# 👤 Perfil do Usuário Admin - Feature Documentation

**Data Criação:** 20 de fevereiro de 2026  
**Última Atualização:** 20 de fevereiro de 2026  
**Status:** ✅ Implementado  
**Rota:** `/admin/perfil`

---

## 📋 Resumo

Foi implementada uma página de perfil do usuário para administradores, permitindo:
- Visualizar informações de conta
- Atualizar nome completo
- **✨ Upload e gerenciamento de avatar**
- Alterar senha
- Ver informações de segurança e datas importantes

---

## 📂 Arquivos Criados/Modificados

### ✨ Novo
- **`src/pages/AdminProfile.tsx`** - Página de perfil do usuário admin

### 🔄 Modificados
- **`src/App.tsx`** - Adicionada rota `/admin/perfil`
- **`src/components/AdminLayout.tsx`** - Adicionado botão "Meu Perfil" no menu

---

## 🚀 Como Acessar

1. Fazer login em `/admin/login`
2. No sidebar, clicar em **"Meu Perfil"** (novo botão)
3. Ou acessar diretamente: `http://localhost:8080/admin/perfil`

---

## 🎯 Funcionalidades

### 1. Avatar (NEW! ✨)
```
- Upload de foto de perfil
- Validação de tipo (apenas imagens)
- Validação de tamanho (máx 5MB)
- Preview antes de enviar
- Armazenamento no Supabase Storage
- Exibição no sidebar admin
- Atualizado automaticamente no Supabase Auth
```

### 2. Dados Pessoais
```
- E-mail: Exibido apenas (não editável)
- Nome Completo: Editável, salva no Supabase
```

### 3. Segurança
```
- Nova Senha: Campo para digitar nova senha
- Confirmar Senha: Validação de coincidência
- Mínimo 6 caracteres obrigatório
- Atualização via Supabase Auth
```

### 4. Informações de Conta
```
- ID da Conta (UUID)
- Data de membro desde
- Status (Ativo/Inativo)
```

---

## 💻 Código-Chave

### Buscar dados do usuário
```typescript
const { data: { session } } = await supabase.auth.getSession();
setUser(session.user);
```

### Atualizar nome completo
```typescript
const { error } = await supabase.auth.updateUser({
  data: { full_name: formData.fullName }
});
```

### Atualizar senha
```typescript
const { error } = await supabase.auth.updateUser({
  password: formData.newPassword
});
```

---

## 🎨 Design & UX

- **Layout:** Três cards principais (Dados Pessoais, Segurança, Informações de Conta)
- **Cores:** Usa design system do projeto (primary, foreground, etc)
- **Responsivo:** Funciona em mobile e desktop
- **Feedback:** Notificações toast para sucesso/erro
- **Navegação:** Botão "Voltar" para retornar ao dashboard

---

## 🔐 Segurança Implementada

✅ Verifica se usuário está logado (`/admin/login` se não)  
✅ Validação de senha (mínimo 6 caracteres)  
✅ Validação de confirmação de senha  
✅ Usa Supabase Auth (criptografia nativa)  
✅ Sem armazenamento de senhas em plain text  

---

## 🧪 Testando

```bash
# 1. Iniciar dev server
npm run dev

# 2. Fazer login em http://localhost:8080/admin/login

# 3. Clicar em "Meu Perfil" no sidebar

# 4. Testar:
  [ ] Atualizar nome completo
  [ ] Alterar senha
  [ ] Validações funcionando
  [ ] Toast notifications aparecendo
  [ ] Voltar ao dashboard
```

---

## 🔄 Rotas Relacionadas

| Rota | O que faz |
|------|-----------|
| `/admin/login` | Login de admin |
| `/admin` | Dashboard admin |
| `/admin/perfil` | **Novo - Perfil do usuário** |
| `/admin/eventos` | Gerenciar eventos |
| `/admin/inscricoes` | Gerenciar inscrições |
| `/admin/pagamentos` | Gerenciar pagamentos |

