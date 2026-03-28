/**
 * Backend simples para processar pagamentos AbacatePay
 * Usa o SDK oficial: abacatepay-nodejs-sdk
 * Roda em http://localhost:3001
 * 
 * Uso:
 * npm install express cors abacatepay-nodejs-sdk dotenv
 * node server.js
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis do .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cwzmiznlvhhnpjgxgsme.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3em1pem5sdmhobnBqZ3hnc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5NzcsImV4cCI6MjA4NzA5Mjk3N30.nsXSSPW2yajdEy-iFlDmtIH-AltsNZ3n8BcNkqTJ4F4';

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SDK não está funcionando, vamos usar fetch direto (já funciona perfeitamente)
console.log('✅ Backend de pagamentos initializado');
console.log('🔑 Chave API:', process.env.VITE_ABACATEPAY_KEY?.substring(0, 15) + '...');
console.log('📌 Modo:', process.env.VITE_ABACATEPAY_KEY?.startsWith('abc_prod') ? '🔴 PRODUÇÃO' : '🟢 DESENVOLVIMENTO');

// ===== CORS =====
// Origens permitidas: VPS LocalWeb + localhost para dev
const ALLOWED_ORIGINS = [
  'http://vps65539.publiccloud.com.br',
  'https://vps65539.publiccloud.com.br',
  'http://191.252.219.41',
  'https://191.252.219.41',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (Postman, curl, servidor-servidor)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    console.warn(`⚠️ CORS bloqueado para: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret', 'X-Webhook-Signature'],
  credentials: true,
}));

// ✅ MIDDLEWARE: Capturar raw body ANTES de fazer JSON parse
// Necessário para validar HMAC depois
app.use((req, res, next) => {
  let rawBody = Buffer.alloc(0);
  
  req.on('data', (chunk) => {
    rawBody = Buffer.concat([rawBody, chunk]);
  });
  
  req.on('end', () => {
    req.rawBody = rawBody.toString('utf-8');
    next();
  });
});

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  const apiKey = process.env.VITE_ABACATEPAY_KEY || 'não configurada';
  res.json({ 
    status: 'ok', 
    message: 'Backend de pagamentos ativo',
    apiKey: apiKey.substring(0, 15) + '...',
    mode: apiKey.startsWith('abc_prod') ? '🔴 PRODUÇÃO' : '🟢 DESENVOLVIMENTO',
  });
});

/**
 * POST /api/payment/create
 * Body: { method, endpoint, body }
 * Cria cobrança via Fetch direto (sem CORS bloqueado)
 */
