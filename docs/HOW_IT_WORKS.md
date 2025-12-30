# How It Works: Complete System Flow

## Overview

This document explains how the Content Repurposing Engine works from end to end, covering every step from content upload to final output delivery.

---

## Complete User Journey

```
User uploads content
        ↓
Content extraction & storage
        ↓
Job creation & queuing
        ↓
Simple job processing
        ↓
Content analysis
        ↓
Strategy generation
        ↓
Parallel platform generation
        ↓
Quality validation
        ↓
Results storage
        ↓
User retrieves outputs
```

---

## Step-by-Step Process

### Step 1: Content Upload

**User Action**: Upload PDF, DOCX, PPT, paste text, or provide URL

**System Process**:

1. **API Receives Request** (`app/api/routes/content.py`)
   ```python
   @router.post("/upload")
   async def upload_content(
       file: UploadFile,
       platforms: List[str],
       user: User = Depends(get_current_user)
   ):
   ```

2. **File Validation**
   - Check file size (max 50MB)
   - Verify file extension
   - Scan for malware (optional)

3. **Storage Upload** (Supabase Storage)
   ```python
   # Upload to Supabase storage bucket
   file_path = f"{user.id}/{file.filename}"
   storage.upload(bucket="uploads", path=file_path, file=file)
   ```

4. **Database Record Creation**
   ```python
   # Create content record
   content = await content_repository.create({
       "user_id": user.id,
       "title": title,
       "source_type": "pdf",
       "file_path": file_path,
       "metadata": {}
   })
   ```

**Output**: Content ID and Job ID returned to user

---

### Step 2: Content Extraction

**Purpose**: Extract text and metadata from uploaded file

**Process**:

1. **Format Detection**
   ```python
   # Determine file type
   if file_path.endswith('.pdf'):
       extractor = PDFExtractor()
   elif file_path.endswith('.docx'):
       extractor = DOCXExtractor()
   ```

2. **Text Extraction** (`app/services/extraction/`)

   **PDF Extraction**:
   ```python
   class PDFExtractor:
       def extract(self, file_path: str) -> ExtractedContent:
           # Use PyPDF2 for simple PDFs
           with open(file_path, 'rb') as f:
               reader = PyPDF2.PdfReader(f)
               text = ""
               for page in reader.pages:
                   text += page.extract_text()
           
           # Use pdfplumber for complex layouts
           with pdfplumber.open(file_path) as pdf:
               for page in pdf.pages:
                   text += page.extract_text()
           
           return ExtractedContent(
               text=text,
               metadata=self._extract_metadata(reader)
           )
   ```

   **DOCX Extraction**:
   ```python
   class DOCXExtractor:
       def extract(self, file_path: str) -> ExtractedContent:
           doc = Document(file_path)
           
           # Extract paragraphs
           text = "\n".join([p.text for p in doc.paragraphs])
           
           # Extract headings
           headings = [p.text for p in doc.paragraphs if p.style.name.startswith('Heading')]
           
           return ExtractedContent(
               text=text,
               metadata={"headings": headings}
           )
   ```

   **URL Extraction**:
   ```python
   class URLExtractor:
       def extract(self, url: str) -> ExtractedContent:
           # Fetch page
           response = requests.get(url)
           
           # Use readability for main content
           doc = Document(response.text)
           
           # Parse with BeautifulSoup
           soup = BeautifulSoup(doc.summary(), 'html.parser')
           text = soup.get_text()
           
           return ExtractedContent(
               text=text,
               metadata={"url": url, "title": doc.title()}
           )
   ```

3. **Text Preprocessing**
   ```python
   def preprocess_text(text: str) -> str:
       # Remove extra whitespace
       text = re.sub(r'\s+', ' ', text)
       
       # Fix encoding issues
       text = text.encode('utf-8', 'ignore').decode('utf-8')
       
       # Remove special characters
       text = re.sub(r'[^\w\s\.\,\!\?\-]', '', text)
       
       return text.strip()
   ```

