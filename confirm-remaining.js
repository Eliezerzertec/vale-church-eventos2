/**
 * Confirmar inscrições pendentes (mais robusto)
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function confirmRemaining() {
  try {
    console.log('\n🔄 === Confirmar Inscrições Pendentes ===\n');

    // Buscar inscrições pendentes
    const { data: pending, error } = await supabase
      .from('event_registrations')
      .select('id, full_name')
      .eq('status', 'pending');

    if (error) {
      console.error('❌ Erro:', error.message);
      return;
    }

    if (pending.length === 0) {
      console.log('✅ Todas as inscrições já estão confirmadas!');
      return;
    }

    console.log(`📦 Encontradas ${pending.length} inscrições pendentes\n`);

    console.log('💾 Confirmando...\n');
    let confirmed = 0;

    for (const item of pending) {
      const { error: err } = await supabase
        .from('event_registrations')
        .update({ status: 'confirmed' })
        .eq('id', item.id);

      if (err) {
        console.error(`❌ ${item.full_name}:`, err.message);
      } else {
        console.log(`✅ ${item.full_name}`);
        confirmed++;
      }
    }

    console.log(`\n✅ ${confirmed}/${pending.length} confirmadas com sucesso!`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

confirmRemaining();
