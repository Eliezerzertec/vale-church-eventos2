# 🚀 Guia - Fazer Upload do Site para Hostgator

## 📋 Pré-requisitos

- ✅ Conta Hostgator criada
- ✅ Domínio apontado para Hostgator
- ✅ Acesso FTP/SFTP (verifique seu email do Hostgator)
- ✅ Build da aplicação: `npm run build` ✅ Já feito

---

## 📦 Arquivos para Upload

### Frontend (Build React/Vite)
```
dist/
├── index.html          (página principal)
├── assets/
│   ├── index-*.css     (estilos)
│   ├── index-*.js      (JavaScript compilado)
│   └── *.png           (imagens)
```

**Tamanho total:** ~1.6 MB (gzip: ~450 KB)

### Backend Node.js (Opcional)
- `server.js` - Backend de pagamentos
- `package.json` - Dependências
- `.env` - Variáveis de ambiente (não fazer upload, configurar no Hostgator)

---

## 🔧 Opção 1: Upload via Gerenciador de Arquivos (Mais Fácil)

### Passo 1: Acessar Hostgator
1. Acesse [hostgator.com.br](https://www.hostgator.com.br)
2. Clique em **"Minha Conta"** ou **"cPanel"**
3. Login com sua conta
4. Procure por **"Gerenciador de Arquivos"** ou **"File Manager"**

### Passo 2: Navegar para pasta public_html
```
/home/seu_usuario/public_html/
```

### Passo 3: Fazer Upload
1. **Comprimir a pasta `dist` em ZIP localmente:**
   ```powershell
   Compress-Archive -Path "dist\*" -DestinationPath "dist.zip" -Force
   ```

2. **Upload do arquivo:**
   - Clique em **"Upload"** no File Manager
   - Selecione **`dist.zip`**
   - Aguarde completar

3. **Descompactar:**
   - Clique com botão direito em `dist.zip`
   - Selecione **"Extract"** ou **"Descompactar"**
   - Escolha a pasta **`public_html`**
   - Confirme

4. **Remover ZIP:**
   - Delete o arquivo `dist.zip`

### Passo 4: Configurar index.html
Se os arquivos estão em `public_html/dist/`:
- Copy todos os arquivos de `dist/` para `public_html/`
- O arquivo `public_html/index.html` é a entrada

---

## 🔧 Opção 2: Upload via FTP Client (Recomendado para atualizações)

### Ferramentas Recomendadas:
- **FileZilla** (Grátis) - https://filezilla-project.org/
- **WinSCP** (Grátis) - https://winscp.net/

### Passo 1: Configurar conexão FTP
1. Abra **FileZilla** ou **WinSCP**
2. Clique em **"Arquivo → Gerenciador de Site"** (ou equivalente)
3. Clique em **"Novo Site"**
4. Preencha:
   ```
   Host: ftp.seu-dominio.com.br
   Usuário: seu_usuario_ftp
   Senha: sua_senha_ftp
   Porta: 21
   ```
5. Clique em **"Conectar"**

### Passo 2: Navegar para pasta pública
- Lado esquerdo (Seu PC): `D:\DESENVOLVIMENTO APP WEB\Nova pasta\Eventos-Church-Lavras\vale-church-manager\dist`
- Lado direito (Hostgator): `/public_html/` ou `/www/`

### Passo 3: Fazer Upload
1. **Selecione todos os arquivos em `dist/`:**
   - Local: pasta `dist`
   - Remoto: `public_html`

2. **Arraste e solte** ou clique direito → **"Upload"**

3. **Aguarde completar** (leva alguns minutos dependendo da conexão)

---

## 🌐 Backend (Node.js + Express)

### Se quiser usar o backend de pagamentos no Hostgator

⚠️ **Nota:** Hostgator compartilhado NÃO suporta Node.js nativamente.

#### Opção A: Usar Node.js Hosting (Recomendado)
- **Render.com** (Grátis até 750h/mês)
- **Railway.app** 
- **Heroku** (Pago)
- **DigitalOcean** (Pago)

#### Opção B: Usar API do Supabase apenas
- Configure frontend para chamar Supabase diretamente
- Remova variável `VITE_BACKEND_URL`

---

## ✅ Checklist Final

- [ ] Arquivo `dist.zip` criado (`npm run build` já feito)
- [ ] Conta Hostgator acessível
- [ ] cPanel/File Manager aberto
- [ ] Arquivos de `dist/` enviados para `public_html`
- [ ] Arquivo `dist.zip` removido do servidor
- [ ] Domínio acessível: `https://seu-dominio.com.br`
- [ ] Verificar no navegador se carrega corretamente

---

## 🔍 Verificações Após Upload

### 1. Testar Frontend
```
Abra: https://seu-dominio.com.br
Verifique:
- ✅ Página carrega sem erros
- ✅ Estilos CSS aplicados
- ✅ Imagens visíveis
- ✅ JavaScript funcionando
```

### 2. Verificar Console do Navegador
- F12 → Console
- Procurar por erros em vermelho
- Verificar se URLs de API estão corretas

### 3. Testar Funcionalidades
- Loginentrar como admin
- Criar evento
- Processar pagamento (se backend configurado)

---

## 🛠️ Variáveis de Ambiente

### No Hostgator - Criar arquivo `.env` em `public_html/`
```bash
VITE_SUPABASE_PROJECT_ID="cwzmiznlvhhnpjgxgsme"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://cwzmiznlvhhnpjgxgsme.supabase.co"
VITE_ABACATEPAY_KEY="abc_prod_..."
VITE_BACKEND_URL="http://seu-backend-node.com:3001"
```

---

## 🚨 Troubleshooting

### Erro: "Página em branco"
- F12 → Console
- Verificar se há erros de CORS
- Verificar se `index.html` está em `public_html/`

### Erro: "Não consegue conectar à API"
- Verificar variáveis de ambiente
- Testar conexão com Supabase: `curl https://cwzmiznlvhhnpjgxgsme.supabase.co`

### Erro: "Estilos não carregam"
- Verificar se CSS está em `dist/assets/`
- Limpar cache do navegador (Ctrl+Shift+Delete)

---

## 📞 Suporte Hostgator
- Chat: https://www.hostgator.com.br/suporte
- Email: support@hostgator.com.br
- Telefone: 1133340000

---

**Próximos passos após upload:**
1. Validar SSL (HTTPS)
2. Configurar DNS se necessário
3. Testar todas as funcionalidades
4. Configurar webhooks AbacatePay para produção

**Gerado em:** 26/03/2026
