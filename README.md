# ForensAI — Cloud-Native AI Image Forensics

> Detects AI-generated images using a Vision Transformer (ViT) + Grad-CAM + Error Level Analysis, deployed on AWS EC2.

---

## Architecture

```
Browser (React + Vite)
       │
       │  HTTP (port 80)
       ▼
   Nginx (EC2)
   ├── /api/*  → FastAPI :8000   (ML inference on cloud)
   └── /*      → React SPA
       │
       ▼
FastAPI Backend
   ├── Upload handler  → saves image to S3
   ├── Background task → ML Pipeline
   │       ├── ELA analysis        → S3
   │       ├── ViT inference       → verdict + confidence
   │       └── Grad-CAM heatmap    → S3
   └── Results endpoint ← frontend polls every 2s
```

**Cloud services used:** EC2 · S3 · IAM Roles · CloudWatch · Elastic IP

---

## Quick Start

### 1. Clone & configure

```bash
git clone https://github.com/YOUR_USERNAME/ai-image-forensics.git
cd ai-image-forensics
cp .env.example .env
# Edit .env with your S3 bucket name and AWS region
```

### 2. Run locally (dev)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

### 3. Deploy to EC2

**One-time EC2 setup:**
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Upload and run setup script
scp infra/ec2_setup.sh ubuntu@YOUR_EC2_IP:~
sudo ./ec2_setup.sh
```

**S3 + IAM setup (run locally):**
```bash
chmod +x infra/s3_setup.sh
BUCKET=your-bucket-name REGION=us-east-1 ./infra/s3_setup.sh
# Then attach the created instance profile to your EC2 in AWS Console
```

**Clone and start on EC2:**
```bash
cd /opt/forensics
git clone https://github.com/YOUR_USERNAME/ai-image-forensics.git .
cp .env.example .env && nano .env      # fill in values
docker compose up -d --build
```

**Set up Nginx reverse proxy:**
```bash
sudo cp infra/nginx.conf /etc/nginx/sites-available/forensics
sudo ln -s /etc/nginx/sites-available/forensics /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**CloudWatch monitoring (optional):**
```bash
sudo ./infra/cloudwatch_setup.sh
```

### 4. CI/CD (GitHub Actions)

Add these secrets to your GitHub repo → Settings → Secrets:

| Secret | Value |
|--------|-------|
| `EC2_HOST` | Your EC2 Elastic IP |
| `EC2_SSH_KEY` | Contents of your `.pem` private key |
| `AWS_REGION` | e.g. `us-east-1` |
| `S3_BUCKET` | Your bucket name |

Push to `main` → auto-deploys to EC2.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/upload` | Upload image, returns `job_id` |
| `GET`  | `/api/v1/results/{job_id}` | Poll for results |
| `GET`  | `/api/v1/health` | Health check |
| `GET`  | `/docs` | Swagger UI (auto-generated) |

**Upload response:**
```json
{ "job_id": "abc123", "message": "Analysis started" }
```

**Results response (done):**
```json
{
  "job_id": "abc123",
  "status": "done",
  "verdict": "AI_GENERATED",
  "confidence": 0.9732,
  "ela_url": "https://s3.amazonaws.com/...",
  "gradcam_url": "https://s3.amazonaws.com/...",
  "original_url": "https://s3.amazonaws.com/..."
}
```

---

## ML Pipeline

| Stage | Technique | Output |
|-------|-----------|--------|
| 1 | **Error Level Analysis (ELA)** | Reveals compression inconsistencies |
| 2 | **ViT Inference** (`umm-maybe/AI-image-detector`) | Verdict + confidence score |
| 3 | **Grad-CAM** | Heatmap showing which pixels influenced decision |

---

## EC2 Instance Recommendation

| Field | Value |
|-------|-------|
| AMI | Ubuntu 22.04 LTS |
| Type | `t3.large` (8GB RAM for PyTorch) |
| Storage | 20GB gp3 |
| Security Group | Port 22, 80, 443 |

---

## Project Structure

```
ai-image-forensics/
├── .github/workflows/deploy.yml   # CI/CD
├── infra/
│   ├── ec2_setup.sh               # One-time EC2 bootstrap
│   ├── s3_setup.sh                # S3 bucket + IAM role
│   ├── nginx.conf                 # Reverse proxy
│   ├── cloudwatch_setup.sh        # Monitoring
│   └── iam_policy.json            # S3 IAM policy
├── backend/                       # FastAPI + ML
│   ├── main.py
│   ├── api/routes/
│   ├── core/                      # Config, S3, job manager
│   ├── ml/                        # ELA, ViT, Grad-CAM, pipeline
│   └── models/schemas.py
├── frontend/                      # React + Vite + Tailwind
│   └── src/
│       ├── pages/                 # Home, Results
│       ├── components/            # UploadZone, ResultCard, viewers
│       ├── hooks/useAnalysis.js   # Polling logic
│       └── api/client.js
├── docker-compose.yml
└── .env.example
```
