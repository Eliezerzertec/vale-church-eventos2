# ✅ CHECKLISTS PRÁTICAS - Vale Church Manager

**Salvando temos:** Use este arquivo para marcar progresso ao trabalhar no projeto.

---

## 🚀 Primeiro Time Setup

### Preparação do Ambiente
```
[ ] Node.js 18+ instalado (npm --version)
[ ] Git instalado e configurado
[ ] VSCode ou editor de escolha
[ ] Extensões recomendadas instaladas:
    [ ] Tailwind CSS IntelliSense
    [ ] ESLint
    [ ] TypeScript Vue Plugin
    [ ] Shadcn/ui Snippets
```

### Clonar e Instalar
```
[ ] Clonar repositório: git clone <url>
[ ] Navegar para pasta: cd vale-church-manager
[ ] Instalar dependências: npm install
[ ] Verificar versão Node: node -v
[ ] Verificar npm: npm -v
```

### Configurar Ambiente
```
[ ] Criar arquivo .env.local na raiz
[ ] Adicionar VITE_SUPABASE_URL
[ ] Adicionar VITE_SUPABASE_PUBLISHABLE_KEY
[ ] Verificar que .env.local está em .gitignore
[ ] NÃO fazer commit de .env.local
```

### Teste Inicial
```
[ ] npm run dev (deve abrir localhost:8080)
[ ] Verificar se compila sem erros
[ ] Clicar em links do menu
[ ] Testar responsividade (F12 → mobile)
[ ] Fechar terminal ctrl+c
```

---

## 🎯 Antes de Cada Sessão de Dev

```
[ ] Atualizar código: git pull origin main
[ ] Instalar novos deps (se houver mudança package.json): npm install
[ ] Limpar cache Vite (se errando): rm -rf node_modules/.vite
[ ] npm run dev
[ ] Verificar console do navegador (F12 → Console) para warnings
[ ] Começar a trabalhar!
```

---

## 📄 Ao Adicionar Nova Página

```
[ ] Criar arquivo src/pages/MeuPagePage.tsx
[ ] Importar componentes necessários
[ ] Criar estrutura básica:
    [ ] <div className="min-h-screen">
    [ ] <Navbar />
    [ ] {/* Conteúdo */}
    [ ] <Footer />
    [ ] </div>
[ ] Exportar como default
[ ] Importar em src/App.tsx
[ ] Adicionar rota em <Routes>
[ ] Testar navegação até a página
[ ] Verificar responsividade
[ ] Commit: git add . && git commit -m "feat: add MeuPage"
```

---

## 🧩 Ao Adicionar Novo Componente UI

```
[ ] Verificar se existe em Shadcn/ui: https://ui.shadcn.com
[ ] Se não existe, instalar: npx shadcn-ui add Nome
[ ] Criar arquivo: src/components/MeuComponent.tsx
[ ] Importar componentes raiz (Button, Card, etc)
[ ] Exportar como default ou nomeado
[ ] Usar em uma página para testar
[ ] Ajustar estilos com Tailwind conforme necessário
[ ] Deletar arquivo src/components/ui/Nome se não usar
[ ] Commit: git add . && git commit -m "feat: add MeuComponent"
```

---

## 🔌 Ao Usar Dados do Supabase

```
[ ] Conferir schema: CONTEXTO_PROJETO.md → seção "Banco de Dados"
[ ] Importar cliente: import { supabase } from "@/integrations/supabase/client"
[ ] Usar em useQuery ou useMutation do React Query
[ ] Adicionar error handling:
    [ ] if (error) toast({ title: "Erro ao carregar" })
    [ ] Mostrar mensagem útil ao usuário
[ ] Testar com dados reais no Supabase
[ ] Verificar console para erros de RLS (Row Level Security)
[ ] Commit: git add . && git commit -m "feat: add data fetching para X"
```

---

## 📋 Ao Criar um Formulário

```
[ ] Importar useForm e Form: import { useForm } from "react-hook-form"
[ ] Importar componentes Form do Shadcn
[ ] Definir tipos com Zod (opcional):
    [ ] const FormSchema = z.object({ ... })
[ ] Criar form com useForm
[ ] Adicionar fields com Form.Field
[ ] Adicionar validação
[ ] Conectar a mutação Supabase
[ ] Testar submissão
[ ] Testar validação (campos vazios, formato, etc)
[ ] Teste com dados reais
[ ] Commit: git add . && git commit -m "feat: add form para X"
```

