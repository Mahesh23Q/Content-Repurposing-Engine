"""
Main FastAPI application entry point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import asyncio
from loguru import logger

from core.config import settings
from api.routes import content, jobs, outputs, analytics, health, auth
from services.simple_job_processor import simple_job_processor


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Initialize services
    # await init_database()
    # await init_storage()
    
    # Start job processor in background
    logger.info("Starting background job processor...")
    job_processor_task = asyncio.create_task(simple_job_processor.start())
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    logger.info("Stopping job processor...")
    simple_job_processor.stop()
    
    # Cancel the job processor task
    job_processor_task.cancel()
    try:
        await job_processor_task
    except asyncio.CancelledError:
        logger.info("Job processor stopped successfully")
    
    # await cleanup_resources()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered content repurposing engine",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time to response headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


# Include routers
app.include_router(
    health.router,
    prefix=settings.API_PREFIX,
    tags=["health"]
)

app.include_router(
    auth.router,
    prefix=f"{settings.API_PREFIX}/auth",
    tags=["authentication"]
)

app.include_router(
    content.router,
    prefix=f"{settings.API_PREFIX}/content",
    tags=["content"]
)

app.include_router(
    jobs.router,
    prefix=f"{settings.API_PREFIX}/jobs",
    tags=["jobs"]
)

app.include_router(
    outputs.router,
    prefix=f"{settings.API_PREFIX}/outputs",
    tags=["outputs"]
)

app.include_router(
    analytics.router,
    prefix=f"{settings.API_PREFIX}/analytics",
    tags=["analytics"]
)


# Job processor status endpoint
@app.get(f"{settings.API_PREFIX}/processor/status")
async def get_processor_status():
    """Get job processor status"""
    from services.simple_job_processor import simple_job_processor
    return {
        "status": "running" if simple_job_processor.is_running else "stopped",
        "processor_type": "simple_gemini",
        "model": settings.GEMINI_MODEL
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "job_processor": "running" if simple_job_processor.is_running else "stopped",
        "docs": f"{settings.API_PREFIX}/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
