"""
User repository for user data access
"""
from typing import Optional, Dict, Any
from uuid import UUID
from supabase import Client
from .base import BaseRepository
from loguru import logger


class UserRepository(BaseRepository):
    """
    Repository for user operations
    """
    
    def __init__(self, client: Client):
        super().__init__(client, "user_profiles")
    
    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user by email
        """
        try:
            response = self.table.select("*").eq("email", email).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            raise
    
    async def create_profile(self, user_id: UUID, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create user profile
        """
        profile_data = {
            "id": str(user_id),
            **data
        }
        return await self.create(profile_data)
    
    async def update_profile(self, user_id: UUID, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update user profile
        """
        return await self.update(user_id, data)
    
    async def get_profile(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get user profile
        """
        return await self.get_by_id(user_id)
    
    async def update_preferences(self, user_id: UUID, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update user preferences
        """
        return await self.update(user_id, {"preferences": preferences})
    
    async def get_api_key(self, user_id: UUID) -> Optional[str]:
        """
        Get user's API key
        """
        try:
            response = self.table.select("api_key").eq("id", str(user_id)).execute()
            if response.data and response.data[0].get("api_key"):
                return response.data[0]["api_key"]
            return None
        except Exception as e:
            logger.error(f"Error getting API key: {e}")
            raise
    
    async def generate_api_key(self, user_id: UUID) -> str:
        """
        Generate new API key for user
        """
        import secrets
        api_key = f"crpe_{secrets.token_urlsafe(32)}"
        await self.update(user_id, {"api_key": api_key})
        return api_key
