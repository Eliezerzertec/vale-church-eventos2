UPDATE payments 
SET status = 'paid' 
WHERE billing_id LIKE 'bill_%' 
LIMIT 1;/**
 * 🧪 Teste Manual sem Webhook Deploy
 * Script que:
 * 1. Cria um evento
 * 2. Cria uma inscrição (registration)
 * 3. Cria um pagamento de teste
 * 4. Simula o pagamento sendo confirmado após 5 segundos
 * 5. Você vê a página de confirmação atualizar em tempo real
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://cwzmiznlvhhnpjgxgsme.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3em1pem5sdmhobnBqZ3hnc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5NzcsImV4cCI6MjA4NzA5Mjk3N30.nsXSSPW2yajdEy-iFlDmtIH-AltsNZ3n8BcNkqTJ4F4'
);

async function testPaymentWithoutWebhook() {
  try {
    console.log('\n🧪 TESTE DE PAGAMENTO SEM WEBHOOK DEPLOY');
    console.log('========================================\n');

    // 1️⃣ Criar um evento de teste
    console.log('✅ Step 1: Criando evento de teste...');
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 7);

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({
        title: '🎉 Teste de Pagamento - Culto de Celebração',
        description: 'Evento de teste para verificar integração de pagamento',
        event_date: eventDate.toISOString(),
        location: 'Vale Church Lavras - MG',
        price: '100.00', // R$ 100,00
        max_registrations: 100,
        is_active: true,
      })
      .select('id')
      .single();

    if (eventError) {
      console.error('❌ Erro ao criar evento:', eventError);
      return;
    }

    const eventId = eventData.id;
    console.log(`✅ Evento criado: ${eventId}`);
    console.log();

    // 2️⃣ Criar uma inscrição de teste
    console.log('✅ Step 2: Criando inscrição de teste...');
    const { data: regData, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        full_name: 'João da Graça',
        email: 'joao@example.com',
        phone: '(35) 99999-9999',
        cpf: '123.456.789-00',
        status: 'pending', // Ainda não pagou
      })
      .select('id')
      .single();

    if (regError) {
      console.error('❌ Erro ao criar inscrição:', regError);
      return;
    }

    const registrationId = regData.id;
    console.log(`✅ Inscrição criada: ${registrationId}`);
    console.log();

    // 3️⃣ Criar um pagamento de teste
    console.log('✅ Step 3: Criando pagamento de teste...');
    const billingId = `bill_test_${Date.now()}`;
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        registration_id: registrationId,
        event_id: eventId,
        amount: 100.00, // R$ 100,00
        status: 'pending', // Começa como pendente
        billing_id: billingId,
        payment_method: 'PIX',
        receipt_url: `https://app.abacatepay.com/receipt/${billingId}`,
      })
      .select('id')
      .single();

    if (paymentError) {
      console.error('❌ Erro ao criar pagamento:', paymentError);
      return;
    }

    console.log(`✅ Pagamento criado: ${billingId}`);
    console.log(`   Status inicial: pending`);
    console.log();

    // 4️⃣ Instruções para testar
    console.log('🔗 PRÓXIMAS AÇÕES:');
    console.log('=========================================');
    console.log(`\n1. Abra o navegador em:
   http://localhost:8080/payment-confirmation/${eventId}?registration_id=${registrationId}&billing_id=${billingId}\n`);
    
    console.log('2. Você verá a página de confirmação com status "Pendente"');
    console.log('   (A página está fazendo polling a cada 3 segundos)\n');

    console.log('3. Em 5 segundos, vou simular o pagamento sendo confirmado...\n');

    // 5️⃣ Aguardar 5 segundos e depois simular confirmação
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('⚡ Step 4: Simulando pagamento confirmado...');
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_method: 'PIX',
        transaction_id: `pix_${Date.now()}`,
        updated_at: new Date().toISOString(),
      })
      .eq('billing_id', billingId);

    if (updateError) {
      console.error('❌ Erro ao confirmar pagamento:', updateError);
      return;
    }

    console.log('✅ Pagamento confirmado no banco de dados!');
    console.log(`   Status: PAID ✅`);
    console.log();

    // 6️⃣ Também confirmar a inscrição
    console.log('✅ Confirmando inscrição...');
    await supabase
      .from('event_registrations')
      .update({ status: 'confirmed' })
      .eq('id', registrationId);

    console.log();
    console.log('🎉 TESTE COMPLETO!');
    console.log('=========================================');
    console.log('\n📋 O que você deve ver agora:');
    console.log('   1. A página de confirmação detecta a mudança via polling');
    console.log('   2. Muda de "Aguardando Confirmação" para "Pagamento Confirmado"');
    console.log('   3. Mostra mensagem de agradecimento');
    console.log('   4. Exibe comprovante de pagamento');
    console.log();

    console.log('📊 Dados de teste:');
    console.log(`   Evento ID:       ${eventId}`);
    console.log(`   Registration ID: ${registrationId}`);
    console.log(`   Billing ID:      ${billingId}`);
    console.log(`   Participante:    João da Graça`);
    console.log(`   Email:           joao@example.com`);
    console.log(`   Valor:           R$ 100.00`);
    console.log();

    console.log('🔄 Próximas ações:');
    console.log('   1. Se backend webhook for deployado, teste com webhook real');
    console.log('      Comando: npx supabase functions deploy abacatepay-webhook');
    console.log('   2. Teste com AbacatePay de verdade usando dados reais');
    console.log();

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    process.exit(1);
  }
}

testPaymentWithoutWebhook();
