# 📋 Checklist de Deploy - Hostgator 69.6.212.241

## ✅ 1. ANTES DE FAZER DEPLOY

### Frontend
- [ ] Executar: `npm run build`
- [ ] Verificar se `dist/` foi gerado
- [ ] Testar localmente: `npm run preview`

### Backend  
- [ ] Criar pasta no servidor: `/home/seu_usuario/app-backend`
- [ ] Verificar Node.js instalado no servidor: `node --version` (requer 16+)
- [ ] npm instalado: `npm --version`

---

## 📦 2. CONFIGURAÇÃO NO SERVIDOR HOSTGATOR

### 2.1 - Com SSH (Terminal no Hostgator)

```bash
# 1. Conectar ao servidor
ssh seu_usuario@69.6.212.241

# 2. Instalar Node.js (se não tiver)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Criar pasta para aplicação
mkdir -p ~/public_html/app-backend
cd ~/public_html/app-backend

# 4. Upload dos arquivos
# (usar SCP ou WinSCP para copiar arquivos)

# 5. Instalar dependências
npm install --production

# 6. Iniciar servidor
npm start
# Ou usar PM2:
npm install -g pm2
pm2 start server.js --name "church-api"
pm2 startup
pm2 save
```

### 2.2 - Sem SSH (Via cPanel/FTP)

1. Acesse **cPanel** > **File Manager**
2. Vá para: `/public_html/`
3. Criar pasta: `app-backend`
4. Upload via FTP:
   - `server.js`
   - `package.json`
   - `.env` (com credenciais corretas)
5. Abrir **Terminal** no cPanel:
   ```bash
   cd /home/seu_usuario/public_html/app-backend
   npm install --production
   ```

---

## 🚀 3. SETUP DO FRONTEND

### 3.1 - Build da aplicação
```bash
npm run build
# Gera pasta: dist/
```

### 3.2 - Upload para Hostgator
1. **Opção A - FTP Simple (VS Code)**
   - Conectar ao FTP Hostgator
   - Navegar para `/public_html/`
   - Fazer upload de toda a pasta `dist/`

2. **Opção B - Gerenciador de Arquivos (cPanel)**
   - Acesse: `/public_html/`
   - Deletar arquivos antigos (manter .htaccess se houver)
   - Fazer upload dos arquivos da pasta `dist/`

---

## 🔧 4. CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE

### .env.production (na raiz do projeto)
```
VITE_BACKEND_URL="http://69.6.212.241:3001"
VITE_FRONTEND_URL="http://69.6.212.241"
NODE_ENV="production"
VITE_ABACATEPAY_KEY=abc_prod_... (usar chave de produção)
```

### .env no servidor (backend)
```
PORT=3001
NODE_ENV=production
VITE_SUPABASE_URL=... (copiar do .env.production)
VITE_SUPABASE_ANON_KEY=... (copiar)
VITE_ABACATEPAY_KEY=abc_prod_... (chave de produção)
ABACATEPAY_WEBHOOK_SECRET=... (chave do webhook)
```

---

## 🧪 5. TESTES APÓS DEPLOY

### Verificar Frontend
```
Abrir navegador: http://69.6.212.241
Verificar se site carrega corretamente
```

### Verificar Backend
```
curl http://69.6.212.241:3001/health
Resposta esperada: { "status": "ok", "mode": "🔴 PRODUÇÃO" }
```

### Verificar Webhooks
```
curl http://69.6.212.241:3001/api/webhook/status
```

### Testar Pagamento
1. Criar inscrição no evento
2. Completar formulário
3. Clicar em "Pagar"
4. Verificar se redirecionou para AbacatePay (PIX/Cartão)
5. Cancelar pagamento de teste
6. Verificar status de pagamento em Admin

---

## ⚙️ 6. CONFIGURAÇÕES ADICIONAIS

### SSL/HTTPS
- [ ] Ativar certificado SSL no cPanel (Let's Encrypt é grátis)
- [ ] Mudar URLs de `http://` para `https://`
- [ ] Atualizar em AbacatePay: webhook URL para HTTPS

### PM2 (Manter backend rodando)
```bash
npm install -g pm2
pm2 start server.js --name "church-api"
pm2 startup
pm2 save

# Status
pm2 status
pm2 logs church-api
```

### Firewall/Porta 3001
- [ ] Verificar se porta 3001 está aberta
- [ ] Se bloqueada, usar porta 80/443 com proxy/nginx

---

## 🔗 7. ATUALIZAR WEBHOOK NO ABACATEPAY

1. Acessar: [AbacatePay Dashboard](https://admin.abacatepay.com)
2. Ir para: **Webhooks** ou **Configurações**
3. Atualizar URL do webhook para: `http://69.6.212.241:3001/webhook`
4. Eventos: `billing.paid`, `billing.failed`, `billing.expired`

---

## 📞 SUPORTE HOSTGATOR

- **Chat/Email**: https://hostgator.com.br/suporte
- **SSH**: Habilitar em cPanel > SSH Access
- **Porta 3001**: Confirmar se está liberada

---

## 🚨 TROUBLESHOOTING

### "Connection refused na porta 3001"
- [ ] Backend não está rodando: `pm2 start server.js`
- [ ] Porta bloqueada: Contactar Hostgator
- [ ] Firewall: Adicionar regra para porta 3001

### "CORS Error"
- [ ] Verificar se VITE_BACKEND_URL está correto
- [ ] Verificar corsOptions em server.js inclui o IP

### "AbacatePay retorna erro"
- [ ] Confirmar credenciais em .env
- [ ] Verificar se chave é `abc_prod` (produção)
- [ ] Testar webhook: `curl -X POST http://69.6.212.241:3001/test/billing`

---

✅ **Pronto para produção!**
