# 👋 Bem-vindo ao Vale Church Manager!

**Data:** 20 de fevereiro de 2026  
**Status:** Em Desenvolvimento 🚀  
**Versão:** 0.0.0 (Beta)

---

## 🎯 Sobre Este Projeto

**Vale Church Manager** é uma plataforma web moderna para gerenciar eventos, inscrições e pagamentos da **Igreja Vale Church em Lavras**.

### ✨ O que você pode fazer:
- 📱 Visitante: Descobrir eventos, inscrever-se, visualizar programação
- 👔 Admin: Gerenciar eventos, inscrições, pagamentos e gerar relatórios

---

## 🚀 Quick Start (5 minutos)

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env.local com:
#    VITE_SUPABASE_URL=your_url_here
#    VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here

# 3. Iniciar desenvolvimento
npm run dev

# 4. Abrir no navegador
# http://localhost:8080
```

✅ Pronto! Agora explore o projeto.

---

## 📚 Documentação Completa

Este projeto tem **6 arquivos de documentação** detalhados. Escolha baseado no seu objetivo:

### 📖 [INDICE.md](INDICE.md) - **LEIA PRIMEIRO!**
Mapa de referência de toda a documentação. Encontre rapidamente o que precisa.

### 📋 [CONTEXTO_PROJETO.md](CONTEXTO_PROJETO.md)
- Visão geral e arquitetura
- Stack tecnológico completo
- Estrutura detalhada de pastas
- Todas as rotas e pages
- Banco de dados (tabelas e schema)
- Design system e cores

**Use quando:** Precisa entender como o projeto é estruturado.

### ⚡ [GUIA_RAPIDO.md](GUIA_RAPIDO.md)
- Comandos essenciais
- Como adicionar páginas/componentes
- Padrões de código prontos
- Quick reference de features
- Checklist para novas funcionalidades

**Use quando:** Está desenvolvendo e precisa de referência rápida.

### 🔧 [REFERENCIA_TECNICA.md](REFERENCIA_TECNICA.md)
- Stack com versões
- Arquitetura em profundidade
- Schema SQL e tipos
- Integração Supabase
- React Query patterns
- TypeScript config
- Debugging tips

**Use quando:** Precisa de detalhes técnicos ou aprofundamento.

### ⚙️ [CONFIG_CRITICA.md](CONFIG_CRITICA.md)
- Variáveis de ambiente necessárias
- Scripts disponíveis
- Tabelas do banco de dados
- Autenticação e admin
- Troubleshooting rápido
- Informações de suporte

**Use quando:** Precisa configurar algo ou resolver um problema.

### 📊 [SUMARIO_EXECUTIVO.md](SUMARIO_EXECUTIVO.md)
- Visão executiva do projeto
- Rotas públicas vs admin
- Stack em uma linha
- Roadmap de fases
- Estimativa de custos
- Métricas de sucesso

**Use quando:** Precisa entender o projeto em alto nível.

### ✅ [CHECKLISTS_PRATICAS.md](CHECKLISTS_PRATICAS.md)
- Setup inicial
- Checklists por tarefa
- Troubleshooting
- Git workflow
- DOD (Definition of Done)
- Daily standup

**Use quando:** Quer completar uma tarefa passo-a-passo.

---

## 🗂️ Estrutura do Projeto

```
vale-church-manager/
├── src/
│   ├── pages/              # Todas as páginas (public + admin)
│   ├── components/         # Componentes reutilizáveis
│   ├── hooks/             # Custom hooks
│   └── integrations/      # Supabase client e types
├── supabase/              # Backend (migrations, functions)
├── public/                # Assets estáticos
├── vite.config.ts         # Build config
├── tailwind.config.ts     # Tema e estilos
│
├── INDICE.md              # 👈 LEIA PRIMEIRO!
├── CONTEXTO_PROJETO.md    # Arquitetura
├── GUIA_RAPIDO.md         # Referência dev
├── REFERENCIA_TECNICA.md  # Detalhes técnicos
├── CONFIG_CRITICA.md      # Configuração
├── SUMARIO_EXECUTIVO.md   # Overview
└── CHECKLISTS_PRATICAS.md # Checklists
```

---

## 🎯 Seus Primeiros Passos

### 1️⃣ Novo Desenvolvedor?
```
1. Leia INDICE.md (2 min)
2. Leia CONTEXTO_PROJETO.md (10 min)
3. Leia este README (5 min)
4. Comece a explorar o código!
```

### 2️⃣ Precisa Fazer Algo?
```
1. Procure na seção relevante de GUIA_RAPIDO.md
2. Se precisar detalhes, procure em REFERENCIA_TECNICA.md
3. Se resolver problemas, veja CHECKLISTS_PRATICAS.md
```

### 3️⃣ Quer Entender Todo o Projeto?
```
1. CONTEXTO_PROJETO.md (completo)
2. Rodar npm run dev e explorar
3. Olhar arquivos-chave: src/App.tsx, src/integrations/supabase/client.ts
```

### 4️⃣ Preparando Deploy?
```
1. CONFIG_CRITICA.md → Seção "Build & Deploy"
2. Executar: npm run build
3. Testar localmente: npm run preview
4. CHECKLISTS_PRATICAS.md → Seção "Antes de Deploy"
```

---

## 📋 Rotas Principais

### Públicas
| Rota | O que é |
|------|---------|
| `/` | Homepage com hero e próximos eventos |
| `/eventos` | Listagem completa de eventos |
| `/eventos/:id` | Detalhes de um evento |
| `/sobre` | Informações sobre a Igreja |

### Admin (após login)
| Rota | O que é |
|------|---------|
| `/admin/login` | Login de administradores |
| `/admin` | Dashboard principal |
| `/admin/eventos` | Gerenciar eventos |
| `/admin/inscricoes` | Gerenciar inscrições |
| `/admin/pagamentos` | Gerenciar pagamentos |

---

## 💻 Comandos Essenciais

```bash
# Desenvolvimento
npm run dev          # Inicia servidor (localhost:8080)
npm run build        # Build para produção
npm run preview      # Visualiza o build

