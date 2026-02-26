#!/usr/bin/env node

/**
 * Debug: Verificar resposta do AbacatePay com cupom
 * Uso: node debug-coupon.js <COUPON_ID>
 * Exemplo: node debug-coupon.js DESCONTO10
 */

import fetch from 'node-fetch';

const ABACATEPAY_API = 'https://api.abacatepay.com/v1';
const ABACATEPAY_KEY = process.env.VITE_ABACATEPAY_KEY || 'abc_dev_wsc2xLB4mS4cjj2LX3DUryzY';
const COUPON_ID = process.argv[2] || 'DESCONTO10';

async function testCoupon() {
  console.log('\n🧪 Testando cupom:', COUPON_ID);
  console.log('🔑 Chave:', ABACATEPAY_KEY.substring(0, 10) + '...');
  console.log('📡 API:', ABACATEPAY_API);
  
  try {
    // 1. Criar billing COM cupom
    console.log('\n1️⃣ Criando billing COM cupom...\n');
    
    const billingBody = {
      frequency: "ONE_TIME",
      methods: ["PIX", "CARD"],
      products: [
        {
          externalId: "debug-test",
          name: "Teste com Cupom",
          description: "Teste de cupom",
          quantity: 1,
          price: 100000, // R$ 1000.00 em centavos
        },
      ],
      returnUrl: "http://localhost:8081",
      completionUrl: "http://localhost:8081?pagamento=ok",
      couponId: COUPON_ID, // ← CUPOM
      customer: {
        name: "Teste Debug",
        email: "test@example.com",
        cellphone: "11999999999",
        taxId: "12345678901",
        metadata: { test: "true" },
      },
    };
    
    console.log('📤 Body enviado:\n', JSON.stringify(billingBody, null, 2));
    
    const createResponse = await fetch(`${ABACATEPAY_API}/billing/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
      body: JSON.stringify(billingBody),
    });
    
    const billingData = await createResponse.json();
    
    console.log('\n📥 Response da criação:\n', JSON.stringify(billingData, null, 2));
    
    if (!billingData?.data?.id) {
      console.error('❌ Erro: Sem billing ID na resposta');
      return;
    }
    
    const billingId = billingData.data.id;
    console.log('\n✅ Billing ID:', billingId);
    console.log('📊 Amount retornado:', billingData.data?.amount || 'N/A');
    
    // 2. Buscar detalhes completos
    console.log('\n2️⃣ Buscando detalhes completos do billing...\n');
    
    const detailResponse = await fetch(`${ABACATEPAY_API}/billing/${billingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
      },
    });
    
    const billingDetails = await detailResponse.json();
    
    console.log('📥 Detalhes completos:\n', JSON.stringify(billingDetails, null, 2));
    
    // 3. Verificar campos de desconto
    console.log('\n3️⃣ Verificando campos de desconto...\n');
    
    const fields = [
      'discount',
      'couponDiscount',
      'discount_amount',
      'discountAmount',
      'coupon_discount',
      'fee',
      'platformFee',
      'platform_fee',
    ];
    
    const data = billingDetails?.data || {};
    console.log('Campos encontrados:');
    fields.forEach(field => {
      const value = data[field];
      if (value !== undefined && value !== null) {
        console.log(`  ✅ ${field}: ${value}`);
      }
    });
    
    console.log('\nTodos os campos (data object):');
    console.log(Object.keys(data).join(', '));
    
    // 4. Resumo
    console.log('\n4️⃣ RESUMO\n');
    console.log('Amount original enviado: R$ 1000.00 (100000 centavos)');
    console.log('Amount retornado:', billingDetails?.data?.amount ? `R$ ${billingDetails.data.amount / 100}` : 'N/A');
    console.log('Cupom:', COUPON_ID);
    console.log('Status:', billingDetails?.data?.status || 'N/A');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCoupon();
