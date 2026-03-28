# 📤 UPLOAD BACKEND VIA FTP SIMPLE

## 🔌 CONECTAR NO FTP SIMPLE

1. **VS Code → Abrir FTP Simple** (barra lateral esquerda)
2. **Connect** → Selecionar conexão
3. Navegar até: `/home/contato/`

---

## 📁 CRIAR PASTA BACKEND

1. No FTP Simple, botão direito em `/home/contato/`
2. **Create Directory** → Nome: `app-backend`
3. Entrar na pasta criada

---

## 📤 FAZER UPLOAD DOS ARQUIVOS

Via FTP Simple, fazer upload de:

1. `server.js`
   - Localização local: `D:\...\vale-church-manager\server.js`
   - Destino: `/home/contato/app-backend/server.js`

2. `package.json`
   - Localização local: `D:\...\vale-church-manager\package.json`
   - Destino: `/home/contato/app-backend/package.json`

3. `.env.production` (renomear para `.env`)
   - Localização local: `D:\...\vale-church-manager\.env.production`
   - Destino: `/home/contato/app-backend/.env`

---

## ⚙️ INSTALAR E RODAR

### Via cPanel Terminal

1. Acessar: **cPanel → Terminal** (ou Command Line Interface)

2. Executar comandos:

```bash
# Ir para pasta backend
cd ~/app-backend

# Instalar dependências
npm install --production

# Instalar PM2
npm install -g pm2

# Rodar servidor
pm2 start server.js --name "church-api"

# Auto-restart
pm2 startup
pm2 save

# Ver status
pm2 status
```

3. Se aparecer `✓ church-api online` → ✅ **FUNCIONANDO!**

---

## ✅ TESTAR

No cPanel Terminal:
```bash
curl http://localhost:3001/health
```

Ou no navegador:
```
http://69.6.212.241:3001/health
```

Esperado:
```json
{"status":"ok","mode":"🔴 PRODUÇÃO"}
```

---

## 📊 GERENCIAR

```bash
# Ver logs
pm2 logs church-api

# Reiniciar
pm2 restart church-api

# Parar
pm2 stop church-api

# Status
pm2 status
```

---

## 🆘 SE DER ERRO

### "Port 3001 already in use"
```bash
lsof -i :3001
kill -9 <PID>
pm2 start server.js --name "church-api"
```

### "npm: command not found"
Node.js não está instalado. Contactar Hostgator.

### "permission denied"
```bash
chmod +x ~/app-backend/server.js
chmod 755 ~/app-backend/
```

---

## ✅ CHECKLIST

- [ ] Conectar no FTP Simple
- [ ] Navegar até `/home/contato/`
- [ ] Criar pasta `app-backend`
- [ ] Upload: server.js
- [ ] Upload: package.json
- [ ] Upload: .env.production (renomear para .env)
- [ ] Acessar cPanel Terminal
- [ ] `npm install --production`
- [ ] `npm install -g pm2`
- [ ] `pm2 start server.js --name "church-api"`
- [ ] `pm2 startup && pm2 save`
- [ ] Testar: `http://69.6.212.241:3001/health`

---

**Pronto para fazer upload?** 📤
