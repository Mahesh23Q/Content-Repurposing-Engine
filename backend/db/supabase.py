"""
Supabase client configuration
"""
from supabase import create_client, Client
from functools import lru_cache
from core.config import settings
from loguru import logger


@lru_cache()
def get_supabase_client() -> Client:
    """
    Get Supabase client instance (cached)
    """
    try:
        client = create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_KEY
        )
        logger.info("Supabase client initialized successfully")
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise


@lru_cache()
def get_supabase_admin_client() -> Client:
    """
    Get Supabase admin client with service role key
    """
    try:
        client = create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_SERVICE_KEY
        )
        logger.info("Supabase admin client initialized successfully")
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase admin client: {e}")
        raise


# Global client instance
supabase_client = get_supabase_client()
supabase_admin_client = get_supabase_admin_client()
