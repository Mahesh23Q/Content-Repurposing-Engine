"""
Content models for content management
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class SourceType(str, Enum):
    """Content source types"""
    PDF = "pdf"
    DOCX = "docx"
    PPT = "ppt"
    URL = "url"
    TEXT = "text"


class ContentBase(BaseModel):
    """Base content model"""
    title: str = Field(..., min_length=1, max_length=500)
    source_type: SourceType


class ContentCreate(ContentBase):
    """Content creation model"""
    original_text: Optional[str] = None
    source_url: Optional[str] = None
    file_path: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('original_text')
    def validate_text(cls, v, values):
        if values.get('source_type') == SourceType.TEXT and not v:
            raise ValueError('original_text is required for text source type')
        return v
    
    @validator('source_url')
    def validate_url(cls, v, values):
        if values.get('source_type') == SourceType.URL and not v:
            raise ValueError('source_url is required for url source type')
        return v


class ContentTextCreate(BaseModel):
    """Direct text content creation"""
    title: str = Field(..., min_length=1, max_length=500)
    text: str = Field(..., min_length=100, description="Content text (minimum 100 characters)")
    platforms: List[str] = Field(..., min_items=1, description="Target platforms")
    preferences: Dict[str, Any] = Field(default_factory=dict)


class ContentURLCreate(BaseModel):
    """URL content creation"""
    url: str = Field(..., description="URL to extract content from")
    title: Optional[str] = None
    platforms: List[str] = Field(..., min_items=1, description="Target platforms")
    preferences: Dict[str, Any] = Field(default_factory=dict)


class ContentUpdate(BaseModel):
    """Content update model"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    metadata: Optional[Dict[str, Any]] = None
    analysis: Optional[Dict[str, Any]] = None


class ContentResponse(ContentBase):
    """Content response model"""
    id: UUID
    user_id: UUID
    original_text: Optional[str] = None
    source_url: Optional[str] = None
    file_path: Optional[str] = None
    file_size_bytes: Optional[int] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    analysis: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ContentListResponse(BaseModel):
    """Paginated content list response"""
    items: List[ContentResponse]
    total: int
    page: int
    pages: int
    limit: int


class ContentMetadata(BaseModel):
    """Content metadata structure"""
    word_count: Optional[int] = None
    reading_time_minutes: Optional[int] = None
    language: Optional[str] = None
    detected_topics: List[str] = Field(default_factory=list)
    complexity_score: Optional[float] = None


class ContentAnalysis(BaseModel):
    """Content analysis structure"""
    thesis: Optional[str] = None
    key_insights: List[str] = Field(default_factory=list)
    tone: Optional[str] = None
    audience: Optional[str] = None
    content_type: Optional[str] = None
    hooks: List[str] = Field(default_factory=list)
