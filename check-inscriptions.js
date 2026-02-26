/**
 * Script para verificar status das inscrições com pagamentos
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkInscriptions() {
  try {
    console.log('\n📊 === Status das Inscrições ===\n');

    // Buscar todas as inscrições com dados de pagamento
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('id, full_name, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erro:', error.message);
      return;
    }

    if (registrations.length === 0) {
      console.log('Nenhuma inscrição encontrada');
      return;
    }

    console.log(`Total de inscrições: ${registrations.length}\n`);

    const statuses = {
      confirmed: 0,
      pending: 0,
      rejected: 0,
      other: 0,
    };

    registrations.forEach((reg) => {
      const statusEmoji = {
        confirmed: '✅',
        pending: '⏳',
        rejected: '❌',
      }[reg.status] || '❓';

      console.log(`${statusEmoji} ${reg.full_name}`);
      console.log(`   Email: ${reg.email}`);
      console.log(`   Status: ${reg.status}\n`);

      if (reg.status === 'confirmed') statuses.confirmed++;
      else if (reg.status === 'pending') statuses.pending++;
      else if (reg.status === 'rejected') statuses.rejected++;
      else statuses.other++;
    });

    console.log('📈 RESUMO:');
    console.log(`✅ Confirmadas: ${statuses.confirmed}`);
    console.log(`⏳ Pendentes: ${statuses.pending}`);
    console.log(`❌ Rejeitadas: ${statuses.rejected}`);
    if (statuses.other > 0) console.log(`❓ Outros: ${statuses.other}`);

  } catch (error) {
    console.error('❌ Erro Fatal:', error.message);
  }
}

checkInscriptions();
