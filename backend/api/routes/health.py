"""
Health check endpoints
"""
from fastapi import APIRouter, Depends
from core.config import settings
from db.supabase import supabase_client
from datetime import datetime
from loguru import logger

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/health/detailed")
async def detailed_health_check():
    """
    Detailed health check with service status
    """
    health_status = {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "services": {}
    }
    
    # Check database
    try:
        response = supabase_client.table("content").select("id").limit(1).execute()
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["services"]["database"] = "unhealthy"
        health_status["status"] = "degraded"
    
    # Check storage
    try:
        buckets = supabase_client.storage.list_buckets()
        health_status["services"]["storage"] = "healthy"
    except Exception as e:
        logger.error(f"Storage health check failed: {e}")
        health_status["services"]["storage"] = "unhealthy"
        health_status["status"] = "degraded"
    
    # Check job processor
    try:
        from services.simple_job_processor import simple_job_processor
        health_status["services"]["job_processor"] = "running" if simple_job_processor.is_running else "stopped"
    except Exception as e:
        logger.error(f"Job processor health check failed: {e}")
        health_status["services"]["job_processor"] = "error"
        health_status["status"] = "degraded"
    
    # Check Groq API (optional - don't fail if not available)
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        health_status["services"]["groq"] = "configured"
    except Exception as e:
        logger.warning(f"Groq health check failed: {e}")
        health_status["services"]["groq"] = "unknown"
    
    return health_status
