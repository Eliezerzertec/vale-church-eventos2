/**
 * 🔒 Backend com HTTPS (SSL)
 * Modifique o server.js para incluir isso no início
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

// ===== SSL/HTTPS Setup =====
const enableSSL = process.env.SSL_ENABLED === 'true';
let server;

if (enableSSL) {
  // Certificados SSL (usar Let's Encrypt ou similar)
  const certPath = process.env.SSL_CERT_PATH || '/etc/letsencrypt/live/seu_dominio/fullchain.pem';
  const keyPath = process.env.SSL_KEY_PATH || '/etc/letsencrypt/live/seu_dominio/privkey.pem';
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const options = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    };
    server = https.createServer(options, app);
    console.log('🔒 HTTPS Ativado no servidor!');
  } else {
    console.warn('⚠️ Certificados SSL não encontrados, usando HTTP');
    server = app;
  }
} else {
  server = app;
}

// Iniciar servidor
server.listen(PORT, () => {
  const protocol = enableSSL ? 'https' : 'http';
  console.log(`\n🚀 Backend rodando em ${protocol}://0.0.0.0:${PORT}`);
  console.log(`   URL: ${protocol}://69.6.212.241:${PORT}`);
});
