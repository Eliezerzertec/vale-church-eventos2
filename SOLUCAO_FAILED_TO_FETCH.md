# 🔗 Solução: Erro "Failed to fetch"

## ❌ O Problema

```
Erro: Failed to fetch
```

### Causas Possíveis:
1. ❌ **CORS Bloqueado** - Navegador está bloqueando requisição cross-origin
2. ❌ **Servidor AbacatePay offline** - API não respondendo
3. ❌ **Rede instável** - Sem conexão internet
4. ❌ **URL incorreta** - Endpoint não existe
5. ❌ **Firewall/Proxy** - Empresa bloqueando requests

---

## ✅ Solução Implementada: PROXY via Supabase

Como "Failed to fetch" é geralmente CORS, implementei um proxy que:

### 1. **Frontend → Supabase (CORS OK)**
```
POST /functions/v1/abacatepay-proxy
  ↓ (requisição ao seu próprio servidor Supabase)
```

### 2. **Supabase → AbacatePay (Backend)**
```
POST https://api.abacatepay.com/v1/billing/create
  ↓ (requisição servidor-a-servidor, sem CORS)
```

### 3. **AbacatePay → Supabase → Frontend**
```
Resposta retorna ao frontend sem CORS
```

---

## 🔧 Como Funciona

### arquivo: `supabase/functions/abacatepay-proxy/index.ts`

```typescript
// Frontend envia:
{
  "method": "POST",
  "endpoint": "/billing/create",
  "body": { amount: 5000, ... },
  "apiKey": "abc_dev_..."
}

// Proxy recebe, chama AbacatePay
fetch("https://api.abacatepay.com/v1/billing/create", {
  method: "POST",
  headers: {
    "X-API-Key": apiKey
  },
  body: JSON.stringify(body)
})

// Retorna resposta ao frontend
```

---

## 📋 Checklist para Deploy

### 1. Supabase Functions Ativadas?
- [ ] Ir em Supabase → Functions
- [ ] Verificar se `abacatepay-proxy` está listada

### 2. Se Proxy Não Aparecer:
Execute no terminal:
```bash
supabase functions deploy abacatepay-proxy
```

### 3. Verificar se Proxy Funciona:
No DevTools Console, teste:
```javascript
const apiKey = "abc_dev_wsc2xLB4mS4cjj2LX3DUryzY";
const supabaseUrl = "https://cwzmiznlvhhnpjgxgsme.supabase.co";

fetch(`${supabaseUrl}/functions/v1/abacatepay-proxy`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    method: "POST",
    endpoint: "/billing/create",
    apiKey,
    body: {
      amount: 5000,
      description: "Teste Proxy",
      methods: ["PIX", "CARD"],
      customer: { id: "teste@example.com" }
    }
  })
})
.then(r => r.json())
.then(d => console.log("Proxy Response:", d));
```

---

## 📊 Erro ainda Persiste?

### Se der "Failed to fetch" no proxy:
```javascript
console.log(PROXY_URL); // Ver se URL está correta
```

### Causas adicionais:
1. **VITE_SUPABASE_URL não configurada** → Verificar `.env`
2. **Função proxy não deployed** → `supabase functions deploy`
3. **Proxy tem erro** → Verificar logs no Supabase

---

## 🚀 Próximos Passos

1. **Deploy proxy:**
   ```bash
   supabase functions deploy abacatepay-proxy
   ```

2. **Testar inscrição novamente:**
   - Preencher formulário
   - Clicar "Inscrever-se e Pagar"
   - Verificar Console (F12) para logs

3. **Se erro persistir:**
   - Copiar log completo do console
   - Compartilhar comigo para debug

---

## 📝 Fluxo Atual

```
Usuário → [Inscrição Formulário]
  ↓
Frontend → POST proxy (CORS OK)
  ↓
Supabase Function abacatepay-proxy
  ↓
POST https://api.abacatepay.com (sem CORS)
  ↓
AbacatePay API
  ↓
Response → Frontend → Usuário
```

---

## 🎯 Status

- ✅ Proxy implementado em Supabase
- ✅ Cliente atualizado para usar proxy
- ⏳ Aguardando deploy da function
- ⏳ Teste do fluxo completo

**Próximo: Deploy e teste!**
