"""
Job repository for job data access
"""
from typing import Optional, Dict, Any, List
from uuid import UUID
from supabase import Client
from .base import BaseRepository
from loguru import logger
from datetime import datetime


class JobRepository(BaseRepository):
    """
    Repository for job operations
    """
    
    def __init__(self, client: Client):
        super().__init__(client, "jobs")
    
    async def get_by_user(
        self,
        user_id: UUID,
        limit: int = 20,
        offset: int = 0,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get jobs by user with optional status filter
        """
        try:
            query = self.table.select("*").eq("user_id", str(user_id))
            
            # Try to filter by is_deleted, but handle gracefully if column doesn't exist
            try:
                query = query.eq("is_deleted", False)
            except Exception:
                # Column doesn't exist yet, skip the filter
                pass
            
            if status:
                query = query.eq("status", status)
            
            query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
            
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting jobs by user: {e}")
            raise
    
    async def get_by_content(self, content_id: UUID) -> List[Dict[str, Any]]:
        """
        Get all jobs for a content
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
            logger.error(f"Error getting jobs by content: {e}")
            raise
    
    async def update_status(
        self,
        job_id: UUID,
        status: str,
        progress: Optional[int] = None,
        current_step: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update job status
        """
        update_data = {"status": status}
        
        if progress is not None:
            update_data["progress_percentage"] = progress
        
        if current_step:
            update_data["current_step"] = current_step
        
        if error_message:
            update_data["error_message"] = error_message
        
        # Set timestamps based on status
        if status == "processing" and not await self._has_started(job_id):
            update_data["started_at"] = datetime.utcnow().isoformat()
        
        if status in ["completed", "failed", "cancelled"]:
            update_data["completed_at"] = datetime.utcnow().isoformat()
        
        return await self.update(job_id, update_data)
    
    async def _has_started(self, job_id: UUID) -> bool:
        """
        Check if job has started
        """
        job = await self.get_by_id(job_id)
        return job and job.get("started_at") is not None
    
    async def increment_retry(self, job_id: UUID) -> Dict[str, Any]:
        """
        Increment retry count
        """
        job = await self.get_by_id(job_id)
        if job:
            retry_count = job.get("retry_count", 0) + 1
            return await self.update(job_id, {"retry_count": retry_count})
        raise Exception(f"Job not found: {job_id}")
    
    async def get_pending_jobs(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get pending jobs for processing
        """
        try:
            response = (
                self.table.select("*")
                .eq("status", "pending")
                .order("created_at", desc=False)
                .limit(limit)
                .execute()
            )
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting pending jobs: {e}")
            raise
    
    async def get_with_content(self, job_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get job with content details
        """
        try:
            response = (
                self.client.rpc(
                    "get_job_with_content",
                    {"job_id": str(job_id)}
                ).execute()
            )
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            # Fallback to separate queries if RPC not available
            job = await self.get_by_id(job_id)
            if job:
                from .content_repository import ContentRepository
                content_repo = ContentRepository(self.client)
                content = await content_repo.get_by_id(UUID(job["content_id"]))
                if content:
                    job["content_title"] = content.get("title")
                    job["content_source_type"] = content.get("source_type")
            return job
    
    async def count_by_user(self, user_id: UUID, status: Optional[str] = None) -> int:
        """
        Count jobs by user
        """
        try:
            query = self.table.select("id", count="exact").eq("user_id", str(user_id))
            
            # Try to filter by is_deleted, but handle gracefully if column doesn't exist
            try:
                query = query.eq("is_deleted", False)
            except Exception:
                # Column doesn't exist yet, skip the filter
                pass
            
            if status:
                query = query.eq("status", status)
            
            response = query.execute()
            return response.count if response.count else 0
        except Exception as e:
            logger.error(f"Error counting jobs: {e}")
            raise
