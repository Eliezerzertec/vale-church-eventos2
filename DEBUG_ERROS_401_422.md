# 🐛 Debug: Erros 401 e 422

## ❌ Erro 1: 401 (Unauthorized) - Supabase

```
POST https://cwzmiznlvhhnpjgxgsme.supabase.co/rest/v1/event_registrations?select=id 401 (Unauthorized)
```

### Causa Possível
- RLS ainda está bloqueando (mesmo que scripts rodados)
- Falta de token de autenticação Supabase
- Headers incorretos

### Solução

#### A. Desabilitar RLS (Rápido)
No Supabase SQL Editor, execute:
```sql
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;
```

#### B. Adicionar Token (Correto)
Verificar se o cliente Supabase está com a chave:

```typescript
// src/integrations/supabase/client.ts deve ter:
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
```

Verificar `.env`:
```
VITE_SUPABASE_URL=https://cwzmiznlvhhnpjgxgsme.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3em1pem5sdmhobnBqZ3hnc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5NzcsImV4cCI6MjA4NzA5Mjk3N30.nsXSSPW2yajdEy-iFlDmtIH-AltsNZ3n8BcNkqTJ4F4
```

---

## ❌ Erro 2: 422 (Unprocessable Content) - AbacatePay

```
POST https://api.abacatepay.com/v1/billing/create 422 (Unprocessable Content)
```

### Causa Possível
- Dados enviados em formato incorreto
- Campo obrigatório faltando
- Tipo de dados errado
- Header de autenticação incorreto

### Solução

#### A. Verificar Payload

Abrir DevTools (F12 → Network) e procurar request para `api.abacatepay.com`:

```
Headers:
Authorization: Bearer abc_dev_wsc2xLB4mS4cjj2LX3DUryzY  ❌ Pode estar errado!
Content-Type: application/json

Body:
{
  "amount": 5000,
  "description": "Inscrição - Evento",
  "methods": ["PIX", "CARD"],
  "customer": {...}
}
```

#### B. Verificar Formato de Autorização

AbacatePay pode usar:
- `Authorization: Bearer KEY` 
- `X-API-Key: KEY`
- Query param: `?apiKey=KEY`

**Testar qual é:**

```typescript
// Opção 1: Bearer
Authorization: `Bearer ${this.apiKey}`

// Opção 2: X-API-Key (PROVAVELMENTE ISTO!)
"X-API-Key": this.apiKey

// Opção 3: Query param
const url = `${API_BASE}/${API_VERSION}${endpoint}?apiKey=${this.apiKey}`;
```

---

## ✅ FIXES RÁPIDOS

### FIX 1: RLS Supabase (SQL)
```sql
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
```

### FIX 2: Cliente AbacatePay (TypeScript)

Trocar:
```typescript
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${this.apiKey}`,
},
```

Por:
```typescript
headers: {
  "Content-Type": "application/json",
  "X-API-Key": this.apiKey,  // ← TRY THIS FIRST
},
```

### FIX 3: Validar Variáveis

Adicionar console.log no início do teste:
```javascript
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_PUBLISHABLE_KEY:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
console.log("VITE_ABACATEPAY_KEY:", import.meta.env.VITE_ABACATEPAY_KEY);
```

Se qualquer uma for `undefined`, o problema está no `.env`

---

## 🔍 DIAGNÓSTICO COMPLETO

1. **Abrir DevTools:** F12
2. **Ir em Network tab**
3. **Fazer inscrição**
4. **Procurar requests:**
   - POST para `supabase.co`
   - POST para `abacatepay.com`

5. **Clicar em cada uma:**
   - Ver Headers
   - Ver Body
   - Ver Response
   - Copiar erro exato

---

## 💡 CHECKLIST

- [ ] `.env` tem todas as 4 variáveis?
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` começa com `eyJ`?
- [ ] `VITE_ABACATEPAY_KEY` começa com `abc_dev`?
- [ ] RLS desabilitado no Supabase?
- [ ] Headers corretos no AbacatePay?
- [ ] DevTools Network mostra requests?

---

## 🎯 PRÓXIMO PASSO

**Envie screenshot mostrando:**
1. DevTools F12 → Network
2. Request para AbacatePay
3. Headers da requisição
4. Response (erro exato)
5. Body enviado

Assim posso dar solução exata!
