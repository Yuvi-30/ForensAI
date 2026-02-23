#!/bin/bash
# ============================================================
# gcs_setup.sh — Creates GCS bucket + Service Account for VM
# Run locally with gcloud CLI authenticated
# Usage: PROJECT=my-gcp-project BUCKET=my-bucket ./gcs_setup.sh
# ============================================================
set -e

PROJECT=${PROJECT:-$(gcloud config get-value project)}
BUCKET=${BUCKET:-"ai-forensics-bucket"}
REGION=${REGION:-"us-central1"}
SA_NAME="forensics-vm-sa"
SA_EMAIL="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"

echo "🪣 [1/4] Creating GCS bucket: $BUCKET"
gcloud storage buckets create "gs://$BUCKET" \
  --project="$PROJECT" \
  --location="$REGION" \
  --uniform-bucket-level-access

echo "🔒 [2/4] Creating Service Account: $SA_NAME"
gcloud iam service-accounts create "$SA_NAME" \
  --project="$PROJECT" \
  --display-name="ForensAI VM Service Account"

echo "🔑 [3/4] Granting Storage Object Admin on bucket..."
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.objectAdmin"

# Also need storage.buckets.get for signed URLs
gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountTokenCreator"

echo "✅ [4/4] Done!"
echo ""
echo "   Bucket:          gs://$BUCKET"
echo "   Service Account: $SA_EMAIL"
echo ""
echo "   ➜ NEXT: Attach service account to your VM:"
echo "     GCP Console → Compute Engine → your VM → Edit"
echo "     → Service Account → select '$SA_NAME' → Save"
echo ""
echo "   ➜ Then set in .env:"
echo "     GCS_BUCKET=$BUCKET"