---

## 🔐 Ao Trabalhar com Admin

```
[ ] Verificar rota protegida em /admin
[ ] Entender AdminLayout em src/components/AdminLayout.tsx
[ ] Adicionar nova subrota em src/App.tsx dentro de <Route path="/admin">
[ ] Criar novo página em src/pages/Admin*.tsx
[ ] Testar acesso sem autenticação (deve redirecionar)
[ ] Login em /admin/login
[ ] Verificar se admin pode acessar
[ ] Testar logout (se implementado)
[ ] Commit: git add . && git commit -m "feat: add admin page para X"
```

---

## 🧪 Ao Escrever Testes

```
[ ] Criar arquivo: src/test/MeuComponent.test.ts
[ ] Importar: import { describe, it, expect } from "vitest"
[ ] Estrutura básica:
    [ ] describe("MeuComponent", () => {
    [ ]   it("deve renderizar", () => {
    [ ]     expect(true).toBe(true)
    [ ]   })
    [ ] })
[ ] npm run test para verificar
[ ] npm run test:watch para desenvolvendo
[ ] Cobertura mínima de 70% das funções
[ ] Commit: git add . && git commit -m "test: add tests para X"
```

---

## 🎨 Ao Estilizar com Tailwind

```
[ ] Usar classes Tailwind em vez de CSS customizado
[ ] Responsive: mobile-first → sm: → md: → lg: → xl:
[ ] Exemplo: className="col-1 sm:col-2 md:col-3"
[ ] Cores: usar variáveis CSS: bg-primary, text-foreground, etc
[ ] Spacing: use escala Tailwind (p-4, m-2, gap-3, etc)
[ ] Breakpoints se precisar: tailwind.config.ts
[ ] Não adicionar CSS em index.css (só variáveis globais)
[ ] Testar dark mode (se aplicável)
[ ] Verificar accessibility (contraste, tamanho fonte)
```

---

## 🐛 Troubleshooting Rápido

```
Erro na porta 8080:
[ ] Verificar se outro processo está usando: netstat -ano | findstr :8080
[ ] Trocar porta: npm run dev -- --port 3000

TypeScript error:
[ ] npm install
[ ] Reload VSCode (Ctrl+Shift+P → reload)
[ ] Verificar types em tipos types.ts do Supabase

Build error:
[ ] rm -rf node_modules/.vite
[ ] npm install
[ ] npm run build

Supabase error:
[ ] Verificar .env.local tem vars corretas
[ ] Testar no Dashboard Supabase direto
[ ] Verificar se tabe existe no schema
[ ] Verificar RLS policies

Problema com styles:
[ ] Verificar class name Tailwind está correto
[ ] Limpar cache: rm -rf node_modules/.vite
[ ] Restart dev server
[ ] Verificar tailwind.config.ts tem pasta src/
```

---

## 📝 Antes de Fazer Commit

```
[ ] Código compilado sem warnings (npm run build)
[ ] Lint passou (npm run lint)
[ ] Testes passando (npm run test)
[ ] Testei a feature manualmente
[ ] Removi console.log de debug
[ ] Sem arquivos deletados acidentalmente
[ ] .env.local NÃO foi commitado
[ ] Mensagem commit é clara e em padrão:
    [ ] feat: adiciona nova feature
    [ ] fix: corrige um bug
    [ ] refactor: melhora código existente
    [ ] test: adiciona ou melhora testes
    [ ] docs: atualiza documentação
[ ] git status limpo (nada staged por acaso)
[ ] Pronto para fazer push!
```

---

## 🚀 Antes de Deploy

```
[ ] Todas as features testadas
[ ] Sem console.log em produção
[ ] .env.local com credenciais de PRODUÇÃO
[ ] npm run build sem erros
[ ] npm run preview funciona
[ ] Testado em múltiplos navegadores
[ ] Testado em mobile (iPhone e Android)
[ ] Testado conexão lenta (DevTools → throttling)
[ ] Performance OK (Lighthouse > 80)
[ ] Sem breaking changes em dependências
[ ] Backup do database feito
[ ] Plano de rollback visualizado
[ ] Comunicado para equipe (se necessário)
[ ] Deploy em staging ANTES de produção
[ ] Smoke tests em produção após deploy
[ ] Monitors ativados (se houver)
```

