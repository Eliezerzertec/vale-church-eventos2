# 🚀 GUIA RÁPIDO - Vale Church Manager

## ⚡ Comandos Essenciais

```bash
# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Testes
npm run test
npm run test:watch

# Lint
npm run lint
```

---

## 📂 Arquivos Principais por Tarefa

### 🎯 Adicionar Nova Página
1. Criar arquivo em `src/pages/NomePagePage.tsx`
2. Adicionar rota em `src/App.tsx` dentro de `<Routes>`
3. Importar componentes necessários

### 🎨 Adicionar Novo Componente UI
1. Usar `npm run shadcn-ui add <component>` (se não existir)
2. Criar em `src/components/` ou `src/components/ui/`
3. Exportar/importar conforme necessário

### 🔌 Usar Banco de Dados
```typescript
import { supabase } from "@/integrations/supabase/client";

// Exemplo: Buscar eventos
const { data, error } = await supabase
  .from("events")
  .select("*")
  .eq("is_active", true);
```

### 📋 Adicionar Query/Fetch
```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ["key-único"],
  queryFn: async () => {
    // Sua lógica de fetch
  },
});
```

### 🎯 Criar Formulário
```typescript
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

const form = useForm();
// Construir form com Form.Field
```

---

## 📍 Localização de Tecnologias

| Tecnologia | Onde Está | Para Quê |
|------------|-----------|----------|
| Roteamento | `src/App.tsx` | Definir rotas da app |
| Estilos Globais | `src/index.css` | CSS custom properties |
| Theme | `tailwind.config.ts` | Cores, fontes, tema |
| DB | Supabase PostgreSQL | Dados eventos/inscrições |
| Auth | Supabase Auth | Login admin |
| Testes | `src/test/` | Vitest + setup.ts |

---

## 🔑 Variáveis de Ambiente Necessárias

Criar arquivo `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

---

## 🎨 Componentes Shadcn/ui Disponíveis

### Layout
- `card`, `separator`, `scroll-area`

### Formulários
- `input`, `select`, `textarea`, `checkbox`, `radio-group`, `switch`
- `form` (com React Hook Form integrado)

### Caixa de Diálogo
- `dialog`, `drawer`, `alert-dialog`, `popover`, `dropdown-menu`

### Tabela & Dados
- `table`, `tabs`, `pagination`, `command`

### Feedback
- `button`, `badge`, `progress`, `skeleton`
- `toast`, `sonner` (notificações)

### Navegação
- `navigation-menu`, `menubar`, `breadcrumb`

### Media
- `carousel`, `avatar`, `aspect-ratio`, `calendar`

---

## 🏗️ Estrutura de Pasta `components/`

```
components/
├── AdminLayout.tsx          # Wrapper da area admin
├── Footer.tsx              # Rodapé global
├── Navbar.tsx              # Header com navegação
├── NavLink.tsx             # Links customizados
└── ui/                     # Componentes Shadcn/ui (30+)
```

---

## 🌐 Rotas Rápidas

| Público | Admin |
|---------|-------|
| `/` | `/admin/login` |
| `/eventos` | `/admin` |
| `/eventos/:id` | `/admin/eventos` |
| `/sobre` | `/admin/inscricoes` |
| | `/admin/pagamentos` |

---

## 💾 Dados Principais (Supabase)

### Tabela: `events`
```
id, title, description, event_date, location, 
max_registrations, is_active, created_at, updated_at
```

### Tabela: `event_registrations`
```
id, event_id, user_id, full_name, email, phone, 
cpf, status (enum), created_at
```

---

## 🔍 Patterns Comuns

### Fetch com Error Handling
```tsx
const { data, error, isLoading } = useQuery({
  queryKey: ["items"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("table")
      .select("*");
    if (error) throw error;
    return data;
  },
});

if (isLoading) return <Skeleton />;
if (error) return <Alert>Erro ao carregar</Alert>;
```

### Notificação Toast
```tsx
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();
toast({ title: "Sucesso", description: "Ação realizada" });
```

### Link Interno
```tsx
import { Link } from "react-router-dom";

<Link to="/eventos/123">
  <Button>Ver Evento</Button>
</Link>
```

---

## 🧩 Extensões Sugeridas (VSCode)

- Tailwind CSS IntelliSense
- ESLint
- TypeScript Vue Plugin
- Shadcn/ui Snippets

---

## 🛠️ Debug & Troubleshooting

### Porta 8080 já está em uso
```bash
# Alterar em vite.config.ts ou:
npm run dev -- --port 3000
```

### Cache Supabase
```typescript
// Invalidar query
queryClient.invalidateQueries({ queryKey: ["events"] });
```

### TypeScript Error
```bash
# Regenerar tipos Supabase
npx supabase gen types typescript
```

---

## 📱 Responsive Breakpoints (Tailwind)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🎯 Checklist para Novas Features

- [ ] Criar componente/página
- [ ] Adicionar rota em `App.tsx`
- [ ] Adicionar tipos (types.ts)
- [ ] Configurar query/mutation
- [ ] Estilizar com Tailwind
- [ ] Testar responsividade
- [ ] Adicionar testes (vitest)
- [ ] Documentar no `CONTEXTO_PROJETO.md`

---

**Última atualização:** 20 de fevereiro de 2026
