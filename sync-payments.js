/**
 * Script para sincronizar status de pagamentos com AbacatePay
 * Verifica o status real no AbacatePay e atualiza o banco de dados
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cwzmiznlvhhnpjgxgsme.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const ABACATEPAY_KEY = process.env.VITE_ABACATEPAY_KEY;
const ABACATEPAY_API = 'https://api.abacatepay.com/v1';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Verifica o status de um pagamento no AbacatePay
 */
async function checkPaymentStatusAbacatepay(billingId) {
  try {
    console.log(`🔍 Verificando status do billing: ${billingId}`);
    
    const response = await fetch(`${ABACATEPAY_API}/billing/${billingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error(`❌ Erro ao verificar billing ${billingId}:`);
      console.error(`   Status HTTP: ${response.status}`);
      console.error(`   Erro: ${data.error || data.message}`);
      console.error(`   Chave API (primeiros 20): ${ABACATEPAY_KEY?.substring(0, 20)}...`);
      return null;
    }

    const billing = data.data || data;
    console.log(`📊 Status no AbacatePay: ${billing.status}`);
    
    return {
      status: billing.status, // PENDING, PAID, FAILED, REFUNDED, etc
      devMode: billing.devMode,
      updatedAt: billing.updatedAt,
    };
  } catch (error) {
    console.error(`❌ Erro ao buscar status:`, error.message);
    return null;
  }
}

/**
 * Sincroniza um pagamento: verifica no AbacatePay e atualiza no banco
 */
async function syncPayment(payment) {
  const { id, billing_id, registration_id, status: currentStatus } = payment;

  console.log(`\n📋 Sincronizando pagamento ID: ${id}`);
  console.log(`   Billing ID: ${billing_id}`);
  console.log(`   Status atual: ${currentStatus}`);

  // Verificar status no AbacatePay
  const abacatepayStatus = await checkPaymentStatusAbacatepay(billing_id);
  
  if (!abacatepayStatus) {
    console.warn(`⚠️ Não conseguiu verificar status no AbacatePay`);
    return false;
  }

  // Mapear status AbacatePay para status local
  const statusMap = {
    'PENDING': 'pending',
    'PAID': 'paid',
    'FAILED': 'failed',
    'REFUNDED': 'refunded',
    'EXPIRED': 'expired',
    'CANCELLED': 'cancelled',
  };

  const newStatus = statusMap[abacatepayStatus.status] || currentStatus;

  // Se o status mudou, atualizar banco de dados
  if (newStatus !== currentStatus) {
    console.log(`✅ Status mudou de "${currentStatus}" para "${newStatus}"`);

    // 1. Atualizar tabela payments
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (paymentError) {
      console.error(`❌ Erro ao atualizar payments:`, paymentError.message);
      return false;
    }

    // 2. Atualizar tabela event_registrations
    const regStatus = newStatus === 'paid' ? 'confirmed' : newStatus === 'failed' ? 'rejected' : 'pending';
    
    const { error: regError } = await supabase
      .from('event_registrations')
      .update({ 
        status: regStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registration_id);

    if (regError) {
      console.error(`❌ Erro ao atualizar registration:`, regError.message);
      return false;
    }

    console.log(`✅ Registro atualizado com sucesso!`);
    return true;
  } else {
    console.log(`ℹ️ Status não mudou, nenhuma atualização necessária`);
    return false;
  }
}

/**
 * Função principal: sincroniza todos os pagamentos pendentes
 */
async function syncAllPayments() {
  console.log('🚀 Iniciando sincronização de pagamentos...\n');

  try {
    // 1. Buscar todos os pagamentos pendentes
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar pagamentos:', error.message);
      return;
    }

    console.log(`📦 Encontrados ${payments.length} pagamentos pendentes\n`);

    if (payments.length === 0) {
      console.log('✅ Nenhum pagamento pendente para sincronizar');
      return;
    }

    // 2. Sincronizar cada pagamento
    let updated = 0;
    let failed = 0;

    for (const payment of payments) {
      const success = await syncPayment(payment);
      if (success) {
        updated++;
      } else {
        failed++;
      }
      
      // Pequeno delay entre requisições para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 RESUMO:`);
    console.log(`   ✅ Atualizados: ${updated}`);
    console.log(`   ⚠️  Sem mudanças: ${payments.length - updated - failed}`);
    console.log(`   ❌ Falhas: ${failed}`);

  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message);
  }
}

// Executar
syncAllPayments();
