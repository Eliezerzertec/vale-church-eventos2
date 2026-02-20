# 📑 ÍNDICE DE DOCUMENTAÇÃO - Vale Church Manager

Bem-vindo! Aqui você encontrará documentação completa do projeto **Vale Church Manager**.

---

## 📚 Arquivos de Documentação

### 1. **CONTEXTO_PROJETO.md** 📖
**Use quando:** Precisa entender a arquitetura geral do projeto, componentes, páginas e banco de dados.

**O que contém:**
- Visão geral e missão do projeto
- Stack tecnológico completo
- Estrutura detalhada de pastas
- Descrição de todas as rotas
- Schema do banco de dados
- Design system
- Configurações importantes

**Exemplo:** "Qual é a estrutura de pastas?" → Leia este arquivo

---

### 2. **GUIA_RAPIDO.md** ⚡
**Use quando:** Você está desenvolvendo e precisa de uma referência rápida para tarefas comuns.

**O que contém:**
- Comandos essenciais (dev, build, test)
- Como adicionar páginas/componentes
- Padrões de código (queries, forms, notificações)
- Localização de tecnologias
- Variáveis de ambiente
- Rotas rápidas
- Padrões comuns de código
- Checklist para novas features

**Exemplo:** "Como faço um fetch com React Query?" → Encontre aqui

---

### 3. **REFERENCIA_TECNICA.md** 🔧
**Use quando:** Você precisa de detalhes técnicos, configuração, ou informações mais profundas.

**O que contém:**
- Stack completo com versões
- Arquitetura detalhada
- Schema SQL com tipos
- Integração Supabase
- Padrões React Query
- Configuração TypeScript
- CSS Architecture
- Patterns de testing
- Security considerations
- Debugging tips

**Exemplo:** "Como configurar o Supabase?" → Procure aqui

---

## 🎯 Guia Rápido por Tarefa

| Tarefa | Arquivo |
|--------|---------|
| Entender o projeto | `CONTEXTO_PROJETO.md` |
| Começar a desenvolver | `GUIA_RAPIDO.md` |
| Adicionar nova página | `GUIA_RAPIDO.md` → Seção "Adicionar Nova Página" |
| Usar banco de dados | `GUIA_RAPIDO.md` → Seção "Usar Banco de Dados" |
| Debugar algo | `REFERENCIA_TECNICA.md` → Seção "Debugging Tips" |
| Entender estrutura DB | `CONTEXTO_PROJETO.md` → Seção "Banco de Dados" |
| Configurar ambiente | `GUIA_RAPIDO.md` → Seção "Variáveis de Ambiente" |
| Escrever testes | `REFERENCIA_TECNICA.md` → Seção "Testing Setup" |
| Entender CSS | `REFERENCIA_TECNICA.md` → Seção "CSS & Styling" |
| Fazer query/mutation | `GUIA_RAPIDO.md` → Seção "Fetch com Error Handling" |

---

## 🗂️ Estrutura de Informação

```
📑 INDICE (este arquivo)
│
├── 📖 CONTEXTO_PROJETO.md
│   ├── Visão geral
│   ├── Stack tecnológico
│   ├── Estrutura de pastas (detalhada)
│   ├── Rotas e navegação
│   ├── Banco de dados
│   ├── Design system
│   └── Funcionalidades
│
├── ⚡ GUIA_RAPIDO.md
│   ├── Comandos essenciais
│   ├── Arquivos por tarefa
│   ├── Patterns comuns
│   ├── Referência rápida de componentes
│   └── Checklist
│
└── 🔧 REFERENCIA_TECNICA.md
    ├── Stack completo
    ├── Arquitetura detalhada
    ├── Schema SQL
    ├── Supabase integration
    ├── React Query patterns
    ├── TypeScript config
    └── Debugging
```

---

## 💡 Por Onde Começar?

### 🆕 Novo no projeto?
1. Leia `CONTEXTO_PROJETO.md` (tudo)
2. Leia `GUIA_RAPIDO.md` (visão geral)
3. Explore o código com esses documentos como referência

### 👨‍💻 Já conhece o projeto?
1. Use `GUIA_RAPIDO.md` para tarefas comuns
2. Consulte `REFERENCIA_TECNICA.md` quando precisar de aprofundamento

