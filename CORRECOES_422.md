# 🔧 Correções para Erro 422 do AbacatePay

## ✅ Mudanças Realizadas

### 1. **EventDetailPage.tsx** - Corrigida estrutura do customer
```javascript
// ❌ ANTES (incorreto)
customer: {
  name: form.full_name,
  email: form.email,
  cellphone: form.phone,
  taxId: form.cpf,
  metadata: { registration_id, event_id }
}

// ✅ DEPOIS (correto)
customer: {
  id: form.email,
  metadata: {
    registration_id: regData.id,
    event_id: id
  }
}
```

### 2. **AdminPayments.tsx** - Simplificado para formato mínimo
```javascript
// Novo payload
{
  "frequency": "ONE_TIME",
  "methods": ["PIX", "CARD"],
  "products": [{
    "name": "Inscrição - Event Title",
    "quantity": 1,
    "price": 50000  // centavos
  }],
  "customer": {
    "id": "email@example.com"
  }
}
```

### 3. **server.js** - Adicionados endpoints de teste
- `POST /api/test/billing` - Payload completo
- `POST /api/test/billing-minimal` - Sem externalId
- `POST /api/test/billing-ultra-minimal` - Ultra mínimo

### 4. **Logging Detalhado Adicionado**
- AdminPayments: `console.log("📋 Payload AdminPayments:", ...)`
- server.js: Logs de payload enviado e resposta recebida

## 📋 Problema Identificado

Há **conflito de interfaces**:
- `sdk.ts` expects: `customer: { name, email, cellphone, taxId, metadata }`
- `client.ts` expects: `customer: { id, metadata: { ... } }`

**Solução**: Usando `client.ts` (que é o importado realmente)

## 🧪 Como Testar

### 1. Reinicie o servidor
```powershell
# Mate processos node
Get-Process -Name "node" | Stop-Process -Force

# Aguarde
Start-Sleep -Seconds 2

# Reinicie
npm run dev:backend
```

### 2. Abra DevTools e teste
- Pressione **F12**
- Vá em aba **Network**
- Clique em "Criar Pagamento" no Admin
- Procure pelo POST para `/api/payment/create`
- Verifique:
  - **Request → Payload**: Veja o JSON enviado
  - **Response**: Veja a erro exato do AbacatePay

### 3. Verifique os logs do backend
Procure por:
- `📋 Payload AdminPayments:`
- `📋 Body completo:`
- `📥 Response Status:`

## 🎯 Resultado Esperado

Se funcionar, verá:
```json
{
  "status": 200,
  "data": {
    "id": "bill_...",
    "url": "https://checkout.abacatepay.com/...",
    "status": "PENDING",
    ...
  }
}
```

Se falhar, verá:
```json
{
  "status": 422,
  "error": "Invalid ... " ou similar
}
```

## 💡 Se Continuar 422

Próximas tentativas:
1. Tente adicionar `description` ao product
2. Tente remover `customer.id` completamente
3. Tente estrutura alternativa SEM products array (apenas amount)

## 📊 Summary das Mudanças

| Arquivo | Mudanças |
|---------|----------|
| EventDetailPage.tsx | customer structure corrected |
| AdminPayments.tsx | payload simplified 5 removing fields |
| server.js | test endpoints + debug logging |