4. **Metadata Extraction**
   ```python
   metadata = {
       "word_count": len(text.split()),
       "reading_time": len(text.split()) // 200,  # ~200 wpm
       "language": detect_language(text),
       "detected_topics": extract_topics(text),
       "complexity_score": calculate_complexity(text)
   }
   ```

5. **Update Database**
   ```python
   await content_repository.update(content_id, {
       "original_text": text,
       "metadata": metadata
   })
   ```

**Output**: Cleaned text and metadata stored in database

---

### Step 3: Job Creation & Queuing

**Purpose**: Create processing job and queue for execution

**Process**:

1. **Create Job Record**
   ```python
   job = await job_repository.create({
       "content_id": content_id,
       "user_id": user.id,
       "platforms": platforms,
       "status": "pending",
       "user_preferences": preferences
   })
   ```

2. **Queue Job** (if using Redis/Celery)
   ```python
   # Add to job queue
   task = process_content_task.delay(job.id)
   ```

3. **Or Process Immediately** (for simple setup)
   ```python
   # Process in background
   asyncio.create_task(process_job(job.id))
   ```

**Output**: Job ID returned to user for status tracking

---

### Step 4: Simple Job Processing

**Purpose**: Process content repurposing using Groq API

**Process**:

#### 4.1 Initialize Workflow

```python
workflow = ContentRepurposingWorkflow()

initial_state = {
    "content": extracted_text,
    "title": content.title,
    "source_metadata": content.metadata,
    "requested_platforms": ["linkedin", "twitter", "blog"],
    "user_preferences": {},
    "retry_count": 0,
    "errors": []
}

result = workflow.execute(initial_state)
```

#### 4.2 Content Analysis Node

**Purpose**: Deep understanding of content

```python
def analyze_content(state: ContentState) -> ContentState:
    """
    Analyze content to extract:
    - Main thesis
    - Key insights (5-7 points)
    - Tone (professional/casual/technical)
    - Target audience
    - Content type (tutorial/opinion/case-study)
    - Compelling hooks (3 options)
    """
    
    analysis_prompt = f"""
    Analyze this content for repurposing:
    
    {content[:3000]}
    
    Provide JSON with:
    - thesis: one sentence main argument
    - key_insights: array of 5-7 actionable points
    - tone: professional/casual/technical/inspirational
    - audience: specific target audience
    - content_type: tutorial/opinion/case-study/news/guide
    - hooks: array of 3 compelling social media hooks
    """
    
    response = llm.invoke([HumanMessage(content=analysis_prompt)])
    analysis = json.loads(response.content)
    
    return {
        **state,
        "content_analysis": analysis,
        "key_insights": analysis["key_insights"],
        "tone": analysis["tone"],
        "audience": analysis["audience"],
        "content_type": analysis["content_type"],
        "hooks": analysis["hooks"]
    }
```

**Example Analysis Output**:
```json
{
  "thesis": "Choosing the right running shoes requires understanding your biomechanics, not just brand preferences",
  "key_insights": [
    "Pronation type matters more than brand reputation",
    "Heel-to-toe drop affects injury risk for beginners",
    "Gait analysis prevents long-term injuries",
    "Shoe fit changes throughout the day",
    "Minimalist shoes increase injury risk 3x for beginners"
  ],
  "tone": "professional",
  "audience": "first-time marathon runners",
  "content_type": "tutorial",
  "hooks": [
    "Want to know why 73% of marathon runners choose the wrong shoes?",
    "I made a $150 mistake that cost me 6 months of training",
    "Your running shoes are probably wrong. Here's why:"
  ]
}
```

#### 4.3 Strategy Generation Node

**Purpose**: Create platform-specific strategies

