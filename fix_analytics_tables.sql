-- Fix Analytics Tables for Blog
-- Execute this in Supabase SQL Editor to fix missing tables

-- Create blog_analytics_views table if not exists
CREATE TABLE IF NOT EXISTS public.blog_analytics_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    session_id TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_analytics_engagement table if not exists
CREATE TABLE IF NOT EXISTS public.blog_analytics_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('like', 'comment', 'share')),
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_analytics_sessions table if not exists
CREATE TABLE IF NOT EXISTS public.blog_analytics_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    ip_address TEXT,
    country TEXT,
    device_type TEXT,
    browser TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for analytics tables
ALTER TABLE public.blog_analytics_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all analytics views" ON public.blog_analytics_views FOR SELECT USING (true);
CREATE POLICY "Users can insert analytics views" ON public.blog_analytics_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view all analytics engagement" ON public.blog_analytics_engagement FOR SELECT USING (true);
CREATE POLICY "Users can insert analytics engagement" ON public.blog_analytics_engagement FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view all analytics sessions" ON public.blog_analytics_sessions FOR SELECT USING (true);
CREATE POLICY "Users can insert analytics sessions" ON public.blog_analytics_sessions FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_analytics_views_post_id ON public.blog_analytics_views(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_views_created_at ON public.blog_analytics_views(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_engagement_post_id ON public.blog_analytics_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_engagement_created_at ON public.blog_analytics_engagement(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_sessions_session_id ON public.blog_analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_sessions_created_at ON public.blog_analytics_sessions(created_at);

-- Add missing columns to blog_posts if they don't exist
DO $$
BEGIN
    -- Check and add views column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'views'
    ) THEN
        ALTER TABLE public.blog_posts ADD COLUMN views INTEGER DEFAULT 0;
    END IF;

    -- Check and add likes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'likes'
    ) THEN
        ALTER TABLE public.blog_posts ADD COLUMN likes INTEGER DEFAULT 0;
    END IF;

    -- Check and add comments_count column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'comments_count'
    ) THEN
        ALTER TABLE public.blog_posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;

    -- Check and add reading_time column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'reading_time'
    ) THEN
        ALTER TABLE public.blog_posts ADD COLUMN reading_time INTEGER DEFAULT 0;
    END IF;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT ON public.blog_analytics_views TO authenticated;
GRANT SELECT, INSERT ON public.blog_analytics_engagement TO authenticated;
GRANT SELECT, INSERT ON public.blog_analytics_sessions TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create sample analytics data (optional - for testing)
INSERT INTO public.blog_analytics_views (post_id, session_id, user_agent, referrer)
SELECT 
    id,
    'session_' || (random() * 1000000)::text,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'https://google.com'
FROM public.blog_posts 
WHERE status = 'published' 
LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO public.blog_analytics_engagement (post_id, type, data)
SELECT 
    id,
    'like',
    '{"source": "blog_page"}'::jsonb
FROM public.blog_posts 
WHERE status = 'published' 
LIMIT 3
ON CONFLICT DO NOTHING;
