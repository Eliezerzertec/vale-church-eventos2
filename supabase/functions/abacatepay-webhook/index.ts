import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const resendFrom = Deno.env.get("RESEND_FROM") || "no-reply@igreja.local";
const webhookSecret = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET") || "qwe123123";

// Public key do AbacatePay (da documentação oficial)
// ⚠️ TODO: Atualizar com a chave real do AbacatePay
const ABACATEPAY_PUBLIC_KEY = Deno.env.get("ABACATEPAY_PUBLIC_KEY") || 
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNH";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verifica assinatura HMAC-SHA256 do AbacatePay (Fase 2)
 */
const verifyAbacateSignature = (rawBody: string, signatureFromHeader: string): boolean => {
  try {
    // 1. Converter body em buffer
    const bodyBuffer = new TextEncoder().encode(rawBody);
    
    // 2. Calcular HMAC-SHA256
    const keyBuffer = new TextEncoder().encode(ABACATEPAY_PUBLIC_KEY);
    
    // Usar Web Crypto API (funciona em Deno)
    const hmac = crypto.subtle.sign("HMAC", 
      crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      bodyBuffer
    );
    
    // Wait for async operation
    return hmac.then(sig => {
      const calculatedSig = btoa(String.fromCharCode(...new Uint8Array(sig)));
      
      const isValid = calculatedSig === signatureFromHeader;
      
      if (!isValid) {
        console.error("❌ Assinatura HMAC inválida");
        console.error("  Esperado:", signatureFromHeader?.slice(0, 20) + "...");
        console.error("  Calculado:", calculatedSig.slice(0, 20) + "...");
      } else {
        console.log("✅ Assinatura HMAC validada com sucesso");
      }
      
      return isValid;
    }).catch(error => {
      console.error("Erro ao verificar HMAC:", error);
      return false;
    });
  } catch (error) {
    console.error("Erro ao verificar HMAC:", error);
    return false;
  }
};

/**
 * Valida a autenticação do webhook (2 Layer)
 * Layer 1: Query string secret parameter (oficial)
 * Layer 2: HMAC-SHA256 signature (oficial)
 */
const validateWebhookSecret = (req: Request): boolean => {
  // 1. Tentar Query String PRIMEIRO (oficial)
  const url = new URL(req.url);
  const secretFromUrl = url.searchParams.get("webhookSecret");
  
  // 2. Fallback para Headers
  const secretFromHeader = req.headers.get("X-Webhook-Secret") || 
                          req.headers.get("x-webhook-secret") ||
                          req.headers.get("Authorization")?.replace("Bearer ", "");
  
  const secret = secretFromUrl || secretFromHeader;
  
  if (!secret) {
    console.warn("⚠️ Webhook sem header de autenticação");
    return false;
  }

  const isValid = secret === webhookSecret;
  
  if (!isValid) {
    console.error("❌ Webhook com secret inválido");
  } else {
    console.log("✅ Webhook autenticado com sucesso");
  }

  return isValid;
};

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

/**
 * Log webhook para monitoramento
 */