```python
def generate_strategy(state: ContentState) -> ContentState:
    """
    For each platform, determine:
    - Which key points to emphasize
    - Tone adjustments needed
    - Structural approach
    - Which hook to use
    """
    
    strategy_prompt = f"""
    Based on analysis:
    {json.dumps(state["content_analysis"])}
    
    Create strategies for: {state["requested_platforms"]}
    
    For each platform specify:
    - key_points: which 2-3 insights to emphasize
    - tone_adjustment: any tone changes needed
    - structure: how to organize content
    - hook_choice: which hook to use (0, 1, or 2)
    """
    
    response = llm.invoke([HumanMessage(content=strategy_prompt)])
    strategies = json.loads(response.content)
    
    return {**state, "generation_strategies": strategies}
```

**Example Strategy Output**:
```json
{
  "linkedin": {
    "key_points": [0, 1, 2],
    "tone_adjustment": "slightly more professional",
    "structure": "hook + numbered list + insight + CTA",
    "hook_choice": 0
  },
  "twitter": {
    "key_points": [0, 1, 2, 3],
    "tone_adjustment": "more conversational",
    "structure": "thread with one point per tweet",
    "hook_choice": 2
  },
  "blog": {
    "key_points": [0, 1, 2, 3, 4],
    "tone_adjustment": "maintain professional",
    "structure": "intro + 3 sections + conclusion",
    "hook_choice": 1
  }
}
```

#### 4.4 Platform Generation Nodes (Parallel)

**LinkedIn Generation**:
```python
def generate_linkedin(state: ContentState) -> ContentState:
    insights = state["key_insights"]
    strategy = state["generation_strategies"]["linkedin"]
    hook = state["hooks"][strategy["hook_choice"]]
    
    linkedin_prompt = f"""
    Create LinkedIn post:
    
    Hook: {hook}
    Key Points: {insights[0:3]}
    Tone: {state["tone"]}
    
    Requirements:
    - Start with hook (< 150 chars)
    - Use line breaks every 2-3 lines
    - Include 3-5 hashtags
    - End with clear CTA
    - Max 1300 characters
    
    Return JSON: {{post, hashtags, character_count, cta}}
    """
    
    response = llm.invoke([HumanMessage(content=linkedin_prompt)])
    output = json.loads(response.content)
    
    return {**state, "linkedin_output": output}
```

**Twitter Generation**:
```python
def generate_twitter(state: ContentState) -> ContentState:
    insights = state["key_insights"]
    strategy = state["generation_strategies"]["twitter"]
    hook = state["hooks"][strategy["hook_choice"]]
    
    twitter_prompt = f"""
    Create Twitter thread:
    
    Hook: {hook}
    Key Points: {insights}
    
    Requirements:
    - 3-7 tweets
    - Numbered format (1/X, 2/X)
    - Hook in first tweet
    - One idea per tweet
    - Max 280 chars per tweet
    - Final tweet: summary + CTA
    
    Return JSON: {{tweets: [{number, text, char_count}]}}
    """
    
    response = llm.invoke([HumanMessage(content=twitter_prompt)])
    output = json.loads(response.content)
    
    return {**state, "twitter_output": output}
```

**Blog Generation**:
```python
def generate_blog(state: ContentState) -> ContentState:
    content = state["content"]
    insights = state["key_insights"]
    
    blog_prompt = f"""
    Create condensed blog (500-700 words):
    
    Original: {content[:2000]}
    Key Points: {insights}
    
    Requirements:
    - SEO-optimized title
    - Clear header structure (H2, H3)
    - Introduction + Body + Conclusion
    - Meta description (150-160 chars)
    - Maintain depth while being concise
    
    Return JSON: {{title, meta_description, content, word_count}}
    """
    
    response = llm.invoke([HumanMessage(content=blog_prompt)])
    output = json.loads(response.content)
    
    return {**state, "blog_output": output}
```

