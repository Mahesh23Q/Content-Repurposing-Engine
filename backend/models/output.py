"""
Output models for generated content
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class OutputBase(BaseModel):
    """Base output model"""
    platform: str = Field(..., description="Platform name (linkedin, twitter, blog, email)")
    content: Dict[str, Any] = Field(..., description="Platform-specific content")


class OutputCreate(OutputBase):
    """Output creation model"""
    job_id: UUID
    content_id: UUID
    quality_score: Optional[float] = Field(None, ge=0, le=1)
    validation_results: Optional[Dict[str, Any]] = None
    generation_metadata: Optional[Dict[str, Any]] = None


class OutputUpdate(BaseModel):
    """Output update model"""
    is_favorite: Optional[bool] = None
    is_published: Optional[bool] = None
    published_url: Optional[str] = None
    published_at: Optional[datetime] = None


class OutputResponse(OutputBase):
    """Output response model"""
    id: UUID
    job_id: UUID
    content_id: UUID
    user_id: UUID
    quality_score: Optional[float] = None
    validation_results: Optional[Dict[str, Any]] = None
    generation_metadata: Optional[Dict[str, Any]] = None
    is_favorite: bool = False
    is_published: bool = False
    published_url: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OutputListResponse(BaseModel):
    """Paginated output list response"""
    items: List[OutputResponse]
    total: int
    page: int
    pages: int
    limit: int


class JobOutputsResponse(BaseModel):
    """All outputs for a job"""
    job_id: UUID
    outputs: Dict[str, OutputResponse]


# Platform-specific output models

class LinkedInOutput(BaseModel):
    """LinkedIn post output"""
    post: str = Field(..., max_length=1300)
    hashtags: List[str] = Field(..., min_items=3, max_items=5)
    character_count: int
    hook: str
    cta: str


class TwitterOutput(BaseModel):
    """Twitter thread output"""
    tweets: List[Dict[str, Any]]
    total_tweets: int = Field(..., ge=3, le=10)
    thread_summary: Optional[str] = None


class BlogOutput(BaseModel):
    """Blog post output"""
    title: str
    meta_description: str = Field(..., min_length=150, max_length=160)
    content: str
    word_count: int = Field(..., ge=500, le=700)
    keywords: List[str] = Field(default_factory=list)


class EmailOutput(BaseModel):
    """Email sequence output"""
    emails: List[Dict[str, Any]] = Field(..., min_items=3, max_items=5)
    sequence_summary: Optional[str] = None


class PlatformOutput(BaseModel):
    """Union of all platform outputs"""
    linkedin: Optional[LinkedInOutput] = None
    twitter: Optional[TwitterOutput] = None
    blog: Optional[BlogOutput] = None
    email: Optional[EmailOutput] = None


class RegenerateRequest(BaseModel):
    """Request to regenerate output"""
    preferences: Dict[str, Any] = Field(default_factory=dict)
