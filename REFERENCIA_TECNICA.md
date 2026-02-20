# 🔧 REFERÊNCIA TÉCNICA - Vale Church Manager

**Projeto:** Vale Church Manager  
**Data:** 20 de fevereiro de 2026  
**Versão:** 0.0.0 (Beta)

---

## 📊 Stack Completo

### Build & Dev
```json
{
  "vite": "^5.x",
  "@vitejs/plugin-react-swc": "compilador otimizado",
  "bun": "package manager (mais rápido que npm)"
}
```

### React & State
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x (routing)",
  "@tanstack/react-query": "^5.83.0 (server state)",
  "react-hook-form": "^7.x (form state)"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.x",
  "postcss": "^8.x",
  "radix-ui": "30+ componentes",
  "shadcn/ui": "wrapper de Radix UI",
  "lucide-react": "ícones minimalistas"
}
```

### Utilitários
```json
{
  "date-fns": "^3.6.0 (com ptBR locale)",
  "@hookform/resolvers": "^3.10.0",
  "@supabase/supabase-js": "^2.97.0",
  "sonner": "notificações toast",
  "embla-carousel-react": "^8.6.0",
  "clsx": "class merging",
  "cmdk": "command palette"
}
```

### Dev & Testing
```json
{
  "typescript": "^5.x (strict mode leve)",
  "eslint": "linting",
  "vitest": "testing framework",
  "lovable-tagger": "component tagging (dev)"
}
```

---

## 🏛️ Arquitetura da Aplicação

```
├── Entry Point: main.tsx
├── App.tsx (Root with Providers)
│   ├── QueryClientProvider
│   ├── TooltipProvider  
│   ├── Toaster (React Toast)
│   ├── Sonner (Toast alt)
│   └── BrowserRouter
│       └── Routes
│           ├── Public Routes (/)
│           ├── Event Routes (/eventos/*)
│           ├── Admin Routes (/admin/*)
│           └── 404 (*) 
│
├── Pages (UI Screens)
│   ├── Index (homepage)
│   ├── EventsPage (listagem)
│   ├── EventDetailPage (detalhe)
│   ├── AboutPage (sobre)
│   ├── AdminLogin
│   ├── AdminLayout (wrapper)
│   │   ├── AdminDashboard
│   │   ├── AdminEvents
│   │   ├── AdminRegistrations
│   │   └── AdminPayments
│   └── NotFound
│
├── Components (Reusable)
│   ├── AdminLayout
│   ├── Navbar
│   ├── Footer
│   └── ui/* (Shadcn components)
│
├── Hooks (State Logic)
│   ├── use-mobile (responsive)
│   └── use-toast (notifications)
│
├── Lib (Utilities)
│   └── utils.ts (helpers)
│
├── Integrations
│   ├── supabase/client.ts (SDK)
│   └── supabase/types.ts (DB types)
│
└── Styles
    ├── index.css (global)
    ├── App.css (component)
    └── tailwind.config.ts (theme)
```

---

## 🗄️ Database Schema (Supabase)

### events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  max_registrations INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Índices (presumido)
CREATE INDEX idx_events_active_date 
ON events(is_active, event_date);
```

### event_registrations
```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES auth.users(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14),
  status registration_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

-- Enum
CREATE TYPE registration_status AS ENUM (
  'pending', 'confirmed', 'cancelled'
);

-- Índices (presumido)
CREATE INDEX idx_event_registrations_event 
ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user 
ON event_registrations(user_id);
```

### Tabelas Esperadas (não confirmadas)
- `payments` - Registro de transações PIX
- `users_admin` - Usuários administradores
- `audit_logs` - Logs de auditoria (opcional)

---

## 🌍 Integração Supabase

### Autenticação
```typescript
// Client configurado em src/integrations/supabase/client.ts
export const supabase = createClient<Database>(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Uso
const { data: { session } } = await supabase.auth.getSession();
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

### Queries (from client)
```typescript
// SELECT
const { data, error } = await supabase
  .from("events")
  .select("*")
  .eq("is_active", true);

// INSERT
const { data, error } = await supabase
  .from("event_registrations")
  .insert([{ full_name, email, event_id }]);

// UPDATE
const { data, error } = await supabase
  .from("events")
  .update({ is_active: false })
  .eq("id", eventId);

// DELETE
const { error } = await supabase
  .from("events")
  .delete()
  .eq("id", eventId);
```

### Edge Functions
- **Location:** `supabase/functions/pix-webhook/index.ts`
- **Propósito:** Receber webhooks de pagamento PIX
- **Trigger:** POST para webhook URL gerada pelo Supabase

---

## 🎨 CSS & Styling Architecture

### Tailwind Configuration
```typescript
// File: tailwind.config.ts
{
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: "Playfair Display (serif)",
        body: "Inter (sans-serif)"
      },
      colors: {
        "church-cream": "#FFF8F0",
        // mais colors customizadas
      },
      // animations, spacing, etc
    }
  }
}
```

### CSS Variables (index.css)
```css
:root {
  --border: hsl(...);
  --input: hsl(...);
  --ring: hsl(...);
  --background: hsl(...);
  --foreground: hsl(...);
  --primary: hsl(...);
  --primary-foreground: hsl(...);
  --secondary: hsl(...);
  --secondary-foreground: hsl(...);
  /* mais 20+ variáveis */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* valores para dark mode */
  }
}
```

---

## 🔌 React Query Patterns

### useQuery (Buscar dados)
```typescript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["events", // chave única
  queryFn: async () => {
    // função de fetch
    return data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutos
  gcTime: 1000 * 60 * 10, // 10 minutos (antigo: cacheTime)
  retry: 2,
  enabled: true // condicional
});
```

### useMutation (Criar/Atualizar/Deletar)
```typescript
const mutation = useMutation({
  mutationFn: async (variables) => {
    return await supabase.from("table").insert(variables);
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    toast({ title: "Sucesso" });
  },
  onError: (error) => {
    toast({ title: "Erro", variant: "destructive" });
  }
});

