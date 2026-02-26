// Script para simular webhook do AbacatePay
// Envia um webhook de teste para seu endpoint local

const backendUrl = "http://localhost:3001";
const webhookEndpoint = `${backendUrl}/api/webhook/abacatepay`;
const webhookSecret = "qwe123123";

// Dados de teste do webhook (formato AbacatePay real)
const testPayload = {
  id: "log_" + Math.random().toString(36).substring(2, 27).toUpperCase(),
  event: "billing.paid",
  devMode: true, // ✅ IMPORTANTE: Ativa modo desenvolvimento
  data: {
    billing: {
      id: "bill_" + Math.random().toString(36).substring(2, 27).toUpperCase(),
      amount: 100,
      customer: {
        id: "cust_" + Math.random().toString(36).substring(2, 27).toUpperCase(),
        metadata: {
          name: "Teste Pagamento",
          cellphone: "35999999999",
          taxId: "12345678901",
          email: "teste@example.com",
          country: "BR",
          zipCode: "37500000"
        }
      },
      frequency: "ONE_TIME",
      kind: ["PIX", "CARD"],
      status: "PAID",
      products: [
        {
          publicId: "prod_" + Math.random().toString(36).substring(2, 27).toUpperCase(),
          externalId: Math.random().toString(),
          quantity: 1
        }
      ],
      paidAmount: 100,
      couponsUsed: []
    },
    payment: {
      amount: 100,
      fee: 80,
      method: "PIX"
    }
  }
};

async function simulateWebhook() {
  try {
    console.log("📤 Enviando webhook de teste...");
    console.log("🔗 Endpoint:", webhookEndpoint);
    console.log("💳 Billing ID:", testPayload.data.billing.id);
    console.log("");

    const response = await fetch(webhookEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": webhookSecret,
      },
      body: JSON.stringify(testPayload),
    });

    console.log("📨 Resposta recebida:");
    console.log(`Status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    if (responseText) {
      console.log("Body:", responseText);
    }

    if (response.status === 200) {
      console.log("\n✅ Webhook enviado com sucesso!");
      console.log("📍 Verifique a tabela webhook_logs no Supabase");
    } else {
      console.log("\n❌ Erro ao enviar webhook");
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

simulateWebhook();
