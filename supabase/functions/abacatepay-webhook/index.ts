import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const resendFrom = Deno.env.get("RESEND_FROM") || "no-reply@igreja.local";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sendConfirmationEmail = async (
  to: string | null,
  name: string | null,
  eventTitle: string | null
) => {
  if (!to) return;
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY não configurada; email não enviado");
    return;
  }

  const subject = eventTitle
    ? `Pagamento confirmado: ${eventTitle}`
    : "Pagamento confirmado";

  const safeName = name || "";
  const html = `
    <p>Olá ${safeName || ""},</p>
    <p>Recebemos a confirmação do seu pagamento.</p>
    ${eventTitle ? `<p>Evento: <strong>${eventTitle}</strong></p>` : ""}
    <p>Sua inscrição está confirmada. Nos vemos lá!</p>
  `;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [to],
      subject,
      html,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Erro ao enviar email de confirmação:", text);
  }
};

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

      // Enviar email de confirmação (best effort)
      let eventTitle: string | null = null;
      if (payment.event_id) {
        const { data: eventData } = await supabase
          .from("events")
          .select("title")
          .eq("id", payment.event_id)
          .maybeSingle();
        eventTitle = eventData?.title || null;
      }

      await sendConfirmationEmail(
        payment.registration_email || null,
        payment.registration_name || null,
        eventTitle
      );
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
