import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  // Incluir todos os headers que o client envia (maiusc/minusc para evitar rejeição)
  "Access-Control-Allow-Headers": [
    "Content-Type",
    "Authorization",
    "authorization",
    "apikey",
    "ApiKey",
    "X-API-Key",
    "x-api-key",
    "X-Client-Info",
    "Prefer",
  ].join(", "),
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    // Preflight precisa status 200 e headers; não parseia body
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const { method, endpoint, body, apiKey } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key não fornecida" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔄 Proxy AbacatePay:", {
      method,
      endpoint,
      apiKeyPrefix: apiKey.substring(0, 10),
    });

    const url = `https://api.abacatepay.com/v1${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        // Conforme docs: Authorization: Bearer <apiKey>
        Authorization: `Bearer ${apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();

    console.log("✅ Proxy Response:", {
      status: response.status,
      body: responseData,
    });

    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Proxy Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Erro no proxy",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
