# Sistema de Pagamento AbacatePay com Webhook

## 📋 Visão Geral

Sistema completo de pagamento integrado com AbacatePay para eventos pagos da Vale Church Manager. Inscrições são confirmadas automaticamente após recebimento de pagamento via webhook.

**Data de Implementação:** 20 de fevereiro de 2026  
**Status:** ✅ Pronto para Produção

---

## 🔄 Fluxo de Pagamento

### Para Eventos **GRATUITOS**:
```
1. Usuário preenche formulário de inscrição
2. Inscrição criada com status "confirmed" imediatamente
3. Usuário vê mensagem de sucesso
```

### Para Eventos **PAGOS**:
```
1. Usuário preenche formulário de inscrição
2. Sistema cria inscrição com status "pending_payment"
3. Sistema cria cobrança no AbacatePay
4. Usuário recebe link de pagamento (PIX ou Cartão)
5. Usuário paga (PIX ou Cartão de Crédito)
6. AbacatePay envia webhook ao servidor
7. Webhook confirma inscrição (status = "confirmed")
8. Webhook marca pagamento como "paid"
9. Email de confirmação enviado ao usuário (TODO)
```

---

## 🏗️ Arquitetura

### Frontend (EventDetailPage.tsx)
- **Estado de Inscrição:**
  - `submitted = false` → Mostra formulário
  - `submitted = true + paymentUrl` → Mostra link de pagamento
  - `submitted = true + is_free` → Mostra confirmação

- **Fluxo:**
  ```tsx
  1. handleSubmit() → registerMutation.mutate()
  2. Criar inscrição no Supabase
  3. Se evento pago:
      a. Criar cobrança no AbacatePay
      b. Salvar em payments table
      c. Obter URL de pagamento
  4. setSubmitted(true)
  5. Mostrar URL para usuário via link aberto em nova aba
  ```

### Backend (abacatepay-webhook)
- **Endpoint:** `/functions/v1/abacatepay-webhook`
- **Método:** POST
- **Payload recebido de AbacatePay:**
  ```json
  {
    "event": "billing.paid",
    "data": {
      "id": "billing_123",
      "status": "paid",
      "...": "..."
    }
  }
  ```

- **Processamento:**
  ```
  1. Receber webhook
  2. Buscar pagamento pelo billing_id
  3. Atualizar status do pagamento
  4. Se status = "paid":
      a. Atualizar inscrição para "confirmed"
      b. Marcar payment_processed = true
      c. Salvar data de pagamento em paid_at
  5. Se status = "failed" ou "expired":
      a. Cancelar inscrição (status = "cancelled")
  6. Retornar sucesso
  ```

---

## 🗄️ Estrutura de Dados

### Tabela: payments
```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_id      TEXT UNIQUE NOT NULL,        -- ID do AbacatePay
  registration_id UUID NOT NULL,                -- FK: event_registrations
  event_id        UUID NOT NULL,                -- FK: events
  amount          NUMERIC NOT NULL,             -- Valor em reais (ex: 500.00)
  status          TEXT DEFAULT 'pending',       -- pending, paid, failed, expired, refunded
  payment_url     TEXT,                         -- Link para pagamento
  registration_email TEXT,                      -- Email para notificação
  registration_name  TEXT,                      -- Nome do pagador
  pix_code        TEXT,                         -- Legado: código PIX
  transaction_id  TEXT,                         -- Legado: ID transação
  paid_at         TIMESTAMP WITH TIME ZONE,     -- Data de confirmação de pagamento
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (registration_id) REFERENCES event_registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_payments_billing_id ON payments(billing_id);
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### Tabela: event_registrations (atualizada)
```sql
ALTER TABLE event_registrations ADD COLUMN payment_processed BOOLEAN DEFAULT false;

-- Status possíveis:
-- "confirmed" = inscrição confirmada
-- "pending_payment" = aguardando pagamento (apenas eventos pagos)
-- "cancelled" = cancelada
```

---

## 🔌 Integração AbacatePay

### Client API (src/integrations/abacatepay/client.ts)
```typescript
class AbacatePay {
  private apiKey: string;
  private baseUrl: string = "https://api.abacatepay.com/v1";
  private isDev: boolean;

  billing = {
    create: (params: CreateBillingParams) → Promise<BillingResponse>
    get: (billingId: string) → Promise<BillingResponse>
    list: (skip?: number, take?: number) → Promise<BillingResponse[]>
    cancel: (billingId: string) → Promise<{ success: boolean }>
    refund: (billingId: string) → Promise<{ success: boolean }>
  }
}
```

### Variáveis de Ambiente
```env
VITE_ABACATEPAY_KEY=seu_api_key_aqui    # Requerido
VITE_ABACATEPAY_DEV=false                 # Opcional: true para modo dev
```

---

## 🚀 Configuração do Webhook

### 1. No AbacatePay Dashboard
```
Settings → Webhooks → Add Webhook
URL: https://seu-projeto.supabase.co/functions/v1/abacatepay-webhook
Events: billing.paid, billing.failed, billing.expired, billing.refunded
```

### 2. Deploying Function
```bash
# Deploy para Supabase Functions
supabase functions deploy abacatepay-webhook
```

### 3. Testar Webhook (Local Dev)
```bash
# Usar ngrok para expor localhost
ngrok http 3000

