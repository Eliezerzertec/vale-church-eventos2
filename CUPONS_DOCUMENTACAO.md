# Sistema de Cupons - Documentação Completa

## 📋 Visão Geral

O sistema de cupons foi totalmente integrado com AbacatePay, permitindo criar, gerenciar e aplicar cupons de desconto aos eventos da plataforma Vale Church Manager.

## 🔧 Arquitetura

### Backend (Node.js/Express)

#### Endpoints de Cupom

**1. POST `/api/coupon/create` - Criar novo cupom**
```javascript
// Request
{
  "code": "DESCONTO10",      // Código único do cupom
  "notes": "Desconto para membros",
  "discountKind": "PERCENTAGE",  // PERCENTAGE ou FIXED
  "discount": 10,                // Percentual (10%) ou centavos (1000 = R$ 10)
  "maxRedeems": 100              // -1 para ilimitado
}

// Response
{
  "error": null,
  "data": {
    "id": "coupon_xxx",
    "code": "DESCONTO10",
    "discountKind": "PERCENTAGE",
    "discount": 10,
    "status": "ACTIVE",
    "maxRedeems": 100,
    "redeemsCount": 0,
    "createdAt": "2025-02-19T...",
    "updatedAt": "2025-02-19T..."
  }
}
```

**2. GET `/api/coupons/list` - Listar todos os cupons**
```javascript
// Response
{
  "error": null,
  "data": [
    {
      "id": "coupon_xxx",
      "code": "DESCONTO10",
      "discountKind": "PERCENTAGE",
      "discount": 10,
      "status": "ACTIVE",
      "maxRedeems": 100,
      "redeemsCount": 5,
      "metadata": {},
      "createdAt": "2025-02-19T..."
    },
    ...
  ]
}
```

**3. GET `/api/coupon/validate/:code` - Validar cupom por código**
```javascript
// Response (sucesso)
{
  "error": null,
  "data": {
    "id": "coupon_xxx",
    "discountKind": "PERCENTAGE",
    "discount": 10,
    "status": "ACTIVE",
    "maxRedeems": 100,
    "redeemsCount": 5
  }
}

// Response (erro)
{
  "error": "Cupom inválido ou expirado",
  "data": null
}
```

### Frontend (React)

#### AdminCoupons.tsx
Página completa para gerenciar cupons com:
- ✅ Formulário para criar cupons
- ✅ Lista de cupons com filtros
- ✅ Exibição de status (Ativo/Inativo)
- ✅ Barra de progresso de resgate
- ✅ Validação de erro
- ✅ Auto-refresh a cada 5 segundos

**Recursos:**
- Validação de campos obrigatórios
- Suporte para desconto PERCENTUAL e VALOR FIXO
- Limite de resgates (ilimitado com -1)
- Toast notifications para feedback

#### EventDetailPage.tsx
Integração de cupons na página de inscrição:
- ✅ Campo para inserir código do cupom
- ✅ Validação em tempo real
- ✅ Cálculo automático de desconto
- ✅ Exibição do preço final
- ✅ Suporte para PERCENTAGE e FIXED discounts

**Lógica de Desconto:**
```typescript
// PERCENTAGE: desconto é percentual
discount = preço * (couponDiscount / 100)
finalPrice = preço - discount

// FIXED: desconto é em centavos
discount = couponDiscount / 100  // Converte para reais
finalPrice = preço - discount
```

#### AdminEvents.tsx
Integração de cupons na criação/edição de eventos:
- ✅ Dropdown para selecionar cupom
- ✅ Exibe código + tipo de desconto
- ✅ Salva coupon_id no banco de dados
- ✅ Carrega lista de cupons automaticamente

### Banco de Dados

#### Tabela: events
Nova coluna adicionada:
```sql
ALTER TABLE events ADD COLUMN coupon_id TEXT NULL;
CREATE INDEX idx_events_coupon_id ON events(coupon_id);
```

Permite associar um cupom a cada evento.

## 🔄 Fluxo de Operação

### 1. Criar um Cupom
```
Admin → AdminCoupons → Formulário → POST /api/coupon/create → AbacatePay → Cupom criado
```

### 2. Associar a Evento
```
Admin → AdminEvents → Editar/Criar → Selecionar cupom → Salvar → coupon_id armazenado
```

### 3. Inscrição com Cupom
```
Usuário → EventDetailPage → Inscrição → Inserir código cupom → 
GET /api/coupon/validate/:code → Valida e calcula desconto → 
Mostra preço final → POST /api/payment/create (com couponId)
```

