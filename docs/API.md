# API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints (except health check) require authentication using JWT tokens.

### Get Access Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Endpoints

### Health Check

#### GET /health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Content Management

#### POST /content/upload

Upload content for repurposing.

**Request (Multipart Form Data):**
```http
POST /api/v1/content/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [PDF/DOCX/PPT file]
title: "How to Choose Running Shoes"
platforms: ["linkedin", "twitter", "blog"]
preferences: {
  "tone_override": "casual",
  "include_emojis": true
}
```

**Response:**
```json
{
  "content_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "pending",
  "message": "Content uploaded successfully. Processing started."
}
```

#### POST /content/text

Submit text content directly.

**Request:**
```json
{
  "title": "Content Marketing Strategy",
  "text": "Your long-form content here...",
  "platforms": ["linkedin", "twitter", "blog", "email"],
  "preferences": {
    "tone": "professional",
    "target_audience": "marketers"
  }
}
```

**Response:**
```json
{
  "content_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "pending"
}
```

#### POST /content/url

Submit URL for content extraction.

**Request:**
```json
{
  "url": "https://example.com/blog/article",
  "platforms": ["linkedin", "twitter"],
  "preferences": {}
}
```

**Response:**
```json
{
  "content_id": "550e8400-e29b-41d4-a716-446655440000",
  "job_id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "pending"
}
```

#### GET /content/{content_id}

Get content details.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "How to Choose Running Shoes",
  "source_type": "pdf",
  "metadata": {
    "word_count": 2000,
    "reading_time": 8,
    "language": "en"
  },
  "analysis": {
    "key_insights": ["insight1", "insight2"],
    "tone": "professional",
    "content_type": "tutorial"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### GET /content

List user's content.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20)
- `source_type` (string): Filter by source type

**Response:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Content Title",
      "source_type": "pdf",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

#### DELETE /content/{content_id}

Delete content (soft delete).

**Response:**
```json
{
  "message": "Content deleted successfully"
}
```

---

### Job Management

#### GET /jobs/{job_id}

Get job status and details.

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "content_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress_percentage": 65,
  "current_step": "Generating Twitter thread",
  "platforms": ["linkedin", "twitter", "blog"],
  "started_at": "2024-01-15T10:30:00Z",
  "estimated_completion": "2024-01-15T10:32:00Z"
}
```

**Status Values:**
- `pending`: Job queued
- `processing`: Currently processing
- `completed`: Successfully completed
- `failed`: Processing failed
- `cancelled`: User cancelled

#### GET /jobs

List user's jobs.

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `status` (string): Filter by status

**Response:**
```json
{
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "content_title": "How to Choose Running Shoes",
      "status": "completed",
      "platforms": ["linkedin", "twitter"],
      "created_at": "2024-01-15T10:30:00Z",
      "processing_time_seconds": 95
    }
  ],
  "total": 12,
  "page": 1,
  "pages": 1
}
```

#### POST /jobs/{job_id}/cancel

Cancel a pending or processing job.

**Response:**
```json
{
  "message": "Job cancelled successfully"
}
```

---

### Outputs

#### GET /outputs/{job_id}

Get all outputs for a job.

**Response:**
```json
{
  "job_id": "660e8400-e29b-41d4-a716-446655440001",
  "outputs": {
    "linkedin": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "post": "Training for your first marathon?\n\nThe right shoes matter more than you think...",
      "hashtags": ["MarathonTraining", "RunningTips", "FitnessGoals"],
      "character_count": 1250,
      "quality_score": 0.95,
      "created_at": "2024-01-15T10:31:30Z"
    },
    "twitter": {
      "id": "770e8400-e29b-41d4-a716-446655440003",
      "tweets": [
        {
          "number": "1/6",
          "text": "Training for a marathon?\n\nYour shoes can make or break your race...",
          "char_count": 245
        }
      ],
      "total_tweets": 6,
      "quality_score": 0.92,
      "created_at": "2024-01-15T10:31:45Z"
    },
    "blog": {
      "id": "770e8400-e29b-41d4-a716-446655440004",
      "title": "How to Choose the Perfect Running Shoes for Marathon Training",
      "content": "# How to Choose the Perfect Running Shoes...",
      "meta_description": "Learn how to select the right marathon shoes...",
      "word_count": 650,
      "quality_score": 0.88,
      "created_at": "2024-01-15T10:32:00Z"
    }
  }
}
```

#### GET /outputs/{output_id}

Get specific output details.

**Response:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "platform": "linkedin",
  "content": {
    "post": "...",
    "hashtags": ["..."],
    "character_count": 1250
  },
  "quality_score": 0.95,
  "validation_results": {
    "passed": true,
    "issues": []
  },
  "is_favorite": false,
  "is_published": false,
  "created_at": "2024-01-15T10:31:30Z"
}
```

#### PUT /outputs/{output_id}

Update output (mark as favorite, published, etc.).

**Request:**
```json
{
  "is_favorite": true,
  "is_published": true,
  "published_url": "https://linkedin.com/posts/..."
}
```

**Response:**
```json
{
  "message": "Output updated successfully"
}
```

