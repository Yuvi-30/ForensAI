# import uuid
# from google.cloud import storage as gcs
# from core.config import settings

# _client = None

# def _get_client():
#     global _client
#     if _client is None:
#         _client = gcs.Client()
#     return _client

# def upload_bytes(data: bytes, key: str, content_type: str = "image/png") -> str:
#     """Upload bytes to GCS, return presigned URL valid for 1 hour."""
#     bucket = _get_client().bucket(settings.GCS_BUCKET)
#     blob = bucket.blob(key)
#     blob.upload_from_string(data, content_type=content_type)

#     url = blob.generate_signed_url(
#         version="v4",
#         expiration=3600,   # 1 hour
#         method="GET",
#     )
#     return url

# def upload_file(local_path: str, key: str) -> str:
#     """Upload a local file to GCS, return presigned URL."""
#     bucket = _get_client().bucket(settings.GCS_BUCKET)
#     blob = bucket.blob(key)
#     blob.upload_from_filename(local_path)
#     return blob.generate_signed_url(version="v4", expiration=3600, method="GET")

# def generate_key(prefix: str, ext: str = "png") -> str:
#     return f"{prefix}/{uuid.uuid4().hex}.{ext}"


import boto3
import uuid
from pathlib import Path
from core.config import settings

s3 = boto3.client("s3", region_name=settings.AWS_REGION)

def upload_file(local_path: str, s3_key: str) -> str:
    """Upload file to S3, return public URL."""
    s3.upload_file(local_path, settings.S3_BUCKET, s3_key)
    return f"https://{settings.S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"

def upload_bytes(data: bytes, s3_key: str, content_type: str = "image/png") -> str:
    s3.put_object(
        Bucket=settings.S3_BUCKET,
        Key=s3_key,
        Body=data,
        ContentType=content_type,
    )
    return f"https://{settings.S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"

def generate_key(prefix: str, ext: str = "png") -> str:
    return f"{prefix}/{uuid.uuid4().hex}.{ext}"