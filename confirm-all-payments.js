/**
 * Script automático para confirmar todos os pagamentos pendentes
 * Use isto para simular aprovação em testes
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cwzmiznlvhhnpjgxgsme.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function confirmAllPayments() {
  try {
    console.log('\n🚀 === Confirmar Todos os Pagamentos Pendentes ===\n');

    // Buscar todos os pagamentos pendentes
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, billing_id, registration_id, registration_name, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar pagamentos:', error.message);
      return;
    }

    if (payments.length === 0) {
      console.log('✅ Nenhum pagamento pendente para confirmar');
      return;
    }

    console.log(`📦 Encontrados ${payments.length} pagamento(s) pendente(s)\n`);
    payments.forEach((p, i) => {
      console.log(`${i + 1}. ${p.registration_name || 'Sem nome'}`);
      console.log(`   Billing: ${p.billing_id}\n`);
    });

    console.log('💾 Confirmando todos...\n');
    let updated = 0;

    for (const payment of payments) {
      try {
        // Atualizar payments
        const { error: paymentError } = await supabase
          .from('payments')
          .update({
            status: 'paid',
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
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.registration_id);

        if (regError) {
          console.error(`❌ Erro ao atualizar registration ${payment.registration_id}:`, regError.message);
          continue;
        }

        console.log(`✅ Confirmado: ${payment.registration_name || 'Sem nome'}`);
        updated++;
      } catch (err) {
        console.error(`❌ Erro ao processar ${payment.id}:`, err.message);
      }
    }

    console.log(`\n✅ ${updated}/${payments.length} pagamento(s) confirmado(s) com sucesso!`);

    // Buscar atualizado para mostrar
    const { data: updated_regs } = await supabase
      .from('event_registrations')
      .select('full_name, status, payment_status')
      .eq('status', 'confirmed')
      .limit(5);

    if (updated_regs && updated_regs.length > 0) {
      console.log(`\n📋 Últimas inscrições confirmadas:`);
      updated_regs.forEach((reg) => {
        console.log(`   • ${reg.full_name} (${reg.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro Fatal:', error.message);
  }
}

confirmAllPayments();
