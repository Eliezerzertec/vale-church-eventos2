/**
 * Script simples para atualizar status de pagamentos
 * Use isto para simular confirmação de pagamento nos testes
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cwzmiznlvhhnpjgxgsme.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updatePaymentStatus() {
  try {
    console.log('\n📋 === Atualizar Status de Pagamentos ===\n');

    // 1. Listar todos os pagamentos pendentes
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, billing_id, registration_id, status, registration_name, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar pagamentos:', error.message);
      return;
    }

    if (payments.length === 0) {
      console.log('✅ Nenhum pagamento pendente encontrado');
      rl.close();
      return;
    }

    console.log(`📦 Encontrados ${payments.length} pagamentos pendentes:\n`);
    payments.forEach((p, i) => {
      const createdAt = new Date(p.created_at).toLocaleString('pt-BR');
      console.log(`${i + 1}. ${p.registration_name || 'Sem nome'}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Billing: ${p.billing_id}`);
      console.log(`   Criado em: ${createdAt}\n`);
    });

    // 2. Perguntar qual atualizar
    const choice = await question('Qual você quer atualizar? (número ou "all" para todos): ');

    let paymentsToUpdate = [];

    if (choice.toLowerCase() === 'all') {
      paymentsToUpdate = payments;
    } else {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < payments.length) {
        paymentsToUpdate = [payments[index]];
      } else {
        console.log('❌ Opção inválida');
        rl.close();
        return;
      }
    }

    // 3. Escolher novo status
    console.log('\nNovos status disponíveis:');
    console.log('1. paid (Confirmado)');
    console.log('2. failed (Falhou)');
    console.log('3. pending (Manter como está)');
    const statusChoice = await question('\nEscolha o novo status (1-3): ');

    const statusMap = {
      '1': 'paid',
      '2': 'failed',
      '3': 'pending',
    };

    const newStatus = statusMap[statusChoice];
    if (!newStatus) {
      console.log('❌ Opção inválida');
      rl.close();
      return;
    }

    if (newStatus === 'pending') {
      console.log('⚠️ Nenhuma atualização necessária');
      rl.close();
      return;
    }

    // 4. Confirmar
    console.log(`\n⚠️ Você vai atualizar ${paymentsToUpdate.length} pagamento(s) para: ${newStatus}`);
    const confirm = await question('Tem certeza? (s/n): ');

    if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'sim') {
      console.log('❌ Cancelado');
      rl.close();
      return;
    }

    // 5. Atualizar
    console.log('\n⏳ Atualizando...\n');
    let updated = 0;

    for (const payment of paymentsToUpdate) {
      const regStatus = newStatus === 'paid' ? 'confirmed' : newStatus === 'failed' ? 'rejected' : 'pending';

      // Atualizar payments
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      if (paymentError) {
        console.error(`❌ Erro ao atualizar payment ${payment.id}:`, paymentError.message);
        continue;
      }

      // Atualizar registration
      const { error: regError } = await supabase
        .from('event_registrations')
        .update({
          status: regStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.registration_id);

      if (regError) {
        console.error(`❌ Erro ao atualizar registration ${payment.registration_id}:`, regError.message);
        continue;
      }

      console.log(`✅ Atualizado: ${payment.registration_name || 'Sem nome'} → ${newStatus}`);
      updated++;
    }

    console.log(`\n✅ ${updated} pagamento(s) atualizado(s) com sucesso!`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    rl.close();
  }
}

updatePaymentStatus();
