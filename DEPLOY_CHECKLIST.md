# 🚀 CHECKLIST DE DEPLOY - PRODUÇÃO

## ✅ PRÉ-DEPLOY (Obrigatório)

### 1. Configurar Supabase (30 min)
- [ ] Criar conta em https://supabase.com
- [ ] Criar novo projeto "DraThalitaMelo"
- [ ] Copiar Project URL e anon key
- [ ] Criar arquivo `.env.production`:
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=xxx
  ```
- [ ] Criar usuário admin:
  - Email: admin@your-domain.com
  - Senha: (crie uma senha forte)
  - ✅ Auto Confirm User
- [ ] Testar login localmente

### 2. Verificar Build (5 min)
- [ ] Executar `npm run build`
- [ ] Verificar pasta `dist/` criada
- [ ] Executar `npm run preview`
- [ ] Testar navegação básica

### 3. Configurar Plataforma de Deploy (15 min)

#### Opção A: Vercel (Recomendado)
- [ ] Criar conta em https://vercel.com
- [ ] Conectar repositório GitHub
- [ ] Configurar:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
- [ ] Adicionar Environment Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy

#### Opção B: Netlify
- [ ] Criar conta em https://netlify.com
- [ ] Conectar repositório
- [ ] Configurar build settings
- [ ] Adicionar variáveis de ambiente
- [ ] Deploy

---

## ✅ PÓS-DEPLOY (Recomendado)

### 4. Configurar Domínio (30 min)
- [ ] Registrar domínio (ex: thalitameloadv.com.br)
- [ ] Configurar DNS na plataforma de deploy
- [ ] Aguardar propagação (até 48h)
- [ ] Verificar SSL ativo (HTTPS)

### 5. Google Analytics (15 min)
- [ ] Criar conta Google Analytics
- [ ] Criar propriedade
- [ ] Copiar Measurement ID
- [ ] Adicionar ao `index.html`:
  ```html
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
  ```
- [ ] Verificar tracking funcionando

### 6. Google Search Console (15 min)
- [ ] Acessar https://search.google.com/search-console
- [ ] Adicionar propriedade (domínio)
- [ ] Verificar propriedade
- [ ] Submeter sitemap: `https://seusite.com/sitemap.xml`
- [ ] Solicitar indexação das páginas principais

### 7. Google My Business (30 min)
- [ ] Criar perfil do negócio
- [ ] Adicionar informações:
  - Nome: Thalita Melo Advocacia
  - Endereço: R. Profa. Maria Nilde Couto Bem, 220
  - Telefone: 88996017070
  - Site: URL do site
  - Horário: Seg-Sex 8h-18h
- [ ] Adicionar fotos
- [ ] Verificar localização

---

## ✅ VERIFICAÇÕES FINAIS

### 8. Testes de Produção (30 min)
- [ ] Testar todas as páginas principais
- [ ] Testar formulários
- [ ] Testar calculadoras
- [ ] Testar login admin
- [ ] Testar em mobile
- [ ] Testar em diferentes navegadores
- [ ] Verificar links quebrados
- [ ] Verificar imagens carregando

### 9. Performance (15 min)
- [ ] Executar Lighthouse
  - Performance: > 90
  - Accessibility: > 90
  - Best Practices: > 90
  - SEO: > 90
- [ ] Verificar PageSpeed Insights
- [ ] Testar velocidade de carregamento

### 10. SEO (15 min)
- [ ] Verificar meta tags (view-source)
- [ ] Testar Schema.org: https://validator.schema.org
- [ ] Verificar sitemap acessível
- [ ] Verificar robots.txt acessível
- [ ] Testar compartilhamento social

---

## ✅ MONITORAMENTO (Opcional)

### 11. Configurar Monitoramento
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics)

### 12. Backup
- [ ] Configurar backup automático
- [ ] Documentar processo de restore
- [ ] Testar restore

---

## 📊 MÉTRICAS PARA ACOMPANHAR

### Primeira Semana:
- [ ] Verificar indexação no Google
- [ ] Monitorar erros no console
- [ ] Verificar conversões (formulários)
- [ ] Analisar tráfego inicial

### Primeiro Mês:
- [ ] Analisar palavras-chave
- [ ] Verificar posicionamento
- [ ] Otimizar páginas de baixo desempenho
- [ ] Publicar novos artigos no blog

---

## 🆘 TROUBLESHOOTING

### Problemas Comuns:

**Build falha:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Variáveis de ambiente não funcionam:**
- Verificar prefixo `VITE_`
- Reiniciar servidor após mudanças
- Verificar configuração na plataforma

**404 em rotas:**
- Configurar redirects/rewrites
- Vercel: Automático
- Netlify: Criar `_redirects`:
  ```
  /*    /index.html   200
  ```

**SSL não ativa:**
- Aguardar propagação DNS (até 48h)
- Verificar configuração de domínio
- Contatar suporte da plataforma

---

## 📞 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview build local
npm run preview

# Verificar segurança
npm audit

# Atualizar dependências
npm update

# Limpar cache
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ CONCLUSÃO

**Tempo Total Estimado:** 2-3 horas

**Ordem Recomendada:**
1. Supabase (30 min)
2. Build e Deploy (20 min)
3. Domínio (30 min)
4. Analytics (15 min)
5. Search Console (15 min)
6. Testes (30 min)

**Após Deploy:**
- Site estará no ar
- Monitorar primeiras 24h
- Fazer ajustes conforme necessário

**Suporte:**
- Consultar `PRODUCTION_AUDIT.md`
- Consultar documentação específica
- Verificar logs da plataforma

---

**Boa sorte com o deploy! 🚀**
