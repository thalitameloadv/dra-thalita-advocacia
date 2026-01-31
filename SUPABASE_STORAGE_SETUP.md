# Supabase Storage Setup for Blog Images

## 1. Criar Bucket no Supabase Storage

Acesse o painel do Supabase e siga estes passos:

1. Vá para **Storage** no menu lateral
2. Clique em **New bucket**
3. Configure o bucket:
   - **Name**: `blog-images`
   - **Public bucket**: ✅ Marque esta opção
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

## 2. Configurar Políticas de Acesso (RLS)

No painel SQL do Supabase, execute as seguintes políticas:

```sql
-- Política para permitir uploads de imagens
CREATE POLICY "Allow image uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);

-- Política para permitir visualização pública de imagens
CREATE POLICY "Allow public image viewing" ON storage.objects
FOR SELECT USING (
  bucket_id = 'blog-images'
);

-- Política para permitir atualização de imagens pelo autor
CREATE POLICY "Allow image updates by owner" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);

-- Política para permitir deleção de imagens pelo autor
CREATE POLICY "Allow image deletion by owner" ON storage.objects
FOR DELETE USING (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);
```

## 3. Configurar CORS (se necessário)

Se encontrar problemas de CORS, adicione esta configuração no painel Storage > Settings:

```json
{
  "allowedOrigins": ["http://localhost:8080", "https://seusite.com"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["*"],
  "exposedHeaders": ["*"]
}
```

## 4. Verificar Configuração

Após configurar, o upload de imagens deve funcionar corretamente no editor de artigos.

## 5. Estrutura de Arquivos

As imagens serão salvas em:
- **Path**: `blog-images/timestamp.extension`
- **URL Pública**: `https://PROJECT_REF.supabase.co/storage/v1/object/public/blog-images/nome-do-arquivo`

## 6. Troubleshooting

### Erro: "Bucket not found"
- Verifique se o bucket `blog-images` foi criado
- Confirme se está marcado como público

### Erro: "Permission denied"
- Execute as políticas RLS acima
- Verifique se o usuário está autenticado

### Erro: "File too large"
- Aumente o limite no bucket ou otimize as imagens antes do upload
- Limite padrão configurado: 5MB

### Erro: "CORS policy violation"
- Configure as políticas CORS conforme mostrado acima
- Verifique se a origem do seu site está incluída
