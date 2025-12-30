# Architecture Overview

## System Design Philosophy

The Content Repurposing Engine is built on three core principles:

1. **Simple Processing**: Groq API handles content generation directly
2. **Platform Expertise**: Each platform has specialized generators with deep knowledge
3. **Quality First**: Multiple validation gates ensure output quality

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Layer                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Web UI    │  │  Mobile    │  │  API       │            │
│  │  (React)   │  │  App       │  │  Clients   │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
└─────────┼────────────────┼────────────────┼──────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    API Gateway Layer                         │
│                   ┌──────▼──────┐                           │
│                   │   FastAPI   │                           │
│                   │   Router    │                           │
│                   └──────┬──────┘                           │
│                          │                                   │
│    ┌─────────────────────┼─────────────────────┐           │
│    │                     │                     │           │
│    ▼                     ▼                     ▼           │
│ ┌────────┐         ┌─────────┐         ┌──────────┐       │
│ │ Upload │         │ Process │         │ Retrieve │       │
│ │ Routes │         │ Routes  │         │ Routes   │       │
│ └────────┘         └─────────┘         └──────────┘       │
└──────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                   Service Layer                              │
│                          │                                   │
│    ┌─────────────────────┼─────────────────────┐           │
│    │                     │                     │           │
│    ▼                     ▼                     ▼           │
│ ┌──────────┐      ┌────────────┐      ┌──────────┐        │
│ │Extraction│      │Simple Job │      │Analytics │        │
│ │ Service  │      │Processor  │      │ Service  │        │
│ └────┬─────┘      └─────┬──────┘      └──────────┘        │
│      │                  │                                   │
│      │    ┌─────────────┴─────────────┐                   │
│      │    │                           │                   │
│      │    ▼                           ▼                   │
│      │ ┌──────────────┐        ┌──────────────┐          │
│      │ │  Analysis    │        │  Generation  │          │
│      │ │  Agent       │        │  Agents      │          │
│      │ └──────────────┘        └──────┬───────┘          │
│      │                                 │                   │
│      │                    ┌────────────┴────────────┐     │
│      │                    │                         │     │
│      │                    ▼                         ▼     │
│      │            ┌──────────────┐         ┌──────────┐  │
│      │            │  LinkedIn    │         │ Twitter  │  │
│      │            │  Generator   │         │Generator │  │
│      │            └──────────────┘         └──────────┘  │
│      │                    │                         │     │
│      │                    ▼                         ▼     │
│      │            ┌──────────────┐         ┌──────────┐  │
│      │            │   Blog       │         │  Email   │  │
│      │            │  Generator   │         │Generator │  │
│      │            └──────────────┘         └──────────┘  │
└──────┼────────────────────────────────────────────────────┘
       │
┌──────┼────────────────────────────────────────────────────┐
│      │              Data Layer                            │
│      │                                                     │
│      ▼                                                     │
│ ┌──────────────────────────────────────────────────────┐ │
│ │                    Supabase                          │ │
│ │                                                      │ │
│ │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │ │
│ │  │  PostgreSQL  │  │    Storage   │  │   Auth    │ │ │
│ │  │              │  │              │  │           │ │ │
│ │  │ - content    │  │ - files      │  │ - users   │ │ │
│ │  │ - jobs       │  │ - uploads    │  │ - tokens  │ │ │
│ │  │ - outputs    │  │              │  │           │ │ │
│ │  │ - analytics  │  │              │  │           │ │ │
│ │  └──────────────┘  └──────────────┘  └───────────┘ │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Component Details

### 1. API Gateway Layer (FastAPI)

**Purpose**: Handle HTTP requests, validation, authentication, and routing

**Key Components**:
- **Upload Routes**: Handle file uploads, URL submissions, text input
- **Process Routes**: Trigger content repurposing jobs
- **Retrieve Routes**: Fetch results, status, analytics

**Technologies**:
- FastAPI for async request handling
- Pydantic for request/response validation
- JWT for authentication
- Rate limiting middleware

**Flow**:
```python
# Example request flow
Client → FastAPI Router → Validation → Auth Check → Service Layer
```

### 2. Extraction Service

**Purpose**: Extract and normalize content from various sources

**Supported Formats**:
- **PDF**: PyPDF2, pdfplumber for complex layouts
- **DOCX**: python-docx for Word documents
- **PPT**: python-pptx for PowerPoint
- **URL**: BeautifulSoup4 + Readability for web scraping
- **Text**: Direct input processing

**Process**:
```
Input → Format Detection → Parser Selection → Content Extraction → 
Cleaning → Metadata Extraction → Normalized Output
```

**Output Structure**:
```python
{
    "raw_text": "Full extracted text",
    "title": "Detected or provided title",
    "metadata": {
        "word_count": 2000,
        "reading_time": 8,
        "detected_language": "en",
        "source_type": "pdf"
    },
    "structure": {
        "headings": [...],
        "paragraphs": [...],
        "key_points": [...]
    }
}
```

