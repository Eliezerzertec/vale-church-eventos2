#!/usr/bin/env node

/**
 * Monitor de Webhooks do AbacatePay
 * 
 * Script para monitorar webhooks em tempo real
 * 
 * Uso:
 *   node monitor-webhooks.js
 * 
 * O script fará polling a cada 3 segundos para buscar novos webhooks
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const POLL_INTERVAL = 3000; // 3 segundos
let lastEventTime = null;

async function fetchWebhookLogs() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/webhook/logs`);
    const result = await response.json();

    if (result.error) {
      console.error('❌ Erro:', result.error);
      return;
    }

    const logs = result.data || [];

    if (logs.length === 0) {
      console.log('⏳ Aguardando webhooks... (nenhum log ainda)');
      return;
    }

    // Mostrar apenas logs novos desde a última verificação
    const newLogs = lastEventTime
      ? logs.filter(log => new Date(log.created_at) > lastEventTime)
      : logs.slice(0, 5); // Mostrar últimos 5 na primeira vez

    if (newLogs.length > 0) {
      console.log(`\n📥 ${newLogs.length} novo(s) evento(s) detectado(s):\n`);

      newLogs.forEach((log, index) => {
        const createdAt = new Date(log.created_at).toLocaleString('pt-BR');
        const statusColor = log.response_status === '200' ? '✅' : '❌';

        console.log(`${index + 1}. ${statusColor} [${createdAt}]`);
        console.log(`   Evento: ${log.event}`);
        console.log(`   ID Cobrança: ${log.billing_id}`);
        console.log(`   Status HTTP: ${log.response_status}`);

        if (log.error_message) {
          console.log(`   ⚠️  Erro: ${log.error_message}`);
        }

        if (log.request_body) {
          console.log(`   Payload: ${JSON.stringify(log.request_body).substring(0, 100)}...`);
        }

        console.log('');
      });

      // Atualizar tempo do último evento
      if (newLogs.length > 0) {
        lastEventTime = new Date(newLogs[0].created_at);
      }
    } else {
      process.stdout.write('.');
    }
  } catch (error) {
    console.error(`\n❌ Erro ao conectar: ${error.message}`);
    console.error(`   Backend URL: ${BACKEND_URL}`);
    console.error(`   Certifique-se que o servidor está rodando: npm run dev:backend\n`);
  }
}

async function main() {
  console.log('🔍 Monitor de Webhooks do AbacatePay');
  console.log(`⚙️  Backend: ${BACKEND_URL}`);
  console.log(`⏱️  Polling a cada ${POLL_INTERVAL / 1000}s\n`);
  console.log('Aguardando webhooks...\n');

  // Fazer primeira verificação
  await fetchWebhookLogs();

  // Fazer polling a cada intervalo
  setInterval(fetchWebhookLogs, POLL_INTERVAL);
}

main();
