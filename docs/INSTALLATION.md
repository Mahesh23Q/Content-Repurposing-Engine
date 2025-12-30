# Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+**: [Download Python](https://www.python.org/downloads/)
- **pip**: Python package manager (comes with Python)
- **Git**: [Download Git](https://git-scm.com/downloads)
- **Supabase Account**: [Sign up for Supabase](https://supabase.com)
- **OpenAI API Key**: [Get API key](https://platform.openai.com/api-keys)

Optional but recommended:
- **Node.js 18+**: For frontend (if building UI)
- **Docker**: For containerized deployment
- **Redis**: For caching and job queue

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/content-repurposing-engine.git
cd content-repurposing-engine
```

---

## Step 2: Set Up Python Environment

### Using venv (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### Using conda (Alternative)

```bash
# Create conda environment
conda create -n content-engine python=3.11
conda activate content-engine
```

---

## Step 3: Install Dependencies

```bash
# Install all required packages
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

---

## Step 4: Set Up Supabase

### 4.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `content-repurposing-engine`
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 4.2 Get Supabase Credentials

From your project dashboard:

1. **Project URL**: Settings → API → Project URL
2. **Anon Key**: Settings → API → Project API keys → anon/public
3. **Service Role Key**: Settings → API → Project API keys → service_role
4. **JWT Secret**: Settings → API → JWT Settings → JWT Secret

### 4.3 Initialize Database

```bash
# Run database initialization script
python scripts/init_db.py
```

This script will:
- Create all required tables
- Set up Row Level Security (RLS) policies
- Create storage buckets
- Add indexes and triggers

Alternatively, run SQL manually:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/schema.sql`
3. Click "Run"

### 4.4 Set Up Storage Buckets

```bash
# Run storage setup script
python scripts/init_storage.py
```

Or manually in Supabase Dashboard:
1. Go to Storage
2. Create bucket: `uploads` (private)
3. Create bucket: `exports` (private)
4. Set up RLS policies (see `docs/DATABASE_SCHEMA.md`)

---

## Step 5: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use your preferred editor
```

### Required Configuration

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Security
SECRET_KEY=generate-a-secure-random-key-here
```

### Generate Secret Key

```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and paste it as `SECRET_KEY` in `.env`

---

## Step 6: Verify Installation

```bash
# Run tests
pytest

# Check configuration
python scripts/check_config.py
```

Expected output:
```
✓ Python version: 3.11.x
✓ All dependencies installed
✓ Supabase connection: OK
✓ OpenAI API: OK
✓ Database tables: OK
✓ Storage buckets: OK
```

---

## Step 7: Run the Application

### Development Mode

```bash
# Start the server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
# Start with Gunicorn (Linux/macOS)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or with Uvicorn (Windows)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Access the Application

- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

---

## Step 8: Create First User

### Using Supabase Dashboard

1. Go to Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Click "Create User"

### Using API

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure-password",
    "full_name": "John Doe"
  }'
```

---

## Step 9: Test the System

### Upload Test Content

```bash
# Using curl
curl -X POST http://localhost:8000/api/v1/content/text \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "text": "Your long-form content here...",
    "platforms": ["linkedin", "twitter"]
  }'
```

### Using Python

```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={"email": "user@example.com", "password": "your-password"}
)
token = response.json()["access_token"]

# Upload content
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(
    "http://localhost:8000/api/v1/content/text",
    headers=headers,
    json={
        "title": "Test Article",
        "text": "Your content here...",
        "platforms": ["linkedin", "twitter"]
    }
)

job_id = response.json()["job_id"]
print(f"Job ID: {job_id}")

# Check status
import time
while True:
    response = requests.get(
        f"http://localhost:8000/api/v1/jobs/{job_id}",
        headers=headers
    )
    status = response.json()["status"]
    print(f"Status: {status}")
    
    if status in ["completed", "failed"]:
        break
    
    time.sleep(5)

# Get outputs
response = requests.get(
    f"http://localhost:8000/api/v1/outputs/{job_id}",
    headers=headers
)
outputs = response.json()
print(outputs)
```

---

## Optional: Set Up Redis (Recommended for Production)

### Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Windows:**
Download from [Redis Windows](https://github.com/microsoftarchive/redis/releases)

### Configure Redis

Add to `.env`:
```env
REDIS_URL=redis://localhost:6379/0
```

---

## Optional: Set Up Sentry (Error Tracking)

1. Sign up at [Sentry](https://sentry.io)
2. Create a project
3. Get DSN from project settings
4. Add to `.env`:

```env
SENTRY_DSN=your-sentry-dsn
```

---

## Docker Installation (Alternative)

### Using Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download models
RUN python -m spacy download en_core_web_sm

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - redis
    volumes:
      - ./logs:/app/logs

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue: Supabase connection fails

**Solution:**
1. Check `.env` credentials are correct
2. Verify Supabase project is active
3. Check network/firewall settings
4. Test connection:
```python
from supabase import create_client
client = create_client(SUPABASE_URL, SUPABASE_KEY)
print(client.table('content').select('*').limit(1).execute())
```

### Issue: OpenAI API errors

**Solution:**
1. Verify API key is valid
2. Check account has credits
3. Test API key:
```python
from openai import OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)
response = client.chat.completions.create(
    model="gpt-4-turbo-preview",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response)
```

### Issue: Port 8000 already in use

**Solution:**
```bash
# Use different port
uvicorn app.main:app --port 8001

# Or kill process using port 8000
# Linux/macOS:
lsof -ti:8000 | xargs kill -9
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: Database tables not created

**Solution:**
```bash
# Run initialization script again
python scripts/init_db.py --force

# Or manually run SQL
# Copy contents of scripts/schema.sql
# Paste in Supabase SQL Editor
```

---

## Next Steps

1. **Read Documentation**: Check `docs/` folder for detailed guides
2. **Configure Platforms**: Set up platform-specific settings
3. **Customize Prompts**: Modify generation prompts in `app/services/generators/`
4. **Set Up Monitoring**: Configure Sentry for error tracking
5. **Deploy**: See `docs/DEPLOYMENT.md` for production deployment

---

## Getting Help

- **Documentation**: Check `docs/` folder
- **Issues**: GitHub Issues
- **Email**: support@example.com
- **Discord**: Join our community

---

## Updating

```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt --upgrade

# Run migrations
python scripts/migrate.py

# Restart server
```

---

Congratulations! Your Content Repurposing Engine is now installed and ready to use. 🎉
