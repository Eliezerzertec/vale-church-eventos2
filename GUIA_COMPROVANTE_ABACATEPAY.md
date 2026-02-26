# 🎯 Corrigir Erro 400 e Adicionar Comprovante do AbacatePay

## ✅ O que foi feito (no código)

1. ✅ Backend (`server.js`): Adiciona `receipt_url` baseando na resposta do AbacatePay
2. ✅ EventDetailPage: Captura e armazena `receipt_url` no banco
3. ✅ PaymentReceipt: Novo botão verde "Ver Comprovante AbacatePay" que abre a URL

## 🔧 O que você precisa fazer no Supabase

Acesse: https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql

Execute **3 queries** (uma por uma):

---

### Query 1️⃣: Adicionar coluna `billing_id`
```sql
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS billing_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';
```

---

### Query 2️⃣: Adicionar coluna `receipt_url`
```sql
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;
```

---

### Query 3️⃣: Corrigir RLS Policies
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

## ✨ Resultado Esperado

Após executar as 3 queries:
1. Frontend exibe um botão verde **"Ver Comprovante AbacatePay"** 
2. Clica no botão → Abre a URL do comprovante em nova aba
3. Link é: `https://app.abacatepay.com/receipt/{transaction_id}`

---

## 🚀 Próximo Passo

1. Execute as 3 queries acima no Supabase
2. Volta ao VS Code e faz `npm run dev`
3. Testa novo pagamento
4. Após confirmação, verás botão verde para abrir comprovante 🎉

---

## 📝 O que mudou no código

**server.js:**
```javascript
// receipt_url agora é construído automaticamente
receipt_url: responseData?.id ? `https://app.abacatepay.com/receipt/${responseData.id}` : null
```

**PaymentReceipt.tsx:**
- Novo prop: `receiptUrl?: string`
- Novo botão que abre a URL em nova aba

**EventDetailPage.tsx:**
- Query agora busca `receipt_url`
- Passa `receiptUrl` para o componente
