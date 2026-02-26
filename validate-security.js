#!/usr/bin/env node

/**
 * 🔒 Validador de Segurança para Deploy
 * Verifica se todas as variáveis de ambiente estão configuradas corretamente
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

console.log('\n🔍 VERIFICAÇÃO DE SEGURANÇA PARA DEPLOY\n');
console.log('═'.repeat(60));

const checks = {
  'Existência de .env': () => fs.existsSync('.env'),
  'Arquivo .env.example existe': () => fs.existsSync('.env.example'),
  '.env está em .gitignore': () => {
    try {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      return gitignore.includes('.env');
    } catch {
      return false;
    }
  },
  'VITE_SUPABASE_URL configurado': () => !!process.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY configurado': () => !!process.env.VITE_SUPABASE_ANON_KEY,
  'VITE_ABACATEPAY_KEY configurado': () => !!process.env.VITE_ABACATEPAY_KEY,
  'ABACATEPAY_WEBHOOK_SECRET configurado': () => !!process.env.ABACATEPAY_WEBHOOK_SECRET,
};

const securityChecks = {
  'ABACATEPAY_WEBHOOK_SECRET tem mínimo 32 caracteres': () => {
    const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
    if (!secret) return false;
    return secret.length >= 32;
  },
  'ABACATEPAY_WEBHOOK_SECRET não é "qwe123123"': () => {
    const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
    return secret !== 'qwe123123';
  },
  'VITE_ABACATEPAY_KEY é chave de PRODUÇÃO (abc_prod)': () => {
    const key = process.env.VITE_ABACATEPAY_KEY;
    if (!key) return 'AVISO: Configure em produção';
    return key.startsWith('abc_prod') ? true : `AVISO: Usando desenvolvimento (${key.substring(0, 10)}...)`;
  },
};

let passed = 0;
let failed = 0;

// Verificações básicas
console.log('\n📋 VERIFICAÇÕES BÁSICAS:\n');
Object.entries(checks).forEach(([name, check]) => {
  const result = check();
  const status = result ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (result) passed++;
  else failed++;
});

// Verificações de segurança
console.log('\n🔒 VERIFICAÇÕES DE SEGURANÇA:\n');
Object.entries(securityChecks).forEach(([name, check]) => {
  const result = check();
  let status, message;
  
  if (result === true) {
    status = '✅';
    passed++;
  } else if (result === false) {
    status = '❌';
    failed++;
  } else {
    status = '⚠️ ';
    message = result;
  }
  
  console.log(`${status} ${name}`);
  if (message) console.log(`   ${message}`);
});

// Verificações de código
console.log('\n🛡️  VERIFICAÇÕES DE CÓDIGO:\n');

const serverJs = fs.readFileSync('server.js', 'utf8');
const codeChecks = {
  'Nenhum hardcoded "qwe123123" em server.js': () => !serverJs.includes(`'qwe123123'`),
  'WEBHOOK_SECRET é obrigatório': () => serverJs.includes('!WEBHOOK_SECRET'),
  'HMAC SHA-256 implementado': () => serverJs.includes('crypto.createHmac'),
  'Timing-safe comparison usado': () => serverJs.includes('timingSafeEqual'),
};

Object.entries(codeChecks).forEach(([name, check]) => {
  const result = check();
  const status = result ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (result) passed++;
  else failed++;
});

// Resultado final
console.log('\n' + '═'.repeat(60));
console.log(`\n📊 RESULTADO: ${passed} ✅  |  ${failed} ❌\n`);

if (failed === 0) {
  console.log('🎉 PROJETO PRONTO PARA DEPLOY!\n');
  process.exit(0);
} else {
  console.log('⚠️  CORRIJA OS ERROS ACIMA ANTES DE FAZER DEPLOY\n');
  console.log('📖 Consulte SECURITY_CHECKLIST.md para mais detalhes\n');
  process.exit(1);
}
