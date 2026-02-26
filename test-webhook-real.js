// Script para testar webhook com dados REAIS do banco
// Busca um payment pendente e simula o webhook para confirmá-lo

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cwzmiznlvhhnpjgxgsme.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3em1pem5sdmhobnBqZ3hnc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5NzcsImV4cCI6MjA4NzA5Mjk3N30.nsXSSPW2yajdEy-iFlDmtIH-AltsNZ3n8BcNkqTJ4F4";
const backendUrl = "http://localhost:3001";
const webhookSecret = "qwe123123";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWebhookWithRealData() {
  try {
    console.log("🔍 Buscando dados reais do banco...\n");

    // Buscar um payment pendente (não confirmado)
    const { data: payments, error: paymentError } = await supabase
      .from("payments")
      .select("id, billing_id, registration_id")
      .eq("status", "pending")
      .limit(1);

    if (paymentError || !payments || payments.length === 0) {
      console.log("⚠️ Nenhum payment pendente encontrado");
      console.log("Buscando qualquer payment...\n");

      const { data: allPayments } = await supabase
        .from("payments")
        .select("id, billing_id, registration_id, status")
        .limit(5);

      if (allPayments && allPayments.length > 0) {
        console.log("💳 Payments disponíveis:");
        allPayments.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.billing_id} (${p.status})`);
        });
        console.log("");
      }

      return;
    }

    const payment = payments[0];
    console.log("✅ Payment encontrado:");
    console.log(`  ID: ${payment.id}`);
    console.log(`  Billing: ${payment.billing_id}`);
    console.log(`  Registration: ${payment.registration_id}\n`);

    // Buscar a inscrição para pegar detalhes do usuário
    const { data: registration } = await supabase
      .from("event_registrations")
      .select("participant_name, participant_email, event_id")
      .eq("id", payment.registration_id)
      .single();

    console.log("👤 Inscrição:");
    console.log(`  Nome: ${registration?.participant_name || "N/A"}`);
    console.log(`  Email: ${registration?.participant_email || "N/A"}\n`);

    // Criar payload do webhook com dados reais
    const webhookPayload = {
      id: "log_" + Math.random().toString(36).substring(2, 27).toUpperCase(),
      event: "billing.paid",
      devMode: true,
      data: {
        billing: {
          id: payment.billing_id,
          amount: 100,
          customer: {
            id: "cust_" + Math.random().toString(36).substring(2, 27).toUpperCase(),
            metadata: {
              name: registration?.participant_name || "Teste",
              cellphone: "3599999999",
              taxId: "12345678901",
              email: registration?.participant_email || "teste@example.com",
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

    console.log("📤 Enviando webhook para processar pagamento...\n");

    const response = await fetch(`${backendUrl}/api/webhook/abacatepay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": webhookSecret,
      },
      body: JSON.stringify(webhookPayload),
    });

    console.log(`📨 Resposta: ${response.status}`);

    if (response.ok) {
      console.log("✅ Webhook processado com sucesso!\n");

      // Verificar se foi atualizado
      console.log("🔄 Verificando status do payment...");
      const { data: updatedPayment } = await supabase
        .from("payments")
        .select("status, confirmed_at")
        .eq("id", payment.id)
        .single();

      if (updatedPayment?.status === "confirmed") {
        console.log("✅ Payment atualizado para CONFIRMED");
        console.log(`   Confirmado em: ${updatedPayment.confirmed_at}`);
      } else {
        console.log("⚠️ Payment ainda não foi confirmado");
        console.log(`   Status: ${updatedPayment?.status}`);
      }

      // Verificar registration
      console.log("\n🔄 Verificando status da inscrição...");
      const { data: updatedReg } = await supabase
        .from("event_registrations")
        .select("status")
        .eq("id", payment.registration_id)
        .single();

      if (updatedReg?.status === "confirmed") {
        console.log("✅ Registration atualizado para CONFIRMED\n");
      } else {
        console.log(`⚠️ Registration status: ${updatedReg?.status}\n`);
      }
    } else {
      console.error("❌ Erro:", await response.text());
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

testWebhookWithRealData();