const logWebhook = async (
  event: string,
  billingId: string,
  requestBody: any,
  status: string,
  errorMessage?: string
) => {
  try {
    await supabase.from("webhook_logs").insert({
      event,
      billing_id: billingId,
      request_body: requestBody,
      response_status: status,
      error_message: errorMessage || null,
    });
  } catch (error) {
    console.warn("Erro ao registrar log de webhook:", error);
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
    // ✅ Fase 1: Ler raw body ANTES de qualquer parse (para HMAC)
    const rawBody = await req.text();
    
    console.log("📨 [Fase 1] Webhook recebido (raw):\n", rawBody.slice(0, 500));

    // ✅ Validar autenticação básica do webhook
    if (!validateWebhookSecret(req)) {
      await logWebhook("WEBHOOK_UNAUTHORIZED", "", {}, "401", "Secret inválido ou ausente");
      return new Response("Unauthorized", { status: 401 });
    }

    // ✅ Fase 2: Validar assinatura HMAC-SHA256 (Oficial)
    const signature = req.headers.get("x-webhook-signature") || 
                      req.headers.get("X-Webhook-Signature");
    
    if (signature) {
      const isValidSignature = await verifyAbacateSignature(rawBody, signature);
      if (!isValidSignature) {
        await logWebhook("WEBHOOK_INVALID_SIGNATURE", "", {}, "401", "Assinatura HMAC inválida");
        return new Response("Unauthorized: Invalid signature", { status: 401 });
      }
    } else {
      console.warn("⚠️ Webhook sem header X-Webhook-Signature (ainda aceitando, mas recomenda-se usar)");
    }

    // ✅ Parse JSON DEPOIS de validar
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      await logWebhook("WEBHOOK_PARSE_ERROR", "", {}, "400", parseError.message);
      return new Response("Invalid JSON", { status: 400 });
    }

    console.log("✅ [Fase 1] Webhook parsado:", JSON.stringify(body, null, 2));

    // ✅ Extrair event ID e tipo (for Phases 3 & 4)
    const webhookId = body.id;  // "log_12345abcdef"
    const event = body.event;   // "billing.paid"
    const devMode = body.devMode || false;

    console.log(`[Webhook ${webhookId}] Evento: ${event}, DevMode: ${devMode}`);

    if (!event) {
      await logWebhook("INVALID_PAYLOAD", "", body, "400", "Falta campo 'event'");
      return new Response("Invalid payload: missing event", { status: 400 });
    }

    // ✅ Fase 3: Verificar idempotência (não processar duplicatas)
    if (webhookId) {
      try {
        const { data: existing } = await supabase
          .from("webhook_events")
          .select("id, status")
          .eq("id", webhookId)
          .maybeSingle();
        
        if (existing) {
          console.log(`⏭️  Webhook ${webhookId} já foi processado (status: ${existing.status})`);
          
          // Retornar 200 OK mesmo assim (idempotent)
          return new Response(
            JSON.stringify({ 
              ok: true, 
              message: `Webhook já processado: ${existing.status}`,
              webhookId 
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch (error) {
        console.warn("⚠️ Erro ao verificar idempotência (continuando anyway):", error);
      }
    }

    // ✅ Fase 4: Verificar devMode (ambiente)
    if (devMode) {
      console.log("ℹ️ Webhook de DESENVOLVIMENTO (teste)");
      
      if (Deno.env.get("ENVIRONMENT") === "production") {
        console.log("⏭️  Ignorando evento de desenvolvimento em produção");
        
        if (webhookId) {
          try {
            await supabase.from("webhook_events").insert({
              id: webhookId,
              event: event,
              status: "skipped",
              payload: body
            }).catch(() => {});
          } catch (e) {}
        }
        
        return new Response(
          JSON.stringify({ 
            ok: true, 
            message: "Evento de dev ignorado em produção",
            webhookId 
          }),
          { status: 200 }
        );
      }
      
      console.log("🧪 [DEV MODE] Processando evento de teste");
    }

    // ✅ Validar payload básico
    const { data } = body;

    if (!data) {
      await logWebhook("INVALID_PAYLOAD", "", body, "400", "Payload inválido: falta 'data'");
      return new Response("Invalid payload: missing data", { status: 400 });
    }

    // Extrair dados do novo formato AbacatePay
    // Format: data.billing.id, data.billing.status, data.payment.method
    const billingId = data.billing?.id || data.id;
    const billingStatus = (data.billing?.status || data.status || "").toLowerCase();
    const paymentMethod = data.payment?.method || "PIX";
    const eventId = data.billing?.products?.[0]?.externalId;

    if (!billingId || !billingStatus) {
      return new Response("Missing billing data", { status: 400 });
    }

    // Buscar pagamento no banco de dados
    let paymentData = null;
    let paymentError = null;

    // Tenta primeiro por billing_id
    const { data: payment1, error: error1 } = await supabase
      .from("payments")
      .select("*")
      .eq("billing_id", billingId)
      .single();

    if (!error1 && payment1) {
      paymentData = payment1;
    } else {
      // Fallback: tenta por transaction_id
      const { data: payment2, error: error2 } = await supabase
        .from("payments")
        .select("*")
        .eq("transaction_id", billingId)
        .single();

      if (!error2 && payment2) {
        paymentData = payment2;
      } else {
        paymentError = error1 || error2;
      }
    }

    if (paymentError) {
      console.error("Erro ao buscar pagamento:", paymentError);
      return new Response("Payment not found", { status: 404 });
    }

    if (!paymentData) {
      console.error("Pagamento não encontrado para billing_id:", billingId);
      return new Response("Payment not found", { status: 404 });
    }

    const payment = paymentData;

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
        billing_id: billingId,
        payment_method: paymentMethod,
        event_id: eventId,
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

    // ✅ Fase 3: Registrar como processado (sucesso)
    if (webhookId) {
      try {
        const billingIdToMap = data.billing?.id || data.pixQrCode?.id || data.id;
        
        await supabase.from("webhook_events").insert({
          id: webhookId,
          event: event,
          status: "processed",
          payload: body
        });
        
        // Se tiver billing_id, mapear também
        if (billingIdToMap) {
          await supabase.from("webhook_billing_map").insert({
            webhook_id: webhookId,
            billing_id: billingIdToMap
          }).catch(() => {}); // Ignore duplicates
        }
      } catch (error) {
        console.warn("Erro ao registrar webhook_events:", error);
        // Continua mesmo se falhar (webhook já foi processado)
      }
    }
    
    // Log sucesso
    await logWebhook(event, billingId, { event, data }, "200", undefined);

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Webhook processado: ${event}`,
        payment_status: appStatus,
        webhookId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro no webhook:", error);
    
    // ✅ Fase 3: Registrar falha
    try {
      // Can't access body here safely, just log the error
      console.warn("Falha no processamento do webhook");
    } catch (logError) {
      console.warn("Erro ao registrar falha:", logError);
    }
    
    // Retornar erro apropriado (para retry)
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
