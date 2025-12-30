"""
Output repository for output data access
"""
from typing import Optional, Dict, Any, List
from uuid import UUID
from supabase import Client
from .base import BaseRepository
from loguru import logger


class OutputRepository(BaseRepository):
    """
    Repository for output operations
    """
    
    def __init__(self, client: Client):
        super().__init__(client, "outputs")
    
    async def get_by_job(self, job_id: UUID) -> List[Dict[str, Any]]:
        """
        Get all outputs for a job
        """
        try:
            response = (
                self.table.select("*")
                .eq("job_id", str(job_id))
                .order("created_at", desc=False)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting outputs by job: {e}")
            raise
    
    async def get_by_user(
        self,
        user_id: UUID,
        limit: int = 20,
        offset: int = 0,
        platform: Optional[str] = None,
        is_favorite: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """
        Get outputs by user with optional filters
        """
        try:
            query = self.table.select("*").eq("user_id", str(user_id))
            
            if platform:
                query = query.eq("platform", platform)
            
            if is_favorite is not None:
                query = query.eq("is_favorite", is_favorite)
            
            query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
            
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting outputs by user: {e}")
            raise
    
    async def get_by_platform(self, job_id: UUID, platform: str) -> Optional[Dict[str, Any]]:
        """
        Get output for specific platform
        """
        try:
            response = (
                self.table.select("*")
                .eq("job_id", str(job_id))
                .eq("platform", platform)
                .execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting output by platform: {e}")
            raise
    
    async def mark_favorite(self, output_id: UUID, is_favorite: bool = True) -> Dict[str, Any]:
        """
        Mark output as favorite
        """
        return await self.update(output_id, {"is_favorite": is_favorite})
    
    async def mark_published(
        self,
        output_id: UUID,
        published_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Mark output as published
        """
        from datetime import datetime
        update_data = {
            "is_published": True,
            "published_at": datetime.utcnow().isoformat()
        }
        if published_url:
            update_data["published_url"] = published_url
        
        return await self.update(output_id, update_data)
    
    async def get_favorites(self, user_id: UUID, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get user's favorite outputs
        """
        return await self.get_by_user(user_id, limit=limit, is_favorite=True)
    
    async def count_by_user(
        self,
        user_id: UUID,
        platform: Optional[str] = None
    ) -> int:
        """
        Count outputs by user
        """
        try:
            query = self.table.select("id", count="exact").eq("user_id", str(user_id))
            
            if platform:
                query = query.eq("platform", platform)
            
            response = query.execute()
            return response.count if response.count else 0
        except Exception as e:
            logger.error(f"Error counting outputs: {e}")
            raise
    
    async def get_by_content(self, content_id: UUID) -> List[Dict[str, Any]]:
        """
        Get all outputs for a content
        """
        try:
            response = (
                self.table.select("*")
                .eq("content_id", str(content_id))
                .order("created_at", desc=True)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting outputs by content: {e}")
            raise