### 🐛 Debugando um problema?
1. Procure na seção relevante de `GUIA_RAPIDO.md`
2. Leia `REFERENCIA_TECNICA.md` → "Debugging Tips"
3. Consulte `CONTEXTO_PROJETO.md` se precisar entender a arquitetura

---

## 🔍 Busca Rápida de Informações

### 🏗️ Arquitetura & Estrutura
- Estrutura de pastas: `CONTEXTO_PROJETO.md` → Seção "Estrutura de Pastas"
- Arquitetura da app: `REFERENCIA_TECNICA.md` → Seção "Arquitetura da Aplicação"

### 📊 Dados & Database
- Schema completo: `CONTEXTO_PROJETO.md` → Seção "Banco de Dados"
- Queries SQL: `REFERENCIA_TECNICA.md` → Seção "Database Schema"
- Como usar Supabase: `GUIA_RAPIDO.md` + `REFERENCIA_TECNICA.md`

### 🚀 Dev Experience
- Comandos: `GUIA_RAPIDO.md` → Seção "Comandos Essenciais"
- Setup env: `GUIA_RAPIDO.md` → Seção "Variáveis de Ambiente"
- Deploy: `REFERENCIA_TECNICA.md` → Seção "CI/CD Readiness"

### 🎨 Frontend & UI
- Componentes disponíveis: `GUIA_RAPIDO.md` → Seção "Componentes Shadcn/ui"
- Design system: `CONTEXTO_PROJETO.md` → Seção "Design System"
- Styling: `REFERENCIA_TECNICA.md` → Seção "CSS & Styling"

### 🔌 Padrões de Código
- Fetch de dados: `GUIA_RAPIDO.md` → Seção "Patterns Comuns"
- Forms: `GUIA_RAPIDO.md` → Seção "Patterns Comuns"
- Notificações: `GUIA_RAPIDO.md` → Seção "Patterns Comuns"
- Routing: `CONTEXTO_PROJETO.md` → Seção "Rotas e Navegação"

### 🧪 Testing & Quality
- Setup de testes: `REFERENCIA_TECNICA.md` → Seção "Testing Setup"
- Linting: `GUIA_RAPIDO.md` → Seção "Comandos Essenciais"

### 🔧 Stack & Tecnologias
- Todas as dependências: `REFERENCIA_TECNICA.md` → Seção "Stack Completo"
- Versões: `package.json` do projeto
- Config Webpack: `vite.config.ts`

---

## 📌 Informações Mais Consultadas

### Variáveis de Ambiente
```
.env.local na raiz com:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
```
Veja: `GUIA_RAPIDO.md` → "Variáveis de Ambiente"

### Rotas da Aplicação
```
Públicas: /, /eventos, /eventos/:id, /sobre
Admin: /admin/login, /admin, /admin/eventos, 
       /admin/inscricoes, /admin/pagamentos
```
Veja: `GUIA_RAPIDO.md` → "Rotas Rápidas"

### Comandos Mais Usados
```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run test         # Testes
npm run lint         # Linting
```
Veja: `GUIA_RAPIDO.md` → "Comandos Essenciais"

---

## 🎓 Recursos Externos Recomendados

- [React Docs](https://react.dev)
- [Tanstack Query](https://tanstack.com/query)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com/docs)
- [Vite](https://vitejs.dev)

Estes links estão também referenciados em `REFERENCIA_TECNICA.md`

---

## ✅ Manutenção da Documentação

**Última atualização:** 20 de fevereiro de 2026

Quando adicionar novas features:
- [ ] Atualizar `CONTEXTO_PROJETO.md` se mudar arquitetura/páginas
- [ ] Atualizar `GUIA_RAPIDO.md` se houver novos patterns
- [ ] Atualizar `REFERENCIA_TECNICA.md` se adicionarem dependências
- [ ] Manter este índice atualizado

---

## 🎯 TL;DR (Muito Longo; Não Li)

| Você quer saber... | Leia isto |
|--------------------|-----------|
| Tudo sobre o projeto | `CONTEXTO_PROJETO.md` |
| Como fazer uma tarefa | `GUIA_RAPIDO.md` |
| Detalhes técnicos | `REFERENCIA_TECNICA.md` |
| Onde está X? | Este índice |

---

**Criado com ❤️ para o projeto Vale Church Manager**  
**20 de fevereiro de 2026**
