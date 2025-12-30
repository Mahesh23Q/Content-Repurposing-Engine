"""
Analytics repository for analytics data access
"""
from typing import Optional, Dict, Any, List
from uuid import UUID
from supabase import Client
from .base import BaseRepository
from loguru import logger


class AnalyticsRepository(BaseRepository):
    """
    Repository for analytics operations
    """
    
    def __init__(self, client: Client):
        super().__init__(client, "analytics")
    
    async def get_by_output(self, output_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get analytics for an output
        """
        try:
            response = (
                self.table.select("*")
                .eq("output_id", str(output_id))
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting analytics by output: {e}")
            raise
    
    async def get_user_summary(self, user_id: UUID) -> Dict[str, Any]:
        """
        Get analytics summary for user
        """
        try:
            # This would ideally use a database function or view
            # For now, we'll aggregate in Python
            from .content_repository import ContentRepository
            from .job_repository import JobRepository
            from .output_repository import OutputRepository
            
            content_repo = ContentRepository(self.client)
            job_repo = JobRepository(self.client)
            output_repo = OutputRepository(self.client)
            
            # Get counts
            total_content = await content_repo.count_by_user(user_id)
            total_jobs = await job_repo.count_by_user(user_id)
            completed_jobs = await job_repo.count_by_user(user_id, status="completed")
            total_outputs = await output_repo.count_by_user(user_id)
            
            # Get favorite outputs
            favorites = await output_repo.get_favorites(user_id, limit=1000)
            favorite_outputs = len(favorites)
            
            # Get platform breakdown
            platforms_used = set()
            platform_breakdown = {}
            
            outputs = await output_repo.get_by_user(user_id, limit=1000)
            for output in outputs:
                platform = output.get("platform")
                if platform:
                    platforms_used.add(platform)
                    
                    if platform not in platform_breakdown:
                        platform_breakdown[platform] = {
                            "platform": platform,
                            "total_outputs": 0,
                            "avg_engagement_rate": 0,
                            "total_views": 0,
                            "total_clicks": 0,
                            "total_likes": 0,
                            "total_comments": 0,
                            "total_shares": 0
                        }
                    
                    platform_breakdown[platform]["total_outputs"] += 1
                    
                    # Get analytics for this output
                    analytics = await self.get_by_output(UUID(output["id"]))
                    if analytics:
                        platform_breakdown[platform]["total_views"] += analytics.get("views", 0)
                        platform_breakdown[platform]["total_clicks"] += analytics.get("clicks", 0)
                        platform_breakdown[platform]["total_likes"] += analytics.get("likes", 0)
                        platform_breakdown[platform]["total_comments"] += analytics.get("comments", 0)
                        platform_breakdown[platform]["total_shares"] += analytics.get("shares", 0)
            
            # Calculate average engagement rates
            for platform_data in platform_breakdown.values():
                if platform_data["total_views"] > 0:
                    engagement = (
                        platform_data["total_likes"] +
                        platform_data["total_comments"] +
                        platform_data["total_shares"]
                    )
                    platform_data["avg_engagement_rate"] = engagement / platform_data["total_views"]
            
            # Convert to PlatformAnalytics objects
            platform_breakdown_models = {}
            for platform, data in platform_breakdown.items():
                platform_breakdown_models[platform] = data
            
            # Get average processing time
            jobs = await job_repo.get_by_user(user_id, limit=1000)
            processing_times = [
                job.get("processing_time_seconds")
                for job in jobs
                if job.get("processing_time_seconds")
            ]
            avg_processing_time = (
                sum(processing_times) / len(processing_times)
                if processing_times else None
            )
            
            return {
                "total_content": total_content,
                "total_jobs": total_jobs,
                "completed_jobs": completed_jobs,
                "total_outputs": total_outputs,
                "favorite_outputs": favorite_outputs,
                "avg_processing_time_seconds": avg_processing_time,
                "platforms_used": list(platforms_used),
                "platform_breakdown": platform_breakdown_models
            }
        except Exception as e:
            logger.error(f"Error getting user analytics summary: {e}")
            raise
    
    async def update_metrics(
        self,
        output_id: UUID,
        views: int = 0,
        clicks: int = 0,
        likes: int = 0,
        comments: int = 0,
        shares: int = 0,
        saves: int = 0  # Note: saves not stored in DB, kept for API compatibility
    ) -> Dict[str, Any]:
        """
        Update or create analytics metrics
        """
        existing = await self.get_by_output(output_id)
        
        # Get the output to determine user_id and platform
        from .output_repository import OutputRepository
        output_repo = OutputRepository(self.client)
        output = await output_repo.get_by_id(output_id)
        
        if not output:
            raise Exception(f"Output not found: {output_id}")
        
        data = {
            "output_id": str(output_id),
            "user_id": output["user_id"],
            "platform": output["platform"],
            "views": views,
            "clicks": clicks,
            "likes": likes,
            "comments": comments,
            "shares": shares
            # Note: saves column doesn't exist in DB schema
        }
        
        # Calculate engagement rate
        if views > 0:
            engagement = likes + comments + shares
            data["engagement_rate"] = engagement / views
        
        if existing:
            return await self.update(UUID(existing["id"]), data)
        else:
            return await self.create(data)
    
    async def get_platform_analytics(
        self,
        user_id: UUID,
        platform: str
    ) -> Dict[str, Any]:
        """
        Get analytics for specific platform
        """
        try:
            from .output_repository import OutputRepository
            output_repo = OutputRepository(self.client)
            
            outputs = await output_repo.get_by_user(user_id, platform=platform, limit=1000)
            
            total_outputs = len(outputs)
            total_views = 0
            total_clicks = 0
            total_likes = 0
            total_comments = 0
            total_shares = 0
            engagement_rates = []
            
            for output in outputs:
                analytics = await self.get_by_output(UUID(output["id"]))
                if analytics:
                    total_views += analytics.get("views", 0)
                    total_clicks += analytics.get("clicks", 0)
                    total_likes += analytics.get("likes", 0)
                    total_comments += analytics.get("comments", 0)
                    total_shares += analytics.get("shares", 0)
                    
                    if analytics.get("engagement_rate"):
                        engagement_rates.append(analytics["engagement_rate"])
            
            avg_engagement_rate = (
                sum(engagement_rates) / len(engagement_rates)
                if engagement_rates else None
            )
            
            return {
                "platform": platform,
                "total_outputs": total_outputs,
                "avg_engagement_rate": avg_engagement_rate,
                "total_views": total_views,
                "total_clicks": total_clicks,
                "total_likes": total_likes,
                "total_comments": total_comments,
                "total_shares": total_shares
            }
        except Exception as e:
            logger.error(f"Error getting platform analytics: {e}")
            raise