### 3. Simple Job Processor

**Purpose**: Process content using Groq API

**Why Simple Processing?**
- Direct API calls without complex orchestration
- Easier to maintain and debug
- Parallel execution of platform generators
- Error recovery and retry logic
- Observable workflow for debugging

**Workflow Graph**:
```
                    ┌─────────────┐
                    │   START     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Analyze    │
                    │  Content    │
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
         ┌─────────────┐      ┌─────────────┐
         │  Extract    │      │  Identify   │
         │  Key Points │      │  Tone/Style │
         └──────┬──────┘      └──────┬──────┘
                │                     │
                └──────────┬──────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Generate   │
                    │  Strategy   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  LinkedIn    │   │   Twitter    │   │    Blog      │
│  Generator   │   │   Generator  │   │  Generator   │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Validate  │
                   │   Quality   │
                   └──────┬──────┘
                          │
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
              ┌─────────┐  ┌─────────┐
              │  PASS   │  │  RETRY  │
              └────┬────┘  └────┬────┘
                   │            │
                   │            └──────┐
                   │                   │
                   ▼                   ▼
              ┌─────────────┐   ┌─────────────┐
              │    Save     │   │  Regenerate │
              │   Results   │   │  (max 2x)   │
              └──────┬──────┘   └─────────────┘
                     │
                     ▼
              ┌─────────────┐
              │     END     │
              └─────────────┘
```

**State Schema**:
```python
class WorkflowState(TypedDict):
    # Input
    content: str
    metadata: dict
    platforms: List[str]
    
    # Analysis
    key_insights: List[str]
    tone: str
    target_audience: str
    content_type: str
    
    # Generation
    outputs: Dict[str, Any]
    
    # Control
    retry_count: int
    errors: List[str]
```

### 4. Analysis Agent

**Purpose**: Deep content understanding before generation

**Analysis Steps**:

1. **Content Classification**
   - Type: Tutorial, Opinion, Case Study, News, etc.
   - Industry: Tech, Business, Health, etc.
   - Complexity: Beginner, Intermediate, Advanced

2. **Key Insight Extraction**
   - Main thesis/argument
   - Supporting points (3-7)
   - Data/statistics
   - Examples/stories
   - Actionable takeaways

3. **Tone Analysis**
   - Formality level
   - Emotional tone
   - Voice (first/third person)
   - Writing style

4. **Audience Detection**
   - Expertise level
   - Industry/role
   - Pain points addressed

**LLM Prompt Strategy**:
```python
ANALYSIS_PROMPT = """
Analyze this content for repurposing:

Content: {content}

Provide:
1. Main thesis (1 sentence)
2. Key insights (3-7 bullet points)
3. Tone (professional/casual/technical/inspirational)
4. Target audience
5. Content type
6. Best hooks for social media (3 options)
7. Core value proposition

Format as JSON.
"""
```

### 5. Platform Generators

Each platform has a specialized generator with deep knowledge of best practices.

#### LinkedIn Generator

**Strategy**:
- Professional yet conversational tone
- Hook in first 2 lines (before "see more")
- Line breaks for scannability
- 3-5 strategic hashtags
- Clear CTA
- 1300 character limit

**Structure**:
```
[Hook - 1-2 lines]

[Problem/Context - 2-3 lines]

[Main Points - 3-5 bullets or numbered list]

[Insight/Lesson - 2-3 lines]

[CTA]

#Hashtag1 #Hashtag2 #Hashtag3
```

**LLM Prompt**:
```python
LINKEDIN_PROMPT = """
Create a LinkedIn post from this content:

Original: {content}
Key Insights: {insights}
Tone: {tone}

Requirements:
- Start with a compelling hook (before "see more" cutoff)
- Professional but conversational
- Use line breaks for readability
- Include 3-5 relevant hashtags
- End with clear CTA
- Max 1300 characters
- Maintain core message

Output format:
{{
    "post": "...",
    "hashtags": ["...", "..."],
    "character_count": 1250,
    "hook_strength": "high/medium/low"
}}
"""
```

#### Twitter/X Thread Generator

**Strategy**:
- 3-7 tweets optimal length
- Hook in first tweet (critical)
- One idea per tweet
- Numbered format (1/7, 2/7...)
- Thread conclusion with CTA
- 280 characters per tweet

**Structure**:
```
Tweet 1/7: [Hook - question, stat, or bold claim]

Tweet 2/7: [Context/Problem]

Tweet 3/7: [Point 1]

Tweet 4/7: [Point 2]

Tweet 5/7: [Point 3]

Tweet 6/7: [Insight/Lesson]

Tweet 7/7: [Summary + CTA]
```

**Hook Strategies**:
- Question: "Want to know why 73% of startups fail?"
- Stat: "I analyzed 1000 LinkedIn posts. Here's what works:"
- Bold claim: "Everything you know about SEO is wrong."
- Story: "3 years ago I made a $50K mistake. Here's what I learned:"

