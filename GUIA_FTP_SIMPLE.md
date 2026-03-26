# 🔗 Conexão FTP Simple - VS Code

## ✅ Credenciais já Configuradas

Sua conexão FTP está pronta:
```
//
Host: ftp.eliezerdejesusmirand1774537855330.1792009.meusitehostgator.com.br
Usuário: zertec@eliezerdejesusmirand1774537855330.1792009.meusitehostgator.com.br
Senha: Qwe123!@#$%
Porta: 21
Tipo: FTP
```

---

## 🚀 Como Usar FTP Simple no VS Code

### Passo 1: Abrir FTP Simple
1. Clique na aba **"FTP Simple"** na barra lateral (ícone de arquivo com seta)
2. Ou pressione: **Ctrl+Shift+P** → Digite "FTP Simple"

### Passo 2: Conectar ao Hostgator
1. Clique em **"Connect"** (no painel FTP Simple)
2. Selecione a conexão **"localhost"** (segunda conexão)
3. A árvore de pastas vai aparecer no lado esquerdo

### Passo 3: Navegar para public_html
1. Expanda as pastas até encontrar: `/public_html/`
2. Ou clique em **"Change Directory"** e digite: `/public_html/`

### Passo 4: Upload do dist.zip

#### Opção A: Upload do arquivo ZIP
1. Clique com botão direito em `/public_html/`
2. Selecione **"Upload File"**
3. Procure no seu PC: `D:\DESENVOLVIMENTO APP WEB\Nova pasta\Eventos-Church-Lavras\vale-church-manager\dist.zip`
4. Clique em "Upload"
5. Aguarde completar

#### Opção B: Upload de toda a pasta dist (diretamente)
1. Clique com botão direito em `/public_html/`
2. Selecione **"Upload Folder"**
3. Selecione a pasta: `dist`
4. Clique em "Upload"

### Passo 5: Descompactar ZIP (se usar Opção A)
1. Clique com botão direito no `dist.zip`
2. Se não tiver opção de extrair, use o cPanel do Hostgator (Gerenciador de Arquivos)
3. Ou use SSH (se habilitado)

### Passo 6: Verificar Upload
```
Abra no navegador: https://seu-dominio.com.br
```

---

## 💡 Dicas FTP Simple

### Sincronizar Pasta Local
```
1. Clique em Downloads (seta com ponta para baixo)
2. FTP Simple sincroniza dist com public_html
```

### Atualizar Conexão
```
Ctrl+Shift+P → FTP Simple: Reload Connection
```

### Ver Logs
```
Clique em "Output" (abaixo) → Selecione "FTP Simple"
```

---

## ⚙️ Alterar Configurações

Se precisar editar as credenciais:
```
Ctrl+Shift+P → FTP Simple: Open Settings
```

---

## ✅ Checklist

- [ ] FTP Simple extensão instalada
- [ ] Conexão configurada (já está ✅)
- [ ] Conectado ao Hostgator
- [ ] Navegou para `/public_html/`
- [ ] Fez upload de `dist.zip`
- [ ] Descompactou no servidor
- [ ] Site acessível: https://seu-dominio.com.br

---

Pronto para fazer upload! 🎉
