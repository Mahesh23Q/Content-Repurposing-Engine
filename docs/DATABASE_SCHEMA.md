# Database Schema - Supabase

## Overview

The Content Repurposing Engine uses Supabase (PostgreSQL) for data persistence with the following design principles:

- **Normalized structure** for data integrity
- **JSONB columns** for flexible metadata storage
- **Row Level Security (RLS)** for multi-tenant isolation
- **Indexes** for query performance
- **Triggers** for automated workflows

## Complete Schema

### 1. Users Table (Managed by Supabase Auth)

```sql
-- This table is managed by Supabase Auth
-- Reference: auth.users

-- Extended user profile
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company TEXT,
    role TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    api_key TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);
```

### 2. Content Table

Stores original content and metadata.

```sql
CREATE TABLE public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content data
    title TEXT NOT NULL,
    original_text TEXT NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('pdf', 'docx', 'ppt', 'url', 'text')),
    source_url TEXT,
    
    -- File reference (if uploaded)
    file_path TEXT,
    file_size_bytes BIGINT,
    
    -- Extracted metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Example metadata structure:
    -- {
    --   "word_count": 2000,
    --   "reading_time_minutes": 8,
    --   "language": "en",
    --   "detected_topics": ["technology", "business"],
    --   "complexity_score": 0.65
    -- }
    
    -- Analysis results (cached)
    analysis JSONB,
    -- Example analysis structure:
    -- {
    --   "key_insights": ["insight1", "insight2"],
    --   "tone": "professional",
    --   "audience": "business professionals",
    --   "content_type": "tutorial",
    --   "hooks": ["hook1", "hook2", "hook3"]
    -- }
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_created_at ON content(created_at DESC);
CREATE INDEX idx_content_source_type ON content(source_type);
CREATE INDEX idx_content_deleted_at ON content(deleted_at) WHERE deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_content_text_search ON content USING gin(to_tsvector('english', title || ' ' || original_text));

-- JSONB indexes
CREATE INDEX idx_content_metadata ON content USING gin(metadata);
CREATE INDEX idx_content_analysis ON content USING gin(analysis);

-- RLS Policies
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content"
    ON content FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own content"
    ON content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content"
    ON content FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete own content"
    ON content FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_updated_at
    BEFORE UPDATE ON content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. Jobs Table

Tracks repurposing jobs and their status.

```sql
CREATE TYPE job_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
);

CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Job configuration
    platforms TEXT[] NOT NULL,
    -- Example: ['linkedin', 'twitter', 'blog', 'email']
    
    user_preferences JSONB DEFAULT '{}'::jsonb,
    -- Example preferences:
    -- {
    --   "tone_override": "casual",
    --   "include_emojis": true,
    --   "max_hashtags": 5,
    --   "target_audience": "developers"
    -- }
    
    -- Status tracking
    status job_status DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_step TEXT,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_time_seconds INTEGER,
    
    -- Error handling
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jobs_content_id ON jobs(content_id);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Composite index for user's recent jobs
CREATE INDEX idx_jobs_user_status_created ON jobs(user_id, status, created_at DESC);

-- RLS Policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
    ON jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
    ON jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
    ON jobs FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to calculate processing time
CREATE OR REPLACE FUNCTION calculate_processing_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.started_at IS NOT NULL THEN
        NEW.processing_time_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_job_processing_time
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION calculate_processing_time();
```

### 4. Outputs Table

Stores generated platform-specific content.

```sql
CREATE TABLE public.outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Platform and content
    platform VARCHAR(50) NOT NULL,
    -- Values: 'linkedin', 'twitter', 'blog', 'email', 'instagram', etc.
    
    content JSONB NOT NULL,
    -- Platform-specific structure:
    -- LinkedIn: {"post": "...", "hashtags": [...], "character_count": 1200}
    -- Twitter: {"tweets": [{...}], "total_tweets": 5}
    -- Blog: {"title": "...", "content": "...", "meta_description": "..."}
    -- Email: {"emails": [{...}]}
    
    -- Quality metrics
    quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
    validation_results JSONB,
    -- Example:
    -- {
    --   "passed": true,
    --   "issues": [],
    --   "character_count_valid": true,
    --   "structure_valid": true
    -- }
    
    -- Generation metadata
    generation_metadata JSONB,
    -- Example:
    -- {
    --   "model": "gpt-4-turbo",
    --   "tokens_used": 1500,
    --   "generation_time_seconds": 3.5,
    --   "retry_count": 0
    -- }
    
    -- User interactions
    is_favorite BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    published_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_outputs_job_id ON outputs(job_id);
CREATE INDEX idx_outputs_content_id ON outputs(content_id);
CREATE INDEX idx_outputs_user_id ON outputs(user_id);
CREATE INDEX idx_outputs_platform ON outputs(platform);
CREATE INDEX idx_outputs_created_at ON outputs(created_at DESC);
CREATE INDEX idx_outputs_is_favorite ON outputs(is_favorite) WHERE is_favorite = TRUE;

-- Composite indexes
CREATE INDEX idx_outputs_user_platform ON outputs(user_id, platform);
CREATE INDEX idx_outputs_content ON outputs USING gin(content);

-- RLS Policies
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outputs"
    ON outputs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outputs"
    ON outputs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outputs"
    ON outputs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outputs"
    ON outputs FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_outputs_updated_at
    BEFORE UPDATE ON outputs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. Analytics Table

