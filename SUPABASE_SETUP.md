# 🔐 Guia de Configuração do Supabase

## 📋 Visão Geral

Este guia explica como configurar a autenticação do admin do blog usando Supabase.

---

## 🚀 Passo a Passo

### 1. **Criar Conta no Supabase**

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou Email

### 2. **Criar Novo Projeto**

1. Clique em "New Project"
2. Preencha:
   - **Name**: DraThalitaMelo
   - **Database Password**: (crie uma senha forte)
   - **Region**: South America (São Paulo)
3. Clique em "Create new project"
4. Aguarde alguns minutos para o projeto ser criado

### 3. **Obter Credenciais**

1. No painel do projeto, vá em **Settings** (⚙️) → **API**
2. Copie as seguintes informações:
   - **Project URL** (exemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (chave pública)

### 4. **Configurar Variáveis de Ambiente**

1. Na raiz do projeto, crie um arquivo `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e adicione suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

### 5. **Criar Usuário Admin**

1. No Supabase, vá em **Authentication** → **Users**
2. Clique em "Add user" → "Create new user"
3. Preencha:
   - **Email**: `marketing@thalitaadv.com.br`
   - **Password**: `Thalitaadv1!`
   - **Auto Confirm User**: ✅ (marque esta opção)
4. Clique em "Create user"

### 6. **Configurar Políticas de Segurança (RLS)**

Por padrão, o Supabase usa Row Level Security (RLS). Para este projeto:

1. Vá em **Authentication** → **Policies**
2. As políticas já estão configuradas para permitir acesso autenticado

### 7. **Testar Autenticação**

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:5173/admin/login`

3. Faça login com:
   - **Email**: `marketing@thalitaadv.com.br`
   - **Senha**: `Thalitaadv1!`

4. Você deve ser redirecionado para `/admin/blog`

---

## 🔒 Segurança

### **Variáveis de Ambiente**

✅ **NUNCA** commite o arquivo `.env` no Git  
✅ O arquivo `.env` já está no `.gitignore`  
✅ Use `.env.example` como template

### **Credenciais do Admin**

- **Email**: `marketing@thalitaadv.com.br`
- **Senha**: `Thalitaadv1!`

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

### **Alterar Senha**

1. Faça login no admin
2. Vá em **Settings** (em desenvolvimento)
3. Ou use o Supabase Dashboard:
   - **Authentication** → **Users**
   - Clique no usuário
   - "Reset password"

---

## 🛡️ Rotas Protegidas

As seguintes rotas exigem autenticação:

- `/admin/blog` - Dashboard do blog
- `/admin/blog/novo` - Criar novo artigo
- `/admin/blog/:id` - Editar artigo
- `/admin/blog/seo` - Ferramentas SEO

### **Como Funciona**

1. Usuário tenta acessar rota protegida
2. `ProtectedRoute` verifica autenticação
3. Se não autenticado → redireciona para `/admin/login`
4. Se autenticado → permite acesso

---

## 🔄 Fluxo de Autenticação

```
┌─────────────────┐
│  /admin/blog    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ProtectedRoute  │
│  Verifica auth  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌──────────┐
│  Auth  │  │ Not Auth │
│   ✓    │  │    ✗     │
└───┬────┘  └────┬─────┘
    │            │
    ▼            ▼
┌────────┐  ┌──────────────┐
│ Acesso │  │ /admin/login │
│ Liberado│  └──────────────┘
└────────┘
```

---

## 📝 Estrutura de Arquivos

```
src/
├── lib/
│   └── supabase.ts              # Cliente Supabase + Auth helpers
│
├── components/
│   └── ProtectedRoute.tsx       # HOC para proteção de rotas
│
├── pages/
│   ├── AdminLogin.tsx           # Página de login
│   ├── BlogAdmin.tsx            # Dashboard (protegido)
│   ├── BlogEditor.tsx           # Editor (protegido)
│   └── BlogSEO.tsx              # SEO tools (protegido)
│
└── App.tsx                      # Rotas configuradas
```

---

## 🔧 Funções Disponíveis

### **authService**

```typescript
// Login
await authService.signIn(email, password);

// Logout
await authService.signOut();

// Obter usuário atual
const user = await authService.getCurrentUser();

// Verificar autenticação
const isAuth = await authService.isAuthenticated();

// Obter sessão
const session = await authService.getSession();

// Reset de senha
await authService.resetPassword(email);

// Atualizar senha
await authService.updatePassword(newPassword);

// Listener de mudanças
authService.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
});
```

---

## 🐛 Troubleshooting

### **Erro: "Invalid login credentials"**

✅ Verifique se o email e senha estão corretos  
✅ Confirme que o usuário foi criado no Supabase  
✅ Verifique se "Auto Confirm User" está marcado

### **Erro: "supabaseUrl is required"**

✅ Verifique se o arquivo `.env` existe  
✅ Confirme que as variáveis estão corretas  
✅ Reinicie o servidor de desenvolvimento

### **Redirecionamento infinito**

✅ Limpe o localStorage: `localStorage.clear()`  
✅ Faça logout e login novamente  
✅ Verifique o console para erros

### **Sessão expira rapidamente**

✅ Supabase mantém sessão por 1 hora por padrão  
✅ A sessão é renovada automaticamente  
✅ Configure `autoRefreshToken: true` (já configurado)

---

## 📊 Tabelas do Supabase (Futuro)

Quando migrar para backend real, crie estas tabelas:

### **blog_posts**
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  author TEXT,
  author_avatar TEXT,
  author_bio TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'draft',
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  reading_time INTEGER,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **newsletter_subscribers**
```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Próximos Passos

1. ✅ Configurar Supabase
2. ✅ Criar usuário admin
3. ✅ Testar login
4. ⏳ Migrar mock data para Supabase
5. ⏳ Implementar upload de imagens
6. ⏳ Adicionar mais funcionalidades admin

---

## 📞 Suporte

- **Documentação Supabase**: https://supabase.com/docs
- **Auth Docs**: https://supabase.com/docs/guides/auth
- **Community**: https://github.com/supabase/supabase/discussions

---

**Configurado com 🔐 para máxima segurança!**
