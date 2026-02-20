# ⚙️ CONFIGURAÇÕES CRÍTICAS - Vale Church Manager

**Última atualização:** 20 de fevereiro de 2026

---

## 🔑 Variáveis de Ambiente Necessárias

### Arquivo: `.env.local` (criar na raiz do projeto)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Opcional: PIX Configuration (para webhooks)
# VITE_PIX_KEY=your_pix_key
# VITE_WEBHOOK_SECRET=your_webhook_secret

# Opcional: Analytics
# VITE_ANALYTICS_ID=your_analytics_id
```

**⚠️ IMPORTANTE:** 
- Este arquivo está em `.gitignore` - NÃO fazer commit
- Cada environment (dev, staging, prod) tem suas próprias credenciais
- As keys são públicas (prefixo VITE_) - não armazene secrets aqui

---

## 🚀 Scripts de Desenvolvimento

```bash
# Desenvolvimento (porta 8080)
npm run dev

# Build para produção
npm run build

# Build em modo desenvolvimento (mais lento, melhor debug)
npm run build:dev

# Preview do build
npm run preview

# Testes (uma vez)
npm run test

# Testes com watch (rerun ao salvar)
npm run test:watch

# Linting (verificar código)
npm run lint
```

---

## 🌍 URLs Importantes

### Supabase Console
```
https://supabase.com/projects
```

### Projeto Local
```
http://localhost:8080
```

### Banco de Dados
```
PostgreSQL via Supabase
URL: conforme VITE_SUPABASE_URL
```

### Google Fonts (carregadas via CSS)
```
- Playfair Display (display font)
- Inter (body font)
```

---

## 🔐 Autenticação

### Admin Login
- **Rota:** `/admin/login`
- **Método:** Email + Senha (Supabase Auth)
- **Tokens:** Gerenciados automaticamente pelo Supabase
- **Storage:** localStorage
- **Auto Refresh:** Habilitado

### Usuários Demo (se existir)
```
Email: admin@valechurch.com
Senha: (conforme configuração no Supabase)
```

**Nota:** Configure credenciais de admin no Dashboard Supabase

---

## 📊 Banco de Dados - Tabelas Críticas

### events (Eventos)
```
- id: UUID (PK)
- title: VARCHAR(255)
- description: TEXT
- event_date: TIMESTAMP
- location: VARCHAR(255)
- max_registrations: INTEGER
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### event_registrations (Inscrições)
```
- id: UUID (PK)
- event_id: UUID (FK → events)
- user_id: UUID (FK → auth.users)
- full_name: VARCHAR(255)
- email: VARCHAR(255)
- phone: VARCHAR(20)
- cpf: VARCHAR(14)
- status: ENUM (pending, confirmed, cancelled)
- created_at: TIMESTAMP
```

### Enums
```sql
registration_status = ('pending', 'confirmed', 'cancelled')
```

---

## 🎨 Design System - Cores

### CSS Variables (em src/index.css)
```css
--border: valor HSL
--input: valor HSL
--ring: valor HSL
--background: valor HSL
--foreground: valor HSL
--primary: valor HSL (cor principal)
--primary-foreground: cor no primary
--secondary: cor secundária
--secondary-foreground: cor no secondary
--muted: cor desabilitada
--muted-foreground: texto em muted
--accent: cor de ênfase
--destructive: cor de erro/delete
```

### Cores Custom
```
--church-cream: #FFF8F0 (background secundário)
```

### Fontes
```
display: "Playfair Display" (serif - títulos)
body: "Inter" (sans-serif - textos)
```

---

## 🧭 Rotas Principais

### Públicas
```
GET  /                    → Index (homepage)
GET  /eventos            → EventsPage (listagem)
GET  /eventos/:id        → EventDetailPage (detalhe)
GET  /sobre              → AboutPage (sobre a igreja)
```

### Admin
```
GET  /admin/login                → AdminLogin
GET  /admin                      → AdminDashboard
GET  /admin/eventos              → AdminEvents
GET  /admin/inscricoes           → AdminRegistrations
GET  /admin/pagamentos           → AdminPayments
```

### Erro
```
GET  *                   → NotFound (404)
```

---

## 📦 Dependências Críticas

### Build
```json
{
  "vite": "5.x",
  "@vitejs/plugin-react-swc": "3.x"
}
```

### Framework
```json
{
  "react": "18.x",
  "react-dom": "18.x",
  "react-router-dom": "6.x"
}
```

### State Management
```json
{
  "@tanstack/react-query": "5.83.0",
  "react-hook-form": "7.x"
}
```

### Database
```json
{
  "@supabase/supabase-js": "2.97.0"
}
```

### UI Components
```json
{
  "tailwindcss": "3.x",
  "@radix-ui/*": "várias versões",
  "shadcn/ui": "via npm add"
}
```

---

## 🔌 Hooks Disponíveis

