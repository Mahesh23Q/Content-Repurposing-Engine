"""
Application configuration using Pydantic settings
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Content Repurposing Engine"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Security
    SECRET_KEY: str = Field(..., min_length=32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Supabase
    SUPABASE_URL: str = Field(..., description="Supabase project URL")
    SUPABASE_KEY: str = Field(..., description="Supabase anon key")
    SUPABASE_SERVICE_KEY: str = Field(..., description="Supabase service key")
    SUPABASE_JWT_SECRET: str = Field(..., description="Supabase JWT secret")
    
    # Groq API
    GROQ_API_KEY: str = Field(..., description="Groq API key")
    GROQ_MODEL: str = "llama3-8b-8192"
    GROQ_TEMPERATURE: float = 0.7
    GROQ_MAX_TOKENS: int = 2000
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # File Upload
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx", "pptx", "txt"]
    
    # Processing
    MAX_CONCURRENT_JOBS: int = 5
    JOB_TIMEOUT_SECONDS: int = 300
    RETRY_MAX_ATTEMPTS: int = 3
    
    # Sentry (Optional)
    SENTRY_DSN: str = ""
    
    # Redis (Optional)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Email (Optional)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def max_file_size_bytes(self) -> int:
        """Convert MB to bytes"""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    def is_allowed_extension(self, filename: str) -> bool:
        """Check if file extension is allowed"""
        if "." not in filename:
            return False
        ext = filename.rsplit(".", 1)[1].lower()
        return ext in self.ALLOWED_EXTENSIONS


# Create settings instance
settings = Settings()


# Configure logging
from loguru import logger
import sys

logger.remove()
logger.add(
    sys.stdout,
    level=settings.LOG_LEVEL,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>"
)

# Add file logging in production
if settings.ENVIRONMENT == "production":
    logger.add(
        "logs/app_{time}.log",
        rotation="500 MB",
        retention="10 days",
        level="INFO"
    )