**Email Generation**:
```python
def generate_email(state: ContentState) -> ContentState:
    insights = state["key_insights"]
    
    email_prompt = f"""
    Create 3-email sequence:
    
    Key Points: {insights}
    
    Email 1: Hook + Problem (tease solution)
    Email 2: Story + Mistake (build curiosity)
    Email 3: Solution + Framework (deliver value)
    
    Each email: subject, preview_text, body, cta
    
    Return JSON: {{emails: [{sequence_number, subject, body, cta}]}}
    """
    
    response = llm.invoke([HumanMessage(content=email_prompt)])
    output = json.loads(response.content)
    
    return {**state, "email_output": output}
```

#### 4.5 Quality Validation Node

**Purpose**: Ensure outputs meet platform requirements

```python
def validate_outputs(state: ContentState) -> ContentState:
    validation_results = {
        "passed": True,
        "issues": [],
        "scores": {}
    }
    
    # Validate LinkedIn
    if state.get("linkedin_output"):
        linkedin = state["linkedin_output"]
        
        # Character limit
        if linkedin["character_count"] > 1300:
            validation_results["passed"] = False
            validation_results["issues"].append("LinkedIn exceeds 1300 chars")
        
        # Hashtags
        if len(linkedin["hashtags"]) < 3:
            validation_results["issues"].append("LinkedIn needs 3+ hashtags")
        
        # CTA present
        if not linkedin.get("cta"):
            validation_results["issues"].append("LinkedIn missing CTA")
        
        # Quality score
        validation_results["scores"]["linkedin"] = calculate_quality_score(linkedin)
    
    # Validate Twitter
    if state.get("twitter_output"):
        twitter = state["twitter_output"]
        
        # Tweet count
        if len(twitter["tweets"]) < 3:
            validation_results["passed"] = False
            validation_results["issues"].append("Twitter needs 3+ tweets")
        
        # Character limits
        for tweet in twitter["tweets"]:
            if tweet["char_count"] > 280:
                validation_results["passed"] = False
                validation_results["issues"].append(f"Tweet {tweet['number']} exceeds 280 chars")
        
        validation_results["scores"]["twitter"] = calculate_quality_score(twitter)
    
    # Similar validation for blog and email...
    
    return {**state, "validation_results": validation_results}
```

#### 4.6 Conditional Routing

**Purpose**: Decide next step based on validation

```python
def check_quality(state: ContentState) -> str:
    validation = state["validation_results"]
    retry_count = state.get("retry_count", 0)
    
    if validation["passed"]:
        return "save_results"  # All good, save
    elif retry_count < 2:
        return "regenerate"  # Try again
    else:
        return "save_with_warnings"  # Give up, save anyway
```

#### 4.7 Regeneration Node (if needed)

```python
def handle_regeneration(state: ContentState) -> ContentState:
    retry_count = state.get("retry_count", 0)
    issues = state["validation_results"]["issues"]
    
    logger.warning(f"Regenerating (attempt {retry_count + 1}): {issues}")
    
    # Increment retry
    state["retry_count"] = retry_count + 1
    
    # Clear failed outputs
    if any("LinkedIn" in issue for issue in issues):
        state["linkedin_output"] = None
    if any("Twitter" in issue for issue in issues):
        state["twitter_output"] = None
    
    # Will loop back to strategy node
    return state
```

#### 4.8 Save Results Node

```python
def save_results(state: ContentState) -> ContentState:
    logger.info("Saving results to database")
    
    # Save each output
    for platform in state["requested_platforms"]:
        output_key = f"{platform}_output"
        if state.get(output_key):
            await output_repository.create({
                "job_id": job_id,
                "platform": platform,
                "content": state[output_key],
                "quality_score": state["validation_results"]["scores"][platform]
            })
    
    # Update job status
    await job_repository.update(job_id, {
        "status": "completed",
        "completed_at": datetime.now()
    })
    
    return {**state, "status": "completed"}
```

**Output**: All platform-specific content generated and stored

---

### Step 5: Results Storage

**Purpose**: Persist generated content in database

**Database Operations**:

1. **Save Outputs**
   ```sql
   INSERT INTO outputs (job_id, platform, content, quality_score)
   VALUES ($1, $2, $3, $4)
   ```

