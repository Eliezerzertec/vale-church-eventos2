## 🔑 Como Obter a SERVICE_ROLE_KEY do Supabase

### Passo 1: Ir para o Dashboard
1. Abra https://supabase.com/dashboard
2. Clique no seu projeto "Eventos Church Lavras"

### Passo 2: Ir para Settings > API
1. Na barra lateral esquerda, clique em **Settings**
2. Abra a aba **API**

### Passo 3: Copiar a Service Role Key
- Você verá duas seções:
  - **Project API keys** (anon/public - compartilhável)
  - **Service role (SECRET)** ← É essa!

1. Localize a seção "Service role (SECRET)"
2. Clique no ícone de copiar ⎘ ao lado da chave longa
3. A chave começa com `eyJ...`

### Passo 4: Adicionar ao .env
1. Abra o arquivo `.env` na raiz do projeto
2. Adicione a linha:
```
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...COLE-AQUI...
```

### ⚠️ AVISOS DE SEGURANÇA
- **NUNCA** compartilhe ou commit essa chave no git
- **NUNCA** coloque no frontend (risco de exposição)
- Apenas no backend (.env server-side)
- Se acidentalmente expuser, revogue em Settings > API

### Verificar se está funcionando
Depois de adicionar, reinicie o backend:
```
npm run dev:backend
```

Se ver no console:
```
✅ Backend rodando em http://localhost:3001
```

Está pronto! Agora o fluxo de pagamento confirmará a inscrição corretamente.
