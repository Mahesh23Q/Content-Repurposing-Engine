"""
Shared dependencies for API routes
"""
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from uuid import UUID
from jose import JWTError, jwt
from core.config import settings
from db.supabase import supabase_client, supabase_admin_client
from db.repositories import (
    UserRepository,
    ContentRepository,
    JobRepository,
    OutputRepository,
    AnalyticsRepository
)
from loguru import logger

# Security
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Get current authenticated user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        
        # Verify JWT token with Supabase
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False}
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from Supabase
        response = supabase_client.auth.get_user(token)
        if not response.user:
            raise credentials_exception
        
        return {
            "id": UUID(user_id),
            "email": response.user.email,
            "user": response.user
        }
    
    except JWTError as e:
        logger.error(f"JWT validation error: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise credentials_exception


async def get_current_user_optional(
    authorization: Optional[str] = Header(None)
) -> Optional[dict]:
    """
    Get current user if token is provided, otherwise return None
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        token = authorization.replace("Bearer ", "")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        return await get_current_user(credentials)
    except HTTPException:
        return None


# Repository dependencies

def get_user_repository() -> UserRepository:
    """Get user repository instance"""
    return UserRepository(supabase_admin_client)


def get_content_repository() -> ContentRepository:
    """Get content repository instance"""
    return ContentRepository(supabase_admin_client)


def get_job_repository() -> JobRepository:
    """Get job repository instance"""
    return JobRepository(supabase_admin_client)


def get_output_repository() -> OutputRepository:
    """Get output repository instance"""
    return OutputRepository(supabase_admin_client)


def get_analytics_repository() -> AnalyticsRepository:
    """Get analytics repository instance"""
    return AnalyticsRepository(supabase_admin_client)


# Pagination helper

class PaginationParams:
    """Pagination parameters"""
    
    def __init__(
        self,
        page: int = 1,
        limit: int = 20
    ):
        self.page = max(1, page)
        self.limit = min(100, max(1, limit))
        self.offset = (self.page - 1) * self.limit
    
    def get_response_meta(self, total: int) -> dict:
        """Get pagination metadata for response"""
        pages = (total + self.limit - 1) // self.limit
        return {
            "total": total,
            "page": self.page,
            "pages": pages,
            "limit": self.limit
        }
