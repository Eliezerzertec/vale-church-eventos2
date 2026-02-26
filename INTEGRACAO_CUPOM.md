# 🎫 Integração de Cupom - Documentação Técnica

## ✅ O que foi implementado

### 1. Frontend (Formulário)
- ✅ Campo "Cupom de Desconto" no formulário de inscrição
- ✅ Cupom é opcional (pode deixar em branco)
- ✅ Cupom é convertido para MAIÚSCULAS antes de enviar

### 2. Backend
- ✅ Cupom é passado à API AbacatePay via `couponId`
- ✅ AbacatePay processa o cupom e retorna o desconto aplicado
- ✅ Backend retorna `receipt_url` automaticamente

### 3. Database (Supabase)
- ✅ Nova coluna: `coupon_code` (armazena cupom usado)
- ✅ Nova coluna: `discount_amount` (armazena valor do desconto em R$)

### 4. Comprovante
- ✅ Exibe cupom usado (se houver)
- ✅ Mostra valor original, desconto e valor final
- ✅ Exibe botão verde para ver comprovante completo no AbacatePay

---

## 🔧 Próximos Passos - Executar no Supabase

Acesse: https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql

Execute **4 queries** (uma por uma, em NOVA QUERY a cada uma):

---

### Query 1️⃣: Adicionar Colunas (billing_id, payment_method)
```sql
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
```

---

### Query 2️⃣: Adicionar Coluna (receipt_url)
```sql
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;
```

---

### Query 3️⃣: Adicionar Colunas (coupon_code, discount_amount)
```sql
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2);
```

---

### Query 4️⃣: Corrigir RLS Policies
```sql
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated or service can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can view payment by registration" ON public.payments;
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;

CREATE POLICY "Anyone can view payment by registration" ON public.payments FOR SELECT USING (true);
CREATE POLICY "System can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
```

---

## 🧪 Testar

### 1. Reiniciar Frontend
```bash
npm run dev
```

### 2. Acesse o site
```
http://192.168.2.104:8081/eventos
```

### 3. Testar com Cupom
- Selecione um evento pago
- Preencha o formulário
- **Digite um código de cupom** (se tiver um válido registrado no AbacatePay)
- Clique "Inscrever-se e Pagar"
- Complete o pagamento
- Veja o comprovante com cupom e desconto aplicado ✨

### 4. Testar sem Cupom
- Deixe o campo de cupom vazio
- Comprovante exibe apenas o valor normal (sem desconto)

---

## 📊 Fluxo Técnico

```
Usuario preenche formulário
    ↓
[Novo] Digita código do cupom (opcional)
    ↓
Frontend envia ao backend:
  - nome, email, cpf, ...
  - **couponId** (novo)
    ↓
Backend passa ao AbacatePay:
  - products: [...]
  - **couponId** (novo)
    ↓
AbacatePay processa:
  - Valida cupom
  - Calcula desconto
  - Retorna billing com dados atualizados
    ↓
Backend retorna:
  - billing.id (transaction_id)
  - receipt_url (novo)
    ↓
Frontend armazena no banco:
  - amount: valor FINAL (já com desconto aplicado)
  - **coupon_code** (novo)
  - **discount_amount** (novo) - NOTA: AbacatePay retorna em "fee", precisamos calcular
  - receipt_url (novo)
    ↓
Usuário completa pagamento
    ↓
PaymentReceipt exibe:
  ✅ Valor original (amount + discount_amount)
  ✅ Cupom aplicado
  ✅ Desconto (-R$ XXX.XX)
  ✅ Valor final (amount)
  ✅ Botão "Ver Comprovante AbacatePay"
```

---

## ⚠️ Nota Importante

**O `discount_amount` será preenchido quando:**
1. Usuário paga e volta com `?pagamento=ok`
2. Frontend consulta status no banco
3. AbacatePay retorna os detalhes do pagamento com taxas/descontos

**Até lá, `discount_amount` pode estar `NULL` ou `0`**

Para obter informações de desconto automática, será necessário:
1. Usar webhooks para receber notificações do AbacatePay
2. Ou fazer uma query ao endpoint `GET /billing/{id}` para buscar detalhes completos

---

## 📝 Código-chave

### EventDetailPage.tsx
```typescript
// Adiciona cupomId se fornecido
if (form.coupon?.trim()) {
  billingParams.couponId = form.coupon.trim().toUpperCase();
}

// Armazena no banco
coupon_code: form.coupon?.trim().toUpperCase() || null,
```

### PaymentReceipt.tsx
```typescript
// Exibe desconto se houver
{couponCode && discountAmount && discountAmount > 0 ? (
  <div>Cupom: {couponCode} | Desconto: -R$ {discountAmount.toFixed(2)}</div>
)}
```

---

## 🎯 Próximas Melhorias (Futuro)

1. **Validar cupom antes de pagar**
   - Endpoint para verificar se cupom é válido (sem criar billing)
   - Mostrar desconto em tempo real no formulário

2. **Webhook de desconto**
   - Receber confirmação de cupom aplicado
   - Atualizar `discount_amount` automaticamente

3. **Painel Admin**
   - Crear cupons
   - Consultar uso de cupons
   - Estatísticas de descontos

---

## 📞 Suporte

Se precisar de ajuda:
1. Consulte [ANALISE_API_ABACATEPAY.md](ANALISE_API_ABACATEPAY.md)
2. Veja documentação oficial: https://docs.abacatepay.com
3. Email: ajuda@abacatepay.com