Tracks performance metrics for generated content.

```sql
CREATE TABLE public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    output_id UUID NOT NULL REFERENCES outputs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Engagement metrics
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    
    -- Calculated metrics
    engagement_rate FLOAT,
    click_through_rate FLOAT,
    
    -- Platform-specific metrics
    platform_metrics JSONB,
    -- Example:
    -- {
    --   "linkedin": {"impressions": 1000, "profile_visits": 50},
    --   "twitter": {"retweets": 10, "quote_tweets": 5}
    -- }
    
    -- Time-based tracking
    tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_output_id ON analytics(output_id);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_tracked_at ON analytics(tracked_at DESC);

-- RLS Policies
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
    ON analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
    ON analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
    ON analytics FOR UPDATE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_analytics_updated_at
    BEFORE UPDATE ON analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to calculate engagement rate
CREATE OR REPLACE FUNCTION calculate_engagement_rate()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.views > 0 THEN
        NEW.engagement_rate = (NEW.likes + NEW.comments + NEW.shares)::FLOAT / NEW.views;
    END IF;
    
    IF NEW.views > 0 THEN
        NEW.click_through_rate = NEW.clicks::FLOAT / NEW.views;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_analytics_rates
    BEFORE INSERT OR UPDATE ON analytics
    FOR EACH ROW
    EXECUTE FUNCTION calculate_engagement_rate();
```

### 6. Templates Table (Optional)

Store reusable templates for content generation.

```sql
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Template details
    name TEXT NOT NULL,
    description TEXT,
    platform VARCHAR(50) NOT NULL,
    
    -- Template content
    template_structure JSONB NOT NULL,
    -- Example:
    -- {
    --   "sections": ["hook", "problem", "solution", "cta"],
    --   "tone": "professional",
    --   "style_guide": "..."
    -- }
    
    -- Usage tracking
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_platform ON templates(platform);
CREATE INDEX idx_templates_is_public ON templates(is_public) WHERE is_public = TRUE;

-- RLS Policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and public templates"
    ON templates FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own templates"
    ON templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
    ON templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
    ON templates FOR DELETE
    USING (auth.uid() = user_id);
```

## Storage Buckets

### File Storage Configuration

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('uploads', 'uploads', false),
    ('exports', 'exports', false);

-- RLS Policies for uploads bucket
CREATE POLICY "Users can upload own files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'uploads' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- RLS Policies for exports bucket
CREATE POLICY "Users can create exports"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'exports' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own exports"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'exports' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
```

## Useful Views

### Recent Jobs View

```sql
CREATE VIEW user_recent_jobs AS
SELECT 
    j.id,
    j.status,
    j.platforms,
    j.progress_percentage,
    j.created_at,
    c.title AS content_title,
    c.source_type,
    COUNT(o.id) AS output_count
FROM jobs j
JOIN content c ON j.content_id = c.id
LEFT JOIN outputs o ON j.id = o.job_id
WHERE j.user_id = auth.uid()
GROUP BY j.id, c.title, c.source_type
ORDER BY j.created_at DESC;
```

### Analytics Summary View

```sql
CREATE VIEW user_analytics_summary AS
SELECT 
    o.platform,
    COUNT(o.id) AS total_outputs,
    AVG(a.engagement_rate) AS avg_engagement_rate,
    SUM(a.views) AS total_views,
    SUM(a.clicks) AS total_clicks
FROM outputs o
LEFT JOIN analytics a ON o.id = a.output_id
WHERE o.user_id = auth.uid()
GROUP BY o.platform;
```

## Database Functions

### Get User Statistics

```sql
CREATE OR REPLACE FUNCTION get_user_statistics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_content', (SELECT COUNT(*) FROM content WHERE user_id = user_uuid AND deleted_at IS NULL),
        'total_jobs', (SELECT COUNT(*) FROM jobs WHERE user_id = user_uuid),
        'completed_jobs', (SELECT COUNT(*) FROM jobs WHERE user_id = user_uuid AND status = 'completed'),
        'total_outputs', (SELECT COUNT(*) FROM outputs WHERE user_id = user_uuid),
        'favorite_outputs', (SELECT COUNT(*) FROM outputs WHERE user_id = user_uuid AND is_favorite = TRUE),
        'avg_processing_time', (SELECT AVG(processing_time_seconds) FROM jobs WHERE user_id = user_uuid AND status = 'completed'),
        'platforms_used', (SELECT json_agg(DISTINCT platform) FROM outputs WHERE user_id = user_uuid)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Initialization Script

```sql
-- Run this script to initialize the database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Create all tables (in order of dependencies)
-- [Include all CREATE TABLE statements from above]

-- Create indexes
-- [Include all CREATE INDEX statements from above]

-- Create views
-- [Include all CREATE VIEW statements from above]

-- Create functions
-- [Include all CREATE FUNCTION statements from above]

-- Create storage buckets
-- [Include storage bucket setup from above]

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

## Migration Strategy

For schema updates:

```sql
-- Example migration: Add new column to outputs table
ALTER TABLE outputs 
ADD COLUMN IF NOT EXISTS ai_model_version VARCHAR(50);

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Record migration
INSERT INTO schema_migrations (version, description)
VALUES (1, 'Add ai_model_version to outputs table');
```

---

This schema provides a robust foundation for the Content Repurposing Engine with proper normalization, indexing, and security through RLS policies.
