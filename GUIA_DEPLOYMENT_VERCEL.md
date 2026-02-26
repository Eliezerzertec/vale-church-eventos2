# 🚀 Guia de Deploy na Vercel - Vale Church Manager

## Opção 1: Via Dashboard Vercel (Recomendado)

### Passo 1: Acessar Vercel
1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em **"Sign In"** ou **"Sign Up"** (se não tiver conta)
3. Faça login com sua conta GitHub

### Passo 2: Importar Projeto
1. Clique em **"Add New..." → "Project"**
2. Selecione a opção **"Import Git Repository"**
3. Procure e selecione **"Eliezerzertec/vale-church-manager"**
4. Clique em **"Import"**

### Passo 3: Configurar Variáveis de Ambiente
1. Na página de configuração, acesse a aba **"Environment Variables"**
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_PROJECT_ID = cwzmiznlvhhnpjgxgsme
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3em1pem5sdmhobnBqZ3hnc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5NzcsImV4cCI6MjA4NzA5Mjk3N30.nsXSSPW2yajdEy-iFlDmtIH-AltsNZ3n8BcNkqTJ4F4
VITE_SUPABASE_URL = https://cwzmiznlvhhnpjgxgsme.supabase.co
VITE_ABACATEPAY_KEY = abc_dev_wsc2xLB4mS4cjj2LX3DUryzY
```

### Passo 4: Deploy
1. Clique em **"Deploy"**
2. Aguarde o build e deployment completar (~2-5 minutos)
3. Seu site está pronto em um URL do tipo: `https://vale-church-manager.vercel.app`

---

## Opção 2: Via CLI (Command Line)

### Passo 1: Fazer Login
```bash
cd "d:\DESENVOLVIMENTO APP WEB\Nova pasta\Eventos-Church-Lavras\vale-church-manager"
npx vercel login
```

Será aberto no navegador para autenticação. Confirme e retorne ao terminal.

### Passo 2: Fazer Deploy
```bash
npx vercel --prod
```

### Passo 3: Adicionar Variáveis de Ambiente
Durante o processo, você pode adicionar as variáveis de ambiente, ou depois via dashboard Vercel.

---

## Opção 3: Deploy Automático (Recomendado para Produção)

### Configurar GitHub Actions
1. Qualquer push para a branch `main` automaticamente faz deploy

**Arquivo já configurado:** `vercel.json`

---

## ✅ Verificações Pré-Deploy

- ✅ Build bem-sucedido localmente (`npm run build`)
- ✅ Sem erros de compilação TypeScript
- ✅ `vercel.json` configurado
- ✅ `.vercelignore` criado
- ✅ Variáveis de ambiente prontas

---

## 📊 Configuração Instalada

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev"
}
```

### .vercelignore
- Node_modules, git, arquivos de documentação
- Supabase migrations (não necessário em frontend)

---

## 🔗 URL Após Deploy

Seu aplicativo estará disponível em:
```
https://vale-church-manager.vercel.app
```

Ou em um domínio customizado se configurar.

---

## ⚠️ Checklist Final

- [ ] Conta Vercel criada e conectada ao GitHub
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] URL acessível e funcionando
- [ ] Webhooks AbacatePay atualizados (se em produção)

---

## 🎯 Próximos Passos Após Deploy

1. **Atualizar Webhook AbacatePay**
   - Ir em AbacatePay Dashboard → Webhooks
   - Atualizar URL para: `https://seu-supabase.supabase.co/functions/v1/abacatepay-webhook`

2. **Verificar Logs**
   - Vercel Dashboard → Logs → Real-time logs

3. **Configurar Domínio Customizado** (opcional)
   - Vercel Dashboard → Settings → Domains

---

**Gerado em:** 20/02/2026
**Projeto:** Vale Church Manager
**Stack:** Vite + React + TypeScript + Supabase
