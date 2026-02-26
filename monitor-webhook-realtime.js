import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cwzmiznlvhhnpjgxgsme.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3em1pem5sdmhobnBqZ3hnc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5NzcsImV4cCI6MjA4NzA5Mjk3N30.nsXSSPW2yajdEy-iFlDmtIH-AltsNZ3n8BcNkqTJ4F4";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔍 Monitorando webhooks em tempo real...\n");

// Inscrever em mudanças em tempo real na tabela webhook_logs
const channel = supabase
  .channel("webhook_logs_realtime")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "webhook_logs",
    },
    (payload) => {
      const { new: newLog, eventType } = payload;

      if (eventType === "INSERT") {
        console.log("\n✨ [NOVO WEBHOOK RECEBIDO]");
        console.log("═══════════════════════════════════════");
        console.log(`⏰ Hora: ${new Date(newLog.created_at).toLocaleString("pt-BR")}`);
        console.log(`📌 Evento: ${newLog.event}`);
        console.log(`💳 Billing ID: ${newLog.billing_id}`);
        console.log(`📊 Status: ${newLog.response_status}`);

        if (newLog.response_status === "200") {
          console.log("✅ SUCESSO");
        } else if (newLog.response_status === "400") {
          console.log("❌ ERRO: " + newLog.error_message);
        } else {
          console.log("⚠️ Status: " + newLog.response_status);
        }

        if (newLog.request_body && Object.keys(newLog.request_body).length > 0) {
          console.log("\n📦 Dados do webhook:");
          console.log(JSON.stringify(newLog.request_body, null, 2).substring(0, 500));
        }

        console.log("═══════════════════════════════════════\n");
      }
    }
  )
  .subscribe((status) => {
    console.log(`📡 Status da conexão: ${status}`);

    if (status === "SUBSCRIBED") {
      console.log("✅ Conectado e aguardando webhooks...\n");
    }
  });

// Limpar ao pressionar Ctrl+C
process.on("SIGINT", () => {
  console.log("\n\n🛑 Encerrando monitoramento...");
  supabase.removeChannel(channel);
  process.exit(0);
});
