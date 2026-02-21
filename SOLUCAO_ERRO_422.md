# 🔧 Solução: Erro 422 AbacatePay

## Problema: POST /billing/create retorna 422

### ✅ Passos para Debug

1. **Abra DevTools (F12)**
2. **Ir em Console**
3. **Tentar fazer inscrição**
4. **Procurar por logs com "📤 AbacatePay Request" e "📥 AbacatePay Response"**
5. **Copiar a resposta de erro**

---

## 🔍 Possíveis Causas

### Causa 1: Header de Autenticação Errado
AbacatePay pode esperar um destes:
```typescript
// ❌ Atual (Bearer)
Authorization: `Bearer ${this.apiKey}`

// ✅ Opção 1: Como Query Parameter
const url = `${API_BASE}/${API_VERSION}${endpoint}?apiKey=${this.apiKey}`;

// ✅ Opção 2: Como Header Custom
"X-API-Key": this.apiKey

// ✅ Opção 3: Como Authorization com "Basic" ou sem prefixo
Authorization: this.apiKey
```

---

### Causa 2: Campos Inválidos no Payload

AbacatePay pode não aceitar:
- Campo `devMode` (pode ser rejeitado)
- Campo `frequency` (se apenas ONE_TIME é aceito)
- Tipos de dados errados

**Payload Atual:**
```javascript
{
  amount: 5000,                    // centavos ✅
  description: "Inscrição - Evento",
  methods: ["PIX", "CARD"],
  customer: {
    id: "email@example.com",
    metadata: {...}
  },
  frequency: "ONE_TIME",           // ❓ Pode causar 422
  nextBilling: undefined,          // ❓ Pode causar 422
  devMode: true                    // ❓ Pode causar 422
}
```

**Payload Simplificado (Teste):**
```javascript
{
  amount: 5000,
  description: "Inscrição - Evento",
  methods: ["PIX", "CARD"],
  customer: {
    id: "email@example.com"
  }
}
```

---

### Causa 3: Endpoint Errado
Verificar se é:
- ❌ POST `/billing/create`
- ✅ POST `/billing` (sem /create)
- ✅ POST `/charges/create`
- ✅ POST `/invoice/create`

---

## 🛠️ Correções Rápidas

### Teste 1: Remover campos opcionais

Edite [client.ts](src/integrations/abacatepay/client.ts) linha 89-97:

```diff
billing.create: async (params: CreateBillingParams): Promise<AbacatePayResponse<BillingResponse>> => {
  return this.request<BillingResponse>("POST", "/billing/create", {
    amount: params.amount,
    description: params.description,
    methods: params.methods || ["PIX", "CARD"],
    customer: params.customer,
-   frequency: params.frequency || "ONE_TIME",
-   nextBilling: params.nextBilling,
-   devMode: this.isDev,
  });
},
```

### Teste 2: Mudar header de autenticação

Edite [client.ts](src/integrations/abacatepay/client.ts) linha 62-68:

```diff
const response = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
-   Authorization: `Bearer ${this.apiKey}`,
+   "X-API-Key": this.apiKey,
  },
  body: body ? JSON.stringify(body) : undefined,
});
```

### Teste 3: Mudar endpoint

Edite [client.ts](src/integrations/abacatepay/client.ts) linha 91:

```diff
- return this.request<BillingResponse>("POST", "/billing/create", {
+ return this.request<BillingResponse>("POST", "/billing", {
```

---

## 📊 Ordem de Teste Recomendada

1. **Primeiramente:** Remover campos `frequency`, `nextBilling`, `devMode`
2. **Se ainda 422:** Mudar header para `X-API-Key`
3. **Se ainda 422:** Testar endpoint `/billing` em vez de `/billing/create`
4. **Se ainda 422:** Copiar resposta exata e enviar ao suporte AbacatePay

---

## 🧪 Para Testar Console Direto

No DevTools Console, execute:

```javascript
const apiKey = "abc_dev_wsc2xLB4mS4cjj2LX3DUryzY";

fetch("https://api.abacatepay.com/v1/billing/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,  // ← Teste com isto
  },
  body: JSON.stringify({
    amount: 5000,
    description: "Teste",
    methods: ["PIX", "CARD"],
    customer: { id: "teste@example.com" }
  })
})
.then(r => r.json())
.then(d => console.log("Response:", d));
```

---

## 🎯 Próximo Passo

Envie o output dos logs do console mostrando:
1. O payload completo sendo enviado
2. A resposta exata do servidor (error, message, etc.)

Assim posso dar uma solução específica!
