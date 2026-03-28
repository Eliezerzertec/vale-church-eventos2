# 🔍 CHECKLIST - Site não carrega no Hostgator

## 1️⃣ VERIFICAR ARQUIVOS NA public_html

### Via cPanel File Manager
1. Acessa: **cPanel → File Manager**
2. Navega para: **public_html**
3. Procura pelos arquivos:
   - ✅ `index.html` (deve estar lá!)
   - ✅ `assets/` (pasta com CSS/JS)
   - ✅ `.htaccess` (necessário!)

### Se não estão lá:
```
❌ PROBLEMA: Arquivos do build não foram copiados!
Solução: Fazer upload dos arquivos da pasta dist/ novamente
```

---

## 2️⃣ VERIFICAR .htaccess

Na pasta `public_html`, deve ter um arquivo `.htaccess` com:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### Se não existe:
```
❌ PROBLEMA: Arquivo .htaccess faltando
Solução: Fazer upload do .htaccess (está em: public/.htaccess do projeto)
```

---

## 3️⃣ TESTAR ACESSO AO ARQUIVO

Abrir no navegador e verificar:

### ✅ Deve funcionar:
```
http://69.6.212.241/
http://69.6.212.241/index.html
http://69.6.212.241/assets/index-xxx.js
```

### ❌ Se mostrar 404:
- Verificar se index.html foi copiado
- Verificar permissões (755 para pastas, 644 para arquivos)

---

## 4️⃣ VERIFICAR PERMISSÕES

No **File Manager**, clique com botão direito > **Change Permissions**:
- Pastas: `755`
- Arquivos: `644`
- index.html: `644`
- .htaccess: `644`

```
❌ Se erro de permissão:
Solução: Ajustar com as permissões acima
```

---

## 5️⃣ TESTAR BACKEND (API)

Abrir no navegador:
```
http://69.6.212.241:3001/health
```

Esperado:
```json
{
  "status": "ok",
  "mode": "🔴 PRODUÇÃO"
}
```

### Se não responder:
```
❌ PROBLEMA: Backend não está rodando!
Solução: 
- SSH no servidor
- cd /home/seu_usuario/public_html/app-backend
- npm start
- Ou: pm2 start server.js
```

---

## 6️⃣ VERIFICAR CONSOLE DO NAVEGADOR

Abrir Developer Tools (F12) > **Console** e procurar por erros:

### Erro comum:
```
Access to fetch at 'http://69.6.212.241:3001/health' 
blocked by CORS policy
```

**Solução:** Verificar corsOptions em server.js

---

## 7️⃣ TESTE RÁPIDO - Criar arquivo test.html

1. Na pasta `public_html/`, criar arquivo `test.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Teste Hostgator</title>
</head>
<body>
  <h1>✅ Hostgator Funcionando!</h1>
  <p>Se vê isso, o servidor HTTP está OK</p>
</body>
</html>
```

2. Testar: `http://69.6.212.241/test.html`

Se funcionar:
- ✅ Servidor HTTP está OK
- ❌ Problema está no upload dos arquivos ou .htaccess

Se não funcionar:
- ❌ Problema está no Hostgator ou DNS

---

## 📋 RESUMO DOS PASSOS

```
1. Verificar se index.html está em public_html ✓
2. Copiar .htaccess para public_html ✓
3. Ajustar permissões (755 pastas, 644 arquivos) ✓
4. Testar http://69.6.212.241 ✓
5. Se erro de API, verificar backend em :3001 ✓
6. Limpar cache do navegador (Ctrl+Shift+Del) ✓
```

---

## 🆘 SOS - Nada funcionou?

### Passo 1: Verificar se mod_rewrite está ativo
```
cPanel > Apache Modules > Procurar por "rewrite"
Se não tiver: Contactar Hostgator
```

### Passo 2: Testar com arquivo estático
Upload de `test.html` (sem SPA routing)
Se não carregar: Problema é no servidor

### Passo 3: Verificar logs
```
cPanel > Logs > Error Log
Procurar por erros 404 ou 500
```

### Passo 4: Contactar Hostgator
- Chat: https://hostgator.com.br/suporte
- Mencionar: "Aplicação React/SPA não carrega em public_html"
- Pedir para ativar mod_rewrite se desativado

---

**Qual é o erro que está vendo no navegador?**
