"""
Analytics models for tracking performance
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class AnalyticsBase(BaseModel):
    """Base analytics model"""
    views: int = Field(default=0, ge=0)
    clicks: int = Field(default=0, ge=0)
    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    saves: int = Field(default=0, ge=0)


class AnalyticsCreate(AnalyticsBase):
    """Analytics creation model"""
    output_id: UUID
    platform_metrics: Dict[str, Any] = Field(default_factory=dict)


class AnalyticsUpdate(AnalyticsBase):
    """Analytics update model"""
    platform_metrics: Optional[Dict[str, Any]] = None


class AnalyticsResponse(AnalyticsBase):
    """Analytics response model"""
    id: UUID
    output_id: UUID
    user_id: UUID
    engagement_rate: Optional[float] = None
    click_through_rate: Optional[float] = None
    platform_metrics: Dict[str, Any] = Field(default_factory=dict)
    tracked_at: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PlatformAnalytics(BaseModel):
    """Analytics for a specific platform"""
    platform: str
    total_outputs: int
    avg_engagement_rate: Optional[float] = None
    total_views: int
    total_clicks: int
    total_likes: int
    total_comments: int
    total_shares: int


class UserAnalyticsSummary(BaseModel):
    """User analytics summary"""
    total_content: int
    total_jobs: int
    completed_jobs: int
    total_outputs: int
    favorite_outputs: int
    avg_processing_time_seconds: Optional[float] = None
    platforms_used: List[str]
    platform_breakdown: Dict[str, PlatformAnalytics]


class OutputAnalyticsResponse(BaseModel):
    """Analytics for specific output"""
    output_id: UUID
    platform: str
    views: int
    clicks: int
    likes: int
    comments: int
    shares: int
    saves: int
    engagement_rate: Optional[float] = None
    click_through_rate: Optional[float] = None
    tracked_at: datetime