2. **Update Job Status**
   ```sql
   UPDATE jobs
   SET status = 'completed',
       completed_at = NOW(),
       processing_time_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))
   WHERE id = $1
   ```

3. **Update Content Analysis** (cache for future use)
   ```sql
   UPDATE content
   SET analysis = $1
   WHERE id = $2
   ```

---

### Step 6: User Retrieves Results

**User Action**: Check job status and retrieve outputs

**API Calls**:

1. **Check Status**
   ```http
   GET /api/v1/jobs/{job_id}
   ```
   
   Response:
   ```json
   {
     "id": "job-123",
     "status": "completed",
     "progress_percentage": 100,
     "processing_time_seconds": 95
   }
   ```

2. **Get Outputs**
   ```http
   GET /api/v1/outputs/{job_id}
   ```
   
   Response:
   ```json
   {
     "linkedin": {
       "post": "Training for your first marathon?...",
       "hashtags": ["MarathonTraining", "RunningTips"],
       "character_count": 1250
     },
     "twitter": {
       "tweets": [
         {"number": "1/6", "text": "..."},
         {"number": "2/6", "text": "..."}
       ]
     },
     "blog": {
       "title": "How to Choose Running Shoes",
       "content": "# How to Choose Running Shoes...",
       "word_count": 650
     }
   }
   ```

---

## Key Technologies & Their Roles

### FastAPI
- **Role**: HTTP API server
- **Why**: Async support, automatic docs, type safety
- **Usage**: Handle requests, validation, routing

### Groq API
- **Role**: AI content generation
- **Why**: High speed inference, generous rate limits, cost effective
- **Usage**: Coordinate content analysis and generation

### Groq API
- **Role**: AI content generation
- **Why**: High speed inference, generous rate limits, cost effective
- **Usage**: Call OpenAI API, manage prompts

### Supabase
- **Role**: Backend-as-a-Service
- **Why**: PostgreSQL + Auth + Storage in one
- **Usage**: Store data, manage files, authenticate users

### OpenAI GPT-4
- **Role**: Large Language Model
- **Why**: Best-in-class content generation
- **Usage**: Analyze content, generate platform-specific versions

---

## Performance Optimizations

### 1. Parallel Generation
```python
# All platforms generate simultaneously
workflow.add_edge("strategy", "linkedin")
workflow.add_edge("strategy", "twitter")
workflow.add_edge("strategy", "blog")
workflow.add_edge("strategy", "email")
```

### 2. Caching
```python
# Cache analysis results
@lru_cache(maxsize=100)
def analyze_content(content_hash: str):
    # Expensive operation
    pass
```

### 3. Async Operations
```python
# Non-blocking I/O
async def fetch_url(url: str):
    async with httpx.AsyncClient() as client:
        return await client.get(url)
```

### 4. Database Indexing
```sql
CREATE INDEX idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX idx_content_text_search ON content USING gin(to_tsvector('english', original_text));
```

---

## Error Handling

### Retry Logic
```python
# Automatic retry on failure
if validation_failed and retry_count < 2:
    return "regenerate"
```

### Graceful Degradation
```python
# Save partial results if some platforms fail
if any_platform_succeeded:
    save_results()
else:
    mark_job_failed()
```

### Error Logging
```python
logger.error("Generation failed", 
    job_id=job_id,
    platform=platform,
    error=str(e),
    exc_info=True
)
```

---

## Monitoring & Observability

### Metrics Tracking
```python
# Track processing time
start_time = time.time()
result = workflow.execute(state)
processing_time = time.time() - start_time

# Log metrics
logger.info("Workflow complete",
    processing_time=processing_time,
    platforms=len(platforms),
    quality_scores=scores
)
```

### Health Checks
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": await check_database(),
        "storage": await check_storage(),
        "llm": await check_llm()
    }
```

---

This comprehensive flow ensures reliable, high-quality content repurposing across all platforms while maintaining observability and error resilience.