**LLM Prompt**:
```python
TWITTER_PROMPT = """
Create a Twitter/X thread from this content:

Original: {content}
Key Insights: {insights}
Best Hooks: {hooks}

Requirements:
- 3-7 tweets
- Numbered format (1/X, 2/X...)
- Compelling hook in first tweet
- One clear idea per tweet
- Max 280 characters per tweet
- Final tweet: summary + CTA
- Conversational tone

Output format:
{{
    "tweets": [
        {{"number": "1/7", "text": "...", "char_count": 245}},
        ...
    ],
    "thread_summary": "...",
    "engagement_score": "high/medium/low"
}}
"""
```

#### Blog Generator

**Strategy**:
- 500-700 words (condensed version)
- Clear header structure (H2, H3)
- SEO-friendly
- Introduction → Body → Conclusion
- Maintains depth while being concise

**Structure**:
```
# Title (H1)

## Introduction (H2)
[Hook + Context + Preview]

## Main Section 1 (H2)
[Point + Explanation + Example]

### Subsection (H3)
[Detail]

## Main Section 2 (H2)
[Point + Explanation + Example]

## Conclusion (H2)
[Summary + CTA]
```

**SEO Optimization**:
- Keyword placement (title, H2s, first paragraph)
- Meta description generation
- Internal linking suggestions
- Image alt text recommendations

#### Email Sequence Generator

**Strategy**:
- 3-5 email sequence
- Storytelling arc
- Each email builds on previous
- Curiosity gaps between emails
- Progressive value delivery

**Sequence Structure**:
```
Email 1: Hook + Problem
- Subject: Curiosity-driven
- Body: Introduce problem, tease solution
- CTA: "Tomorrow I'll share..."

Email 2: Story + Mistake
- Subject: Reference Email 1
- Body: Personal story, what went wrong
- CTA: "Next: The framework that fixed this"

Email 3: Solution + Framework
- Subject: Deliver on promise
- Body: Actionable framework
- CTA: "Get the full guide"
```

### 6. Quality Validation

**Validation Gates**:

1. **Character Limits**
   - LinkedIn: ≤ 1300 characters
   - Twitter: ≤ 280 per tweet
   - Blog: 500-700 words

2. **Core Message Preservation**
   - Semantic similarity check (embeddings)
   - Key insight presence verification
   - Tone consistency

3. **Platform Best Practices**
   - LinkedIn: Has hashtags, CTA, line breaks
   - Twitter: Numbered format, hook quality
   - Blog: Header structure, SEO elements

4. **Quality Metrics**
   ```python
   {
       "readability_score": 65,  # Flesch reading ease
       "sentiment_match": 0.92,  # Original vs generated
       "key_insight_coverage": 0.85,  # % of insights included
       "platform_compliance": True
   }
   ```

### 7. Data Layer (Supabase)

**Database Schema**:

```sql
-- Content table
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT,
    original_text TEXT,
    source_type VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id),
    status VARCHAR(20),
    platforms TEXT[],
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

-- Outputs table
CREATE TABLE outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id),
    platform VARCHAR(50),
    content JSONB,
    quality_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    output_id UUID REFERENCES outputs(id),
    views INT DEFAULT 0,
    engagement_rate FLOAT,
    clicks INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Storage Buckets**:
- `uploads`: Original files (PDF, DOCX, PPT)
- `exports`: Generated content exports

## Data Flow

### Complete Request Flow

```
1. Client uploads PDF
   ↓
2. FastAPI receives file
   ↓
3. Save to Supabase Storage
   ↓
4. Create content record in DB
   ↓
5. Create job record (status: pending)
   ↓
6. Extraction Service processes PDF
   ↓
7. Simple job processor starts
   ↓
8. Groq API generates content
   ↓
9. Platform Generators run in parallel
   ↓
10. Quality Validation checks outputs
   ↓
11. Save outputs to DB
   ↓
12. Update job status (completed)
   ↓
13. Return results to client
```

## Scalability Considerations

### Horizontal Scaling
- Stateless FastAPI instances
- Job queue (Celery/Redis) for async processing
- Load balancer distribution

### Performance Optimization
- Caching frequent analyses
- Batch processing for multiple jobs
- Streaming responses for large content

### Cost Optimization
- LLM call batching
- Smart caching of similar content
- Tiered processing (fast/quality modes)

## Security

### Authentication
- JWT tokens
- Supabase Auth integration
- API key for programmatic access

### Data Protection
- Encryption at rest (Supabase)
- Encryption in transit (HTTPS)
- File scanning for malware

### Rate Limiting
- Per-user limits
- IP-based throttling
- Graceful degradation

## Monitoring & Observability

### Metrics
- Processing time per platform
- Success/failure rates
- LLM token usage
- User engagement with outputs

### Logging
- Structured logging (JSON)
- Request tracing
- Error tracking (Sentry)

### Alerts
- Processing failures
- High latency
- Rate limit breaches

---

This architecture provides a robust, scalable foundation for intelligent content repurposing with clear separation of concerns and extensibility for new platforms.
