import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestEvent() {
  try {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 7); // 7 dias a partir de hoje
    
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          title: '🎉 Culto de Celebração - Teste',
          description: 'Evento de teste para fluxo completo de pagamento com AbacatePay',
          event_date: eventDate.toISOString(),
          location: 'Vale Church Lavras - MG',
          max_registrations: 100,
          is_active: true,
        },
      ])
      .select();

    if (error) {
      console.error('❌ Erro ao criar evento:', error);
      return;
    }

    console.log('✅ Evento criado com sucesso!');
    console.log('📌 ID do evento:', data[0].id);
    console.log('📅 Data:', data[0].event_date);
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

createTestEvent();
