# 📖 CONTEXTO DO PROJETO - Vale Church Manager

**Data Criação:** 20 de fevereiro de 2026  
**Versão:** 0.0.0  
**Status:** Em Desenvolvimento

---

## 🎯 Visão Geral

**Vale Church Manager** é uma aplicação web moderna para gerenciar eventos, inscrições e pagamentos da Igreja Vale Church em Lavras. O sistema oferece uma experiência responsiva tanto para visitantes quanto para administradores.

**Slogan:** "Somos Movidos Por Amor"  
**Missão:** Uma igreja formada por autênticos discípulos de Cristo, comprometida com a implantação do Reino de Deus.

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** React 18+ (TypeScript)
- **Build:** Vite
- **Roteamento:** React Router v6
- **Styling:** Tailwind CSS + PostCSS
- **Components UI:** Shadcn/ui (baseado em Radix UI)
- **Estado/Queries:** TanStack React Query v5
- **Formulários:** React Hook Form + Resolvers
- **Ícones:** Lucide React
- **Datas:** date-fns (com locale pt-BR)
- **Notificações:** Sonner + React Toaster
- **Carrossel:** Embla Carousel

### Backend
- **Database:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **Webhooks:** Supabase Functions (APIs serverless)

### DevTools
- **Linting:** ESLint
- **Testing:** Vitest
- **Package Manager:** Bun
- **Editor Config:** VSCode auto-tagger (Lovable)

---

## 📁 Estrutura de Pastas

```
vale-church-manager/
├── src/
│   ├── pages/              # Páginas da aplicação
│   │   ├── Index.tsx              # Homepage com hero e próximos eventos
│   │   ├── EventsPage.tsx         # Listagem de eventos
│   │   ├── EventDetailPage.tsx    # Detalhes de um evento
│   │   ├── AboutPage.tsx          # Página sobre a igreja
│   │   ├── AdminLogin.tsx         # Login administrador
│   │   ├── AdminDashboard.tsx     # Dashboard admin
│   │   ├── AdminEvents.tsx        # Gerenciar eventos (admin)
│   │   ├── AdminRegistrations.tsx # Gerenciar inscrições (admin)
│   │   ├── AdminPayments.tsx      # Gerenciar pagamentos (admin)
│   │   └── NotFound.tsx           # Página 404
│   │
│   ├── components/         # Componentes React
│   │   ├── AdminLayout.tsx        # Layout do painel admin
│   │   ├── Navbar.tsx             # Navegação superior
│   │   ├── Footer.tsx             # Rodapé
│   │   ├── NavLink.tsx            # Link de navegação customizado
│   │   └── ui/                    # Componentes Shadcn/ui (30+)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── form.tsx
│   │       ├── dialog.tsx
│   │       ├── tabs.tsx
│   │       └── ... (mais 20+)
│   │
│   ├── hooks/              # Custom Hooks
│   │   ├── use-mobile.tsx        # Detecta tela mobile
│   │   └── use-toast.ts          # Hook de notificações
│   │
│   ├── integrations/       # Integrações externas
│   │   └── supabase/
│   │       ├── client.ts         # Cliente Supabase autogen
│   │       └── types.ts          # Types da DB autogen (345 linhas)
│   │
│   ├── lib/                # Utilitários
│   │   └── utils.ts              # Funções helpers (classname merge, etc)
│   │
│   ├── assets/             # Imagens e mídia
│   │   └── hero-church.jpg
│   │
│   ├── test/               # Testes
│   │   ├── example.test.ts
│   │   └── setup.ts
│   │
│   ├── App.tsx             # Configuração de rotas principal
│   ├── main.tsx            # Entry point
│   ├── App.css
│   ├── index.css           # Estilos globais
│   └── vite-env.d.ts       # Type definitions Vite
│
├── supabase/               # Backend Supabase
│   ├── config.toml         # Configuração local
│   ├── functions/          # Edge Functions
│   │   └── pix-webhook/
│   │       └── index.ts    # Webhook para pagamento PIX
│   └── migrations/         # Migrations SQL
│       ├── 20260219164317_e719a5a1-17da-4b7f-9522-f847b4db9c49.sql
│       ├── 20260219164335_fb1d6410-2779-41d4-bdb9-2b88cf106b3b.sql
│       └── 20260220172220_ff33eb28-7ca3-4d8d-926d-0ae41a003c16.sql
│
├── public/                 # Arquivos estáticos
│   └── robots.txt
│
├── package.json            # Dependências e scripts
├── bun.lockb              # Lock file Bun
├── vite.config.ts         # Configuração Vite
├── tsconfig.json          # Config TypeScript base
├── tsconfig.app.json      # Config TypeScript app
├── tsconfig.node.json     # Config TypeScript node
├── tailwind.config.ts     # Configuração Tailwind
├── postcss.config.js      # Configuração PostCSS
├── eslint.config.js       # Configuração ESLint
├── vitest.config.ts       # Configuração Vitest
├── components.json        # Configuração Shadcn/ui
├── index.html             # HTML base
└── README.md             # Documentação padrão

```

