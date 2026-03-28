# 📦 INSTALAR NODE.JS NO HOSTGATOR

## ✅ PASSO 1: VERIFICAR SE JÁ ESTÁ INSTALADO

### Via cPanel Terminal

```bash
node --version
npm --version
```

Se aparecer versão (ex: `v18.19.0`), ✅ **Já está instalado!**

Se disser "command not found", ❌ **Precisa instalar**

---

## 🔧 PASSO 2: INSTALAR NODE.JS

### Opção A: Via cPanel (Automático - Melhor)

1. Acessar **cPanel**
2. Procurar por: **"Node.js Manager"** ou **"Node.js Selector"**
3. Clicar em **"Create Node.js App"** ou **"Install"**
4. Selecionar versão: **v18** ou **v20** (estável)
5. Confirm

✅ Pronto! Node.js instalado.

---

### Opção B: Via SSH (Se cPanel não tiver)

```bash
# 1. Conectar via SSH
ssh contato@69.6.212.241

# 2. Instalar Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Verificar
node --version
npm --version
```

---

### Opção C: Via NVM (Node Version Manager)

```bash
# 1. Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Reiniciar terminal (ou source ~/.bashrc)
source ~/.bashrc

# 3. Instalar Node.js
nvm install 18

# 4. Usar versão instalada
nvm use 18

# 5. Verificar
node --version
```

---

## ✅ PASSO 3: INSTALAR DEPENDÊNCIAS DO PROJETO

```bash
# Ir para pasta do backend
cd ~/app-backend

# Instalar pacotes (development + production)
npm install

# OU apenas production (mais rápido)
npm install --production
```

---

## ✅ PASSO 4: INSTALAR PM2 (para manter rodando)

```bash
# Instalar globalmente
npm install -g pm2

# Verificar
pm2 --version
```

---

## 🚀 PASSO 5: RODAR O SERVIDOR

```bash
# Iniciar servidor
pm2 start server.js --name "church-api"

# Auto-restart ao reiniciar VPS
pm2 startup
pm2 save

# Ver status
pm2 status
```

Se aparecer:
```
✓ church-api  online
```

✅ **SERVIDOR RODANDO!**

---

## 🧪 PASSO 6: TESTAR

```bash
# Via terminal
curl http://localhost:3001/health

# Ou via navegador
# http://69.6.212.241:3001/health

# Esperado:
# {"status":"ok","mode":"🔴 PRODUÇÃO"}
```

---

## 📋 VERSÕES RECOMENDADAS

```
✅ Node.js 18.x (LTS - Recomendado)
✅ Node.js 20.x (LTS - Mais novo)
❌ Node.js 16.x (Antiga, mas funciona)
```

Hostgator geralmente usa: **Node.js 14-18**

---

## 🔍 VERIFICAR APÓS INSTALAR

```bash
# Versão do Node.js
node -v

# Versão do npm
npm -v

# Localização
which node
which npm

# Variáveis de ambiente
echo $PATH | grep node
```

---

## 🆘 TROUBLESHOOTING

### Erro: "npm not found"
```bash
# Node.js foi instalado mas npm não
# Reinstalar:
sudo apt-get install npm
```

### Erro: "Permission denied"
```bash
# Ajustar permissões
chmod +x ~/.npm
chmod -R 777 ~/.npm
```

### Servidor não inicia
```bash
# Verificar erro
node ~/app-backend/server.js

# Ver logs do PM2
pm2 logs church-api
```

### Port 3001 já em uso
```bash
# Encontrar processo
lsof -i :3001

# Matar processo
kill -9 <PID>

# Ou usar outra porta
PORT=3000 pm2 start server.js
```

---

## 📊 GERENCIAR NODE.JS

```bash
# Ver aplicações PM2
pm2 list

# Ver logs
pm2 logs church-api

# Reiniciar
pm2 restart church-api

# Parar
pm2 stop church-api

# Deletar
pm2 delete church-api

# Salvar state
pm2 save
```

---

## 🎯 CHECKLIST FINAL

- [ ] Verificar Node.js: `node --version`
- [ ] Verificar npm: `npm --version`
- [ ] Instalar se necessário (cPanel ou SSH)
- [ ] Ir para ~/app-backend
- [ ] `npm install --production`
- [ ] `npm install -g pm2`
- [ ] `pm2 start server.js --name "church-api"`
- [ ] `pm2 startup && pm2 save`
- [ ] Teste: `curl http://localhost:3001/health`
- [ ] Teste via navegador: `http://69.6.212.241:3001/health`

---

## 🚀 RESULTADOS ESPERADOS

```bash
$ node --version
v18.19.0

$ npm --version
9.6.7

$ pm2 status
┌─────────┬────┬─────────┬──────┬──────┬───────┐
│ App     │ id │ version │ mode │ PID  │ status│
├─────────┼────┼─────────┼──────┼──────┼───────┤
│ church-│ 0  │         │ fork │ 1234 │ online│
│ api     │    │         │      │      │       │
└─────────┴────┴─────────┴──────┴──────┴───────┘

$ curl http://localhost:3001/health
{"status":"ok","mode":"🔴 PRODUÇÃO","timestamp":"2026-03-26T..."}
```

---

✅ **Tudo funcionando! API do AbacatePay pronta para usar!**
