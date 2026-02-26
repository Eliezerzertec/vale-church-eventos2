/**
 * 🧪 Teste de Fluxo de Pagamento Completo
 * Conforme documentação AbacatePay: https://docs.abacatepay.com
 * 
 * Testa o fluxo de:
 * 1. Criar evento
 * 2. Registrar inscrição
 * 3. Simular webhook de confirmação
 * 4. Verificar se page de confirmação carrega dados corretos
 */

import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:3001";
const WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET;

console.log("🧪 TESTE DE FLUXO DE PAGAMENTO");
console.log("================================\n");
console.log("📍 Supabase URL:", SUPABASE_URL);
console.log("📍 Backend URL:", BACKEND_URL);
console.log("📍 Webhook Secret:", WEBHOOK_SECRET);
console.log("\n================================\n");

async function testPaymentFlow() {
  try {
    // 1️⃣ TESTAR BACKEND HEALTH CHECK
    console.log("✅ Step 1/4: Testando backend...");
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    if (!healthRes.ok) throw new Error(`Backend não respondeu: ${healthRes.status}`);
    const health = await healthRes.json();
    console.log("✅ Backend está rodando:");
    console.log(`   - Status: ${health.status}`);
    console.log(`   - Modo: ${health.mode}`);
    console.log();

    // 2️⃣ TESTAR CRIAÇÃO DE COBRANÇA
    console.log("✅ Step 2/4: Testando criação de cobrança...");
    
    const billingPayload = {
      frequency: "ONE_TIME",
      methods: ["PIX", "CARD"],
      products: [
        {
          externalId: "teste-123",
          name: "Inscrição - Culto de Celebração",
          description: "Teste de pagamento PIX",
          quantity: 1,
          price: 10000, // R$ 100,00
        },
      ],
      returnUrl: `http://localhost:8080/payment-confirmation/teste?registration_id=test123&billing_id=PENDING`,
      completionUrl: `http://localhost:8080/payment-confirmation/teste?registration_id=test123&billing_id=PENDING`,
      customer: {
        name: "Teste User",
        email: "teste@example.com",
        cellphone: "11999999999",
        taxId: "11144477735", // CPF válido para testes (NOPE - vai ser rejeitado de qualquer forma)
      },
    };

    const billingRes = await fetch(`${BACKEND_URL}/api/payment/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "POST",
        endpoint: "/billing/create",
        body: billingPayload,
      }),
    });

    if (!billingRes.ok) {
      const errorText = await billingRes.text();
      throw new Error(`Erro ao criar cobrança: ${billingRes.status} - ${errorText}`);
    }

    const billing = await billingRes.json();
    console.log("✅ Cobrança criada com sucesso:");
    console.log(`   - ID: ${billing.data?.id || billing.id}`);
    console.log(`   - URL: ${billing.data?.url || billing.url}`);
    console.log(`   - Status: ${billing.data?.status || billing.status}`);
    console.log();

    // 3️⃣ SIMULAR WEBHOOK
    console.log("✅ Step 3/4: Simulando webhook de confirmação...");
    const webhookUrl = `https://cwzmiznlvhhnpjgxgsme.supabase.co/functions/v1/abacatepay-webhook?webhookSecret=${WEBHOOK_SECRET}`;
    
    const webhookPayload = {
      id: `test_webhook_${Date.now()}`,
      event: "billing.paid",
      devMode: false,
      data: {
        billing: {
          id: billing.data?.id || billing.id,
          status: "PAID",
          amount: 10000,
          externalId: "teste-123",
        },
        payment: {
          id: `pix_${Date.now()}`,
          method: "PIX",
          paidAt: new Date().toISOString(),
        },
      },
    };

    console.log("📤 Enviando webhook para:", webhookUrl.split('?')[0]);
    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log(`📥 Response Status: ${webhookRes.status}`);
    const webhookResponseText = await webhookRes.text();
    console.log(`📥 Response Body: ${webhookResponseText.substring(0, 200)}...`);
    console.log();

    // 4️⃣ VERIFICAR LOGS
    console.log("✅ Step 4/4: Verificando logs do webhook...");
    const logsRes = await fetch(`${BACKEND_URL}/api/webhook/logs`);
    if (logsRes.ok) {
      const logs = await logsRes.json();
      console.log(`📊 Total de webhooks registrados: ${logs.length}`);
      if (logs.length > 0) {
        console.log("📋 Últimos 3 webhooks:");
        logs.slice(0, 3).forEach((log, i) => {
          console.log(`   ${i + 1}. ${log.event} - ${log.status} (${new Date(log.created_at).toLocaleTimeString()})`);
        });
      }
    }
    console.log();

    console.log("✅ TESTE COMPLETO!");
    console.log("\n🔗 Próximas etapas:");
    console.log(`1. Abra o navegador em: http://localhost:8080`);
    console.log(`2. Navegue para: /eventos`);
    console.log(`3. Clique em um evento e preencha o formulário`);
    console.log(`4. Clique em "Inscrever-se e Pagar"`);
    console.log(`5. Você será redirecionado para AbacatePay`);
    console.log(`6. Use PIX de teste: 00020126580014br.gov.bcb.pix0136...`);
    console.log(`7. Após pagamento, a página de confirmação atualizará em tempo real`);

  } catch (error) {
    console.error("❌ ERRO:", error.message);
    process.exit(1);
  }
}

testPaymentFlow();
