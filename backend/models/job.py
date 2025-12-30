"""
Job models for processing jobs
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class JobStatus(str, Enum):
    """Job status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobBase(BaseModel):
    """Base job model"""
    platforms: List[str] = Field(..., min_items=1, description="Target platforms")
    user_preferences: Dict[str, Any] = Field(default_factory=dict)


class JobCreate(JobBase):
    """Job creation model"""
    content_id: UUID


class JobResponse(JobBase):
    """Job response model"""
    id: UUID
    content_id: UUID
    user_id: UUID
    title: Optional[str] = None
    status: JobStatus
    progress_percentage: int = Field(default=0, ge=0, le=100)
    current_step: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    processing_time_seconds: Optional[int] = None
    error_message: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None
    retry_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    """Paginated job list response"""
    items: List[JobResponse]
    total: int
    page: int
    pages: int
    limit: int


class JobStatusUpdate(BaseModel):
    """Job status update model"""
    status: JobStatus
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    current_step: Optional[str] = None
    error_message: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None


class JobWithContent(JobResponse):
    """Job response with content details"""
    content_title: str
    content_source_type: str
    output_count: int = 0
