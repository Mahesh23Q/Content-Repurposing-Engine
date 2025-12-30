"""
Analytics endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from models.analytics import (
    UserAnalyticsSummary,
    OutputAnalyticsResponse,
    AnalyticsUpdate
)
from db.repositories import AnalyticsRepository, OutputRepository
from api.dependencies import (
    get_current_user,
    get_analytics_repository,
    get_output_repository
)
from loguru import logger

router = APIRouter()


@router.get("/", response_model=UserAnalyticsSummary)
async def get_analytics(
    current_user: dict = Depends(get_current_user),
    analytics_repo: AnalyticsRepository = Depends(get_analytics_repository)
):
    """Get user's analytics data for dashboard"""
    summary = await analytics_repo.get_user_summary(current_user["id"])
    return UserAnalyticsSummary(**summary)


@router.get("/summary", response_model=UserAnalyticsSummary)
async def get_analytics_summary(
    current_user: dict = Depends(get_current_user),
    analytics_repo: AnalyticsRepository = Depends(get_analytics_repository)
):
    """Get user's analytics summary"""
    summary = await analytics_repo.get_user_summary(current_user["id"])
    return UserAnalyticsSummary(**summary)


@router.get("/outputs/{output_id}", response_model=OutputAnalyticsResponse)
async def get_output_analytics(
    output_id: UUID,
    current_user: dict = Depends(get_current_user),
    analytics_repo: AnalyticsRepository = Depends(get_analytics_repository),
    output_repo: OutputRepository = Depends(get_output_repository)
):
    """Get analytics for specific output"""
    output = await output_repo.get_by_id(output_id)
    
    if not output:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Output not found")
    
    if output["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    analytics = await analytics_repo.get_by_output(output_id)
    
    if not analytics:
        # Return empty analytics if none exist
        return OutputAnalyticsResponse(
            output_id=output_id,
            platform=output["platform"],
            views=0,
            clicks=0,
            likes=0,
            comments=0,
            shares=0,
            saves=0,
            engagement_rate=None,
            click_through_rate=None,
            tracked_at=output["created_at"]
        )
    
    return OutputAnalyticsResponse(
        output_id=output_id,
        platform=output["platform"],
        **analytics
    )


@router.post("/outputs/{output_id}")
async def update_output_analytics(
    output_id: UUID,
    data: AnalyticsUpdate,
    current_user: dict = Depends(get_current_user),
    analytics_repo: AnalyticsRepository = Depends(get_analytics_repository),
    output_repo: OutputRepository = Depends(get_output_repository)
):
    """Update analytics data for output"""
    output = await output_repo.get_by_id(output_id)
    
    if not output:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Output not found")
    
    if output["user_id"] != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    analytics = await analytics_repo.update_metrics(
        output_id=output_id,
        views=data.views,
        clicks=data.clicks,
        likes=data.likes,
        comments=data.comments,
        shares=data.shares,
        saves=data.saves
    )
    
    logger.info(f"Analytics updated for output: {output_id}")
    
    return {
        "message": "Analytics updated successfully",
        "engagement_rate": analytics.get("engagement_rate")
    }
