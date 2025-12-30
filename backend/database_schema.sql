-- =====================================================
-- Content Repurposing Engine - Database Schema
-- Supabase PostgreSQL Database Setup
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES TABLE
-- =====================================================
-- Note: Supabase Auth manages users in auth.users table
-- This table extends the auth.users with additional profile data
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    company TEXT,
    role TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON public.user_profiles(subscription_tier);

-- =====================================================
-- 2. CONTENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(title) > 0 AND length(title) <= 500),
    source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'docx', 'ppt', 'url', 'text')),
    original_text TEXT,
    source_url TEXT,
    file_path TEXT,
    file_size_bytes BIGINT,
    metadata JSONB DEFAULT '{}'::jsonb,
    analysis JSONB,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_content_user_id ON public.content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_source_type ON public.content(source_type);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON public.content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_is_deleted ON public.content(is_deleted);

-- =====================================================
-- 3. JOBS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    platforms TEXT[] NOT NULL,
    user_preferences JSONB DEFAULT '{}'::jsonb,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_step TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_time_seconds INTEGER,
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_content_id ON public.jobs(content_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_is_deleted ON public.jobs(is_deleted);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON public.jobs(title);

-- =====================================================
-- 4. OUTPUTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'blog', 'email')),
    content JSONB NOT NULL,
    quality_score DECIMAL(3, 2) CHECK (quality_score >= 0 AND quality_score <= 1),
    validation_results JSONB,
    generation_metadata JSONB,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outputs_user_id ON public.outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_outputs_job_id ON public.outputs(job_id);
CREATE INDEX IF NOT EXISTS idx_outputs_content_id ON public.outputs(content_id);
CREATE INDEX IF NOT EXISTS idx_outputs_platform ON public.outputs(platform);
CREATE INDEX IF NOT EXISTS idx_outputs_is_favorite ON public.outputs(is_favorite);
CREATE INDEX IF NOT EXISTS idx_outputs_created_at ON public.outputs(created_at DESC);

-- =====================================================
-- 5. ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    output_id UUID NOT NULL REFERENCES public.outputs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2),
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    metrics JSONB DEFAULT '{}'::jsonb,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(output_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_output_id ON public.analytics(output_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_platform ON public.analytics(platform);

-- =====================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outputs_updated_at BEFORE UPDATE ON public.outputs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON public.analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Content Policies
CREATE POLICY "Users can view their own content"
    ON public.content FOR SELECT
    USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own content"
    ON public.content FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
    ON public.content FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
    ON public.content FOR DELETE
    USING (auth.uid() = user_id);

-- Jobs Policies
CREATE POLICY "Users can view their own jobs"
    ON public.jobs FOR SELECT
    USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own jobs"
    ON public.jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
    ON public.jobs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
    ON public.jobs FOR DELETE
    USING (auth.uid() = user_id);

-- Outputs Policies
CREATE POLICY "Users can view their own outputs"
    ON public.outputs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outputs"
    ON public.outputs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outputs"
    ON public.outputs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outputs"
    ON public.outputs FOR DELETE
    USING (auth.uid() = user_id);

-- Analytics Policies
CREATE POLICY "Users can view their own analytics"
    ON public.analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
    ON public.analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
    ON public.analytics FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- 8. HELPFUL VIEWS
-- =====================================================

-- View for job statistics
CREATE OR REPLACE VIEW public.job_statistics AS
SELECT 
    user_id,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
    COUNT(*) FILTER (WHERE status = 'processing') as processing_jobs,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_jobs,
    AVG(processing_time_seconds) FILTER (WHERE status = 'completed') as avg_processing_time
FROM public.jobs
GROUP BY user_id;

-- View for content statistics  
CREATE OR REPLACE VIEW public.content_statistics AS
SELECT 
    user_id,
    COUNT(*) as total_content,
    COUNT(*) FILTER (WHERE source_type = 'pdf') as pdf_count,
    COUNT(*) FILTER (WHERE source_type = 'docx') as docx_count,
    COUNT(*) FILTER (WHERE source_type = 'text') as text_count,
    COUNT(*) FILTER (WHERE source_type = 'url') as url_count,
    SUM(file_size_bytes) as total_storage_bytes
FROM public.content
WHERE is_deleted = FALSE
GROUP BY user_id;

-- =====================================================
-- 9. INITIAL DATA (Optional)
-- =====================================================

-- You can add any initial seed data here
-- For example, default user preferences, platform configurations, etc.

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- To run this script:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute

-- Verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
