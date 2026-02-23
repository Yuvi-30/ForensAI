import io
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from PIL import Image

from core.job_manager import create_job, update_job, fail_job
from core.storage import upload_bytes, generate_key
from models.schemas import UploadResponse, JobStatus
from ml.pipeline import run_pipeline

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 10


@router.post("/upload", response_model=UploadResponse)
async def upload_image(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Validate
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, WEBP allowed")

    raw = await file.read()
    if len(raw) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large (max {MAX_SIZE_MB}MB)")

    # Create job
    job_id = create_job()

    # Save original to S3
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    orig_key = generate_key(f"jobs/{job_id}/original", ext=ext)
    orig_url = upload_bytes(raw, orig_key, content_type=file.content_type)
    update_job(job_id, original_url=orig_url, status=JobStatus.PROCESSING)

    # Queue background analysis
    image = Image.open(io.BytesIO(raw))
    background_tasks.add_task(_analyse, job_id, image)

    return UploadResponse(job_id=job_id)


async def _analyse(job_id: str, image: Image.Image):
    try:
        result = run_pipeline(image, job_id)
        update_job(
            job_id,
            status=JobStatus.DONE,
            verdict=result["verdict"],
            confidence=result["confidence"],
            ela_url=result["ela_url"],
            gradcam_url=result["gradcam_url"],
        )
    except Exception as e:
        fail_job(job_id, str(e))
