import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Validar método HTTP
  if (req.method === "OPTIONS") {
    return new Response("OK", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();

    console.log("Webhook recebido:", JSON.stringify(body, null, 2));

    // AbacatePay envia status de pagamento
    // Eventos possíveis: billing.created, billing.paid, billing.failed, billing.expired, billing.refunded
    const { event, data } = body;

    if (!event || !data) {
      return new Response("Invalid payload", { status: 400 });
    }

    const billingId = data.id;
    const billingStatus = data.status?.toLowerCase();

    if (!billingId || !billingStatus) {
      return new Response("Missing billing data", { status: 400 });
    }

    // Buscar pagamento no banco de dados
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("billing_id", billingId)
      .single();

    if (paymentError) {
      console.error("Erro ao buscar pagamento:", paymentError);
      return new Response("Payment not found", { status: 404 });
    }

    // Mapear status do AbacatePay para app
    const statusMap: Record<string, string> = {
      pending: "pending",
      paid: "paid",
      failed: "failed",
      expired: "expired",
      refunded: "refunded",
    };

    const appStatus = statusMap[billingStatus] || billingStatus;

    // Atualizar status do pagamento
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        status: appStatus,
        paid_at: appStatus === "paid" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("billing_id", billingId);

    if (updatePaymentError) {
      console.error("Erro ao atualizar pagamento:", updatePaymentError);
      return new Response("Failed to update payment", { status: 500 });
    }

    // Se pagamento foi confirmado, confirmar inscrição
    if (appStatus === "paid") {
      const { error: registrationError } = await supabase
        .from("event_registrations")
        .update({
          status: "confirmed",
          payment_processed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.registration_id);

      if (registrationError) {
        console.error("Erro ao confirmar inscrição:", registrationError);
        return new Response("Failed to confirm registration", { status: 500 });
      }

      console.log(
        `Inscrição ${payment.registration_id} confirmada após pagamento`
      );

      // TODO: Enviar email de confirmação para o usuário
      // const emailService = new EmailService();
      // await emailService.sendConfirmationEmail(payment.registration_email);
    }

    // Se pagamento falhou, cancelar inscrição
    if (appStatus === "failed" || appStatus === "expired") {
      const { error: cancelError } = await supabase
        .from("event_registrations")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.registration_id);

      if (cancelError) {
        console.error("Erro ao cancelar inscrição:", cancelError);
      }

      console.log(
        `Inscrição ${payment.registration_id} cancelada (status: ${appStatus})`
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Webhook processado: ${event}`,
        payment_status: appStatus,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro no webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
