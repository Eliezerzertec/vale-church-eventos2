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

<<<<<<< HEAD
// ===== CORS Configuration =====
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1', 'http://69.6.212.241', process.env.VITE_FRONTEND_URL || '*'].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

/**
 * 📊 Logger para transações de API AbacatePay
 */
async function logApiTransaction(data) {
  try {
    const startTime = Date.now();
    
    // Gerar ID único para a transação
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const logEntry = {
      transaction_id: transactionId,
      api_type: 'abacatepay',
      endpoint: data.endpoint,
      method: data.method,
      request_body: data.requestBody,
      response_status: data.responseStatus,
      response_body: data.responseBody,
      error_message: data.errorMessage || null,
      duration_ms: data.durationMs || Date.now() - startTime,
      user_email: data.userEmail || null,
      registration_id: data.registrationId || null,
      billing_id: data.billingId || null,
    };

    // Registrar no banco de dados
    const { error } = await supabase
      .from('api_transaction_logs')
      .insert([logEntry]);

    if (error) {
      console.warn('⚠️ Erro ao registrar log de transação:', error.message);
    } else {
      console.log(`📝 Transação registrada: ${transactionId}`);
    }

    return transactionId;
  } catch (error) {
    console.error('❌ Erro fatal ao registrar log:', error.message);
  }
}

app.use(cors(corsOptions));
=======
app.use(cors());
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString(encoding);
  }
}));

