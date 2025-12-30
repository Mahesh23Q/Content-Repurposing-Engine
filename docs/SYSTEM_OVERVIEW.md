# System Overview: Content Repurposing Engine

## Executive Summary

The Content Repurposing Engine is an AI-powered system that transforms long-form content into multiple platform-optimized versions. It uses Groq API for fast content generation, FastAPI for the backend, and Supabase for data persistence.

**Key Capabilities**:
- Accepts PDF, DOCX, PPT, text, and URLs
- Generates LinkedIn posts, Twitter threads, blog posts, and email sequences
- Maintains core message while adapting to platform best practices
- Processes content in 90-120 seconds
- Provides quality validation and automatic retry logic

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  (Web UI, Mobile App, API Clients, CLI Tools)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Content    │  │     Jobs     │  │   Outputs    │     │
│  │   Routes     │  │    Routes    │  │   Routes     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Extraction  │  │ Simple Job   │  │  Validation  │     │
│  │   Service    │  │  Processor   │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Platform Generators                         │  │
│  │  LinkedIn │ Twitter │ Blog │ Email │ Instagram       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │   Storage    │  │     Auth     │     │
│  │  (Supabase)  │  │  (Supabase)  │  │  (Supabase)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Groq API   │  │   (Errors)   │     │
│  │   (Llama3)   │  │   (Errors)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **API** | FastAPI | HTTP server, routing, validation |
| **Processing** | Groq API | AI content generation |
| **LLM** | Groq (Llama 3) | Content analysis & generation |
| **Database** | Supabase (PostgreSQL) | Data persistence |
| **Storage** | Supabase Storage | File storage |
| **Auth** | Supabase Auth | User authentication |
| **Errors** | Sentry | Error tracking |
| **Cache** | Redis (optional) | Caching & job queue |

---

## Core Workflows

### 1. Content Upload & Processing

```
User uploads content
        ↓
[API Layer] Validate & store file
        ↓
[Extraction Service] Extract text & metadata
        ↓
[Database] Store content record
        ↓
[Job Queue] Create processing job
        ↓
Return job_id to user
```

### 2. Simple Job Processing

```
[START]
   ↓
[Analyze Content]
   ├─ Extract key insights
   ├─ Detect tone & audience
   └─ Generate hooks
   ↓
[Generate Strategy]
   ├─ Platform-specific approaches
   └─ Point selection
   ↓
[Parallel Generation]
   ├─ LinkedIn Generator
   ├─ Twitter Generator
   ├─ Blog Generator
   └─ Email Generator
   ↓
[Validate Outputs]
   ├─ Check character limits
   ├─ Verify structure
   └─ Calculate quality scores
   ↓
[Decision Point]
   ├─ Pass → Save Results
   ├─ Fail & retry < 2 → Regenerate
   └─ Fail & retry >= 2 → Save with warnings
   ↓
[Save Results]
   ↓
[END]
```

### 3. Result Retrieval

```
User requests outputs
        ↓
[API Layer] Authenticate user
        ↓
[Database] Fetch outputs by job_id
        ↓
[API Layer] Format response
        ↓
Return platform-specific content
```

---

## Data Flow

### Input Processing

```
Raw Input (PDF/DOCX/URL/Text)
        ↓
[Format Detection]
        ↓
[Appropriate Extractor]
   ├─ PDFExtractor (PyPDF2, pdfplumber)
   ├─ DOCXExtractor (python-docx)
   ├─ PPTExtractor (python-pptx)
   └─ URLExtractor (BeautifulSoup, Readability)
        ↓
[Text Preprocessing]
   ├─ Remove extra whitespace
   ├─ Fix encoding
   └─ Clean special characters
        ↓
[Metadata Extraction]
   ├─ Word count
   ├─ Reading time
   ├─ Language detection
   └─ Topic extraction
        ↓
Cleaned Text + Metadata
```

### Content Analysis

```
Cleaned Text
        ↓
[LLM Analysis]
   ├─ Main thesis identification
   ├─ Key insight extraction (5-7 points)
   ├─ Tone detection
   ├─ Audience identification
   ├─ Content type classification
   └─ Hook generation (3 options)
        ↓
Analysis Results (JSON)
```

### Platform Generation