app.post('/api/payment/create', async (req, res) => {
  const { method = 'POST', endpoint = '/billing/create', body } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Body obrigatório' });
  }

  try {
    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const ABACATEPAY_KEY = process.env.VITE_ABACATEPAY_KEY;

    console.log(`📤 Criando cobrança...`);
    console.log('🔑 Chave:', ABACATEPAY_KEY?.substring(0, 15) + '...');
    console.log('Dados:', JSON.stringify(body, null, 2).substring(0, 200) + '...');

    const url = `${ABACATEPAY_API}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    console.log(`📥 Resposta [${response.status}]:`, {
      billingId: responseData?.data?.id || responseData?.id,
      status: responseData?.data?.status || responseData?.status,
      devMode: responseData?.data?.devMode || responseData?.devMode,
      url: responseData?.data?.url || responseData?.url || responseData?.payment_link,
    });

    if (!response.ok) {
      const errorMsg = responseData?.error?.message || responseData?.error || responseData?.message || `HTTP ${response.status}`;
      console.error('❌ AbacatePay Error:', errorMsg);
      return res.status(response.status).json({ error: errorMsg, data: null });
    }

    // Normalizar resposta
    const billingData = responseData?.data || responseData;
    const receiptUrl = billingData?.id ? `https://app.abacatepay.com/receipt/${billingData.id}` : null;
    
    console.log(`✅ Cobrança criada com sucesso!`);

    // 🆕 SALVAR payment no banco de dados
    // Extrair registrationId e eventId de diferentes fontes:
    // 1. Diretamente no body (via teste/script)
    // 2. De customer.metadata (via frontend EventDetailPage)
    const registrationId = body?.registrationId || body?.customer?.metadata?.registration_id;
    const eventId = body?.eventId || body?.customer?.metadata?.event_id;
    const amount = body?.amount || (body?.products?.[0]?.price / 100) || 0;

    let savedPayment = null;
    let saveError = null;
    
    if (billingData?.id && registrationId) {
      console.log(`💾 Payment auto-salvando: billing_id=${billingData.id}, registration_id=${registrationId}`);
      
      const result = await supabase
        .from('payments')
        .insert({
          registration_id: registrationId,
          event_id: eventId,
          billing_id: billingData.id,
          amount: amount,
          status: 'pending',
          payment_method: 'abacatepay_pix',
        })
        .select('id');
      
      savedPayment = result.data;
      saveError = result.error;

      if (saveError) {
        console.warn(`⚠️ Erro ao salvar payment (billing_id=%s):`, billingData.id, saveError.message);
      } else {
        console.log(`✅ Payment salvo automaticamente: ${savedPayment[0]?.id}`);
      }
    }
    
    res.status(200).json({
      error: null,
      data: {
        ...billingData,
        receipt_url: receiptUrl,
      },
    });
  } catch (error) {
    console.error('❌ Backend Error:', error.message);
    res.status(500).json({ error: error.message, data: null });
  }
});

/**
 * GET /api/coupons/list
 * Lista todos os cupons disponíveis
 */
app.get('/api/coupons/list', async (req, res) => {
  try {
    console.log(`📤 [GET] ${ABACATEPAY_API}/coupon/list`);

    const response = await fetch(`${ABACATEPAY_API}/coupon/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
    });

    const responseData = await response.json();

    console.log(`📥 [${response.status}] Coupons list:`, responseData?.data?.length || 0);

    if (!response.ok) {
      const errorMsg = responseData?.error?.message || responseData?.error || `HTTP ${response.status}`;
      console.error('❌ Error listing coupons:', errorMsg);
      return res.status(response.status).json({ error: errorMsg, data: [] });
    }

    res.status(200).json({ error: null, data: responseData?.data || [] });
  } catch (error) {
    console.error('❌ Backend Error:', error.message);
    res.status(500).json({ error: error.message, data: [] });
  }
});

/**
 * GET /api/coupon/validate/:code
 * Valida e retorna detalhes de um cupom
 */
app.get('/api/coupon/validate/:code', async (req, res) => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ error: 'Cupom obrigatório', data: null });
  }

  try {
    console.log(`📤 [GET] Validando cupom: ${code}`);

    const response = await fetch(`${ABACATEPAY_API}/coupon/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
    });

    const responseData = await response.json();

    // Procurar o cupom na lista
    const coupon = responseData?.data?.find((c) => c.id.toUpperCase() === code.toUpperCase());

    if (!coupon) {
      console.warn(`⚠️ Cupom não encontrado: ${code}`);
      return res.status(404).json({ error: 'Cupom inválido ou expirado', data: null });
    }

    if (coupon.status !== 'ACTIVE') {
      console.warn(`⚠️ Cupom inativo: ${code} (status: ${coupon.status})`);
      return res.status(400).json({ error: 'Cupom inativo', data: null });
    }

    console.log(`✅ Cupom validado: ${code}`, { 
      discountKind: coupon.discountKind, 
      discount: coupon.discount,
      redeemsCount: coupon.redeemsCount,
      maxRedeems: coupon.maxRedeems,
    });

    res.status(200).json({ 
      error: null, 
      data: {
        id: coupon.id,
        discountKind: coupon.discountKind,  // 'PERCENTAGE' ou 'FIXED'
        discount: coupon.discount,           // valor em % ou centavos
        status: coupon.status,
        maxRedeems: coupon.maxRedeems,
        redeemsCount: coupon.redeemsCount,
        notes: coupon.notes,
      }
    });
  } catch (error) {
    console.error('❌ Backend Error:', error.message);
    res.status(500).json({ error: error.message, data: null });
  }
});

