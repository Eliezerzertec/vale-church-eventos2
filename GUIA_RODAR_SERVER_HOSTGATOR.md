# 🚀 RODAR SERVER NODE.JS NO HOSTGATOR

## 📋 ARQUIVOS NECESSÁRIOS

Fazer upload dos arquivos para o backend:
```
server.js           (arquivo principal)
package.json       (dependências) 
.env              (variáveis de ambiente)
```

---

## 🔧 SETUP NO HOSTGATOR

### Via SSH (Recomendado - Mais rápido)

#### 1️⃣ Conectar ao servidor
```bash
ssh seu_usuario@seu_dominio.com
# Ou com IP:
ssh seu_usuario@69.6.212.241
```

#### 2️⃣ Criar pasta para backend
```bash
mkdir -p ~/app-backend
cd ~/app-backend
```

#### 3️⃣ Upload dos arquivos (em outro terminal do seu PC)
```bash
scp server.js seu_usuario@seu_dominio.com:~/app-backend/
scp package.json seu_usuario@seu_dominio.com:~/app-backend/
scp .env.production seu_usuario@seu_dominio.com:~/app-backend/.env
```

#### 4️⃣ Instalar dependências no servidor
```bash
cd ~/app-backend
npm install --production
```

#### 5️⃣ Testar servidor
```bash
npm start
```

Se aparecer:
```
🚀 Backend rodando em http://0.0.0.0:3001
   URL: http://69.6.212.241:3001
```

✅ Funcionando!

---

### Via cPanel File Manager (Sem SSH)

#### 1️⃣ Upload via File Manager
1. cPanel → **File Manager**
2. Criar pasta: `app-backend` (na raiz home)
3. Upload dos arquivos:
   - `server.js`
   - `package.json`
   - `.env.production` (renomear para `.env`)

#### 2️⃣ Instalar dependências
1. cPanel → **Terminal** (se disponível)
   ```bash
   cd ~/app-backend
   npm install --production
   ```

2. Se não tiver Terminal, usar **SSH Access**

---

## 🎯 MANTER SERVIDOR RODANDO (PM2)

### Instalar PM2
```bash
npm install -g pm2
```

### Iniciar servidor com PM2
```bash
cd ~/app-backend
pm2 start server.js --name "church-api"
```

### Ver status
```bash
pm2 status
```

### Ver logs
```bash
pm2 logs church-api
```

### Auto-restart ao reiniciar servidor
```bash
pm2 startup
pm2 save
```

### Parar servidor
```bash
pm2 stop church-api
```

---

## ✅ VERIFICAR SE ESTÁ RODANDO

### Teste 1: Via terminal
```bash
curl http://69.6.212.241:3001/health
```

Esperado:
```json
{"status":"ok","mode":"🔴 PRODUÇÃO"}
```

### Teste 2: Via navegador
```
http://69.6.212.241:3001/health
```

### Teste 3: Verificar processo
```bash
pm2 list
# ou
ps aux | grep "node"
```

---

## 🔐 .env NO SERVIDOR (IMPORTANTE!)

Arquivo: `~/app-backend/.env`

```
# Backend
PORT=3001
NODE_ENV=production

# Supabase
VITE_SUPABASE_URL=https://cwzmiznlvhhnpjgxgsme.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AbacatePay (PRODUÇÃO)
VITE_ABACATEPAY_KEY=abc_prod_S1DZarn5zgPxuxSndzzT4FNR

# Webhook
ABACATEPAY_WEBHOOK_SECRET=qwe123123

# Frontend (para CORS)
VITE_FRONTEND_URL=https://seu_dominio.com
```

---

## 🆘 TROUBLESHOOTING

### Erro: "port 3001 is already in use"
```bash
# Encontrar processo usando porta 3001
lsof -i :3001
# Matar processo
kill -9 <PID>
# Ou usar outra porta:
PORT=3000 pm2 start server.js
```

### Erro: "npm: command not found"
```bash
# Node.js não está instalado
# Contactar Hostgator ou instalar:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Erro: "EACCES: permission denied"
```bash
# Permissões de arquivo
chmod +x server.js
chmod 755 ~/app-backend
```

### Backend não inicia com PM2
```bash
# Ver logs detalhados
pm2 logs church-api --lines 100
# Testar direto sem PM2
node server.js
```

---

## 📊 MONITORAR SERVIDOR

### Ver CPU/Memória
```bash
pm2 monit
```

### Ver erros
```bash
pm2 logs church-api
```

### Reiniciar
```bash
pm2 restart church-api
```

---

## 🔄 ATUALIZAR CÓDIGO DO SERVIDOR

Se fez mudanças no `server.js`:

1. **Upload novo arquivo:**
   ```bash
   scp server.js seu_usuario@seu_dominio.com:~/app-backend/
   ```

2. **SSH no servidor:**
   ```bash
   cd ~/app-backend
   pm2 restart church-api
   ```

3. **Ver se reiniciou:**
   ```bash
   pm2 logs church-api
   ```

---

## 🚨 CHECKLIST

- [ ] SSH habilitado no Hostgator (cPanel → SSH Access)
- [ ] `server.js` enviado para `~/app-backend/`
- [ ] `package.json` enviado
- [ ] `.env` configurado com credenciais corretas
- [ ] `npm install --production` executado
- [ ] `pm2 start server.js` rodando
- [ ] `pm2 startup` executado (auto-restart)
- [ ] Teste em `http://69.6.212.241:3001/health` funciona
- [ ] Frontend consegue chamar API

---

## 🎉 PRONTO!

Backend rodando em:
```
http://69.6.212.241:3001
```

Frontend consegue chamar:
```
http://69.6.212.241:3001/api/payment/create
http://69.6.212.241:3001/webhook
```