```
Analysis Results + Strategy
        ↓
[Platform-Specific Generator]
        ↓
[LLM Generation with Platform Prompt]
   ├─ LinkedIn: Professional post with hashtags
   ├─ Twitter: Engaging thread with hooks
   ├─ Blog: SEO-optimized article
   └─ Email: 3-email nurture sequence
        ↓
Platform-Optimized Content (JSON)
```

### Quality Validation

```
Generated Content
        ↓
[Validation Checks]
   ├─ Character/word limits
   ├─ Required elements present
   ├─ Structure compliance
   └─ Quality scoring
        ↓
[Decision]
   ├─ Pass → Save
   ├─ Fail → Regenerate (if retries < 2)
   └─ Fail → Save with warnings (if retries >= 2)
```

---

## Database Schema

### Core Tables

**content**
- Stores original content and metadata
- Fields: id, user_id, title, original_text, source_type, metadata, analysis

**jobs**
- Tracks processing jobs
- Fields: id, content_id, status, platforms, progress, started_at, completed_at

**outputs**
- Stores generated platform content
- Fields: id, job_id, platform, content, quality_score, validation_results

**analytics**
- Tracks performance metrics
- Fields: id, output_id, views, clicks, engagement_rate

### Relationships

```
users (Supabase Auth)
   ↓ 1:N
content
   ↓ 1:N
jobs
   ↓ 1:N
outputs
   ↓ 1:N
analytics
```

---

## API Endpoints

### Content Management
- `POST /content/upload` - Upload file
- `POST /content/text` - Submit text
- `POST /content/url` - Submit URL
- `GET /content/{id}` - Get content details
- `GET /content` - List user's content
- `DELETE /content/{id}` - Delete content

### Job Management
- `GET /jobs/{id}` - Get job status
- `GET /jobs` - List user's jobs
- `POST /jobs/{id}/cancel` - Cancel job

### Output Management
- `GET /outputs/{job_id}` - Get all outputs for job
- `GET /outputs/{id}` - Get specific output
- `PUT /outputs/{id}` - Update output
- `POST /outputs/{id}/regenerate` - Regenerate output
- `GET /outputs` - List user's outputs

### Analytics
- `GET /analytics/summary` - User analytics summary
- `GET /analytics/outputs/{id}` - Output analytics
- `POST /analytics/outputs/{id}` - Update analytics

---

## Platform Generators

### LinkedIn Generator

**Strategy**:
- Professional tone
- Hook in first 150 characters
- Line breaks for scannability
- 3-5 strategic hashtags
- Clear CTA

**Output Structure**:
```json
{
  "post": "Full post text with line breaks",
  "hashtags": ["tag1", "tag2", "tag3"],
  "character_count": 1250,
  "hook": "The hook used",
  "cta": "Call to action"
}
```

### Twitter Generator

**Strategy**:
- Conversational tone
- 3-7 tweet thread
- Numbered format (1/X)
- Hook in first tweet
- One idea per tweet

**Output Structure**:
```json
{
  "tweets": [
    {"number": "1/6", "text": "...", "char_count": 245},
    {"number": "2/6", "text": "...", "char_count": 268}
  ],
  "total_tweets": 6
}
```

### Blog Generator

**Strategy**:
- 500-700 words
- SEO-optimized
- Clear header structure
- Introduction → Body → Conclusion

**Output Structure**:
```json
{
  "title": "SEO-optimized title",
  "meta_description": "150-160 char description",
  "content": "Full blog with markdown",
  "word_count": 650,
  "keywords": ["keyword1", "keyword2"]
}
```

### Email Generator

**Strategy**:
- 3-email sequence
- Progressive value delivery
- Curiosity gaps between emails
- Story-driven

**Output Structure**:
```json
{
  "emails": [
    {
      "sequence_number": 1,
      "subject": "Hook + Problem",
      "body": "Email content",
      "cta": "Tomorrow I'll share..."
    }
  ]
}
```

---

## Quality Assurance

### Validation Rules

**LinkedIn**:
- ✓ Character count ≤ 1300
- ✓ Has 3-5 hashtags
- ✓ Has clear CTA
- ✓ Line breaks present

**Twitter**:
- ✓ 3-7 tweets
- ✓ Each tweet ≤ 280 characters
- ✓ Numbered format
- ✓ Hook in first tweet

**Blog**:
- ✓ 500-700 words
- ✓ Has title and meta description
- ✓ Header structure (H2, H3)
- ✓ Introduction and conclusion