---

## 📦 Dependências Utilizadas

- React (hooks: useState, useEffect)
- React Router (useNavigate, useLocation)
- Supabase Auth
- **Supabase Storage** (para avatars)
- React Hook Form (validações)
- Shadcn/ui (Card, Input, Button)
- Lucide React (ícones: User, Mail, Lock, ArrowLeft, **Upload, Camera**)

---

## 🚀 Próximos Passos Sugeridos

### Feature Completes
- [x] **Avatar do usuário** ✅ (implementado)
- [ ] Upload de avatar com preview
- [ ] Histórico de avatares anteriores
- [ ] Excluir avatar (volta para default)
- [ ] Tema preferido (dark/light mode)
- [ ] Preferências de notificação
- [ ] Two-factor authentication (2FA)
- [ ] Histórico de login
- [ ] Atividades recentes

### Integração
- [ ] Ligar a tabela `user_roles` para exibir função
- [ ] Adicionar última alteração de senha
- [ ] Mostrar dispositivos/locais de login
- [ ] Compressão de imagem automática
- [ ] Avatar inicial com letras (Avatar colorido com initiais)

---

## 📝 Estrutura de Arquivo

```
src/pages/AdminProfile.tsx
├── Importações (React, Supabase, UI Components)
├── Component AdminProfile
│   ├── useEffect (carregar dados do usuário)
│   ├── handleInputChange (atualizar form)
│   ├── handleUpdateProfile (salvar nome)
│   ├── handleUpdatePassword (alterar senha)
│   └── Renderização
│       ├── Header com botão voltar
│       ├── Card: Dados Pessoais
│       ├── Card: Segurança
│       └── Card: Informações de Conta
└── Export default
```

---

## ⚙️ Variáveis de Estado

```typescript
loading       // Carregando dados do usuário
saving        // Salvando alterações
user          // Dados do usuário (Supabase)
formData      // Estado do formulário
  ├─ email           // Email (read-only)
  ├─ fullName        // Nome (editável)
  ├─ currentPassword // (futuro uso)
  ├─ newPassword     // Nova senha
  └─ confirmPassword // Confirmação
```

---

## 🐛 Tratamento de Erros

✅ Usuário não logado → redireciona para `/admin/login`  
✅ Senha muito curta → mostra toast de erro  
✅ Senhas não combinam → mostra toast de erro  
✅ Erro no Supabase → mostra mensagem de erro  
✅ Sucesso na atualização → mostra toast de sucesso  

---

## 📊 Banco de Dados

Dados do usuário vêm de:
- **`auth.users`** (Supabase) - Email, metadata (nome completo)
- Não usa tabela customizada para perfil (usa Supabase Auth nativo)

Possível expandir com:
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY (FK auth.users),
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  theme TEXT,
  updated_at TIMESTAMP
);
```

---

## 📱 Responsividade

- ✅ Mobile (< 640px): Funciona com scroll
- ✅ Tablet (640px - 1024px): 2 colunas
- ✅ Desktop (> 1024px): 3 colunas máximo
- ✅ Dark mode: Suportado via CSS

---

## 🎓 Padrão de Código Seguido

```
✅ React Hooks (useState, useEffect)
✅ Supabase client integration
✅ React Router navigation
✅ Shadcn/ui components
✅ Tailwind CSS styling
✅ TypeScript types
✅ Error handling
✅ Loading states
✅ Toast notifications
```

---

## 🔗 Relacionados

Veja também:
- `GUIA_RAPIDO.md` → "Como criar um formulário"
- `REFERENCIA_TECNICA.md` → "Integração Supabase"
- `CONFIG_CRITICA.md` → "Autenticação e Admin"

---

**Status:** ✅ Completo e Funcional  
**Testado em:** 20 de fevereiro de 2026  
**Build:** ✅ Sem erros (npm run build)
