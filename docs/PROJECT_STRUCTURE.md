# Project Structure

## Complete Directory Tree

```
content-repurposing-engine/
├── app/
│   ├── __init__.py
│   ├── main.py                          # FastAPI application entry point
│   │
│   ├── api/                             # API layer
│   │   ├── __init__.py
│   │   ├── dependencies.py              # Shared dependencies (auth, db)
│   │   └── routes/                      # API endpoints
│   │       ├── __init__.py
│   │       ├── health.py                # Health check endpoints
│   │       ├── auth.py                  # Authentication endpoints
│   │       ├── content.py               # Content management endpoints
│   │       ├── jobs.py                  # Job management endpoints
│   │       ├── outputs.py               # Output retrieval endpoints
│   │       └── analytics.py             # Analytics endpoints
│   │
│   ├── core/                            # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py                    # Application settings
│   │   ├── security.py                  # JWT, password hashing
│   │   └── exceptions.py                # Custom exceptions
│   │
│   ├── models/                          # Pydantic models
│   │   ├── __init__.py
│   │   ├── content.py                   # Content models
│   │   ├── job.py                       # Job models
│   │   ├── output.py                    # Output models
│   │   ├── user.py                      # User models
│   │   └── analytics.py                 # Analytics models
│   │
│   ├── services/                        # Business logic
│   │   ├── __init__.py
│   │   │
│   │   ├── extraction/                  # Content extraction
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  # Base extractor interface
│   │   │   ├── pdf_extractor.py         # PDF extraction
│   │   │   ├── docx_extractor.py        # DOCX extraction
│   │   │   ├── ppt_extractor.py         # PPT extraction
│   │   │   ├── url_extractor.py         # URL/web scraping
│   │   │   └── text_processor.py        # Text preprocessing
│   │   │
│   │   ├── simple_job_processor.py    # Simple job processing
│   │   │   ├── state.py                 # State definitions
│   │   │   └── nodes.py                 # Workflow nodes
│   │   │
│   │   ├── generators/                  # Platform generators
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  # Base generator interface
│   │   │   ├── linkedin.py              # LinkedIn post generator
│   │   │   ├── twitter.py               # Twitter thread generator
│   │   │   ├── blog.py                  # Blog post generator
│   │   │   ├── email.py                 # Email sequence generator
│   │   │   ├── instagram.py             # Instagram caption generator
│   │   │   └── youtube.py               # YouTube description generator
│   │   │
│   │   ├── validation/                  # Quality validation
│   │   │   ├── __init__.py
│   │   │   ├── validators.py            # Content validators
│   │   │   ├── quality_checker.py       # Quality scoring
│   │   │   └── platform_rules.py        # Platform-specific rules
│   │   │
│   │   ├── analysis/                    # Content analysis
│   │   │   ├── __init__.py
│   │   │   ├── analyzer.py              # Main analyzer
│   │   │   ├── tone_detector.py         # Tone analysis
│   │   │   ├── insight_extractor.py     # Key insight extraction
│   │   │   └── audience_detector.py     # Audience identification
│   │   │
│   │   └── job_processor.py             # Job processing orchestration
│   │
│   ├── db/                              # Database layer
│   │   ├── __init__.py
│   │   ├── supabase.py                  # Supabase client
│   │   └── repositories/                # Data access layer
│   │       ├── __init__.py
│   │       ├── base.py                  # Base repository
│   │       ├── content_repository.py    # Content CRUD
│   │       ├── job_repository.py        # Job CRUD
│   │       ├── output_repository.py     # Output CRUD
│   │       ├── user_repository.py       # User CRUD
│   │       └── analytics_repository.py  # Analytics CRUD
│   │
│   └── utils/                           # Utility functions
│       ├── __init__.py
│       ├── file_utils.py                # File handling utilities
│       ├── text_utils.py                # Text processing utilities
│       ├── validation_utils.py          # Validation helpers
│       └── cache.py                     # Caching utilities
│
├── docs/                                # Documentation
│   ├── ARCHITECTURE.md                  # System architecture
│   ├── API.md                           # API documentation
│   ├── INSTALLATION.md                  # Installation guide
│   ├── PLATFORM_STRATEGIES.md           # Platform-specific strategies
│   ├── DATABASE_SCHEMA.md               # Database schema
│   ├── DEPLOYMENT.md                    # Deployment guide
│   └── PROJECT_STRUCTURE.md             # This file
│
├── tests/                               # Test suite
│   ├── __init__.py
│   ├── conftest.py                      # Pytest configuration
│   │
│   ├── unit/                            # Unit tests
│   │   ├── __init__.py
│   │   ├── test_extractors.py
│   │   ├── test_generators.py
│   │   ├── test_validators.py
│   │   └── test_repositories.py
│   │
│   ├── integration/                     # Integration tests
│   │   ├── __init__.py
│   │   ├── test_workflow.py
│   │   ├── test_api.py
│   │   └── test_database.py
│   │
│   └── e2e/                             # End-to-end tests
│       ├── __init__.py
│       └── test_full_flow.py
│
├── scripts/                             # Utility scripts
│   ├── init_db.py                       # Database initialization
│   ├── init_storage.py                  # Storage bucket setup
│   ├── migrate.py                       # Database migrations
│   ├── check_config.py                  # Configuration checker
│   ├── seed_data.py                     # Seed test data
│   └── backup.py                        # Backup utility
│
├── frontend/                            # Frontend (optional)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── logs/                                # Application logs
│   └── .gitkeep
│
├── .env.example                         # Environment variables template
├── .env                                 # Environment variables (gitignored)
├── .gitignore                           # Git ignore rules
├── requirements.txt                     # Python dependencies
├── requirements-dev.txt                 # Development dependencies
├── pytest.ini                           # Pytest configuration
├── .flake8                              # Flake8 configuration
├── .pre-commit-config.yaml              # Pre-commit hooks
├── Dockerfile                           # Docker image definition
├── docker-compose.yml                   # Docker Compose configuration
├── README.md                            # Project overview
├── LICENSE                              # License file
└── CONTRIBUTING.md                      # Contribution guidelines
```

