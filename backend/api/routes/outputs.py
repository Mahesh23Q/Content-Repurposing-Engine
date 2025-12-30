"""
Output management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from uuid import UUID
from models.output import (
    OutputResponse,
    OutputListResponse,
    OutputUpdate,
    JobOutputsResponse,
    RegenerateRequest
)
from db.repositories import OutputRepository, JobRepository
from api.dependencies import (
    get_current_user,
    get_output_repository,
    get_job_repository,
    PaginationParams
)
from loguru import logger

router = APIRouter()


@router.get("/{job_id}/all", response_model=JobOutputsResponse)
async def get_job_outputs(
    job_id: UUID,
    current_user: dict = Depends(get_current_user),
    output_repo: OutputRepository = Depends(get_output_repository),
    job_repo: JobRepository = Depends(get_job_repository)
):
    """Get all outputs for a job"""
    job = await job_repo.get_by_id(job_id)
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    if job["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    outputs = await output_repo.get_by_job(job_id)
    
    # Organize by platform
    outputs_dict = {}
    for output in outputs:
        platform = output["platform"]
        outputs_dict[platform] = OutputResponse(**output)
    
    return JobOutputsResponse(job_id=job_id, outputs=outputs_dict)


@router.get("/{output_id}", response_model=OutputResponse)
async def get_output(
    output_id: UUID,
    current_user: dict = Depends(get_current_user),
    output_repo: OutputRepository = Depends(get_output_repository)
):
    """Get specific output details"""
    output = await output_repo.get_by_id(output_id)
    
    if not output:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Output not found")
    
    if output["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return OutputResponse(**output)


@router.get("", response_model=OutputListResponse)
async def list_outputs(
    page: int = 1,
    limit: int = 20,
    platform: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    output_repo: OutputRepository = Depends(get_output_repository)
):
    """List user's outputs"""
    pagination = PaginationParams(page, limit)
    
    outputs = await output_repo.get_by_user(
        user_id=current_user["id"],
        limit=pagination.limit,
        offset=pagination.offset,
        platform=platform,
        is_favorite=is_favorite
    )
    
    total = await output_repo.count_by_user(user_id=current_user["id"], platform=platform)
    
    return OutputListResponse(
        items=[OutputResponse(**o) for o in outputs],
        **pagination.get_response_meta(total)
    )


@router.put("/{output_id}", response_model=OutputResponse)
async def update_output(
    output_id: UUID,
    data: OutputUpdate,
    current_user: dict = Depends(get_current_user),
    output_repo: OutputRepository = Depends(get_output_repository)
):
    """Update output (mark as favorite, published, etc.)"""
    output = await output_repo.get_by_id(output_id)
    
    if not output:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Output not found")
    
    if output["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    update_data = data.dict(exclude_unset=True)
    updated = await output_repo.update(output_id, update_data)
    
    return OutputResponse(**updated)


@router.post("/{output_id}/regenerate", status_code=status.HTTP_202_ACCEPTED)
async def regenerate_output(
    output_id: UUID,
    data: RegenerateRequest,
    current_user: dict = Depends(get_current_user),
    output_repo: OutputRepository = Depends(get_output_repository),
    job_repo: JobRepository = Depends(get_job_repository)
):
    """Regenerate specific platform output"""
    output = await output_repo.get_by_id(output_id)
    
    if not output:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Output not found")
    
    if output["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Create new job for regeneration
    job = await job_repo.create({
        "content_id": output["content_id"],
        "user_id": str(current_user["id"]),
        "platforms": [output["platform"]],
        "user_preferences": data.preferences,
        "status": "pending"
    })
    
    logger.info(f"Regeneration job created: {job['id']} for output: {output_id}")
    
    return {
        "job_id": job["id"],
        "status": "pending",
        "message": "Regeneration started"
    }
