import uuid
from datetime import datetime
from typing import Dict, Optional
from models.schemas import JobStatus, JobRecord

_jobs: Dict[str, JobRecord] = {}

def create_job() -> str:
    job_id = uuid.uuid4().hex
    _jobs[job_id] = JobRecord(
        job_id=job_id,
        status=JobStatus.PENDING,
        created_at=datetime.utcnow().isoformat(),
    )
    return job_id

def get_job(job_id: str) -> Optional[JobRecord]:
    return _jobs.get(job_id)

def update_job(job_id: str, **kwargs):
    if job_id in _jobs:
        job = _jobs[job_id]
        for k, v in kwargs.items():
            setattr(job, k, v)

def fail_job(job_id: str, error: str):
    update_job(job_id, status=JobStatus.FAILED, error=error)