### use-toast
```typescript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();
toast({
  title: "Título",
  description: "Descrição",
  variant: "default" | "destructive"
});
```

### use-mobile
```typescript
import { useIsMobile } from "@/hooks/use-mobile";

const isMobile = useIsMobile();
```

---

## 🎯 Paths & Aliases

### TypeScript
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Vite
```typescript
// vite.config.ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

**Uso:**
```typescript
// Em vez de:
import Button from "../../../components/ui/button";

// Use:
import Button from "@/components/ui/button";
```

---

## 🧪 Testing

### Framework
```
Vitest (rápido, compatível com Jest)
```

### Setup
```typescript
// vitest.config.ts
{
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"]
  }
}
```

### Executar
```bash
npm run test          # Uma vez
npm run test:watch    # Watch mode
```

---

## 📝 Prettier e ESLint

### Linting
```bash
npm run lint
```

### Config ESLint
```
eslint.config.js (arquivo raiz)
```

### Formatter
```
Prettier (configuração padrão)
```

---

## 🚀 Build & Deploy

### Build Output
```
dist/ (com HTML, JS, CSS minificados)
```

### Build Commands
```bash
npm run build      # Produção (otimizado)
npm run build:dev  # Desenvolvimento (debug)
npm run preview    # Visualizar build localmente
```

### Recomendações Deploy
- **Vercel:** Suporta perfeitamente Vite
- **Netlify:** Suporta Node.js build
- **AWS S3 + CloudFront:** Para máximo controle
- **GitHub Pages:** Simples, sem backend

---

## 🔍 Mode: Development vs Production

### Development (npm run dev)
```
- Vite dev server (porta 8080)
- Hot Module Replacement (HMR) ativo
- Source maps para debug
- Sem minificação
- Lovable component tagger ativo
- Watch mode em automático
```

### Production (npm run build)
```
- Build estático em dist/
- Minificação total
- Tree shaking de imports
- Hashing de assets
- Otimização de imagens
- Pronto para CDN
```

---

## 📋 Checklist: Primeiro Setup

- [ ] Node.js 18+ instalado
- [ ] Clonar repositório
- [ ] `npm install` ou `bun install`
- [ ] Criar `.env.local` com credenciais Supabase
- [ ] `npm run dev` para testar
- [ ] Acessar `http://localhost:8080`
- [ ] Login no /admin/login com credenciais

---

## 📋 Checklist: Novo Desenvolvedor

- [ ] Ler `INDICE.md`
- [ ] Ler `CONTEXTO_PROJETO.md`
- [ ] Ler `GUIA_RAPIDO.md`
- [ ] Setup ambiente (Node, npm/bun)
- [ ] Clone + `npm install`
- [ ] Criar `.env.local`
- [ ] `npm run dev` → testar no browser
- [ ] Explore código com estes docs como guia

---

## 🐛 Troubleshooting Rápido

### Porta 8080 em use
```bash
# Opção 1: Usar outra porta
npm run dev -- --port 3000

# Opção 2: Liberar porta 8080
# No Windows: netstat -ano | findstr :8080
# Depois kill o processo
```

### Erro de autenticação Supabase
- Verificar `.env.local` com credenciais corretas
- Confirmar CORS no Dashboard Supabase
- Verificar se ainda é plano gratuito com limite

### Build failure
```bash
# Limpar cache Vite
rm -rf node_modules/.vite

# Reinstalar dependências
npm install
npm run build
```

### TypeScript errors
```bash
# Regenerar tipos Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID
```

---

## 📞 Contatos Importantes

### Supabase Support
```
https://supabase.com/support
```

### GitHub Repo
```
Conforme seu git remote origin
```

### Equipe
```
Contatos conforme seu time
```

---

## 📅 Datas Importantes

| Data | Evento |
|------|--------|
| 2026-02-19 | Primeiras duas migrations |
| 2026-02-20 | Migration PIX/payments |
| 2026-02-20 | Este documento criado |

---

## ✨ Quick Reference Cards

### Adicionar novo evento via DB
```typescript
const { error } = await supabase
  .from("events")
  .insert({
    title: "Nome do Evento",
    description: "Descrição",
    event_date: "2026-03-15T19:00:00",
    location: "Vale Church - Lavras",
    max_registrations: 100,
    is_active: true
  });
```

### Buscar eventos ativos
```typescript
const { data: events } = await supabase
  .from("events")
  .select("*")
  .eq("is_active", true)
  .gte("event_date", new Date().toISOString());
```

### Inscrever em evento
```typescript
const { error } = await supabase
  .from("event_registrations")
  .insert({
    event_id: "event-uuid",
    full_name: "Nome Completo",
    email: "email@example.com",
    phone: "(31) 99999-9999"
  });
```

---

**Criado em:** 20 de fevereiro de 2026  
**Finalidade:** Referência rápida de configurações críticas