/**
 * GET /api/payment/:billingId
 * Consulta status de um pagamento
 */
app.get('/api/payment/:billingId', async (req, res) => {
  const { billingId } = req.params;

  try {
    console.log(`📤 [GET] ${ABACATEPAY_API}/billing/${billingId}`);

    const response = await fetch(`${ABACATEPAY_API}/billing/${billingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
    });

    const responseData = await response.json();

    console.log(`📥 [${response.status}]`, responseData);

    if (!response.ok) {
      const errorMsg = responseData?.error?.message || responseData?.error || `HTTP ${response.status}`;
      return res.status(response.status).json({ error: errorMsg, data: null });
    }

    res.status(200).json({ error: null, data: responseData });
  } catch (error) {
    console.error('❌ Backend Error:', error.message);
    res.status(500).json({ error: error.message, data: null });
  }
});

/**
 * GET /api/webhook/logs
 * Monitora webhooks recebidos (últimos 50)
 */
app.get('/api/webhook/logs', async (req, res) => {
  try {
    console.log(`📤 [GET] Consultando webhook logs`);

    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Erro ao buscar logs:', error);
      return res.status(400).json({ error: error.message, data: [] });
    }

    console.log(`✅ ${data?.length || 0} webhook logs encontrados`);

    res.status(200).json({
      error: null,
      data: data || [],
      total: data?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Backend Error:', error.message);
    res.status(500).json({ error: error.message, data: [] });
  }
});

/**
 * 🔒 Valida assinatura HMAC-SHA256 do webhook
 * @param {string} rawBody - Corpo RAW (antes de JSON parse)
 * @param {string} signatureFromHeader - Valor do header X-Webhook-Signature
 * @param {string} secret - Secret/chave para HMAC
 * @returns {boolean} true se válido
 */
function verifyWebhookSignature(rawBody, signatureFromHeader, secret) {
  if (!signatureFromHeader || !rawBody || !secret) {
    console.warn('⚠️ Faltam parâmetros para verificar assinatura');
    return false;
  }

  try {
    // Calcular HMAC-SHA256 do raw body
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody, 'utf-8');
    const calculatedSignature = hmac.digest('base64');

    // Comparação timing-safe (evita timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(calculatedSignature),
      Buffer.from(signatureFromHeader)
    );

    if (!isValid) {
      console.error('❌ Assinatura HMAC inválida');
      console.error(`   Esperado:  ${calculatedSignature.substring(0, 20)}...`);
      console.error(`   Recebido:  ${signatureFromHeader.substring(0, 20)}...`);
    }

    return isValid;
  } catch (error) {
    console.error('❌ Erro ao verificar assinatura HMAC:', error.message);
    return false;
  }
}

/**
 * POST /api/webhook/abacatepay
 * Processa webhooks de pagamento (COM VALIDAÇÃO HMAC-SHA256)
 */
app.post('/api/webhook/abacatepay', async (req, res) => {
  const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET || 'qwe123123';
  const secretFromHeader = req.headers['x-webhook-secret'] || 
                          req.headers['authorization']?.replace('Bearer ', '');

  console.log('\n� [WEBHOOK] Requisição recebida');
  console.log('  Hora:', new Date().toLocaleString('pt-BR'));
  
  // ✅ Validar secret
  if (secretFromHeader !== webhookSecret) {
    console.error('❌ Secret inválido:', secretFromHeader?.slice(0, 10));
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = req.body;
    const { event, data, devMode } = body;

    console.log(`✅ Secret validado`);
    console.log(`📌 Evento: ${event}`);
    console.log(`🔧 Mode: ${devMode ? '🟢 DEV' : '🔴 PROD'}`);

    if (!data?.billing?.id) {
      console.error('❌ Billing ID não encontrado');
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const billingId = data.billing.id;
    const status = data.billing.status?.toUpperCase();
    const amount = data.billing.amount || 0;

    console.log(`💳 Billing: ${billingId}`);
    console.log(`💰 Valor: R$ ${amount}`);
    console.log(`✅ Status: ${status}`);

    // ✅ Registrar log do webhook
    try {
      await supabase.from('webhook_logs').insert({
        event,
        billing_id: billingId,
        request_body: body,
        response_status: '200',
      });
      console.log('✅ Log registrado');
    } catch (logError) {
      console.warn('⚠️ Erro ao registrar log:', logError.message);
    }

    // ✅ Se status = PAID, atualizar payment no banco
    if (status === 'PAID') {
      console.log('\n🎯 Processando confirmação de pagamento...');
      
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('id, registration_id')
        .eq('billing_id', billingId)
        .single();

      if (fetchError) {
        console.warn('⚠️ Payment não encontrado:', billingId);
        console.warn('ℹ️ Webhook será apenas registrado em webhook_logs');
        // Responder com 200 mesmo sem encontrar payment (conforme docs)
        // Para evitar retentativas desnecessárias
        return res.status(200).json({ 
          received: true,
          acknowledged: true,
          warning: 'Payment not found in database'
        });
      }

      if (payment?.id) {
        console.log(`\n📌 Encontrado:`);
        console.log(`   Payment ID: ${payment.id}`);
        console.log(`   Registration ID: ${payment.registration_id}`);
        
        // 1️⃣ Atualizar payment
        const { error: updateError } = await supabase
          .from('payments')
          .update({ status: 'confirmed' })
          .eq('id', payment.id);

        if (!updateError) {
          console.log(`✅ Payment #${payment.id} atualizado para CONFIRMED`);

          // 2️⃣ Atualizar registration (usuário)
          const { error: regError } = await supabase
            .from('event_registrations')
            .update({ status: 'confirmed' })
            .eq('id', payment.registration_id);

          if (!regError) {
            console.log(`✅ Registration #${payment.registration_id} atualizado para CONFIRMED`);
            console.log(`\n🎉 USUÁRIO CONFIRMADO COM SUCESSO!\n`);
            console.log(`   Billing ID: ${billingId}`);
            console.log(`   Valor: R$ ${amount}`);
            console.log(`   Hora: ${new Date().toLocaleString('pt-BR')}`);
          } else {
            console.error('❌ Erro ao atualizar registration:', regError.message);
          }
        } else {
          console.error('❌ Erro ao atualizar payment:', updateError.message);
        }
      }
    }

    res.status(200).json({ 
      received: true,
      acknowledged: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error.message);
    // Responder com 200 para evitar que AbacatePay retente indefinidamente
    // Log do erro foi feito acima
    res.status(200).json({ 
      received: true,
      acknowledged: true,
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const apiKey = process.env.VITE_ABACATEPAY_KEY || 'não configurada';
  const host = process.env.SERVER_HOST || 'vps65539.publiccloud.com.br';
  console.log(`\n✅ Backend de pagamentos rodando em http://0.0.0.0:${PORT}`);
  console.log(`🌐 Acesso externo: http://${host}:${PORT}`);
  console.log(`� API AbacatePay Key: ${apiKey.substring(0, 15)}...`);
  console.log(`📌 Modo: ${apiKey.startsWith('abc_prod') ? '🔴 PRODUÇÃO' : '🟢 DESENVOLVIMENTO'}`);
  console.log(`\n📍 Endpoints:`);
  console.log(`   POST /api/payment/create    - Criar cobrança`);
  console.log(`   GET  /api/payment/:id       - Consultar status`);
  console.log(`   GET  /api/coupons/list      - Listar cupons`);
  console.log(`   GET  /api/coupon/validate/:code - Validar cupom`);
  console.log(`   POST /api/webhook/abacatepay   - Processar webhook [NOVO]`);
  console.log(`   GET  /api/webhook/logs      - Monitor webhooks\n`);
});
