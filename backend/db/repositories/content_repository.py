"""
Content repository for content data access
"""
from typing import Optional, Dict, Any, List
from uuid import UUID
from supabase import Client
from .base import BaseRepository
from loguru import logger


class ContentRepository(BaseRepository):
    """
    Repository for content operations
    """
    
    def __init__(self, client: Client):
        super().__init__(client, "content")
    
    async def get_by_user(
        self,
        user_id: UUID,
        limit: int = 20,
        offset: int = 0,
        source_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get content by user with optional filters
        """
        try:
            query = self.table.select("*").eq("user_id", str(user_id)).eq("is_deleted", False)
            
            if source_type:
                query = query.eq("source_type", source_type)
            
            query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
            
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting content by user: {e}")
            raise
    
    async def count_by_user(self, user_id: UUID, source_type: Optional[str] = None) -> int:
        """
        Count content by user
        """
        try:
            query = self.table.select("id", count="exact").eq("user_id", str(user_id)).eq("is_deleted", False)
            
            if source_type:
                query = query.eq("source_type", source_type)
            
            response = query.execute()
            return response.count if response.count else 0
        except Exception as e:
            logger.error(f"Error counting content: {e}")
            raise
    
    async def update_analysis(self, content_id: UUID, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update content analysis
        """
        return await self.update(content_id, {"analysis": analysis})
    
    async def search_content(
        self,
        user_id: UUID,
        search_term: str,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Search content by title or text
        """
        try:
            # Note: This is a simple search. For production, use PostgreSQL full-text search
            response = (
                self.table.select("*")
                .eq("user_id", str(user_id))
                .eq("is_deleted", False)
                .ilike("title", f"%{search_term}%")
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error searching content: {e}")
            raise
    
    async def get_with_metadata(self, content_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get content with full metadata
        """
        return await self.get_by_id(content_id)
