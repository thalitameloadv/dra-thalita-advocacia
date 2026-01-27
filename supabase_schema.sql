-- SUPABASE SCHEMA SETUP
-- Dra Thalita Melo Advocacia - Blog & Newsletter

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Blog Categories Table
CREATE TABLE public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#060629',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Blog Posts Table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    author TEXT DEFAULT 'Dra. Thalita Melo',
    author_avatar TEXT,
    author_bio TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured_image TEXT,
    category TEXT REFERENCES public.blog_categories(name) ON UPDATE CASCADE,
    tags TEXT[] DEFAULT '{}',
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}',
    reading_time INTEGER,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Newsletter Subscribers Table
CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'pending')),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 6. Policies for blog_categories
-- Anyone can read categories
CREATE POLICY "Allow public read access on blog_categories" 
ON public.blog_categories FOR SELECT USING (true);

-- Only authenticated admins can modify categories
CREATE POLICY "Allow admin all access on blog_categories" 
ON public.blog_categories FOR ALL USING (auth.role() = 'authenticated');

-- 7. Policies for blog_posts
-- Anyone can read published posts
CREATE POLICY "Allow public read access on published blog_posts" 
ON public.blog_posts FOR SELECT USING (status = 'published');

-- Authenticated admins can read all posts
CREATE POLICY "Allow admin read access on all blog_posts" 
ON public.blog_posts FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated admins can modify posts
CREATE POLICY "Allow admin all access on blog_posts" 
ON public.blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- 8. Policies for newsletter_subscribers
-- Anonymous can insert (subscribe)
CREATE POLICY "Allow public insert on newsletter_subscribers" 
ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Only authenticated admins can read/modify subscribers
CREATE POLICY "Allow admin all access on newsletter_subscribers" 
ON public.newsletter_subscribers FOR ALL USING (auth.role() = 'authenticated');

-- 9. Automatic Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 10. Initial Categories Seed
INSERT INTO public.blog_categories (name, slug, description, color)
VALUES 
('Direito Previdenciário', 'direito-previdenciario', 'Artigos sobre aposentadoria, INSS e benefícios previdenciários', '#060629'),
('Direito Trabalhista', 'direito-trabalhista', 'Conteúdo sobre direitos do trabalhador, rescisão e CLT', '#060629'),
('Direito de Família', 'direito-familia', 'Artigos sobre divórcio, pensão alimentícia e guarda de filhos', '#060629'),
('Notícias Jurídicas', 'noticias-juridicas', 'Últimas notícias e atualizações do mundo jurídico', '#060629')
ON CONFLICT (slug) DO NOTHING;

-- NOTE ON USER CREATION:
-- To create the admin user via SQL (uncommon in Supabase as it's usually done via Auth UI/API):
-- The user should be created in the auth.users table. 
-- However, it is strongly recommended to use the Supabase Dashboard 
-- Authentication -> Users -> Add User for security and to ensure all hooks/triggers run correctly.