#### POST /outputs/{output_id}/regenerate

Regenerate specific platform output.

**Request:**
```json
{
  "preferences": {
    "tone": "more casual",
    "include_emojis": true
  }
}
```

**Response:**
```json
{
  "job_id": "880e8400-e29b-41d4-a716-446655440005",
  "status": "pending",
  "message": "Regeneration started"
}
```

#### GET /outputs

List user's outputs.

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `platform` (string): Filter by platform
- `is_favorite` (bool): Filter favorites

**Response:**
```json
{
  "items": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "platform": "linkedin",
      "content_title": "How to Choose Running Shoes",
      "quality_score": 0.95,
      "is_favorite": true,
      "created_at": "2024-01-15T10:31:30Z"
    }
  ],
  "total": 28,
  "page": 1,
  "pages": 2
}
```

---

### Analytics

#### GET /analytics/summary

Get user's analytics summary.

**Response:**
```json
{
  "total_content": 15,
  "total_jobs": 18,
  "completed_jobs": 16,
  "total_outputs": 48,
  "favorite_outputs": 12,
  "avg_processing_time_seconds": 92,
  "platforms_used": ["linkedin", "twitter", "blog", "email"],
  "platform_breakdown": {
    "linkedin": {
      "total_outputs": 16,
      "avg_engagement_rate": 0.045,
      "total_views": 12500
    },
    "twitter": {
      "total_outputs": 16,
      "avg_engagement_rate": 0.032,
      "total_views": 8900
    }
  }
}
```

#### GET /analytics/outputs/{output_id}

Get analytics for specific output.

**Response:**
```json
{
  "output_id": "770e8400-e29b-41d4-a716-446655440002",
  "platform": "linkedin",
  "views": 1250,
  "clicks": 45,
  "likes": 38,
  "comments": 12,
  "shares": 8,
  "engagement_rate": 0.0464,
  "click_through_rate": 0.036,
  "tracked_at": "2024-01-15T15:00:00Z"
}
```

#### POST /analytics/outputs/{output_id}

Update analytics data.

**Request:**
```json
{
  "views": 1250,
  "clicks": 45,
  "likes": 38,
  "comments": 12,
  "shares": 8
}
```

**Response:**
```json
{
  "message": "Analytics updated successfully",
  "engagement_rate": 0.0464
}
```

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data",
  "details": {
    "field": "platforms",
    "issue": "At least one platform must be specified"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Per Minute**: 60 requests
- **Per Hour**: 1000 requests

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642252800
```

---

## Webhooks (Optional)

Configure webhooks to receive notifications when jobs complete.

### POST /webhooks

Register a webhook.

**Request:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["job.completed", "job.failed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

When a job completes:
```json
{
  "event": "job.completed",
  "timestamp": "2024-01-15T10:32:00Z",
  "data": {
    "job_id": "660e8400-e29b-41d4-a716-446655440001",
    "content_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "outputs": ["linkedin", "twitter", "blog"]
  }
}
```

---

## SDK Examples

### Python

```python
import requests

class ContentRepurposingClient:
    def __init__(self, api_key):
        self.base_url = "http://localhost:8000/api/v1"
        self.headers = {"Authorization": f"Bearer {api_key}"}
    
    def upload_file(self, file_path, platforms):
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'platforms': platforms}
            response = requests.post(
                f"{self.base_url}/content/upload",
                headers=self.headers,
                files=files,
                data=data
            )
        return response.json()
    
    def get_job_status(self, job_id):
        response = requests.get(
            f"{self.base_url}/jobs/{job_id}",
            headers=self.headers
        )
        return response.json()
    
    def get_outputs(self, job_id):
        response = requests.get(
            f"{self.base_url}/outputs/{job_id}",
            headers=self.headers
        )
        return response.json()

# Usage
client = ContentRepurposingClient("your-api-key")
result = client.upload_file("article.pdf", ["linkedin", "twitter"])
print(f"Job ID: {result['job_id']}")
```

### JavaScript

```javascript
class ContentRepurposingClient {
  constructor(apiKey) {
    this.baseUrl = 'http://localhost:8000/api/v1';
    this.headers = {
      'Authorization': `Bearer ${apiKey}`
    };
  }
  
  async uploadFile(file, platforms) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('platforms', JSON.stringify(platforms));
    
    const response = await fetch(`${this.baseUrl}/content/upload`, {
      method: 'POST',
      headers: this.headers,
      body: formData
    });
    
    return response.json();
  }
  
  async getJobStatus(jobId) {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      headers: this.headers
    });
    
    return response.json();
  }
  
  async getOutputs(jobId) {
    const response = await fetch(`${this.baseUrl}/outputs/${jobId}`, {
      headers: this.headers
    });
    
    return response.json();
  }
}

// Usage
const client = new ContentRepurposingClient('your-api-key');
const result = await client.uploadFile(file, ['linkedin', 'twitter']);
console.log(`Job ID: ${result.job_id}`);
```

---

## Interactive API Documentation

Visit `/api/v1/docs` for interactive Swagger UI documentation where you can test all endpoints directly.