# Testes e Qualidade
npm run test         # Executa testes
npm run test:watch   # Testes com auto-reload
npm run lint         # Verifica código

# Limpeza
rm -rf node_modules  # Remove deps (se necessário)
npm install          # Reinstala deps
```

---

## 🛠️ Stack Tecnológico (One-Liner)

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui  
**State:** TanStack React Query + React Hook Form  
**Backend:** Supabase (PostgreSQL + Auth + Edge Functions)  
**Deploy:** Recomenda-se Vercel ou Netlify

---

## 📊 Banco de Dados

Duas tabelas principais:

### `events` (Eventos)
- id, title, description, event_date, location, max_registrations, is_active

### `event_registrations` (Inscrições)
- id, event_id, user_id, full_name, email, phone, cpf, status

**Detalhes completos:** CONTEXTO_PROJETO.md → "Banco de Dados"

---

## 🔐 Configuração Necessária

Crie um arquivo `.env.local` na raiz com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

**⚠️ Este arquivo é git-ignored - não fazer commit!**

Obtenha estas credenciais:
1. Acesse [Supabase Console](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para Project Settings → API Keys
4. Copie `SUPABASE_URL` e `anon` key

---

## ✨ Features Principais

### Para Visitantes
- ✅ Homepage elegante com hero section
- ✅ Listagem de próximos eventos
- ✅ Detalhes completos de cada evento
- ✅ Inscrição em eventos (sem login)
- ✅ Informações sobre a Igreja
- ✅ Programação semanal de cultos

### Para Administradores
- ✅ Painel login seguro
- ✅ CRUD de eventos
- ✅ Gerenciar inscrições
- ✅ Processar pagamentos PIX
- ✅ Dashboard com dados

### Futuro (v2.0+)
- 📅 Relatórios e analytics
- 📊 Dashboard com gráficos
- 📧 Envio de emails automático
- 📱 App mobile
- 🎟️ QR code para check-in

---

## 🎨 Design & UX

- **Responsivo:** Mobile-first (funciona em todos tamanhos)
- **Acessível:** Cores com bom contraste, textos legíveis
- **Dark Mode:** Suportado (via CSS)
- **Performance:** Otimizado com Vite + React Query

Cores principais: Tons eclesiásticos + cream (#FFF8F0)  
Fontes: Playfair Display (títulos) + Inter (corpo)

---

## 🐛 Troubleshooting Rápido

### Não compila?
```bash
rm -rf node_modules
npm install
npm run dev
```

### Erro de Supabase?
- Verificar `.env.local` tem credenciais corretas
- Testar no [Supabase Console](https://supabase.com/dashboard)

### Porta 8080 em uso?
```bash
npm run dev -- --port 3000
```

**Mais troubleshooting:** CONFIG_CRITICA.md ou CHECKLISTS_PRATICAS.md

---

## 📚 Recursos Úteis

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)

---

## 🎓 Padrões de Código

### Fetch de Dados
```tsx
const { data, isLoading } = useQuery({
  queryKey: ["events"],
  queryFn: async () => {
    const { data } = await supabase.from("events").select("*");
    return data;
  }
});
```

### Criar Formulário
```tsx
const form = useForm();
// Use componentes Form do Shadcn/ui
```

### Toast/Notificação
```tsx
const { toast } = useToast();
toast({ title: "Sucesso!", description: "Ação realizada" });
```

**Mais padrões:** GUIA_RAPIDO.md → "Patterns Comuns"

---

## 🚀 Próximos Passos

### Para Começar Bem
1. [ ] Ler INDICE.md
2. [ ] Setup `.env.local`
3. [ ] Rodar `npm run dev`
4. [ ] Explorar o código
5. [ ] Fazer uma pequena mudança para testar

### Para Adicionar Feature
1. [ ] Ler GUIA_RAPIDO.md → tarefa relevante
2. [ ] Criar branch: `git checkout -b feature/meu-nome`
3. [ ] Desenvolver
4. [ ] Testar: `npm run test`, `npm run lint`
5. [ ] Commit e push

### Para Deploy
1. [ ] `npm run build` (sem erros?)
2. [ ] `npm run preview` (funciona?)
3. [ ] CONFIG_CRITICA.md → "Build & Deploy"
4. [ ] Deploy em Vercel ou Netlify

---

## 🤝 Contribuindo

### Reportar Bug
```
GitHub Issues → New Issue → Bug Report
Descrever: o que esperava, o que aconteceu, como reproduzir
```

### Sugerir Feature
```
GitHub Discussions ou email
Descrever: caso de uso, benefício, complexidade estimada
```

### Código
```
1. Fork → Clone → Nova branch
2. Código → Testes → Commit
3. Push → Pull Request
```

Veja CONTEXTO_PROJETO.md para mais detalhes.

---

## 📝 Documentação

Todos os arquivos `.md` na raiz têm documentação completa:

- **INDICE.md** - Começa por aqui!
- **CONTEXTO_PROJETO.md** - Arquitetura
- **GUIA_RAPIDO.md** - Dev reference
- **REFERENCIA_TECNICA.md** - Detalhes
- **CONFIG_CRITICA.md** - Configuração
- **SUMARIO_EXECUTIVO.md** - Overview
- **CHECKLISTS_PRATICAS.md** - Checklists

---

## 💡 Dicas Importantes

1. **Sempre use `@/` para imports:** `import Button from "@/components/ui/button"`
2. **Commit com mensagens claras:** `feat: add novo componente` ou `fix: corrige erro em X`
3. **Tailwind é seu amigo:** Use classes em vez de CSS customizado
4. **React Query gerencia cache:** Não precisa refetch manual
5. **TypeScript ajuda:** Aproveite sugestões do editor
6. **Variáveis de env:** Nunca fazer commit de `.env.local`
7. **Branches por feature:** `feature/nome-descritivo`
8. **Testes contam!** `npm run test` regularmente

---

## 🎉 Bem-vindo à Equipe!

**Vale Church Manager** é um projeto emocionante que vai ajudar a Igreja a gerenciar eventos de forma moderna e eficiente.

Se tiver dúvidas:
1. Procure nos arquivo `.md` (provavelmente está aí!)
2. Pergunte para a equipe
3. Procure na documentação das bibliotecas

**Vamos construir algo incrível! 🚀**

---

## 📞 Support & Links

| Recurso | Link |
|---------|------|
| Documentação Projeto | INDICE.md (neste folder) |
| Supabase Docs | https://supabase.com/docs |
| React Docs | https://react.dev |
| Tailwind Docs | https://tailwindcss.com |
| Shadcn/ui| https://ui.shadcn.com |

---

**Última atualização:** 20 de fevereiro de 2026  
**Criado com ❤️ para Vale Church Manager**

Happy coding! 🎉
