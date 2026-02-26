# Backend de Pagamentos AbacatePay - Guia de Setup

## 📌 Problema Resolvido
A AbacatePay bloqueia CORS para requisições diretas do navegador. A solução é usar um backend Node.js simples que processa os pagamentos **sem CORS bloqueado**.

## 🚀 Como Usar

### 1. Instalar Dependências (uma única vez)

```bash
npm install
```

Isto instala:
- `express` - servidor web
- `cors` - suporte CORS
- `node-fetch` - fazer requisições HTTP
- `concurrently` - rodar múltiplos processos

### 2. Rodando em Desenvolvimento (Duas Opções)

#### Opção A: Terminal Único - Roda Front + Backend simultaneamente
```bash
npm run dev:all
```
- Backend roda em `http://localhost:3001`
- Front roda em `http://localhost:8080` (ou outra porta)
- Ambos iniciam automaticamente

#### Opção B: Terminais Separados - Mais Controle
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Front (em outro terminal)
npm run dev
```

### 3. Como Funciona

```
[Navegador:8080]
    ↓ POST /api/payment/create
[Backend:3001] (sem CORS bloqueado)
    ↓ Authorization: Bearer abc_dev_...
[AbacatePay API]
    ↓ Resposta JSON
[Backend]
    ↓ { error: null, data: { id, url, ... } }
[Navegador] Recebe link de pagamento
```

### 4. Testando

1. Abra a página de inscrição em um evento pago
2. Preenca o formulário
3. Clique em "Inscrever-se e Pagar"
4. Você verá os logs no backend mostrando a requisição à AbacatePay
5. Se sucesso: será redirecionado para o checkout AbacatePay

### 5. Se Algo Não Funcionar

**Backend não inicia?**
```
Error: listen EADDRINUSE :::3001
```
→ Porta 3001 já está em uso. Mude a porta em `server.js` (line 7)

**CORS error in browser?**
→ Certifique-se que o backend está rodando (`npm run dev:backend`)

**"Failed to fetch" no console?**
→ Verifique se `VITE_ABACATEPAY_KEY` está correto no `.env`

## 🔐 Segurança

- A chave `VITE_ABACATEPAY_KEY` fica no servidor (não é exposta ao navegador)
- O front comunica apenas com o backend local
- Em produção, recomenda-se usar a mesma abordagem com HTTPS

## 📦 Para Produção (Servidor Hospedado)

Quando o site estiver em um servidor com domínio próprio (ex: eventos.churchlavras.com):

1. **Opção 1: Backend permanece**
   - Deploy do `server.js` em produção
   - Front faz POST para `https://seu-dominio.com/api/payment/create`

2. **Opção 2: Proxy Supabase** (mais avançado)
   - Deploy da função `supabase/functions/abacatepay-proxy`
   - Front faz POST para `https://seu-supabase.supabase.co/functions/v1/abacatepay-proxy`

## 📚 Documentação dos Endpoints

### POST /api/payment/create
Cria uma cobrança no AbacatePay

**Body:**
```json
{
  "method": "POST",
  "endpoint": "/billing/create",
  "body": {
    "frequency": "ONE_TIME",
    "methods": ["PIX", "CARD"],
    "products": [
      {
        "externalId": "evento-123",
        "name": "Evento Teste",
        "quantity": 1,
        "price": 10000
      }
    ],
    "returnUrl": "https://seu-site.com/eventos/123",
    "completionUrl": "https://seu-site.com/eventos/123?pagamento=ok",
    "customer": {
      "metadata": {
        "name": "João Silva",
        "email": "joao@example.com"
      }
    }
  }
}
```

**Response (sucesso):**
```json
{
  "error": null,
  "data": {
    "id": "billing-id-123",
    "url": "https://checkout.abacatepay.com/...",
    "amount": 10000,
    "status": "PENDING"
  }
}
```

**Response (erro):**
```json
{
  "error": "Chave API inválida",
  "data": null
}
```

### GET /api/payment/:billingId
Consulta status de um pagamento

**Response:**
```json
{
  "error": null,
  "data": {
    "id": "billing-id-123",
    "status": "PAID",
    "amount": 10000,
    "paidAt": "2026-02-23T17:45:00Z"
  }
}
```

---

**📞 Dúvidas?** Verifique os logs no terminal do backend com `npm run dev:backend`

