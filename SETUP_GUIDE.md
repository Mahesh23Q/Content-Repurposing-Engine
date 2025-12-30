# Content Repurposing Engine - Complete Setup Guide

## 🎯 Quick Start (5 Minutes)

### Step 1: Database Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Open your project: `hbxxlbyjjelfpsepwvok`
3. Go to **SQL Editor** (left sidebar)
4. Copy everything from `backend/database_schema.sql`
5. Paste into SQL Editor and click **Run**

### Step 2: Configure Backend
 
 1. Copy the example environment file:
 ```bash
 cd backend
 cp .env.example .env
 ```
 
 2. Open `backend/.env` and update the following with your credentials:
    - `SUPABASE_URL`
    - `SUPABASE_KEY` (Anon Key)
    - `SUPABASE_SERVICE_KEY` (Service Role Key)
    - `SUPABASE_JWT_SECRET` (JWT Secret)
    - `GROQ_API_KEY` (or OPENAI_API_KEY if you switched providers)
    - `SECRET_KEY` (Generate a new secure key)

Get your OpenAI key from: https://platform.openai.com/api-keys

### Step 3: Test Backend

```bash
# Install backend dependencies (if not already done)
pip install -r requirements.txt

# Test the setup
python test_setup.py

# If all tests pass, start the server
uvicorn backend.main:app --reload
```

Backend will be available at: http://localhost:8000

### Step 4: Frontend Setup

1. Open a new terminal and go to frontend directory:
```bash
cd frontend
cp .env.example .env
```

2. Install and Start:
```bash
npm install
npm run dev
```

Frontend will be available at: http://localhost:5173

## 🔑 Your Credentials

**Supabase Project:**
- URL: `https://hbxxlbyjjelfpsepwvok.supabase.co`
- Anon Key: ✅ Already configured in backend/.env
- Service Key: ✅ Already configured in backend/.env

**Frontend API Endpoint:**
- Already configured to connect to `http://localhost:8000/api/v1`

## 📋 Database Tables Created

✅ **user_profiles** - User profile data (extends Supabase auth.users)
✅ **content** - Uploaded content and source files
✅ **jobs** - Processing jobs with status tracking
✅ **outputs** - Generated content for each platform
✅ **analytics** - Performance metrics and engagement data

All tables include:
- Row Level Security (RLS) enabled
- Automatic timestamps (created_at, updated_at)
- Proper indexes for performance
- Foreign key constraints

## 🧪 Testing the Complete Flow

### 1. Register a User

```bash
# Via Frontend: http://localhost:5173/register
# Or via API:
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "full_name": "Test User"
  }'
```

### 2. Login

```bash
# Via Frontend: http://localhost:5173/login
# Or via API:
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. Create Content (Once OpenAI key is set)

```bash
curl -X POST http://localhost:8000/api/v1/content/text \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Article",
    "text": "Your long-form content here (minimum 100 characters)...",
    "platforms": ["linkedin", "twitter", "blog"]
  }'
```

## 🔧 Configuration Files

### Backend (.env)
Location: `backend/.env`

Key settings to customize:
```env
# Required
OPENAI_API_KEY=sk-your-key-here  # ⚠️ ADD THIS!

# Optional (already set to defaults)
MAX_FILE_SIZE_MB=50
MAX_CONCURRENT_JOBS=5
RATE_LIMIT_PER_MINUTE=60
```

### Frontend (.env)
Location: `frontend/.env`

Already configured:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 📊 Monitoring & Debugging

### Check Supabase Logs
Go to Supabase Dashboard → Logs to see database queries and errors

### Check Backend Logs
Backend uses Loguru for logging. All logs appear in the console with timestamps.

### API Documentation
Once backend is running, visit:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Test Supabase connection
python backend/test_setup.py
```

If it fails:
1. Verify `database_schema.sql` was executed successfully
2. Check your Supabase project is active
3. Verify credentials in `backend/.env` match your Supabase dashboard

### Backend Won't Start

```bash
# Check if all dependencies are installed
pip install -r backend/requirements.txt

# Check for port conflicts (8000)
# On Windows:
netstat -ano | findstr :8000

# Change port if needed:
uvicorn backend.main:app --reload --port 8001
```

### Frontend Issues

```bash
cd frontend
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📦 Project Structure

```
Syntax-squad/
├── backend/
│   ├── .env                    # Backend configuration (UPDATE OPENAI KEY!)
│   ├── database_schema.sql     # Database setup script
│   ├── DATABASE_SETUP.md       # Database setup guide
│   ├── test_setup.py          # Test script
│   ├── main.py                # FastAPI app
│   ├── core/config.py         # Settings
│   ├── db/supabase.py         # Supabase client
│   ├── api/routes/            # API endpoints
│   └── models/                # Pydantic models
│
├── frontend/
│   ├── .env                   # Frontend configuration
│   ├── src/
│   │   ├── pages/            # Landing, Login, Register, Dashboard
│   │   ├── components/       # UI components
│   │   ├── context/          # AuthContext
│   │   └── config/           # API client
│   └── tailwind.config.cjs   # Tailwind CSS config
│
└── SETUP_GUIDE.md            # This file
```

## ✅ Checklist

- [ ] Database schema executed in Supabase
- [ ] Environment variables configured in backend/.env
- [ ] Environment variables configured in frontend/.env
- [ ] Backend dependencies installed
- [ ] Backend test passed (`python test_setup.py`)
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] Successfully registered a user
- [ ] Successfully logged in
- [ ] Dashboard loads correctly

## 🎉 You're All Set!

Once you complete the checklist above, you have:
- ✅ A beautiful glassmorphism frontend with Tailwind CSS
- ✅ FastAPI backend with Supabase database
- ✅ Complete authentication flow
- ✅ Ready to generate AI-powered content across platforms!

## 📧 Need Help?

Check the documentation:
- Backend README: `backend/README.md`
- Database Setup: `backend/DATABASE_SETUP.md`
- API Docs: http://localhost:8000/api/v1/docs (when server is running)
