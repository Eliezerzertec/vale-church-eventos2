# GUIA DE INTEGRAÇÃO - SISTEMA DE CUPONS

## ✅ O QUE FOI IMPLEMENTADO

### Backend (server.js)
- ✅ POST `/api/coupon/create` - Criar cupom
- ✅ GET `/api/coupons/list` - Listar cupons
- ✅ GET `/api/coupon/validate/:code` - Validar cupom
- ✅ DELETE `/api/coupon/:id` - Desativar cupom

### Frontend (React)
- ✅ AdminCoupons.tsx - Gerenciar cupons (criar, listar, deletar)
- ✅ AdminEvents.tsx - Associar cupom a evento
- ✅ EventDetailPage.tsx - Validar e aplicar cupom na inscrição

### Banco de Dados (Supabase)
- ✅ Coluna `coupon_id` na tabela `events`
- ✅ Tabela `coupon_deactivations` (para rastrear cupons desativados)

---

## 🚀 COMO USAR

### 1. CRIAR CUPOM (Admin)

**URL:** `http://localhost:8080/admin/cupons`

**Passos:**
1. Clique em "+ Novo Cupom"
2. Preencha os dados:
   - **Código:** DESCONTO10 (único)
   - **Tipo:** PERCENTAGE (%) ou FIXED (R$)
   - **Desconto:** 
     - Se PERCENTAGE: 10 (significa 10%)
     - Se FIXED: 5000 (significa R$ 50 em centavos)
   - **Limite de Resgates:** 100 (ou -1 para ilimitado)
   - **Descrição:** "Desconto para membros da comunidade"
3. Clique em "Criar Cupom"
4. ✅ Cupom criado com sucesso!

### 2. ASSOCIAR CUPOM A EVENTO (Admin)

**URL:** `http://localhost:8080/admin/eventos`

**Passos:**
1. Clique na aba "Eventos"
2. Clique em "Novo Evento" ou edite um existente
3. Na seção "Cupom de Desconto":
   - Selecione o cupom da lista
   - Se não existir, crie um novo em `/admin/cupons`
4. Salve o evento
5. ✅ Evento vinculado ao cupom!

### 3. USAR CUPOM NA INSCRIÇÃO (Usuário)

**URL:** `http://localhost:8080/eventos/:id`

**Passos:**
1. Acesse página do evento
2. Preencha formulário de inscrição
3. Na seção "Cupom de Desconto":
   - Digite o código: DESCONTO10
   - Clique em "Validar Cupom"
4. Se válido:
   - ✅ Cupom aplicado
   - 💰 Preço final atualizado
   - Cupom criado com sucesso!
5. Clique em "Pagar" para finalizar

---

## 🔗 FLUXO COMPLETO

```
┌─────────────────────────────────────┐
│  ADMIN: Criar Cupom                 │
│  POST /api/coupon/create            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ADMIN: Associar a Evento           │
│  PATCH /events/:id (coupon_id)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  USUÁRIO: Inscrição & Pagamento     │
│  GET /api/coupon/validate/:code     │
│  POST /api/payment/create           │
│  (com couponId no body)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ABACATEPAY: Processa Pagamento     │
│  redeemsCount incrementa            │
│  Status pode virar INACTIVE         │
└─────────────────────────────────────┘
```

---

## 📊 EXEMPLOS DE CUPONS

### Exemplo 1: 10% de Desconto
```
Código: DESCONTO10
Tipo: PERCENTAGE
Desconto: 10
Max Resgates: 100
Descrição: "10% para membros"

Evento: R$ 100
Com cupom: R$ 100 - 10% = R$ 90
```

### Exemplo 2: R$ 50 de Desconto Fixo
```
Código: DESCONTO50
Tipo: FIXED
Desconto: 5000
Max Resgates: -1 (ilimitado)
Descrição: "R$ 50 de desconto"

Evento: R$ 150
Com cupom: R$ 150 - R$ 50 = R$ 100
```

### Exemplo 3: Cupom Único (Primeira Compra)
```
Código: PRIMEIRACOMPRA
Tipo: PERCENTAGE
Desconto: 20
Max Resgates: 1
Descrição: "20% para primeira compra"

Evento: R$ 100
Com cupom: R$ 100 - 20% = R$ 80
(Apenas primeira pessoa consegue usar)
```

---

## 🔌 API DIRETA (Para Testes)

### Criar Cupom via AbacatePay
```bash
curl -X POST "https://api.abacatepay.com/v1/coupon/create" \
  -H "Authorization: Bearer abc_dev_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DESCONTO10",
    "notes": "Desconto para membros",
    "discountKind": "PERCENTAGE",
    "discount": 10,
    "maxRedeems": 100
  }'
```

### Listar Cupons
```bash
curl -X GET "https://api.abacatepay.com/v1/coupon/list" \
  -H "Authorization: Bearer abc_dev_YOUR_KEY"
```

### Validar Cupom (Via API Local)
```bash
curl -X GET "http://localhost:3001/api/coupon/validate/DESCONTO10"
```

---

## 📱 INTERFACE ADMIN

### Página: Admin > Cupons

**Funcionalidades:**
- ✅ Criar novo cupom (formulário)
- ✅ Listar todos os cupons (tabela)
- ✅ Ver status (Ativo/Inativo)
- ✅ Ver uso (barra de progresso)
- ✅ Deletar cupom (marca como inativo)

**Campos Visíveis:**
- Código (azul, destaque)
- Descrição
- Desconto (% ou R$)
- Uso (progresso)
- Status (badge verde/cinza)
- Ações (deletar)

---

## 🔐 SEGURANÇA

✅ Cupons validados no backend
✅ CPF validado antes de pagamento
✅ Descontos calculados server-side
✅ Integração HTTPS com AbacatePay
✅ Autenticação ADMIN obrigatória

---

## 🐛 TROUBLESHOOTING

### "Cupom inválido ou expirado"
- Verifique o código (case-insensitive, sem espaços)
- Verifique se cupom atingiu limite de resgates
- Verifique se cupom está ativo

### "Erro ao criar cupom"
- Verifique chave de API AbacatePay
- Verifique se código já existe
- Tente novo código

### "Conexão recusada"
- Verifique se servidor Node está rodando (porta 3001)
- Verifique se Vite está com proxy `/api` configurado
- Reinicie ambos os servidores

---

## 📞 SUPORTE

**Documentação Completa:** [CUPONS_DOCUMENTACAO.md](CUPONS_DOCUMENTACAO.md)

**Links de Referência:**
- AbacatePay Coupon API: https://docs.abacatepay.com/pages/coupon/reference
- AdminCoupons.tsx: src/pages/AdminCoupons.tsx
- AdminEvents.tsx: src/pages/AdminEvents.tsx
- EventDetailPage.tsx: src/pages/EventDetailPage.tsx

---

**Última atualização:** 28/02/2026
**Status:** ✅ Completo e Funcional
