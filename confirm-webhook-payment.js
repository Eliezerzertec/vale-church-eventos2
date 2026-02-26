// Script para confirmar manualmente um pagamento pelo billing_id
// Use isso enquanto o webhook está sendo testado

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cwzmiznlvhhnpjgxgsme.supabase.co";
// IMPORTANTE: Use a ANON_KEY para buscar dados, depois use SQL para UPDATE
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3em1pem5sdmhobnBqZ3hnc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5NzcsImV4cCI6MjA4NzA5Mjk3N30.nsXSSPW2yajdEy-iFlDmtIH-AltsNZ3n8BcNkqTJ4F4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function confirmPaymentByBillingId(billingId) {
  try {
    if (!billingId) {
      console.error("❌ Uso: node confirm-webhook-payment.js <billing_id>");
      console.error("Exemplo: node confirm-webhook-payment.js bill_gjXdebFMk0Kj0S0YKBXuSsGr");
      process.exit(1);
    }

    console.log(`🔍 Buscando payment com billing_id: ${billingId}`);

    // Buscar o payment
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("id, registration_id, billing_id, status")
      .eq("billing_id", billingId)
      .single();

    if (fetchError || !payment) {
      console.error("❌ Payment não encontrado");
      return;
    }

    console.log(`✅ Payment encontrado: ${payment.id}`);
    console.log(`   Status atual: ${payment.status}`);

    if (payment.status === "confirmed") {
      console.log("ℹ️ Payment já estava confirmado");
      return;
    }

    // Tentar atualizar payment
    console.log(`\n🔄 Confirmando payment...`);

    const { data: updated, error: updateError } = await supabase
      .from("payments")
      .update({
        status: "confirmed"
      })
      .eq("id", payment.id)
      .select();

    if (updateError) {
      console.error("❌ Erro ao atualizar payment:", updateError.message);
      console.log("\n💡 Solução: Configure SUPABASE_SERVICE_ROLE_KEY no .env");
      return;
    }

    console.log("✅ Payment confirmado!");

    // Atualizar registration
    console.log(`\n🔄 Confirmando registration...`);

    const { data: regUpdated, error: regError } = await supabase
      .from("event_registrations")
      .update({ status: "confirmed" })
      .eq("id", payment.registration_id)
      .select();

    if (regError) {
      console.error("❌ Erro ao atualizar registration:", regError.message);
      return;
    }

    console.log("✅ Registration confirmada!");
    console.log("\n🎉 Pagamento confirmado com sucesso!\n");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

// Pegar billing_id do argumento de linha de comando
const billingId = process.argv[2];
confirmPaymentByBillingId(billingId);
