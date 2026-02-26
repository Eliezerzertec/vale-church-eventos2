/**
 * 🎯 Backend: Sistema de Pagamentos AbacatePay
 * Endpoints: Criar cobrança, consultar, validar cupons, processar webhook
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const ABACATEPAY_KEY = process.env.VITE_ABACATEPAY_KEY;
const WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ABACATEPAY_KEY || !WEBHOOK_SECRET) {
  console.error('❌ Variáveis de ambiente inválidas. Verifique .env.example');
  console.error('   Faltam:', [
    !SUPABASE_URL && 'VITE_SUPABASE_URL',
    !SUPABASE_ANON_KEY && 'VITE_SUPABASE_ANON_KEY',
    !ABACATEPAY_KEY && 'VITE_ABACATEPAY_KEY',
    !WEBHOOK_SECRET && 'ABACATEPAY_WEBHOOK_SECRET'
  ].filter(Boolean).join(', '));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const isProd = ABACATEPAY_KEY.startsWith('abc_prod');

app.use(cors());
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString(encoding);
  }
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: isProd ? '🔴 PRODUÇÃO' : '🟢 DESENVOLVIMENTO',
    timestamp: new Date().toISOString()
  });
});


app.post('/api/payment/create', async (req, res) => {
  const { method = 'POST', endpoint = '/billing/create', body: paymentBody } = req.body;

  if (!paymentBody) {
    return res.status(400).json({ error: 'Body obrigatório', data: null });
  }

  try {
    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const response = await fetch(`${ABACATEPAY_API}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
      body: JSON.stringify(paymentBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMsg = responseData?.error?.message || `HTTP ${response.status}`;
      return res.status(response.status).json({ error: errorMsg, data: null });
    }

    const billingData = responseData?.data || responseData;
    const receiptUrl = billingData?.id ? `https://app.abacatepay.com/receipt/${billingData.id}` : null;

    // Auto-salvar payment
    const registrationId = paymentBody?.registrationId || paymentBody?.customer?.metadata?.registration_id;
    if (billingData?.id && registrationId) {
      await supabase.from('payments').insert({
        registration_id: registrationId,
        billing_id: billingData.id,
        amount: paymentBody?.amount || 0,
        status: 'pending',
        payment_method: 'abacatepay_pix',
      }).catch(() => null);
    }

    res.json({ error: null, data: { ...billingData, receipt_url: receiptUrl } });
  } catch (error) {
    res.status(500).json({ error: error.message, data: null });
  }
});

app.get('/api/payment/:id', async (req, res) => {
  try {
    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const response = await fetch(`${ABACATEPAY_API}/billing/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${ABACATEPAY_KEY}` },
    });
    const responseData = await response.json();
    res.json({
      error: !response.ok ? responseData?.error : null,
      data: response.ok ? (responseData?.data || responseData) : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: null });
  }
});

app.get('/api/coupons/list', async (req, res) => {
  try {
    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const response = await fetch(`${ABACATEPAY_API}/coupon/list`, {
      headers: { 'Authorization': `Bearer ${ABACATEPAY_KEY}` },
    });
    const responseData = await response.json();
    res.json({
      error: !response.ok ? responseData?.error : null,
      data: response.ok ? (responseData?.data || []) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] });
  }
});

app.get('/api/coupon/validate/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const response = await fetch(`${ABACATEPAY_API}/coupon/list`, {
      headers: { 'Authorization': `Bearer ${ABACATEPAY_KEY}` },
    });
    const responseData = await response.json();
    const coupon = response.ok && responseData?.data
      ? responseData?.data.find((c) => c.id.toUpperCase() === code.toUpperCase())
      : null;

    if (!coupon || coupon.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Cupom inválido ou expirado', data: null });
    }

    res.json({
      error: null,
      data: {
        id: coupon.id,
        discountKind: coupon.discountKind,
        discount: coupon.discount,
        status: coupon.status,
        maxRedeems: coupon.maxRedeems,
        redeemsCount: coupon.redeemsCount,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: null });
  }
});


function verifyWebhookSignature(rawBody, signatureFromHeader, secret) {
  try {
    if (!signatureFromHeader) return true;
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signatureFromHeader));
  } catch {
    return false;
  }
}

app.post('/api/webhook/abacatepay', async (req, res) => {
  const rawBody = req.rawBody || '';

  try {
    // Validar secret
    const secretHeader = req.headers['x-webhook-secret'];
    if (secretHeader !== WEBHOOK_SECRET) {
      console.warn('⚠️ Secret inválido');
      return res.status(200).json({ received: true, acknowledged: true, message: 'Invalid secret' });
    }

    // Validar HMAC
    const signatureHeader = req.headers['x-webhook-signature'];
    if (signatureHeader && !verifyWebhookSignature(rawBody, signatureHeader, WEBHOOK_SECRET)) {
      console.warn('⚠️ HMAC signature inválida');
      return res.status(200).json({ received: true, acknowledged: true, message: 'Invalid signature' });
    }

    // Parse JSON
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return res.status(200).json({ received: true, acknowledged: true, error: 'Invalid JSON' });
    }

    const { id: webhookId, event, data, devMode } = body;

    // Ignorar testes em produção
    if (devMode === true && isProd) {
      console.log('🟡 Dev webhook ignorado em produção');
      return res.status(200).json({ received: true, acknowledged: true, message: 'Dev webhook ignored' });
    }

    // Idempotência
    if (webhookId) {
      const { data: existing } = await supabase
        .from('webhook_processing')
        .select('id')
        .eq('id', webhookId)
        .maybeSingle();

      if (existing) {
        return res.status(200).json({ received: true, acknowledged: true, message: 'Already processed' });
      }
    }

    // Validar payload
    if (!data?.billing?.id) {
      return res.status(200).json({ received: true, acknowledged: true, error: 'Invalid payload' });
    }

    const { id: billingId, status } = data.billing;

    // Confirmar inscrição se PAID
    if (status === 'PAID') {
      const { data: payment } = await supabase
        .from('payments')
        .select('id, registration_id')
        .eq('billing_id', billingId)
        .single();

      if (payment?.id) {
        await supabase.from('payments').update({ status: 'confirmed' }).eq('id', payment.id);
        await supabase.from('event_registrations').update({ status: 'confirmed' }).eq('id', payment.registration_id);
        console.log(`✅ Inscrição #${payment.registration_id} confirmada`);
      }
    }

    // Marcar como processado
    if (webhookId) {
      await supabase.from('webhook_processing').insert({
        id: webhookId,
        event: event,
        status: 'processed'
      }).catch(() => null);
    }

    res.status(200).json({ received: true, acknowledged: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(200).json({ received: true, acknowledged: true, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
  console.log(`📌 Modo: ${isProd ? '🔴 PRODUÇÃO' : '🟢 DESENVOLVIMENTO'}`);
});
