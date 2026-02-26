# 🎉 Vale Church Manager - Sistema de Eventos e Pagamentos

Sistema de gerenciamento de eventos e pagamentos via AbacatePay (PIX). Frontend em React + Vite, Backend em Node.js Express.

## 🚀 Quick Start

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar .env
```env
VITE_SUPABASE_URL=https://seu-project.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key
VITE_ABACATEPAY_KEY=abc_dev_... 
ABACATEPAY_WEBHOOK_SECRET=qwe123123
PORT=3001
```

### 3. Iniciar

**Backend:**
```bash
node server.js
```

**Frontend (opcional):**
```bash
npm run dev
```

## 📱 Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status do backend |
| POST | `/api/payment/create` | Criar cobrança |
| GET | `/api/payment/:id` | Consultar pagamento |
| GET | `/api/coupons/list` | Listar cupons |
| GET | `/api/coupon/validate/:code` | Validar cupom |
| POST | `/api/webhook/abacatepay` | Webhook do AbacatePay |

## 🔐 Webhook

### Configurar no AbacatePay
1. Dashboard → Configurações → Webhooks
2. URL: `https://dominio.com/api/webhook/abacatepay`
3. Secret: `qwe123123`
4. Evento: `billing.paid`

### Desenvolvimento (ngrok)
```bash
ngrok http 3001
# Configure ngrok URL no AbacatePay
```

## 🗄️ Banco de Dados

Tabelas necessárias em Supabase:
- `events`
- `event_registrations` 
- `payments`
- `webhook_processing` (idempotência)

## 🔧 Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind, ShadCN
- **Backend**: Node.js, Express, Supabase SDK
- **Pagamento**: AbacatePay API

## 📦 Deploy

```bash
npm install -g vercel
vercel
```

## 🆘 Support

Verifique:
1. Backend logs: `node server.js`
2. Browser console
3. Supabase Dashboard
4. AbacatePay Dashboard

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project is ready to be deployed to Vercel, AWS, Azure, or any Node.js hosting platform.

**For Vercel:**
```bash
vercel --prod
```

**For other platforms:**
1. Set environment variables (see .env.example)
2. Run `npm run build`
3. Deploy the built files
