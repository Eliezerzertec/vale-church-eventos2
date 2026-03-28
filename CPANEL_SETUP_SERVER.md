# 📋 RODAR SERVER NODE.JS COM CPANEL

## 🔑 ACESSO CPANEL

```
URL: https://seu_dominio.com:2083
OU: https://69.6.212.241:2083
OU: https://eliezerdejesusmirand1774537855330.1792009.meusitehostgator.com.br:2083

Usuário: seu_usuario_ftp
Senha: sua_senha_ftp
```

---

## 📦 PASSO 1: UPLOAD DO BACKEND

### Via File Manager (cPanel)

1. Acessar **cPanel → File Manager**
2. Criar pasta: `app-backend`
3. Entrar na pasta
4. **Upload** dos 3 arquivos:
   - `server.js`
   - `package.json`
   - `.env` (copiar de `.env.production`)

---

## 🔧 PASSO 2: INSTALAR DEPENDÊNCIAS

### Via Terminal (cPanel)

1. Acessar **cPanel → Terminal** (ou **Command Line Interface**)

```bash
cd ~/app-backend
npm install --production
```

⏳ Esperar instalar (pode levar alguns segundos)

---

## 🚀 PASSO 3: RODAR SERVER COM PM2

### Via Terminal (cPanel)

1. Executar comandos em sequência:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Ir para pasta backend
cd ~/app-backend

# Iniciar servidor
pm2 start server.js --name "church-api"

# Auto-restart ao reiniciar VPS
pm2 startup
pm2 save

# Verificar status
pm2 status
```

Se aparecer:
```
✓ church-api             online
```

✅ **SERVIDOR RODANDO!**

---

## 📊 VERIFICAR VIA CPANEL

### Status do servidor

```bash
# Ver se está rodando
pm2 list

# Ver logs de erro
pm2 logs church-api

# Ver CPU/Memória
pm2 monit
```

---

## ✅ TESTAR SERVER

### Via Terminal cPanel

```bash
# Testar se responde
curl http://localhost:3001/health

# Esperado:
# {"status":"ok","mode":"🔴 PRODUÇÃO"}
```

### Via Navegador

```
http://69.6.212.241:3001/health
```

---

## 🔄 GERENCIAR SERVER

### Parar servidor
```bash
pm2 stop church-api
```

### Reiniciar
```bash
pm2 restart church-api
```

### Deletar
```bash
pm2 delete church-api
```

### Ver logs completos
```bash
pm2 logs church-api --lines 100
```

---

## 🛑 ERROS COMUNS

### Erro: "Port 3001 already in use"
```bash
# Encontrar processo na porta
lsof -i :3001

# Matar processo
kill -9 <PID>

# Ou usar outra porta
PORT=3000 pm2 start server.js
```

### Erro: "npm: command not found"
```bash
# Node.js não está instalado
# Contactar Hostgator para instalar
# Ou providenciar VPS com Node.js pré-instalado
```

### Erro: "permission denied"
```bash
# Arrumar permissões
chmod +x ~/app-backend/server.js
chmod 755 ~/app-backend/
```

### Server não inicia
```bash
# Ver erro detalhado
pm2 logs church-api
node ~/app-backend/server.js  # testar direto
```

---

## 📁 ESTRUTURA FINAL

```
~/ (home folder)
├── app-backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── node_modules/ (criado por npm install)
```

---

## 🎯 CHECKLIST

- [ ] Acessar cPanel: https://seu_dominio.com:2083
- [ ] Criar pasta: ~/app-backend
- [ ] Upload: server.js, package.json, .env
- [ ] Terminal cPanel: npm install --production
- [ ] Terminal cPanel: npm install -g pm2
- [ ] Terminal cPanel: pm2 start server.js --name "church-api"
- [ ] Terminal cPanel: pm2 startup && pm2 save
- [ ] Teste: curl http://localhost:3001/health
- [ ] Teste: http://69.6.212.241:3001/health no navegador

---

## 🎉 PRONTO!

Backend rodando em:
```
http://69.6.212.241:3001
https://seu_dominio.com:3001
```

Frontend consegue chamar a API! ✅