<<<<<<< HEAD
app.get('/api/webhook/status', async (req, res) => {
  try {
    // Buscar últimos webhooks recebidos
    const { data: webhooks, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return res.json({
        status: 'ok',
        message: 'Webhook endpoint ativo (webhook_logs table não configurada)',
        webhooks: []
      });
    }

    res.json({
      status: 'ok',
      message: `Recebidos ${webhooks.length} webhooks`,
      webhooks: webhooks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

=======
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: isProd ? '🔴 PRODUÇÃO' : '🟢 DESENVOLVIMENTO',
    timestamp: new Date().toISOString()
  });
});

<<<<<<< HEAD
// Endpoint de teste para debug do AbacatePay
app.post('/api/test/billing', async (req, res) => {
  try {
    console.log('🧪 Teste de billing.create iniciado');
    
    const testPayload = {
      frequency: "ONE_TIME",
      products: [{
        externalId: "test-product-1",
        name: "Test Product",
        description: "Test Description",
        quantity: 1,
        price: 50000, // R$ 500 em centavos
      }],
      methods: ["PIX", "CARD"],
      returnUrl: "http://localhost:8081/eventos/teste",
      completionUrl: "http://localhost:8081/eventos/teste",
      customer: {
        id: "test@example.com",
        metadata: {
          name: "Test User",
          email: "test@example.com",
          registration_id: "test-reg-123",
          event_id: "test-event-123",
        },
      },
    };

    console.log('📋 Payload de teste:', JSON.stringify(testPayload, null, 2));

    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const response = await fetch(`${ABACATEPAY_API}/billing/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
      body: JSON.stringify(testPayload),
    });

    const responseData = await response.json();
    console.log('📥 Resposta AbacatePay:', JSON.stringify(responseData, null, 2));
    console.log('📊 Status HTTP:', response.status);

    res.status(response.status).json({
      status: response.status,
      statusOk: response.ok,
      data: responseData,
    });
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de teste com payload ULTRA MÍNIMO (sem externalId)
app.post('/api/test/billing-ultra-minimal', async (req, res) => {
  try {
    console.log('🧪 Teste de billing.create (ULTRA MÍNIMO) iniciado');
    
    const ultraMinimalPayload = {
      products: [{
        name: "Ultra Minimal Test",
        quantity: 1,
        price: 5000, // R$ 50
      }],
    };

    console.log('📋 Payload ultra-mínimo (sem externalId):', JSON.stringify(ultraMinimalPayload, null, 2));

    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const response = await fetch(`${ABACATEPAY_API}/billing/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
      body: JSON.stringify(ultraMinimalPayload),
    });

    const responseData = await response.json();
    console.log('📥 Resposta AbacatePay (ultra-minimal):', JSON.stringify(responseData, null, 2));
    console.log('📊 Status HTTP:', response.status);

    res.status(response.status).json({
      status: response.status,
      statusOk: response.ok,
      data: responseData,
    });
  } catch (error) {
    console.error('❌ Erro no teste ultra-minimal:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payment/create', async (req, res) => {
  const transactionStartTime = Date.now();
  let transactionId = null;
  
  try {
    console.log('\n🔍 ========== /api/payment/create REQUEST RECEBIDO ==========');
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    const { method = 'POST', endpoint = '/billing/create', body: paymentBody } = req.body;

    // GET requests não têm body, isso é ok
    if (method === 'POST' && !paymentBody) {
      console.error('❌ Body obrigatório para POST. Recebido:', req.body);
      await logApiTransaction({
        endpoint,
        method,
        requestBody: req.body,
        responseStatus: 400,
        responseBody: { error: 'Body obrigatório para POST' },
        errorMessage: 'Body obrigatório para POST',
      });
      return res.status(400).json({ error: 'Body obrigatório para POST', data: null });
    }

    // 📋 Log detalhado da requisição
    console.log(`📤 Método: ${method}`);
    console.log(`🔗 Endpoint: ${endpoint}`);
    console.log(`👤 Usuario: ${paymentBody?.customer?.email || 'N/A'}`);
    console.log(`📝 Payload Keys: ${paymentBody ? Object.keys(paymentBody).join(', ') : '(no body)'}`);
    console.log(`💰 Valor: ${paymentBody?.products?.[0]?.price || 'N/A'} centavos`);
    
    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const url = `${ABACATEPAY_API}${endpoint}`;
    
    console.log(`\n📤 Enviando para: ${url}`);
    console.log('📋 Body completo:', JSON.stringify(paymentBody, null, 2));
    
    // Medir tempo de resposta
    const requestStartTime = Date.now();
    const response = await fetch(url, {
=======

app.post('/api/payment/create', async (req, res) => {
  const { method = 'POST', endpoint = '/billing/create', body: paymentBody } = req.body;

  if (!paymentBody) {
    return res.status(400).json({ error: 'Body obrigatório', data: null });
  }

  try {
    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const response = await fetch(`${ABACATEPAY_API}${endpoint}`, {
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
<<<<<<< HEAD
      body: paymentBody ? JSON.stringify(paymentBody) : undefined,
    });
    const responseDurationMs = Date.now() - requestStartTime;

    const responseData = await response.json();
    const responseStatus = response.status;

    console.log(`\n📥 Resposta AbacatePay`);
    console.log(`   Status: ${responseStatus} ${response.statusText}`);
    console.log(`   ⏱️ Duração: ${responseDurationMs}ms`);
    console.log(`   Body: ${JSON.stringify(responseData, null, 2)}`);

    // 💾 Registrar a transação no banco
    transactionId = await logApiTransaction({
      endpoint,
      method,
      requestBody: paymentBody,
      responseStatus,
      responseBody: responseData,
      errorMessage: !response.ok ? (responseData?.error?.message || responseData?.message || `HTTP ${responseStatus}`) : null,
      durationMs: responseDurationMs,
      userEmail: paymentBody?.customer?.email,
      registrationId: paymentBody?.customer?.metadata?.registration_id,
      billingId: responseData?.data?.id || responseData?.id,
    });

    if (!response.ok) {
      const errorMsg = responseData?.error?.message || responseData?.message || `HTTP ${responseStatus}`;
      console.error(`\n❌ AbacatePay ERROR: ${errorMsg}`);
      console.log(`🔗 Transaction ID: ${transactionId}`);
      return res.status(responseStatus).json({ error: errorMsg, data: null, transactionId });
=======
      body: JSON.stringify(paymentBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMsg = responseData?.error?.message || `HTTP ${response.status}`;
      return res.status(response.status).json({ error: errorMsg, data: null });
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
    }

    const billingData = responseData?.data || responseData;
    const receiptUrl = billingData?.id ? `https://app.abacatepay.com/receipt/${billingData.id}` : null;

<<<<<<< HEAD
    console.log(`\n✅ Sucesso!`);
    console.log(`   Billing ID: ${billingData?.id}`);
    console.log(`   URL: ${billingData?.url}`);
    console.log(`   Status no AbacatePay: ${billingData?.status}`);
    console.log(`🔗 Transaction ID: ${transactionId}`);

    // Auto-salvar payment se for POST /billing/create
    if (method === 'POST' && endpoint === '/billing/create' && paymentBody?.customer?.metadata?.registration_id) {
      const registrationId = paymentBody.customer.metadata.registration_id;
      const eventId = paymentBody.customer.metadata.event_id;
      
      if (billingData?.id && registrationId) {
        console.log(`\n💾 Salvando pagamento no banco...`);
        const { error, data } = await supabase.from("payments").insert({
          registration_id: registrationId,
          amount: paymentBody.amount || Math.round((paymentBody.products?.[0]?.price || 0) / 100),
          status: "pending",
          billing_id: billingData.id,
          event_id: eventId,
          payment_url: billingData.url || billingData.paymentUrl,
        }).select().single();
        
        if (error) {
          console.warn(`⚠️ Aviso ao salvar payment no banco:`, error);
          console.log(`   Mas a cobrança foi criada no AbacatePay: ${billingData.id}`);
        } else {
          console.log(`   ✅ Payment salvo com ID: ${data?.id}`);
        }
      }
    }

    const totalDurationMs = Date.now() - transactionStartTime;
    console.log(`\n⏱️ Tempo total: ${totalDurationMs}ms`);
    console.log('========================================\n');

    res.json({ error: null, data: { ...billingData, receipt_url: receiptUrl }, transactionId });
  } catch (error) {
    const totalDurationMs = Date.now() - transactionStartTime;
    
    console.error(`\n❌ EXCEPTION em /api/payment/create`);
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensagem: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    console.error(`⏱️ Tempo até Exception: ${totalDurationMs}ms`);
    console.log(`🔗 Transaction ID: ${transactionId}`);

    // Registrar exception
    if (transactionId) {
      await logApiTransaction({
        endpoint: req.body?.endpoint || 'unknown',
        method: req.body?.method || 'unknown',
        requestBody: req.body,
        responseStatus: 500,
        responseBody: null,
        errorMessage: `Exception: ${error.name} - ${error.message}`,
        durationMs: totalDurationMs,
        userEmail: req.body?.body?.customer?.email,
      });
    }

    console.log('========================================\n');
    res.status(500).json({ error: error.message, data: null, transactionId });
=======
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
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
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

<<<<<<< HEAD
// Endpoint para confirmar uma inscrição quando pagamento é marcado como "paid"
app.post('/api/payment/:paymentId/confirm', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    console.log('🔄 POST /api/payment/:paymentId/confirm, paymentId:', paymentId);
    
    // 1. Buscar o pagamento no banco
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
    
    if (fetchError || !payment) {
      console.error('❌ Pagamento não encontrado:', fetchError);
      return res.status(404).json({ error: 'Pagamento não encontrado', data: null });
    }
    
    console.log('💾 Pagamento encontrado:', { id: payment.id, status: payment.status, registration_id: payment.registration_id });
    
    // 2. Se pagamento está "paid", confirmar a inscrição
    if (payment.status === 'paid') {
      const { error: updateError } = await supabase
        .from('event_registrations')
        .update({ status: 'confirmed' })
        .eq('id', payment.registration_id)
        .eq('status', 'pending');
      
      if (updateError) {
        console.error('❌ Erro ao confirmar inscrição:', updateError);
        return res.status(500).json({ error: 'Erro ao confirmar inscrição', data: null });
      }
      
      console.log('✅ Inscrição confirmada automaticamente pela trigger');
      return res.json({ error: null, data: { message: 'Inscrição confirmada', registration_id: payment.registration_id } });
    } else {
      return res.json({ error: null, data: { message: 'Pagamento ainda não está em status "paid"', status: payment.status } });
    }
  } catch (error) {
    console.error('❌ Exception em /api/payment/:paymentId/confirm:', error);
    res.status(500).json({ error: error.message, data: null });
  }
});

=======
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
app.get('/api/coupons/list', async (req, res) => {
  try {
    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const response = await fetch(`${ABACATEPAY_API}/coupon/list`, {
      headers: { 'Authorization': `Bearer ${ABACATEPAY_KEY}` },
    });
    const responseData = await response.json();
<<<<<<< HEAD
    
    if (!response.ok) {
      return res.json({
        error: responseData?.error,
        data: []
      });
    }

    // Filtrar cupons desativados localmente
    let cupons = responseData?.data || [];
    try {
      const { data: deactivated } = await supabase
        .from('coupon_deactivations')
        .select('coupon_id');
      
      const deactivatedIds = new Set((deactivated || []).map(d => d.coupon_id.toUpperCase()));
      cupons = cupons.filter(c => !deactivatedIds.has(c.id.toUpperCase()));
    } catch (dbError) {
      console.error('⚠️  Erro ao filtrar cupons desativados:', dbError);
      // Se falhar a query de desativados, continua com todos
    }

    res.json({
      error: null,
      data: cupons
=======
    res.json({
      error: !response.ok ? responseData?.error : null,
      data: response.ok ? (responseData?.data || []) : []
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] });
  }
});

<<<<<<< HEAD
app.post('/api/coupon/create', async (req, res) => {
  const { code, notes, discountKind, discount, maxRedeems } = req.body;
  
  try {
    if (!code || !notes || !discountKind || discount === undefined) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: code, notes, discountKind, discount', 
        data: null 
      });
    }

    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    const payload = {
      code: code.toUpperCase(),
      notes,
      discountKind, // PERCENTAGE ou FIXED
      discount: Number(discount),
      maxRedeems: Number(maxRedeems) || -1 // -1 = ilimitado
    };

    console.log('📌 Criando cupom:', payload);

    const response = await fetch(`${ABACATEPAY_API}/coupon/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📡 Status da resposta:', response.status);
    const responseText = await response.text();
    console.log('📡 Response text:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (err) {
      console.error('❌ Erro ao fazer parse JSON:', err);
      console.error('❌ Texto recebido:', responseText);
      return res.status(response.status || 500).json({ 
        error: `Erro na resposta da AbacatePay: ${responseText}`, 
        data: null 
      });
    }

    if (!responseData?.success || !response.ok) {
      console.error('❌ Erro ao criar cupom:', responseData?.error);
      return res.status(response.status).json({ 
        error: responseData?.error || `Erro ao criar cupom: ${response.status}`, 
        data: null 
      });
    }

    console.log('✅ Cupom criado:', responseData?.data?.id);
    res.json({
      error: null,
      data: responseData?.data
    });
  } catch (error) {
    console.error('❌ Exception ao criar cupom:', error);
    res.status(500).json({ error: error.message, data: null });
  }
});

app.patch('/api/coupon/:id/deactivate', async (req, res) => {
  const { id } = req.params;
  
  try {
    const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
    
    console.log('🔒 Desativando cupom:', id);

    // Tenta PATCH para desativar o cupom
    const response = await fetch(`${ABACATEPAY_API}/coupon/${id}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (err) {
      console.error('❌ Erro ao fazer parse JSON:', err, responseText);
    }

    if (responseData?.success || response.ok) {
      console.log('✅ Cupom desativado:', id);
      res.json({
        error: null,
        data: responseData?.data || { id, status: 'INACTIVE' }
      });
    } else {
      console.error('❌ Erro ao desativar cupom:', responseData?.error);
      res.status(response.status || 400).json({ 
        error: responseData?.error || 'Erro ao desativar cupom',
        data: null 
      });
    }
  } catch (error) {
    console.error('❌ Exception ao desativar cupom:', error);
    res.status(500).json({ error: error.message, data: null });
  }
});

app.delete('/api/coupon/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log('🗑️ Desativando cupom:', id);

    // Como AbacatePay não permite desativar via API,
    // rastreamos desativações localmente no Supabase
    const { error } = await supabase
      .from('coupon_deactivations')
      .insert({
        coupon_id: id.toUpperCase(),
        coupon_code: id.toUpperCase(),
        reason: 'Desativado via AdminCoupons'
      });

    if (error && !error.message.includes('duplicate')) {
      throw error;
    }

    console.log('✅ Cupom marcado como desativado:', id);
    res.json({
      error: null,
      data: { 
        id: id.toUpperCase(),
        status: 'INACTIVE',
        message: 'Cupom desativado com sucesso'
      }
    });
  } catch (error) {
    console.error('❌ Exception ao desativar cupom:', error);
    res.status(500).json({ error: error.message, data: null });
  }
});

=======
>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
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

<<<<<<< HEAD
// Endpoint para confirmar TODOS os pagamentos pendentes (admin/debug)
app.post('/api/admin/confirm-all-payments', async (req, res) => {
  try {
    console.log('🔄 POST /api/admin/confirm-all-payments - Confirmando TODOS os pagamentos...');
    
    // 1. Buscar TODOS os pagamentos com status "pending"
    const { data: pendingPayments, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending');
    
    if (fetchError) {
      console.error('❌ Erro ao buscar pagamentos:', fetchError);
      return res.status(500).json({ error: 'Erro ao buscar pagamentos', data: null });
    }
    
    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('ℹ️ Nenhum pagamento pendente para confirmar');
      return res.json({ error: null, data: { message: 'Nenhum pagamento pendente', count: 0 } });
    }
    
    console.log(`⏳ Confirmando ${pendingPayments.length} pagamentos...`);
    
    // 2. Atualizar todos para "paid"
    const { error: updatePaymentError, count: updatedPayments } = await supabase
      .from('payments')
      .update({ 
        status: 'paid'
      })
      .eq('status', 'pending');
    
    if (updatePaymentError) {
      console.error('❌ Erro ao atualizar pagamentos:', updatePaymentError);
      return res.status(500).json({ error: 'Erro ao atualizar pagamentos', data: null });
    }
    
    // 3. Confirmar inscrições correspondentes
    let confirmCount = 0;
    for (const payment of pendingPayments) {
      const { error: confirmError, count } = await supabase
        .from('event_registrations')
        .update({ status: 'confirmed' })
        .eq('id', payment.registration_id)
        .eq('status', 'pending');
      
      if (!confirmError && count > 0) {
        confirmCount += count;
      }
    }
    
    console.log(`✅ ${pendingPayments.length} pagamentos confirmados`);
    console.log(`✅ ${confirmCount} inscrições confirmadas`);
    
    res.json({
      error: null,
      data: {
        message: 'Todos os pagamentos confirmados com sucesso',
        payments_confirmed: pendingPayments.length,
        registrations_confirmed: confirmCount,
      }
    });
  } catch (error) {
    console.error('❌ Exception em /api/admin/confirm-all-payments:', error);
    res.status(500).json({ error: error.message, data: null });
  }
});

/**
 * 📊 ENDPOINTS DE MONITORAMENTO DE TRANSAÇÕES
 */

// Obter últimas transações de API
app.get('/api/monitor/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status; // 'error', 'success', all
    
    let query = supabase
      .from('api_transaction_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filtrar por status de resposta
    if (status === 'error') {
      query = query.not('error_message', 'is', null);
    } else if (status === 'success') {
      query = query.is('error_message', null);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message, data: [] });
    }

    res.json({
      error: null,
      count: data?.length || 0,
      data: data || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Obter transações de um usuário específico
app.get('/api/monitor/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase
      .from('api_transaction_logs')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ error: error.message, data: [] });
    }

    res.json({
      error: null,
      count: data?.length || 0,
      userEmail: email,
      data: data || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Obter transações de uma cobrança específica (billing_id)
app.get('/api/monitor/billing/:billingId', async (req, res) => {
  try {
    const { billingId } = req.params;
    const { data, error } = await supabase
      .from('api_transaction_logs')
      .select('*')
      .eq('billing_id', billingId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message, data: [] });
    }

    res.json({
      error: null,
      billingId,
      data: data || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Obter estatísticas de transações
app.get('/api/monitor/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('api_transaction_logs')
      .select('*', { count: 'exact' });

    if (error) {
      return res.status(500).json({ error: error.message, data: null });
    }

    // Calcular estatísticas
    const total = data?.length || 0;
    const errors = data?.filter(log => log.error_message)?.length || 0;
    const success = total - errors;
    const avgDuration = data?.length > 0 
      ? Math.round(data.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / data.length)
      : 0;

    // Erros mais comuns
    const errorCounts = {};
    data?.forEach(log => {
      if (log.error_message) {
        const shortMsg = log.error_message.substring(0, 50);
        errorCounts[shortMsg] = (errorCounts[shortMsg] || 0) + 1;
      }
    });

    // Endpoints mais usados
    const endpointCounts = {};
    data?.forEach(log => {
      endpointCounts[log.endpoint] = (endpointCounts[log.endpoint] || 0) + 1;
    });

    res.json({
      error: null,
      data: {
        total,
        success,
        errors,
        successRate: total > 0 ? ((success / total) * 100).toFixed(2) + '%' : '0%',
        averageDurationMs: avgDuration,
        topErrors: Object.entries(errorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        endpointUsage: endpointCounts,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: null });
  }
});

// Obter transação específica por ID
app.get('/api/monitor/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('api_transaction_logs')
      .select('*')
      .eq('transaction_id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Transação não encontrada', data: null });
    }

    res.json({ error: null, data });
  } catch (error) {
    res.status(500).json({ error: error.message, data: null });
  }
});

/**
 * 📊 ENDPOINT DE EXPORTAÇÃO DE INSCRITOS
 * Retorna dados de inscritos com filtros de data e evento
 */
app.get('/api/export/registrations', async (req, res) => {
  try {
    const { eventId, dateFrom, dateTo } = req.query;

    console.log('\n📊 ===== EXPORTAÇÃO DE INSCRITOS =====');
    console.log(`   Evento: ${eventId || 'TODOS'}`);
    console.log(`   De: ${dateFrom || 'início'}`);
    console.log(`   Até: ${dateTo || 'agora'}`);

    // Construir query
    let query = supabase
      .from('event_registrations')
      .select(`
        id,
        full_name,
        email,
        phone,
        cpf,
        status,
        created_at,
        updated_at,
        event_id,
        events:event_id(id, title, event_date, location, price, is_free),
        payments(id, status, amount, paid_at)
      `);

    // Filtrar por evento se fornecido
    if (eventId && eventId !== 'all') {
      query = query.eq('event_id', eventId);
    }

    // Filtrar por data se fornecido
    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      // Adicionar 1 dia para incluir todo o dia final
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Ordenar por data
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar inscritos:', error.message);
      return res.status(500).json({ error: error.message, data: [] });
    }

    console.log(`✅ Encontrados ${data?.length || 0} inscritos`);
    console.log('=====================================\n');

    // Formatar dados para exportação
    const formattedData = (data || []).map((reg) => ({
      'ID Inscrição': reg.id,
      'Nome Completo': reg.full_name,
      'Email': reg.email,
      'Telefone': reg.phone || '-',
      'CPF': reg.cpf || '-',
      'Status Inscrição': reg.status,
      'Evento': reg.events?.title || 'N/A',
      'Data Evento': reg.events?.event_date ? new Date(reg.events.event_date).toLocaleDateString('pt-BR') : 'N/A',
      'Local': reg.events?.location || '-',
      'Preço': reg.events?.is_free ? 'Gratuito' : `R$ ${reg.events?.price?.toFixed(2) || '0.00'}`,
      'Status Pagamento': reg.payments?.[0]?.status || 'Sem pagamento',
      'Valor Pago': reg.payments?.[0]?.amount ? `R$ ${(reg.payments[0].amount / 100).toFixed(2)}` : '-',
      'Pago em': reg.payments?.[0]?.paid_at ? new Date(reg.payments[0].paid_at).toLocaleDateString('pt-BR') : '-',
      'Data Inscrição': new Date(reg.created_at).toLocaleDateString('pt-BR'),
      'Hora Inscrição': new Date(reg.created_at).toLocaleTimeString('pt-BR'),
    }));

    res.json({
      error: null,
      count: formattedData.length,
      data: formattedData,
    });
  } catch (error) {
    console.error('❌ Exception em /api/export/registrations:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

/**
 * Endpoint para obter lista de eventos (para filtro)
 */
app.get('/api/export/events-list', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, event_date, is_free, price')
      .order('event_date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message, data: [] });
    }

    res.json({
      error: null,
      data: (data || []).map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.event_date).toLocaleDateString('pt-BR'),
        price: event.is_free ? 'Gratuito' : `R$ ${event.price?.toFixed(2) || '0.00'}`
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] });
  }
});

// ❌ WEBHOOK DESABILITADO - Pagamentos confirmados pela página (pagamento=ok)
// Quando a AbacatePay redireciona com ?pagamento=ok, o frontend:
// 1. Detecta o parâmetro na URL
// 2. Busca o pagamento no banco
// 3. Atualiza status de "pending" para "paid"
// 4. Confirma também a inscrição (event_registrations)
// Sem dependência de webhook!

=======
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

>>>>>>> 3f51709dab058c5382fcc063e5888a503d8db658
app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
  console.log(`📌 Modo: ${isProd ? '🔴 PRODUÇÃO' : '🟢 DESENVOLVIMENTO'}`);
});