---

## Key Directories Explained

### `/app` - Application Code

The main application directory containing all Python code.

#### `/app/api` - API Layer
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Request validation
  - Response formatting
  - Authentication/authorization
  - Rate limiting
  - Error handling

#### `/app/core` - Core Configuration
- **Purpose**: Application-wide configuration and utilities
- **Contents**:
  - Settings management
  - Security (JWT, hashing)
  - Custom exceptions
  - Constants

#### `/app/models` - Data Models
- **Purpose**: Pydantic models for data validation
- **Types**:
  - Request models (API input)
  - Response models (API output)
  - Database models (ORM)
  - Internal models (business logic)

#### `/app/services` - Business Logic
- **Purpose**: Core application logic
- **Subdirectories**:
  - `extraction/`: Content extraction from various sources
  - `generators/`: Platform-specific content generation
  - `validation/`: Quality assurance
  - `analysis/`: Content analysis

#### `/app/db` - Database Layer
- **Purpose**: Data persistence and retrieval
- **Pattern**: Repository pattern for clean separation
- **Contents**:
  - Supabase client configuration
  - Repository classes for each entity
  - Database utilities

#### `/app/utils` - Utilities
- **Purpose**: Reusable helper functions
- **Examples**:
  - File operations
  - Text processing
  - Caching
  - Validation helpers

---

### `/docs` - Documentation

Comprehensive documentation for the project.

**Files**:
- `ARCHITECTURE.md`: System design and architecture
- `API.md`: API endpoint documentation
- `INSTALLATION.md`: Setup instructions
- `PLATFORM_STRATEGIES.md`: Content generation strategies
- `DATABASE_SCHEMA.md`: Database structure
- `DEPLOYMENT.md`: Production deployment guide

---

### `/tests` - Test Suite

Comprehensive testing at multiple levels.

#### `/tests/unit` - Unit Tests
- Test individual functions/classes in isolation
- Fast execution
- High coverage

#### `/tests/integration` - Integration Tests
- Test component interactions
- Database operations
- API endpoints

#### `/tests/e2e` - End-to-End Tests
- Test complete user flows
- Simulate real usage
- Slower but comprehensive

---

### `/scripts` - Utility Scripts

Helper scripts for common tasks.

**Scripts**:
- `init_db.py`: Set up database schema
- `init_storage.py`: Configure storage buckets
- `migrate.py`: Run database migrations
- `check_config.py`: Validate configuration
- `seed_data.py`: Add test data
- `backup.py`: Backup database

---

### `/frontend` - Frontend Application (Optional)

React/Next.js frontend for the application.

**Structure**:
```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── services/         # API client
│   ├── hooks/            # Custom React hooks
│   ├── context/          # React context
│   └── utils/            # Helper functions
```

---

## File Naming Conventions

