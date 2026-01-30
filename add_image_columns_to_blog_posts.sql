-- Schema para adicionar colunas de imagem à tabela blog_posts
-- Execute este script após criar a tabela uploaded_images

-- Adicionar colunas de imagem à tabela blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS post_image TEXT;

-- Adicionar comentários sobre as colunas
COMMENT ON COLUMN blog_posts.cover_image IS 'Imagem de capa exibida na listagem do blog (1200x630px recomendado)';
COMMENT ON COLUMN blog_posts.post_image IS 'Imagem principal exibida no topo do artigo (1920x1080px recomendado)';
COMMENT ON COLUMN blog_posts.featured_image IS 'Imagem em destaque (legado para compatibilidade)';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_cover_image ON blog_posts(cover_image);
CREATE INDEX IF NOT EXISTS idx_blog_posts_post_image ON blog_posts(post_image);

-- Atualizar a view de imagens populares para usar as novas colunas
DROP VIEW IF EXISTS popular_images;

CREATE OR REPLACE VIEW popular_images AS
SELECT 
    i.*,
    COALESCE(featured_usage.featured_count, 0) + 
    COALESCE(cover_usage.cover_count, 0) + 
    COALESCE(post_usage.post_count, 0) as usage_count
FROM uploaded_images i
LEFT JOIN LATERAL (
    SELECT 
        COUNT(*) as featured_count
    FROM blog_posts bp 
    WHERE bp.featured_image = i.url
) featured_usage ON true
LEFT JOIN LATERAL (
    SELECT 
        COUNT(*) as cover_count
    FROM blog_posts bp 
    WHERE bp.cover_image = i.url
) cover_usage ON true
LEFT JOIN LATERAL (
    SELECT 
        COUNT(*) as post_count
    FROM blog_posts bp 
    WHERE bp.post_image = i.url
) post_usage ON true
WHERE i.is_public = true
ORDER BY usage_count DESC, i.created_at DESC;

-- Atualizar a função de limpeza de imagens órfãs
DROP FUNCTION IF EXISTS cleanup_orphaned_images();

CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Deletar imagens não referenciadas em nenhum post ou newsletter
    WITH orphaned_images AS (
        SELECT ui.id
        FROM uploaded_images ui
        LEFT JOIN blog_posts bp ON 
            bp.featured_image = ui.url OR 
            bp.cover_image = ui.url OR 
            bp.post_image = ui.url
        LEFT JOIN newsletter_campaigns nc ON nc.featured_image = ui.url
        WHERE 
            bp.id IS NULL AND 
            nc.id IS NULL AND
            ui.created_at < NOW() - INTERVAL '7 days' AND
            ui.user_id IS NOT NULL
    )
    DELETE FROM uploaded_images 
    WHERE id IN (SELECT id FROM orphaned_images)
    RETURNING 1;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar timestamps
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger existente se já existir
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;

CREATE OR REPLACE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_blog_posts_updated_at();

-- Função para migrar dados existentes (se necessário)
CREATE OR REPLACE FUNCTION migrate_featured_to_cover_images()
RETURNS VOID AS $$
BEGIN
    -- Migrar imagens featured para cover_image se cover_image estiver vazio
    UPDATE blog_posts 
    SET cover_image = featured_image 
    WHERE featured_image IS NOT NULL 
    AND cover_image IS NULL;
    
    -- Migrar imagens featured para post_image se post_image estiver vazio e cover_image já tiver valor
    UPDATE blog_posts 
    SET post_image = featured_image 
    WHERE featured_image IS NOT NULL 
    AND post_image IS NULL 
    AND cover_image IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Comentário sobre migração
-- Execute a função abaixo se quiser migrar dados existentes:
-- SELECT migrate_featured_to_cover_images();

-- Criar view para estatísticas de uso de imagens
CREATE OR REPLACE VIEW image_usage_stats AS
SELECT 
    'featured' as image_type,
    COUNT(*) as usage_count,
    COUNT(DISTINCT id) as unique_posts,
    DATE_TRUNC('day', created_at) as usage_date
FROM blog_posts 
WHERE featured_image IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at)
UNION ALL
SELECT 
    'cover' as image_type,
    COUNT(*) as usage_count,
    COUNT(DISTINCT id) as unique_posts,
    DATE_TRUNC('day', created_at) as usage_date
FROM blog_posts 
WHERE cover_image IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at)
UNION ALL
SELECT 
    'post' as image_type,
    COUNT(*) as usage_count,
    COUNT(DISTINCT id) as unique_posts,
    DATE_TRUNC('day', created_at) as usage_date
FROM blog_posts 
WHERE post_image IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY usage_date DESC, image_type;
