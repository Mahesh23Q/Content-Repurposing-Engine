"""
Content management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional, List
from uuid import UUID
from models.content import (
    ContentResponse,
    ContentListResponse,
    ContentTextCreate,
    ContentURLCreate,
    ContentUpdate
)
from db.repositories import ContentRepository, JobRepository
from api.dependencies import (
    get_current_user,
    get_content_repository,
    get_job_repository,
    PaginationParams
)
from core.config import settings
from loguru import logger

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_content(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    platforms: str = Form(...),  # JSON string
    preferences: str = Form("{}"),  # JSON string
    current_user: dict = Depends(get_current_user),
    content_repo: ContentRepository = Depends(get_content_repository),
    job_repo: JobRepository = Depends(get_job_repository)
):
    """
    Upload file for content repurposing
    """
    import json
    from services.extraction import extract_content_from_file
    
    try:
        # Validate file
        if not settings.is_allowed_extension(file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}"
            )
        
        # Parse JSON strings
        platforms_list = json.loads(platforms)
        preferences_dict = json.loads(preferences)
        
        # Read file
        file_content = await file.read()
        
        if len(file_content) > settings.max_file_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
            )
        
        # Extract content
        extracted = await extract_content_from_file(file_content, file.filename)
        
        # Create content record
        content = await content_repo.create({
            "user_id": str(current_user["id"]),
            "title": title or extracted.get("title", file.filename),
            "original_text": extracted["text"],
            "source_type": extracted["source_type"],
            "file_path": f"{current_user['id']}/{file.filename}",
            "file_size_bytes": len(file_content),
            "metadata": extracted.get("metadata", {})
        })
        
        # Create job
        job = await job_repo.create({
            "content_id": content["id"],
            "user_id": str(current_user["id"]),
            "platforms": platforms_list,
            "user_preferences": preferences_dict,
            "status": "pending"
        })
        
        logger.info(f"Content uploaded: {content['id']}, Job created: {job['id']}")
        
        return {
            "content_id": content["id"],
            "job_id": job["id"],
            "status": "pending",
            "message": "Content uploaded successfully. Processing started."
        }
    
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/text", status_code=status.HTTP_201_CREATED)
async def create_text_content(
    data: ContentTextCreate,
    current_user: dict = Depends(get_current_user),
    content_repo: ContentRepository = Depends(get_content_repository),
    job_repo: JobRepository = Depends(get_job_repository)
):
    """
    Submit text content directly
    """
    try:
        # Create content record
        content = await content_repo.create({
            "user_id": str(current_user["id"]),
            "title": data.title,
            "original_text": data.text,
            "source_type": "text",
            "metadata": {
                "word_count": len(data.text.split()),
                "character_count": len(data.text)
            }
        })
        
        # Create job
        job = await job_repo.create({
            "content_id": content["id"],
            "user_id": str(current_user["id"]),
            "platforms": data.platforms,
            "user_preferences": data.preferences,
            "status": "pending"
        })
        
        logger.info(f"Text content created: {content['id']}, Job created: {job['id']}")
        
        return {
            "content_id": content["id"],
            "job_id": job["id"],
            "status": "pending"
        }
    
    except Exception as e:
        logger.error(f"Text content creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/url", status_code=status.HTTP_201_CREATED)
async def create_url_content(
    data: ContentURLCreate,
    current_user: dict = Depends(get_current_user),
    content_repo: ContentRepository = Depends(get_content_repository),
    job_repo: JobRepository = Depends(get_job_repository)
):
    """
    Submit URL for content extraction
    """
    from services.extraction import extract_content_from_url
    
    try:
        # Extract content from URL
        extracted = await extract_content_from_url(data.url)
        
        # Create content record
        content = await content_repo.create({
            "user_id": str(current_user["id"]),
            "title": data.title or extracted.get("title", "Untitled"),
            "original_text": extracted["text"],
            "source_type": "url",
            "source_url": data.url,
            "metadata": extracted.get("metadata", {})
        })
        
        # Create job
        job = await job_repo.create({
            "content_id": content["id"],
            "user_id": str(current_user["id"]),
            "platforms": data.platforms,
            "user_preferences": data.preferences,
            "status": "pending"
        })
        
        logger.info(f"URL content created: {content['id']}, Job created: {job['id']}")
        
        return {
            "content_id": content["id"],
            "job_id": job["id"],
            "status": "pending"
        }
    
    except Exception as e:
        logger.error(f"URL content creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: UUID,
    current_user: dict = Depends(get_current_user),
    content_repo: ContentRepository = Depends(get_content_repository)
):
    """
    Get content by ID
    """
    content = await content_repo.get_by_id(content_id)
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content["user_id"] != str(current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return ContentResponse(**content)


@router.get("", response_model=ContentListResponse)
async def list_content(
    page: int = 1,
    limit: int = 20,
    source_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    content_repo: ContentRepository = Depends(get_content_repository)
):
    """
    List user's content
    """
    pagination = PaginationParams(page, limit)
    
    contents = await content_repo.get_by_user(
        user_id=current_user["id"],
        limit=pagination.limit,
        offset=pagination.offset,
        source_type=source_type
    )
    
    total = await content_repo.count_by_user(
        user_id=current_user["id"],
        source_type=source_type
    )
    
    return ContentListResponse(
        items=[ContentResponse(**c) for c in contents],
        **pagination.get_response_meta(total)
    )


@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: UUID,
    data: ContentUpdate,
    current_user: dict = Depends(get_current_user),
    content_repo: ContentRepository = Depends(get_content_repository)
):
    """
    Update content
    """
    content = await content_repo.get_by_id(content_id)
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content["user_id"] != str(current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    update_data = data.dict(exclude_unset=True)
    updated = await content_repo.update(content_id, update_data)
    
    return ContentResponse(**updated)


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: UUID,
    current_user: dict = Depends(get_current_user),
    content_repo: ContentRepository = Depends(get_content_repository)
):
    """
    Delete content (soft delete)
    """
    content = await content_repo.get_by_id(content_id)
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if content["user_id"] != str(current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    await content_repo.soft_delete(content_id)
    logger.info(f"Content deleted: {content_id}")
