# Quick Start Guide

Get the Content Repurposing Engine running in 10 minutes.

## Prerequisites

- Python 3.11+
- Supabase account
- OpenAI API key

## Installation

### 1. Clone & Install

```bash
git clone https://github.com/your-username/content-repurposing-engine.git
cd content-repurposing-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase (get from https://app.supabase.com)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-key-here

# Security (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
SECRET_KEY=your-generated-secret-key
```

### 3. Initialize Database

```bash
python scripts/init_db.py
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload
```

Visit http://localhost:8000/api/v1/docs to see the API documentation.

## First Request

### 1. Create User (via Supabase Dashboard)

1. Go to https://app.supabase.com
2. Select your project
3. Go to Authentication → Users
4. Click "Add User"
5. Enter email and password

### 2. Get Access Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the `access_token` from the response.

### 3. Submit Content

```bash
curl -X POST http://localhost:8000/api/v1/content/text \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to Choose Running Shoes",
    "text": "Your long-form content here... (2000+ words)",
    "platforms": ["linkedin", "twitter", "blog"]
  }'
```

Save the `job_id` from the response.

### 4. Check Status

```bash
curl -X GET http://localhost:8000/api/v1/jobs/YOUR_JOB_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Get Results

Once status is "completed":

```bash
curl -X GET http://localhost:8000/api/v1/outputs/YOUR_JOB_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Python Example

```python
import requests
import time

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "your-email@example.com"
PASSWORD = "your-password"

# 1. Login
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": EMAIL, "password": PASSWORD}
)
token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Submit content
content = """
Your long-form content here...
This should be 500+ words for best results.
"""

response = requests.post(
    f"{BASE_URL}/content/text",
    headers=headers,
    json={
        "title": "My Article Title",
        "text": content,
        "platforms": ["linkedin", "twitter", "blog"]
    }
)
job_id = response.json()["job_id"]
print(f"Job created: {job_id}")

# 3. Wait for completion
while True:
    response = requests.get(f"{BASE_URL}/jobs/{job_id}", headers=headers)
    status = response.json()["status"]
    print(f"Status: {status}")
    
    if status in ["completed", "failed"]:
        break
    
    time.sleep(5)

# 4. Get results
if status == "completed":
    response = requests.get(f"{BASE_URL}/outputs/{job_id}", headers=headers)
    outputs = response.json()
    
    print("\n=== LinkedIn Post ===")
    print(outputs["linkedin"]["post"])
    
    print("\n=== Twitter Thread ===")
    for tweet in outputs["twitter"]["tweets"]:
        print(f"{tweet['number']}: {tweet['text']}\n")
    
    print("\n=== Blog Post ===")
    print(outputs["blog"]["title"])
    print(outputs["blog"]["content"][:500] + "...")
```

## Next Steps

- **Read Documentation**: Check `docs/` folder for detailed guides
- **Customize Prompts**: Modify generators in `app/services/generators/`
- **Add Platforms**: Create new generators for additional platforms
- **Deploy**: See `docs/DEPLOYMENT.md` for production setup

## Troubleshooting

### "Module not found" errors
```bash
pip install -r requirements.txt --force-reinstall
```

### Supabase connection fails
- Verify credentials in `.env`
- Check project is active in Supabase dashboard
- Ensure database tables are created (`python scripts/init_db.py`)

### OpenAI API errors
- Verify API key is valid
- Check account has credits
- Test key: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

### Port 8000 in use
```bash
# Use different port
uvicorn app.main:app --port 8001
```

## Support

- **Documentation**: `docs/` folder
- **Issues**: GitHub Issues
- **Email**: support@example.com

---

You're all set! Start repurposing content across platforms. 🚀
