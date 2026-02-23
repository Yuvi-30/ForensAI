from enum import Enum
from typing import Optional
from pydantic import BaseModel

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"

class JobRecord(BaseModel):
    job_id: str
    status: JobStatus
    created_at: str
    verdict: Optional[str] = None           # "AI_GENERATED" | "REAL"
    confidence: Optional[float] = None      # 0.0 – 1.0
    ela_url: Optional[str] = None
    gradcam_url: Optional[str] = None
    original_url: Optional[str] = None
    error: Optional[str] = None

class UploadResponse(BaseModel):
    job_id: str
    message: str = "Analysis started"

class ResultResponse(BaseModel):
    job_id: str
    status: JobStatus
    verdict: Optional[str] = None
    confidence: Optional[float] = None
    ela_url: Optional[str] = None
    gradcam_url: Optional[str] = None
    original_url: Optional[str] = None
    error: Optional[str] = None