---

## 🌐 Rotas e Navegação

### Rotas Públicas
| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Index | Homepage com hero, programação semanal e próximos eventos |
| `/eventos` | EventsPage | Listagem de todos os eventos ativos |
| `/eventos/:id` | EventDetailPage | Detalhes de um evento específico |
| `/sobre` | AboutPage | Informações sobre a Igreja Vale Church |

### Rotas Admin (protegidas)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin/login` | AdminLogin | Login de administradores |
| `/admin` | AdminDashboard | Dashboard principal (dentro do AdminLayout) |
| `/admin/eventos` | AdminEvents | Gerenciar eventos (criar, editar, deletar) |
| `/admin/inscricoes` | AdminRegistrations | Gerenciar inscrições de eventos |
| `/admin/pagamentos` | AdminPayments | Gerenciar pagamentos e PIX |

### Rota Coringa
| Rota | Página | Descrição |
|------|--------|-----------|
| `*` | NotFound | Página 404 para rotas não encontradas |

---

## 📊 Banco de Dados (Supabase)

### Tabelas Principais

#### `events` (Eventos)
- `id` (UUID) - Chave primária
- `title` (string) - Título do evento
- `description` (text) - Descrição detalhada
- `event_date` (timestamp) - Data e hora do evento
- `location` (string) - Local do evento
- `max_registrations` (integer) - Limite de inscrições
- `is_active` (boolean) - Se o evento está ativo
- Timestamps: `created_at`, `updated_at`

#### `event_registrations` (Inscrições)
- `id` (UUID) - Chave primária
- `event_id` (UUID) - FK para events
- `user_id` (UUID) - FK para auth.users (nullable)
- `full_name` (string) - Nome completo
- `email` (string) - Email
- `phone` (string) - Telefone (nullable)
- `cpf` (string) - CPF (nullable)
- `status` (enum) - Status: `pending`, `confirmed`, `cancelled`
- Timestamps: `created_at`

#### Outras Tabelas Esperadas
- `payments` - Registro de pagamentos e PIX
- `users` - Usuários do sistema (admin)
- Possivelmente: `event_categories`, `payment_history`, `audit_logs`

---

## 🎨 Design System

### Tipografia
- **Display Font:** Playfair Display (serif) - Para títulos
- **Body Font:** Inter (sans-serif) - Para textos

### Cores Principais
- **Primary:** Usado em destaque e CTAs
- **Secondary:** Backgrounds e destaques
- **Primary Foreground:** Textos sobre primary
- **Secondary Foreground:** Textos sobre secondary
- **Church Cream:** Background custom (`#FFF8F0`)

### Gradientes
- `gradient-hero` - Overlay escuro para seção hero
- `gradient-gold` - Gradiente dourado para ícones

