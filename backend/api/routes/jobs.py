"""
Job management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from uuid import UUID
from models.job import JobResponse, JobListResponse, JobWithContent
from db.repositories import JobRepository
from api.dependencies import get_current_user, get_job_repository, PaginationParams
from loguru import logger

router = APIRouter()


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: UUID,
    current_user: dict = Depends(get_current_user),
    job_repo: JobRepository = Depends(get_job_repository)
):
    """Get job status and details"""
    job = await job_repo.get_by_id(job_id)
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    if job["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return JobResponse(**job)


@router.get("", response_model=JobListResponse)
async def list_jobs(
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    job_repo: JobRepository = Depends(get_job_repository)
):
    """List user's jobs"""
    pagination = PaginationParams(page, limit)
    
    jobs = await job_repo.get_by_user(
        user_id=current_user["id"],
        limit=pagination.limit,
        offset=pagination.offset,
        status=status_filter
    )
    
    total = await job_repo.count_by_user(user_id=current_user["id"], status=status_filter)
    
    return JobListResponse(
        items=[JobResponse(**j) for j in jobs],
        **pagination.get_response_meta(total)
    )


@router.post("/{job_id}/cancel")
async def cancel_job(
    job_id: UUID,
    current_user: dict = Depends(get_current_user),
    job_repo: JobRepository = Depends(get_job_repository)
):
    """Cancel a pending or processing job"""
    job = await job_repo.get_by_id(job_id)
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    if job["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    if job["status"] not in ["pending", "processing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only cancel pending or processing jobs"
        )
    
    await job_repo.update_status(job_id, "cancelled")
    logger.info(f"Job cancelled: {job_id}")
    
    return {"message": "Job cancelled successfully"}


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: UUID,
    current_user: dict = Depends(get_current_user),
    job_repo: JobRepository = Depends(get_job_repository)
):
    """Delete a job (soft delete)"""
    job = await job_repo.get_by_id(job_id)
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    if job["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Only allow deletion of completed, failed, or cancelled jobs
    if job["status"] in ["pending", "processing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete pending or processing jobs. Cancel them first."
        )
    
    await job_repo.soft_delete(job_id)
    logger.info(f"Job deleted: {job_id}")
    
    return