### Python Files
- **Modules**: `snake_case.py`
- **Classes**: `PascalCase`
- **Functions**: `snake_case()`
- **Constants**: `UPPER_SNAKE_CASE`

### Test Files
- **Pattern**: `test_*.py`
- **Example**: `test_linkedin_generator.py`

### Documentation
- **Pattern**: `UPPER_CASE.md`
- **Example**: `INSTALLATION.md`

---

## Import Structure

### Absolute Imports (Preferred)

```python
from app.services.generators.linkedin import LinkedInGenerator
from app.db.repositories.content_repository import ContentRepository
from app.core.config import settings
```

### Relative Imports (Within Package)

```python
# In app/services/generators/twitter.py
from .base import BaseGenerator
from ..validation.validators import validate_tweet_length
```

---

## Code Organization Principles

### 1. Separation of Concerns
- API layer handles HTTP
- Services contain business logic
- Repositories handle data access
- Models define data structures

### 2. Dependency Injection
```python
class ContentService:
    def __init__(self, repository: ContentRepository):
        self.repository = repository
```

### 3. Interface-Based Design
```python
class BaseExtractor(ABC):
    @abstractmethod
    def extract(self, source: Any) -> str:
        pass

class PDFExtractor(BaseExtractor):
    def extract(self, source: bytes) -> str:
        # Implementation
        pass
```

### 4. Configuration Management
```python
# All config in one place
from app.core.config import settings

# Access anywhere
api_key = settings.OPENAI_API_KEY
```

---

## Adding New Features

### Adding a New Platform Generator

1. **Create generator file**: `app/services/generators/new_platform.py`

```python
from .base import BaseGenerator

class NewPlatformGenerator(BaseGenerator):
    def generate(self, content: str, **kwargs) -> Dict[str, Any]:
        # Implementation
        pass
```

2. **Add to processor**: `app/services/simple_job_processor.py`

```python
def generate_new_platform(self, state: ContentState) -> ContentState:
    if "new_platform" not in state["requested_platforms"]:
        return state
    
    output = self.new_platform_gen.generate(...)
    return {**state, "new_platform_output": output}
```

3. **Add validation**: `app/services/validation/validators.py`

```python
def validate_new_platform(output: Dict) -> ValidationResult:
    # Validation logic
    pass
```

4. **Add tests**: `tests/unit/test_new_platform_generator.py`

```python
def test_new_platform_generation():
    generator = NewPlatformGenerator()
    result = generator.generate(...)
    assert result["platform"] == "new_platform"
```

### Adding a New API Endpoint

1. **Create route**: `app/api/routes/new_feature.py`

```python
from fastapi import APIRouter, Depends

router = APIRouter()

@router.get("/new-feature")
async def get_new_feature():
    return {"message": "New feature"}
```

2. **Add to main**: `app/main.py`

```python
from app.api.routes import new_feature

app.include_router(
    new_feature.router,
    prefix=f"{settings.API_PREFIX}/new-feature",
    tags=["new-feature"]
)
```

3. **Add tests**: `tests/integration/test_new_feature_api.py`

```python
def test_new_feature_endpoint(client):
    response = client.get("/api/v1/new-feature")
    assert response.status_code == 200
```

---

## Environment-Specific Configuration

### Development
```python
# .env
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=DEBUG
```

### Staging
```python
# .env.staging
ENVIRONMENT=staging
DEBUG=False
LOG_LEVEL=INFO
```

### Production
```python
# .env.production
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=WARNING
SENTRY_DSN=your-sentry-dsn
```

---

## Logging Strategy

### Log Levels
- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages
- **WARNING**: Warning messages
- **ERROR**: Error messages
- **CRITICAL**: Critical issues

### Log Format
```python
from loguru import logger

logger.info("Processing job", job_id=job_id, user_id=user_id)
logger.error("Failed to generate content", error=str(e), exc_info=True)
```

---

## Performance Considerations

### Caching
```python
# Cache expensive operations
from functools import lru_cache

@lru_cache(maxsize=100)
def analyze_content(content_hash: str) -> Dict:
    # Expensive analysis
    pass
```

### Async Operations
```python
# Use async for I/O operations
async def fetch_url(url: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.text
```

### Database Optimization
```python
# Use indexes, limit queries
results = await repository.find_all(
    limit=20,
    offset=0,
    order_by="created_at DESC"
)
```

---

This structure provides a scalable, maintainable foundation for the Content Repurposing Engine with clear separation of concerns and extensibility for new features.