### Tema
- Suporta dark mode via `darkMode: ["class"]`
- CSS variables para customização dinâmica

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev           # Inicia dev server (porta 8080)
npm run build         # Build para produção
npm run build:dev     # Build em modo desenvolvimento
npm run preview       # Preview do build

# Testes
npm run test          # Executa testes com Vitest
npm run test:watch    # Testes em modo watch

# Qualidade
npm run lint          # Lint com ESLint
```

---

## 🔐 Autenticação e Admin

### Sistema Admin
- Login por email/senha no Supabase
- Proteção de rotas via AdminLayout (presumivelmente)
- Dashboard para gerenciar:
  - Eventos
  - Inscrições
  - Pagamentos e PIX

### Integrações
- **Supabase Auth:** Autenticação padrão
- **WebHook PIX:** Edge Function em `supabase/functions/pix-webhook/`

---

## 📝 Funcionalidades Principais

### Para Visitantes
- Visualizar homepage com hero section
- Ver próximos eventos (limite 3 na homepage)
- Listar todos os eventos disponíveis
- Ver detalhes de cada evento
- Inscrever-se em eventos
- Informações sobre a Igreja Vale Church
- Programação semanal (Domingo, Terça, Quinta)

### Para Administradores
- Login seguro
- Dashboard com overview
- CRUD completo de eventos
- Gerenciar inscrições
- Processar pagamentos (PIX)
- Relatórios e análises

---

## 🔧 Configurações Importantes

### Vite (vite.config.ts)
- Host: `::`
- Porta: `8080`
- HMR overlay desativado
- alias `@` para `./src`
- React SWC como compilador

### TypeScript (tsconfig.json)
- `baseUrl: "."`
- Path alias `@/*` → `./src/*`
- `skipLibCheck: true`
- Verificações leves (`noImplicitAny: false`, `strictNullChecks: false`)

### Supabase Client
```typescript
// Env vars necessárias:
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY

// Configuração:
- Storage: localStorage
- persistSession: true
- autoRefreshToken: true
```

---

## 📌 Informações Importantes

### Arquitetura
- **SPA (Single Page Application)** com React Router
- **Query Client** centralizado (TanStack Query)
- **Providers** aninhados: QueryClientProvider → TooltipProvider → Toaster → BrowserRouter
- **Components** reutilizáveis do Shadcn/ui

### Padrões de Código
- TypeScript strict (com algumas relaxações)
- Componentes funcionais com hooks
- Naming: PascalCase para componentes, camelCase para funções
- Path aliases `@/` para importações limpas

### Integração Lovable
- Projeto gerenciado via lovable.dev
- Auto-tagger para componentes (modo dev)
- Commits automáticos via Lovable
- Suporte a GitHub Codespaces

---

## ⚠️ Observações Técnicas

1. **Geração Automática:** Arquivos em `supabase/` e `src/integrations/supabase/` são gerados automaticamente - edite com cuidado!

2. **Migrations:** 3 migrations já realizadas (feb 19-20, 2026)
   - Estrutura de eventos
   - Sistema de inscrições
   - Provável sistema de pagamentos

3. **Assets:** Imagem hero (`hero-church.jpg`) armazenada em `src/assets/`

4. **Locale:** Configurado para português-Brasil (pt-BR) via date-fns

5. **Package Manager:** Bun (mais rápido que npm/yarn)

6. **Responsividade:** Totalmente responsivo com Tailwind breakpoints

---

## 📞 Próximos Passos Sugeridos

- [ ] Configurar variáveis de ambiente (`.env.local`)
- [ ] Testar autenticação Supabase
- [ ] Completar páginas admin
- [ ] Implementar webhook PIX
- [ ] Adicionar testes unitários
- [ ] Deploy em produção
- [ ] Configurar CI/CD

---

**Última Atualização:** 20 de fevereiro de 2026  
**Criado por:** GitHub Copilot  
**Para consultas:** Revise este arquivo sempre que precisar entender a arquitetura do projeto.