mutation.mutate({ /* dados */ });
```

---

## 📝 TypeScript Config

### tsconfig.json (base)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "strictNullChecks": false,
    "allowJs": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

---

## 🚀 Build Output

- **Target:** ES2020
- **Module:** ESNext
- **Output:** Vite gera `dist/` com HTML + JS + CSS otimizados
- **Size Hints:** Vite avalia bundle size ao build

---

## 🧪 Testing Setup

### Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"]
  }
});
```

### Setup (src/test/setup.ts)
- Configuração global para testes
- Mocks de dependências
- Providers wrapper

---

## 📦 Migrations (3 aplicadas)

1. **20260219164317**: Estrutura inicial (presumido)
2. **20260219164335**: Tabelas principais (presumido)
3. **20260220172220**: Webhooks ou payments (presumido)

---

## 🔐 Security Considerations

1. **RLS (Row Level Security):** Deve estar ativado no Supabase
2. **Environment Variables:** `.env.local` (git-ignored)
3. **Auth Tokens:** Gerenciados automaticamente pelo Supabase
4. **CORS:** Configurado no Supabase dashboard
5. **API Keys:** Publishable key apenas (segura no frontend)

---

## 📱 Responsive Design Approach

```
Mobile First (mobile < 640px)
  └── sm (640px)
      └── md (768px)
          └── lg (1024px)
              └── xl (1280px)
                  └── 2xl (1536px)
```

Exemplo:
```tsx
<div className="col-1 sm:col-2 md:col-3 lg:col-4">
  // 1 coluna mobile, 2 em tablet, 3 em desktop, 4 em widescreen
</div>
```

---

## 🎯 Performance Optimizations

- **Vite + SWC:** Build > 10x mais rápido que webpack
- **React Query:** Caching automático de requests
- **Code Splitting:** Rotas lazy-loaded via React Router
- **Image Optimization:** Imagens em `assets/`
- **Tree Shaking:** Remove código não usado
- **CSS Purging:** Tailwind remove classes não usadas

---

## 🔄 CI/CD Readiness

- Git integration pronta
- Build script: `npm run build`
- Lint: `npm run lint`
- Tests: `npm run test`
- Preview: `npm run preview`
- Deploy: Recomenda-se Vercel, Netlify ou AWS S3

---

## 📚 Documentação Oficial

- [React Docs](https://react.dev)
- [Tanstack Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 🐛 Debugging Tips

### React DevTools
```
Chrome Extension: React Developer Tools
Inspecionar componentes e hooks
```

### Vite Inspector
```typescript
// vite.config.ts permite devTools
```

### Console Logging (React Query)
```typescript
import { queryClient } from "@/lib/queryClient";

// Ver cache
console.log(queryClient.getQueryData(["events"]));

// Invalidar
queryClient.invalidateQueries({ queryKey: ["events"] });
```

### Supabase Realtime (opcional)
```typescript
// Subscribe a mudanças
supabase
  .from("events")
  .on("*", (payload) => console.log(payload))
  .subscribe();
```

---

**Última atualização:** 20 de fevereiro de 2026  
**Finalidade:** Referência técnica completa do projeto
