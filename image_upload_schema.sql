-- Schema para Upload e Gerenciamento de Imagens
-- Execute este script no Supabase SQL Editor

-- 1. Criar bucket para imagens do blog
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar bucket para imagens de newsletter
INSERT INTO storage.buckets (id, name, public) 
VALUES ('newsletter-images', 'newsletter-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Tabela para metadados das imagens uploadadas
CREATE TABLE IF NOT EXISTS uploaded_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL,
    bucket TEXT NOT NULL,
    path TEXT NOT NULL,
    alt_text TEXT,
    title TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    file_hash TEXT,
    width INTEGER,
    height INTEGER,
    thumbnail_url TEXT,
    optimized_url TEXT
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_uploaded_images_bucket ON uploaded_images(bucket);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id ON uploaded_images(user_id);

-- 5.-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_uploaded_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_uploaded_images_updated_at 
    BEFORE UPDATE ON uploaded_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_uploaded_images_updated_at();

-- 6. Políticas de segurança (RLS)
ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se já existirem
DROP POLICY IF EXISTS "Users can view public images" ON uploaded_images;
DROP POLICY IF EXISTS "Users can view own images" ON uploaded_images;
DROP POLICY IF EXISTS "Users can insert own images" ON uploaded_images;
DROP POLICY IF EXISTS "Users can update own images" ON uploaded_images;
DROP POLICY IF EXISTS "Users can delete own images" ON uploaded_images;

-- Política para usuários autenticados verem imagens públicas
CREATE POLICY "Users can view public images"
    ON uploaded_images FOR SELECT
    USING (is_public = true);

-- Política para usuários verem suas próprias imagens
CREATE POLICY "Users can view own images"
    ON uploaded_images FOR SELECT
    USING (auth.uid() = user_id);

-- Política para usuários inserirem suas próprias imagens
CREATE POLICY "Users can insert own images"
    ON uploaded_images FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias imagens
CREATE POLICY "Users can update own images"
    ON uploaded_images FOR UPDATE
    USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias imagens
CREATE POLICY "Users can delete own images"
    ON uploaded_images FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Função para otimizar imagem
CREATE OR REPLACE FUNCTION optimize_image_on_upload()
RETURNS TRIGGER AS $$
BEGIN
    -- Aqui você pode adicionar lógica para otimização automática
    -- Por exemplo, gerar thumbnails, extrair metadados EXIF, etc.
    
    -- Exemplo: Extrair dimensões da imagem (requer extensão PostgreSQL)
    -- BEGIN
    --   SELECT width, height INTO NEW.width, NEW.height 
    --   FROM images 
    --   WHERE path = NEW.path;
    -- END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para otimização automática
CREATE OR REPLACE TRIGGER trigger_optimize_image_on_upload
    BEFORE INSERT ON uploaded_images
    FOR EACH ROW
    EXECUTE FUNCTION optimize_image_on_upload();

-- 8. Views para consultas otimizadas

-- View para imagens recentes
CREATE OR REPLACE VIEW recent_uploaded_images AS
SELECT 
    id,
    name,
    url,
    thumbnail_url,
    size,
    type,
    bucket,
    created_at,
    user_id,
    width,
    height
FROM uploaded_images 
WHERE is_public = true 
ORDER BY created_at DESC 
LIMIT 50;

-- View para estatísticas de upload
CREATE OR REPLACE VIEW image_upload_stats AS
SELECT 
    bucket,
    COUNT(*) as total_images,
    SUM(size) as total_size,
    AVG(size) as avg_size,
    COUNT(DISTINCT user_id) as unique_users,
    DATE_TRUNC('day', created_at) as upload_date
FROM uploaded_images 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY bucket, DATE_TRUNC('day', created_at)
ORDER BY upload_date DESC;

-- View para imagens populares
CREATE OR REPLACE VIEW popular_images AS
SELECT 
    i.*,
    0 as usage_count -- Temporariamente definido como 0 até que as colunas sejam adicionadas
FROM uploaded_images i
WHERE i.is_public = true
ORDER BY i.created_at DESC;

-- 9. Funções utilitárias

-- Função para buscar imagens por tags
CREATE OR REPLACE FUNCTION find_images_by_tags(search_tags TEXT[])
RETURNS TABLE (
    id UUID,
    name TEXT,
    url TEXT,
    thumbnail_url TEXT,
    tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.name,
        i.url,
        i.thumbnail_url,
        i.tags
    FROM uploaded_images i
    WHERE i.is_public = true
    AND i.tags && search_tags
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar imagens órfãs
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Temporariamente, apenas deleta imagens antigas sem referências
    -- Quando as colunas forem adicionadas, implementar a verificação completa
    DELETE FROM uploaded_images 
    WHERE 
        created_at < NOW() - INTERVAL '30 days' AND
        user_id IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Permissões de Storage para o bucket
-- Execute estes comandos no Supabase Dashboard ou via API:

-- Políticas para o bucket blog-images
-- INSERT: Usuários autenticados podem fazer upload
-- SELECT: Todos podem ver imagens públicas
-- UPDATE: Apenas o dono pode atualizar
-- DELETE: Apenas o dono pode deletar

-- Exemplo de políticas de Storage (execute no Supabase Dashboard):

-- CREATE POLICY "Users can upload images" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'blog-images' AND 
--   auth.role() = 'authenticated'
-- );

-- CREATE POLICY "Anyone can view images" ON storage.objects
-- FOR SELECT USING (
--   bucket_id = 'blog-images'
-- );

-- CREATE POLICY "Users can update own images" ON storage.objects
-- FOR UPDATE USING (
--   bucket_id = 'blog-images' AND 
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can delete own images" ON storage.objects
-- FOR DELETE USING (
--   bucket_id = 'blog-images' AND 
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- 11. Comentários sobre o schema:
-- 
-- IMPORTANTE: Execute também o script "add_image_columns_to_blog_posts.sql" 
-- para adicionar as colunas de imagem à tabela blog_posts antes de usar
-- as funcionalidades completas de imagem no sistema.
--
-- Estrutura de pastas recomendada no Storage:
-- - blog-images/user-id/filename.jpg
-- - newsletter-images/user-id/filename.jpg
-- - thumbnails/blog-images/user-id/thumbnail-filename.jpg
--
-- Campos importantes:
-- - file_hash: Para evitar uploads duplicados
-- - thumbnail_url: URL da imagem miniatura gerada automaticamente
-- - optimized_url: URL da imagem otimizada para web
-- - tags: Array de tags para busca e organização
-- - width/height: Dimensões extraídas automaticamente
--
-- Performance:
-- - Use thumbnails para listagens
-- - Implemente cache CDN se necessário
-- - Considere compressão automática de imagens
--
-- Segurança:
-- - Valide tipos de arquivo no upload
-- - Implemente rate limiting para uploads
-- - Monitore tamanho total de armazenamento por usuário