### 4. Resgate do Cupom
```
Pagamento processado → AbacatePay incrementa redeemsCount → 
Status pode mudar para INACTIVE se atingir maxRedeems
```

## 💰 Exemplos de Uso

### Exemplo 1: Cupom de 10% de Desconto
```
Código: DESCONTO10
Tipo: PERCENTAGE
Desconto: 10
Max Resgates: 100

Evento: R$ 100
Com cupom: R$ 100 - (100 * 0.10) = R$ 90
```

### Exemplo 2: Cupom de R$ 50 de Desconto Fixo
```
Código: DESCONTO50
Tipo: FIXED
Desconto: 5000 (centavos)
Max Resgates: -1 (ilimitado)

Evento: R$ 150
Com cupom: R$ 150 - (5000 / 100) = R$ 150 - R$ 50 = R$ 100
```

### Exemplo 3: Cupom Único
```
Código: PRIMEIRACOMPRA
Tipo: PERCENTAGE
Desconto: 20
Max Resgates: 1

Primeira pessoa que usar ganha 20% de desconto.
Próximas pessoas recebem erro "Cupom expirado"
```

## 🛠️ Implementação Técnica

### Validação de Desconto FIXED
Atenção: Valores FIXED vêm da AbacatePay em centavos.

```typescript
// EventDetailPage.tsx
calculateDiscountAmount = () => {
  if (!couponData) return 0;
  
  if (couponData.discountKind === 'PERCENTAGE') {
    return originalPrice * (couponData.discount / 100);
  } else {
    // FIXED: converter centavos para reais
    return couponData.discount / 100;
  }
}
```

### Integração no Frontend

```typescript
// Validar cupom
const handleValidateCoupon = async (code: string) => {
  const response = await fetch(`/api/coupon/validate/${code}`);
  const data = await response.json();
  
  if (data.error) {
    toast({ title: "Cupom inválido", variant: "destructive" });
    return;
  }
  
  setCouponData(data.data);
  const finalPrice = calculateFinalPrice();
  // Usar finalPrice no pagamento
}
```

### Integração no Pagamento

```typescript
// POST /api/payment/create
const billingParams = {
  customer: { taxId: cpf.replace(/\D/g, '') },
  discount: selectedDiscount,
  amount: finalAmount * 100,
  ...(couponId && { couponId }) // Adiciona coupon se válido
}
```

## 📊 Status de Implementação

✅ **Concluído:**
- Backend endpoints (create, list, validate)
- AdminCoupons page (create, list, manage)
- EventDetailPage integration (validate, calculate)
- AdminEvents integration (select, save)
- Database migration (coupon_id column)
- Validation PERCENTAGE + FIXED
- Toast notifications
- Auto-refresh de cupons

⏳ **Futuro (Opcional):**
- Delete/Inativar cupons (via AbacatePay dashboard)
- Cupoms por categoria de evento
- Limite de eventos que podem usar cupom
- Histórico de cupons utilizados
- Relatório de ROI por cupom

## 🔐 Segurança

1. **Chave de API**: ABACATEPAY_KEY armazenada em .env
2. **HTTPS**: Todas as requisições para AbacatePay usam HTTPS
3. **Validação**:
   - Backend valida código do cupom
   - Frontend mostra apenas cupons ATIVOS
   - Resgate automático controlado por AbacatePay
4. **Rate Limiting**: Não implementado (considerar para produção)

## 🧪 Testando

### Criar Cupom
```bash
curl -X POST http://localhost:3001/api/coupon/create \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TESTE123",
    "notes": "Cupom de teste",
    "discountKind": "PERCENTAGE",
    "discount": 15,
    "maxRedeems": 10
  }'
```

### Listar Cupons
```bash
curl http://localhost:3001/api/coupons/list
```

### Validar Cupom
```bash
curl http://localhost:3001/api/coupon/validate/TESTE123
```

## 📱 Interface

### Menu Admin
O menu lateral contém novo item:
```
OPERACIONAL
├── Pagamentos
├── Cupons ← NOVO
└── Relatórios
```

## 🔗 Links Relacionados

- [AbacatePay Coupon API](https://docs.abacatepay.com/pages/coupon/reference)
- [AdminCoupons.tsx](src/pages/AdminCoupons.tsx)
- [AdminEvents.tsx](src/pages/AdminEvents.tsx)
- [EventDetailPage.tsx](src/pages/EventDetailPage.tsx)
- [server.js - Endpoints](server.js#L420)

---

**Última atualização:** 19/02/2025
**Versão:** 1.0.0
