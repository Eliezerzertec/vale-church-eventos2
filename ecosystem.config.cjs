/**
 * PM2 Ecosystem Config
 * VPS LocalWeb: vps65539.publiccloud.com.br (191.252.219.41)
 *
 * Uso:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'vale-church-backend',
      script: 'server.js',
      cwd: '/var/www/vale-church-manager',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        SERVER_HOST: 'vps65539.publiccloud.com.br',
        // Supabase
        VITE_SUPABASE_URL: 'https://cwzmiznlvhhnpjgxgsme.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3em1pem5sdmhobnBqZ3hnc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTY5NzcsImV4cCI6MjA4NzA5Mjk3N30.nsXSSPW2yajdEy-iFlDmtIH-AltsNZ3n8BcNkqTJ4F4',
        // AbacatePay - PRODUCAO
        VITE_ABACATEPAY_KEY: 'abc_prod_S1DZarn5zgPxuxSndzzT4FNR',
        // Webhook
        ABACATEPAY_WEBHOOK_SECRET: 'qwe123123',
      },
    },
  ],
};
