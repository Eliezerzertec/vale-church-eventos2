# 📦 SITE HOSTGATOR.ZIP - GUIA DE UPLOAD

## ✅ Arquivo Pronto!

```
📦 site_hostgator.zip (0.77 MB)
├── .htaccess (configurações Apache)
└── dist/ (aplicação React compilada)
    ├── index.html
    ├── assets/ (CSS, JS, imagens)
    └── [arquivos estáticos]
```

---

## 🚀 INSTRUÇÕES DE UPLOAD

### OPÇÃO 1: Upload via cPanel (Mais Fácil)

1. **Acessar cPanel**
   - URL: `https://seu_dominio.com:2083` ou Hostgator login
   - Usuário: seu_usuario
   - Senha: sua_senha

2. **Ir para File Manager**
   - Menu: **File Manager** ou **Arquivos**
   - Navegar para: `/public_html/`

3. **Deletar arquivos antigos** (opcional)
   - Selecionar TODOS os arquivos em `public_html/`
   - Clique: **Delete**
   - Deixar vazio para instalação limpa

4. **Upload do ZIP**
   - Clique: **Upload**
   - Selecionar: `site_hostgator.zip`
   - Aguardar Upload (pode levar alguns segundos)

5. **Descompactar**
   - Clique direito no ZIP: **Extract**
   - Descompactar para: `/public_html/`
   - Confirmar

6. **Reorganizar estrutura** (se necessário)
   - Se criou pasta `/dist/`, mover conteúdo para `/public_html/`
   - Ou, mover `/dist/*` para `/public_html/`

6. **Deletar o ZIP**
   - Clique direito em `site_hostgator.zip`
   - Clique: **Delete**

---

### OPÇÃO 2: Upload via FTP (VS Code - FTP Simple)

1. **Conectar ao FTP**
   - VS Code: FTP Simple → Connect
   - Selecionar conexão Hostgator

2. **Navegar para public_html**
   - Expandir pastas até `/public_html/`

3. **Fazer Upload**
   - Clique direito em `public_html/`
   - Selecionar: **Upload File**
   - Procurar: `site_hostgator.zip`

4. **Descompactar no servidor** (via cPanel, pois FTP não descompacta)
   - Abrir cPanel → File Manager
   - Ir para `/public_html/`
   - Clique direito no ZIP → Extract

---

### OPÇÃO 3: Upload via SSH (Linha de comando)

```bash
# 1. Conectar ao servidor
ssh seu_usuario@seu_dominio.com

# 2. Navegar para public_html
cd ~/public_html

# 3. Fazer upload usando SCP (do seu PC)
# (Execute em outro terminal na sua máquina)
scp site_hostgator.zip seu_usuario@seu_dominio.com:~/public_html/

# 4. Descompactar no servidor
unzip site_hostgator.zip

# 5. Limpar
rm site_hostgator.zip
```

---

## ✅ VERIFICAR APÓS UPLOAD

### 1. Testar Site
```
Abrir no navegador: http://seu_dominio.com
ou: http://69.6.212.241
```

✅ Se carregar com logo e layout → **SUCESSO!**

### 2. Verificar Arquivo .htaccess
```
File Manager → public_html/
Procurar por: .htaccess (arquivo hidden)
Se não vir: cPanel → Settings → Show Hidden Files
```

### 3. Testar Assets
```
Pressionar F12 (Developer Tools)
Abrir "Network"
Recarregar página (Ctrl+R)
Procurar por:
- index.html (status 200)
- assets/index-*.css (status 200)
- assets/index-*.js (status 200)
```

❌ Se tiver 404 ou erro de MIME type:
- Verificar se elementos estão em `/assets/`
- Confirmar que `.htaccess` foi copiado

---

## 🔧 POS-DEPLOYMENT

### 1. Verificar Backend
```
Abrir: http://69.6.212.241:3001/health

Esperado:
{
  "status": "ok",
  "mode": "🔴 PRODUÇÃO"
}
```

### 2. Testar Evento
- Abrir evento
- Tentar se inscrever
- Colocar dados
- Clicar em "Pagar"
- Deve redirecionar para AbacatePay

### 3. Testar Admin
```
http://69.6.212.241/admin
Fazer login com credenciais corretas
```

---

## 🆘 TROUBLESHOOTING

### Erro: "Arquivo .zip não foi extraído"
```
Solução:
1. Fazer upload novamente
2. Tentar usar File Manager > Extract
3. Se não funcionar, contactar Hostgator
```

### Erro: "404 Not Found" ou página em branco
```
Solução:
1. Verificar se .htaccess foi copiado
2. Verificar se index.html está em public_html/
3. Limpar cache: Ctrl+Shift+Del
4. Aguardar propagação DNS (5-10 min)
```

### Erro: "MIME type" (Expected JavaScript module)
```
Solução:
1. Garantir que .htaccess foi enviado
2. Recarregar navegador: Ctrl+F5 (força reload)
```

### API retorna CORS Error
```
Solução:
1. Verificar se backend (3001) está rodando
2. Confirmar VITE_BACKEND_URL no frontend
3. Verificar corsOptions em server.js
```

---

## 📋 CHECKLIST FINAL

- [ ] Arquivo unzip enviado para `/public_html/`
- [ ] `.htaccess` está em `/public_html/`
- [ ] `index.html` está em `/public_html/`
- [ ] Pasta `assets/` está em `/public_html/`
- [ ] Testar: `http://seu_dominio.com` carrega
- [ ] Testar: `http://seu_dominio.com/eventos/1` carrega (sem 404)
- [ ] Testar: Backend `http://69.6.212.241:3001/health` responde
- [ ] Testar: Inscrição e pagamento funcionam

---

## 🎉 PRONTO!

Site ativo em produção no Hostgator!

**Arquivo:** `site_hostgator.zip` (localizado na raiz do projeto)
**Tamanho:** 0.77 MB
**Local de upload:** `/public_html/`
