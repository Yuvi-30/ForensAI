from fastapi import APIRouter, HTTPException
from core.job_manager import get_job
from models.schemas import ResultResponse

router = APIRouter()


@router.get("/results/{job_id}", response_model=ResultResponse)
def get_result(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return ResultResponse(**job.model_dump())


@router.get("/health")
def health():
    return {"status": "ok"}
