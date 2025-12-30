# Content Repurposing Engine

An intelligent AI-powered system that transforms long-form content into multiple platform-specific versions optimized for LinkedIn, Twitter/X, blogs, emails, and more.

## 🎯 Overview

This system uses Groq API for fast AI-powered content generation, FastAPI for the backend API, and Supabase for data persistence. It intelligently analyzes content and generates platform-optimized versions while maintaining the core message and insights.

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend UI   │
│  (React/HTML)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   FastAPI API   │
│   - Upload      │
│   - Process     │
│   - Retrieve    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Simple Job    │
│   Processor     │
│  ┌───────────┐  │
│  │ Extract   │  │
│  │ Analyze   │  │
│  │ Generate  │  │
│  │ Optimize  │  │
│  └───────────┘  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │
│  - Content DB   │
│  - File Storage │
│  - Analytics    │
└─────────────────┘
```

## 🚀 Features

- **Multi-format Input**: PDF, DOCX, PPT, text, URLs
- **Platform Optimization**: LinkedIn, Twitter/X, Blog, Email sequences
- **Intelligent Analysis**: Extracts key insights, tone, and structure
- **Quality Preservation**: Maintains core message across all versions
- **Fast Processing**: 2-3 minutes for complete repurposing
- **Analytics**: Track performance and engagement

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend)
- Supabase account
- OpenAI API key (or other LLM provider)

## 🛠️ Tech Stack

- **Backend**: FastAPI, Python 3.11+
- **AI Processing**: Groq API (Llama 3)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Document Processing**: PyPDF2, python-docx, BeautifulSoup4
- **LLM**: OpenAI GPT-4 (configurable)

## 📦 Installation

See [INSTALLATION.md](./docs/INSTALLATION.md) for detailed setup instructions.

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Platform Strategies](./docs/PLATFORM_STRATEGIES.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)

## 🎮 Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd content-repurposing-engine

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Initialize database
python scripts/init_db.py

# Run the server
uvicorn app.main:app --reload

# Access API docs
# http://localhost:8000/docs
```

## 📖 Usage Example

```python
import requests

# Upload content
response = requests.post(
    "http://localhost:8000/api/v1/content/upload",
    files={"file": open("article.pdf", "rb")},
    data={"platforms": ["linkedin", "twitter", "blog"]}
)

job_id = response.json()["job_id"]

# Check status
status = requests.get(f"http://localhost:8000/api/v1/jobs/{job_id}")

# Get results
results = requests.get(f"http://localhost:8000/api/v1/content/{job_id}/outputs")
```

## 🔑 Key Components

### 1. Content Extraction
- PDF/DOCX parsing
- URL scraping with readability
- Text preprocessing and cleaning

### 2. Simple Job Processing
- Direct Groq API integration
- Parallel platform generation
- Quality validation gates

### 3. Platform Generators
- LinkedIn: Professional tone, hashtags, CTAs
- Twitter: Thread structure, hooks, engagement
- Blog: SEO optimization, structure
- Email: Sequence building, storytelling

### 4. Quality Assurance
- Character limit validation
- Tone consistency checking
- Key insight preservation
- Platform best practices

## 📊 Project Structure

```
content-repurposing-engine/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── api/
│   │   ├── routes/            # API endpoints
│   │   └── dependencies.py    # Shared dependencies
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   └── security.py        # Auth & security
│   ├── services/
│   │   ├── extraction/        # Content extraction
│   │   └── generators/        # Platform generators
│   ├── models/                # Pydantic models
│   └── db/
│       ├── supabase.py        # Supabase client
│       └── repositories/      # Data access layer
├── docs/                      # Documentation
├── tests/                     # Test suite
├── scripts/                   # Utility scripts
├── requirements.txt
└── .env.example
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_generators.py
```

## 🚀 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for production deployment guide.

## 📈 Performance

- Average processing time: 90-120 seconds
- Supports files up to 50MB
- Concurrent job processing
- Rate limiting and caching

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- Documentation: [docs/](./docs/)
- Issues: GitHub Issues
- Email: support@example.com

---

Built with ❤️ using FastAPI, Groq API, and Supabase