**Email**:
- ✓ Exactly 3 emails
- ✓ Each has subject and body
- ✓ Progressive value delivery

### Quality Scoring

```python
quality_score = (
    0.3 * structure_compliance +
    0.3 * content_quality +
    0.2 * platform_optimization +
    0.2 * engagement_potential
)
```

---

## Performance Characteristics

### Processing Time
- **Average**: 90-120 seconds
- **Breakdown**:
  - Extraction: 5-10 seconds
  - Analysis: 15-20 seconds
  - Generation (parallel): 60-80 seconds
  - Validation: 5-10 seconds

### Scalability
- **Concurrent Jobs**: 5 (configurable)
- **Max File Size**: 50MB
- **Rate Limits**: 60/min, 1000/hour per user

### Resource Usage
- **Memory**: ~500MB per worker
- **CPU**: Minimal (I/O bound)
- **Storage**: ~10MB per content piece
- **LLM Tokens**: ~3000-5000 per job

---

## Security

### Authentication
- JWT tokens (30-minute expiry)
- Supabase Auth integration
- API key support for programmatic access

### Authorization
- Row Level Security (RLS) in Supabase
- Users can only access their own data
- Service role for admin operations

### Data Protection
- Encryption at rest (Supabase)
- Encryption in transit (HTTPS)
- File scanning for malware (optional)

### Rate Limiting
- Per-user limits
- IP-based throttling
- Graceful degradation

---

## Monitoring & Observability

### Metrics Tracked
- Processing time per platform
- Success/failure rates
- LLM token usage
- Quality scores
- User engagement

### Logging
- Structured JSON logs
- Request tracing
- Error tracking (Sentry)

### Health Checks
- Database connectivity
- Storage availability
- LLM API status
- Overall system health

---

## Deployment Options

### Development
```bash
uvicorn app.main:app --reload
```

### Production (Single Server)
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker
```bash
docker-compose up -d
```

### Cloud Platforms
- **Heroku**: One-click deploy
- **AWS**: ECS/Fargate
- **Google Cloud**: Cloud Run
- **Azure**: App Service

---

## Extensibility

### Adding New Platforms

1. Create generator: `app/services/generators/new_platform.py`
2. Add validation: `app/services/validation/validators.py`
4. Update API models: `app/models/output.py`

### Custom Prompts

Modify prompts in generator files:
```python
# app/services/generators/linkedin.py
LINKEDIN_PROMPT = """
Your custom prompt here...
"""
```

### Additional Features

- **Templates**: Reusable content templates
- **Scheduling**: Schedule content publishing
- **Analytics Integration**: Connect to platform APIs
- **A/B Testing**: Test different versions
- **Collaboration**: Team features

---

## Cost Estimation

### OpenAI API Costs (GPT-4 Turbo)
- **Per Job**: ~$0.10-0.15
- **1000 Jobs/month**: ~$100-150
- **10,000 Jobs/month**: ~$1000-1500

### Supabase Costs
- **Free Tier**: 500MB database, 1GB storage
- **Pro Tier**: $25/month (8GB database, 100GB storage)

### Total Monthly Cost (1000 jobs)
- **OpenAI**: $100-150
- **Supabase**: $25
- **Hosting**: $10-50
- **Total**: ~$135-225/month

---

## Future Enhancements

### Planned Features
- [ ] Real-time collaboration
- [ ] Content calendar integration
- [ ] Multi-language support
- [ ] Voice-to-text input
- [ ] Image generation for posts
- [ ] Analytics dashboard
- [ ] Browser extension
- [ ] Mobile app

### Potential Integrations
- Zapier for automation
- Buffer/Hootsuite for scheduling
- Google Analytics for tracking
- Slack for notifications
- WordPress for direct publishing

---

## Support & Resources

### Documentation
- `README.md` - Project overview
- `QUICKSTART.md` - Quick start guide
- `docs/` - Comprehensive documentation

### Community
- GitHub Issues - Bug reports & features
- Discord - Community chat
- Email - support@example.com

### Contributing
- See `CONTRIBUTING.md`
- Pull requests welcome
- Code of conduct enforced

---

This system provides a robust, scalable foundation for intelligent content repurposing with clear architecture, comprehensive documentation, and extensibility for future enhancements.
