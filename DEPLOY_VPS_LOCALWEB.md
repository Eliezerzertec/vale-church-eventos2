# Deploy no VPS LocalWeb
**Host:** vps65539.publiccloud.com.br  
**IP:** 191.252.219.41  
**Porta API:** 3001  

---

## 1. Gerar o build de produção (local)

```bash
npm run build
```
O Vite usa automaticamente o `.env.production` com as URLs do VPS.  
A pasta `dist/` gerada contém o frontend estático.

---

## 2. Enviar arquivos para o VPS via SCP/FTP

### Frontend (pasta `dist/`)
```bash
scp -r dist/* usuario@191.252.219.41:/var/www/html/
```
Ou use o Gerenciador de Arquivos do painel LocalWeb.

### Backend (arquivos do servidor)
```bash
scp server.js package.json ecosystem.config.cjs .env.production \
    usuario@191.252.219.41:/var/www/vale-church-manager/
```
Renomeie `.env.production` para `.env` no servidor:
```bash
mv /var/www/vale-church-manager/.env.production /var/www/vale-church-manager/.env
```

---

## 3. Instalar dependências no VPS

```bash
cd /var/www/vale-church-manager
npm install --omit=dev
```

---

## 4. Iniciar o backend com PM2

```bash
# Instalar PM2 globalmente (primeira vez)
npm install -g pm2

# Iniciar servidor com ecosystem
pm2 start ecosystem.config.cjs

# Salvar para reiniciar automaticamente após reboot
pm2 save
pm2 startup
```

### Comandos PM2 úteis
```bash
pm2 status                        # Ver processos rodando
pm2 logs vale-church-backend      # Ver logs
pm2 restart vale-church-backend   # Reiniciar
pm2 stop vale-church-backend      # Parar
```

---

## 5. Configurar Nginx (recomendado)

Crie `/etc/nginx/sites-available/vale-church`:

```nginx
server {
    listen 80;
    server_name vps65539.publiccloud.com.br 191.252.219.41;
    root /var/www/html;
    index index.html;

    # Frontend React (SPA - redirecionar tudo para index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend Node.js na porta 3001
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://127.0.0.1:3001;
    }
}
```

Ativar:
```bash
ln -s /etc/nginx/sites-available/vale-church /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

> **Com Nginx:** o frontend aponta para `http://vps65539.publiccloud.com.br/api/...`  
> (sem porta 3001), mas o `.env.production` já configura o cliente para usar a porta 3001 diretamente.

---

## 6. Abrir porta 3001 no Firewall

```bash
# ufw (Ubuntu)
ufw allow 3001/tcp
ufw reload

# iptables
iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
```

---

## 7. Verificar se está funcionando

```bash
# Health check do backend
curl http://vps65539.publiccloud.com.br:3001/health

# Deve retornar:
# {"status":"ok","message":"Backend de pagamentos ativo",...}
```

---

## Arquitetura final

```
Usuário
  │
  ▼
http://vps65539.publiccloud.com.br        (porta 80 - Nginx)
  │
  ├── /           → dist/ (React SPA - arquivos estáticos)
  │
  └── /api/*      → localhost:3001 (Node.js via PM2)
                       │
                       ├── POST /api/payment/create
                       ├── GET  /api/payment/:id
                       ├── GET  /api/coupons/list
                       ├── GET  /api/coupon/validate/:code
                       ├── POST /api/webhook/abacatepay
                       └── GET  /api/webhook/logs
                       │
                       └── AbacatePay API (externo)
                       └── Supabase (externo)
```
