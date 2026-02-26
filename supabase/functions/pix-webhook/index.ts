import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("PIX Webhook received:", JSON.stringify(payload));

    // Expected payload: { transaction_id, registration_id, status, amount }
    const { transaction_id, registration_id, status } = payload;

    if (!transaction_id && !registration_id) {
      return new Response(
        JSON.stringify({ error: "transaction_id or registration_id required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update payment status
    let query = supabase.from("payments").update({
      status: status === "paid" ? "paid" : "failed",
      paid_at: status === "paid" ? new Date().toISOString() : null,
      transaction_id: transaction_id || null,
    });

    if (transaction_id) {
      query = query.eq("transaction_id", transaction_id);
    } else {
      query = query.eq("registration_id", registration_id);
    }

    const { data: updatedPayments, error: paymentError } = await query.select("registration_id");

    if (paymentError) {
      console.error("Payment update error:", paymentError);
      throw paymentError;
    }

    // If paid, confirm the registration
    if (status === "paid" && updatedPayments && updatedPayments.length > 0) {
      const regId = updatedPayments[0].registration_id;
      const { error: regError } = await supabase
        .from("event_registrations")
        .update({ status: "confirmed" })
        .eq("id", regId);

      if (regError) {
        console.error("Registration update error:", regError);
      }
    }

    console.log("PIX Webhook processed successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Payment processed" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