---

## 📊 Daily Standup Checklist

```
Manhã (antes de começar):
[ ] Pull latest code: git pull
[ ] npm install (se houver mudanças)
[ ] npm run dev funciona
[ ] Nenhum erro no console

Meio do dia:
[ ] Qual foi meu progresso?
[ ] Algum bloqueador?
[ ] Preciso de ajuda?

Final do dia:
[ ] Todos commits feitos?
[ ] Código em estado funcional?
[ ] Documentação atualizada?
[ ] Deixei nota para próximo dev (se necessário)?
[ ] git push para não perder código

Semanal (sexta-feira):
[ ] Testes updated?
[ ] Documentação atualizada?
[ ] Code review feito (se houver)?
[ ] Nenhuma build warning?
```

---

## 🎓 Learning Path (Novo Dev)

```
Semana 1:
[ ] Ler INDICE.md
[ ] Ler CONTEXTO_PROJETO.md
[ ] Ler GUIA_RAPIDO.md
[ ] Setup ambiente completo
[ ] Explorar código base
[ ] Rodar npm run dev e testar
[ ] Entender estrutura de pastas

Semana 2:
[ ] Fazer pequena feature (1-2 páginas)
[ ] Aprender React hooks (useState, useEffect, etc)
[ ] Aprender Tailwind CSS
[ ] Aprender React Router (navegação)

Semana 3:
[ ] Integrar com Supabase
[ ] Aprender React Query
[ ] Fazer form com validação
[ ] Aprender testes básicos

Semana 4+:
[ ] Features mais complexas
[ ] Mentoring outros devs
[ ] Documentar padrões descobertos
[ ] Otimizações de performance
```

---

## 📦 Git Workflow Checklist

```
Criar feature:
[ ] git checkout -b feature/nome-descritivo
[ ] Desenvolveu no branch
[ ] Testou tudo

Fazer commit:
[ ] git status (verificar o que mudou)
[ ] git add . (ou arquivos específicos)
[ ] git commit -m "tipo: descrição"
[ ] Verificou se commit foi feito: git log

Push para remoto:
[ ] git push origin feature/nome-descritivo
[ ] Verificar no GitHub/GitLab

Pull Request:
[ ] Criou PR no GitHub
[ ] Adicionou descrição clara
[ ] Linked a issue (se houver)
[ ] Esperou review
[ ] Respondeu comentários
[ ] Squashear commits (se pedido)

Merge:
[ ] Verificou conflitos
[ ] Resolveu conflitos (se houver)
[ ] PR aprovado
[ ] Merged para main
[ ] Deletou branch: git branch -d feature/nome

Atualizar local:
[ ] git checkout main
[ ] git pull origin main
[ ] Trabalhar na próxima feature
```

---

## 🎯 DOD (Definition of Done)

Uma tarefa só é considerada COMPLETA quando:

```
Code:
[ ] Feature implementada
[ ] Código revisado (auto-review)
[ ] Sem console.log
[ ] Sem code smell

Testing:
[ ] Manual testing completo
[ ] Casos edge cases testados
[ ] Unit tests (se aplicável)
[ ] Performance aceitável

Quality:
[ ] Lint passou (npm run lint)
[ ] Build passou (npm run build)
[ ] TypeScript sem erros
[ ] Sem warnings

Documentation:
[ ] Código comentado (se complexo)
[ ] Atualizada CONTEXTO_PROJETO.md (se necessário)
[ ] Atualizada GUIA_RAPIDO.md (se necessário)

Git:
[ ] Commit com mensagem clara
[ ] Branch feito push
[ ] PR criado com descrição
[ ] Code review completo
[ ] Merged para main

UI/UX (se aplicável):
[ ] Testado em mobile
[ ] Testado em desktop
[ ] Testado em dark mode
[ ] Acessibilidade OK
[ ] Responsivo em todos breakpoints
```

---

## 🏁 Conclusão

Use estes checklists para manter organização e qualidade do código. Adapte conforme necessário para seu workflow específico.

**Happy coding! 🚀**

---

**Criado em:** 20 de fevereiro de 2026  
**Última atualização:** 20 de fevereiro de 2026