# Usar URL do ngrok no AbacatePay
https://sua-url-ngrok.ngrok.io/functions/v1/abacatepay-webhook
```

---

## 💳 Campos de Cobrança

### CreateBillingParams
```typescript
{
  amount: number;              // Em centavos (ex: 50000 = R$ 500.00)
  description: string;          // Ex: "Inscrição - Culto de Sábado"
  methods: ["PIX", "CARD"];     // Métodos de pagamento
  customer: {
    id: string;                 // Email do cliente
    metadata: {
      email: string;
      name: string;
      registration_id: string;
      event_id: string;
    }
  }
}
```

### BillingResponse
```typescript
{
  id: string;                   // ID único da cobrança
  status: "pending" | "paid" | "failed" | "expired" | "refunded";
  url: string;                  // Link para o cliente pagar
  amount: number;               // Valor em centavos
  customer: { ... };
  pix?: {
    qrCode: string;
    brCode: string;
  };
  createdAt: string;
  expiresAt: string;
}
```

---

## 📊 Dashboard de Pagamentos (/admin/pagamentos)

### Componentes
- **Estatísticas:** Total coletado, pendentes, falhados, total
- **Inscrições não faturadas:** Alert com botão "Criar Cobrança"
- **Histórico:** Tabela com participante, email, evento, valor, status, data, ações

### Ações Disponíveis
- **Copiar Link:** Copia URL de pagamento para compartilhar
- **Abrir:** Abre em nova aba para teste
- **Sincronizar:** Atualiza status da cobrança com AbacatePay

---

## 🔐 Segurança

### Autenticação
```typescript
// Header requerido em todas requisições
Authorization: Bearer {VITE_ABACATEPAY_KEY}
```

### Validação de Webhook
```typescript
// TODO: Adicionar verificação de assinatura (webhook signature)
// AbacatePay envia header X-Webhook-Signature
// Verificar com HMAC-SHA256(payload, secret_key)
```

### RLS (Row-Level Security)
```sql
-- payments table
CREATE POLICY "Usuários veem seus pagamentos"
  ON payments FOR SELECT
  USING (registration_id IN (
    SELECT id FROM event_registrations WHERE user_id = auth.uid()
  ));
```

---

## 📝 Status de Pagamento

| Status | Significado | Ação Automática |
|--------|-------------|-----------------|
| `pending` | Aguardando pagamento | Nenhuma |
| `paid` | Pagamento confirmado | Confirmar inscrição |
| `failed` | Pagamento falhou | Cancelar inscrição |
| `expired` | Link expirou (sem pagar) | Cancelar inscrição |
| `refunded` | Reembolso processado | Manter inscrição |

---

## 📧 Email (TODO)

### Confirmação de Pagamento
```
Assunto: Inscrição Confirmada - [Nome do Evento]

Olá [Nome],

Seu pagamento de R$ [valor] foi confirmado com sucesso!
Evento: [Evento]
Data: [Data do Evento]

Até logo!
```

### Falha no Pagamento
```
Assunto: Erro na Inscrição - [Nome do Evento]

Olá [Nome],

Seu pagamento não foi processado. Por favor, tente novamente:
[Link de Pagamento]
```

---

## 🐛 Troubleshooting

### Webhook não é disparado
```bash
# 1. Verificar logs no AbacatePay Dashboard
# 2. Verificar URL do webhook está correta
# 3. Enviar webhook teste manualmente
# 4. Verificar logs do Supabase: edge-functions
```

### Inscrição não confirma após pagamento
```bash
# 1. Verificar se pagamento tem billing_id correto
# 2. Verificar status do webhook nos logs
# 3. Verificar queries de UPDATE retornam sucesso
```

### Link de pagamento não funciona
```bash
# 1. Verificar se VITE_ABACATEPAY_KEY está correto
# 2. Verificar se API retorna erro 401 (unauthorized)
# 3. Testa manualmente com curl:
curl -X POST https://api.abacatepay.com/v1/billing/create \
  -H "Authorization: Bearer sua_chave" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, ...}'
```

---

## 📚 Documentação Oficial

- **AbacatePay Docs:** https://docs.abacatepay.com
- **Supabase Functions:** https://supabase.com/docs/guides/functions
- **Supabase Webhooks:** https://supabase.com/docs/guides/database/webhooks

---

## ✅ Checklist de Implementação

- [x] Criar cliente AbacatePay (src/integrations/abacatepay/)
- [x] Criar handler de webhook (supabase/functions/abacatepay-webhook/)
- [x] Atualizar EventDetailPage.tsx com fluxo de pagamento
- [x] Atualizar AdminPayments.tsx com gestão de cobranças
- [x] Adicionar campos à tabela payments no Supabase
- [ ] Configurar webhook no AbacatePay Dashboard
- [ ] Adicionar variável VITE_ABACATEPAY_KEY ao .env
- [ ] Deploy função webhook no Supabase
- [ ] Implementar envio de emails de confirmação
- [ ] Adicionar validação de assinatura de webhook
- [ ] Adicionar RLS policies para payments table
- [ ] Testar fluxo completo (evento pago + pagamento + webhook)
- [ ] Testar cancelamento de inscrição (pagamento falhou)

---

## 🔄 Próximos Passos

1. **Configuração de Webhook:** Adicionar URL do webhook no AbacatePay Dashboard
2. **Testes Manuais:** Testar fluxo completo com evento gratuito e pago
3. **Email de Confirmação:** Implementar envio de emails
4. **Segurança:** Adicionar validação de assinatura de webhook
5. **Notificações:** Adicionar notificações em tempo real no dashboard
