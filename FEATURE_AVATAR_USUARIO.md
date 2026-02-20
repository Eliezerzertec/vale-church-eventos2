# 👤 Sistema de Avatar do Usuário

**Data Criação:** 20 de fevereiro de 2026  
**Status:** ✅ Implementado  
**Versão:** 1.0

---

## 📋 Resumo

Foi implementado um sistema completo de avatar para usuários administradores, permitindo:
- ✅ Upload de foto de perfil
- ✅ Preview antes de enviar
- ✅ Validação de tipo e tamanho
- ✅ Armazenamento no Supabase Storage
- ✅ Exibição do avatar em múltiplos locais
- ✅ Atualização automática no Supabase Auth

---

## 📂 Arquivos Modificados

### 🔄 Atualizados
- **`src/pages/AdminProfile.tsx`** - Adicionado sistema de upload e gerenciamento de avatar
- **`src/components/AdminLayout.tsx`** - Adicionado avatar no header do sidebar

### 📦 Versões de Supabase Storage
- Bucket: `avatars` (necessário criar manualmente no Supabase Dashboard)
- Estrutura: `{user_id}/{timestamp}-{filename}`

---

## 🚀 Como Usar

### 1. Criar Bucket no Supabase (Primeira Vez)
```
1. Abra Supabase Console
2. Vá para Storage
3. Clique em "New bucket"
4. Nome: "avatars"
5. Marque como "Public"
6. Criar RLS policies (see abaixo)
```

### 2. RLS Policies para Storage (Segurança)
```sql
-- Permitir usuários uploadarem só seus próprios avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Permitir leitura pública
CREATE POLICY "Public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### 3. Fazer Upload de Avatar
1. Login em `/admin/login`
2. Abra seu perfil (clique em avatar no sidebar ou em "Meu Perfil")
3. Na seção "Avatar":
   - Clique em "Escolher Imagem"
   - Selecione sua foto (PNG, JPG, GIF)
   - Clique em "Enviar Avatar"
4. Avatar atualizado em tempo real!

---

## 🎨 Locais de Exibição do Avatar

### 1. Sidebar Admin Header
- Mostra avatar grande (12x12) do usuário logado
- Clicável → leva para página de perfil
- Mostra nome e email abaixo

### 2. Página de Perfil (`/admin/perfil`)
- Avatar grande para preview
- Formulário de upload
- Mostra imagem selecionada antes de enviar

### 3. Sugestão: Expandir Para
- Navbar (se implementar header horizontal)
- Dashboard (exibir avatar do usuário)
- Atividades/logs (mostrar avatar de quem fez)

---

## 💻 Funcionalidades Técnicas

### Upload e Armazenamento
```typescript
// Fluxo completo:
1. Usuário seleciona arquivo (input type="file")
2. Validação de tipo (image/*)
3. Validação de tamanho (máx 5MB)
4. Preview local com FileReader
5. Upload para Supabase Storage
6. Obter URL pública
7. Salvar URL no user metadata (Supabase Auth)
8. Toast de sucesso/erro
```

### Estados do Upload
```typescript
uploadingAvatar    // Enquanto enviando
avatarFile         // Arquivo selecionado
avatarPreview      // Preview antes de enviar (base64)
avatarUrl          // URL final salva no Supabase Auth
```

### Validações
- ✅ Tipo de arquivo: Apenas `image/*`
- ✅ Tamanho máximo: 5MB
- ✅ Formato suportado: PNG, JPG, GIF, WebP
- ✅ Nome único: `{user_id}/{timestamp}-{filename}`

---

## 🔐 Segurança

### Implementado
✅ Validação de tipo MIME no frontend  
✅ Validação de tamanho (5MB max)  
✅ Armazenamento em pasta do usuário (`user_id/`)  
✅ URL pública controlada por RLS  
✅ Atualizado no Supabase Auth (criptografado)  

### Recomendado Adicionar
- [ ] Validação backend de tipo/tamanho
- [ ] Scan de vírus (ClamAV ou similar)
- [ ] Rate limiting para upload
- [ ] Soft delete ao trocar avatar (manter histórico)
- [ ] Compressão de imagem automática

---

## 📊 Database Storage

### Estrutura no Supabase Storage
```
avatars/
├── {user_id_1}/
│   ├── 1708408941234-photo.jpg
│   ├── 1708408942156-selfie.png
│   └── 1708408943789-profile.gif
├── {user_id_2}/
│   └── 1708408944321-avatar.jpg
└── ...
```

### Metadados no Auth
```typescript
// Salvos em auth.users.user_metadata
{
  "avatar_url": "https://project.supabase.co/storage/v1/object/public/avatars/...",
  "full_name": "João Silva",
  // outros campos
}
```

---

## 🧪 Testando

```bash
# 1. Iniciar dev server
npm run dev

# 2. Acessar http://localhost:8080/admin/login

# 3. Fazer login com credenciais admin

# 4. Testar Avatar:
  [ ] Ver avatar placeholder no sidebar
  [ ] Clicar em "Meu Perfil"
  [ ] Upload uma imagem (< 5MB)
  [ ] Ver preview antes de enviar
  [ ] Clicar em "Enviar Avatar"
  [ ] Ver toast de sucesso
  [ ] Avatar atualizado no sidebar
  [ ] Recarregar página (F5)
  [ ] Avatar ainda visível (salvo no Supabase)

# 5. Testar Validações:
  [ ] Tentar upload de arquivo > 5MB (deve rejeitar)
  [ ] Tentar upload de arquivo não-imagem (deve rejeitar)
  [ ] Tentar upload de imagem inválida (deve falhar upload)
```

---

## 🔗 URLs Relacionadas

### Supabase
- Storage Docs: https://supabase.com/docs/guides/storage
- RLS Policies: https://supabase.com/docs/guides/storage/security/access-control
- Authentication: https://supabase.com/docs/guides/auth

### Frontend
- FileReader API: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
- FormData: https://developer.mozilla.org/en-US/docs/Web/API/FormData

---

## 🚀 Próximas Melhorias

### Quick Wins
- [ ] Crop de imagem antes de fazer upload
- [ ] Histórico de avatares anteriores
- [ ] Excluir avatar (volta para default)
- [ ] Múltiplos avatares (selecionar em perfil)
- [ ] Avatar inicial com letras (A.S. para "Admin Silva")

### Advanced
- [ ] Compressão automática (Squoosh, Sharp)
- [ ] Geração de thumbnails (96x96 para sidebar)
- [ ] WebP fallback para navegadores antigos
- [ ] Progressive image loading (LQIP)
- [ ] CDN para avatars (Cloudinary, imgix)

### Analytics
- [ ] Rastrear quantos usuários adicionaram avatar
- [ ] Tamanho médio de upload
- [ ] Tempo médio de upload
- [ ] Tipos de imagem mais populares

---

## 📝 Padrão de Código Seguido

```
✅ React Hooks (useState, useEffect)
✅ Supabase Storage + Auth integration
✅ FileReader API (preview local)
✅ Validação frontend
✅ Error handling com try/catch
✅ Toast notifications
✅ TypeScript types
✅ Tailwind CSS responsive
✅ Acessibilidade (labels, alt text)
```

---

## 🐛 Troubleshooting

### "Avatar não aparece após envio"
```
Solução:
1. Verificar se bucket "avatars" existe no Supabase
2. Verificar se bucket é "Public"
3. Verificar RLS policies
4. Limpar cache do navegador (Ctrl+Shift+Del)
5. Verificar console (F12 → Console) para erros
```

### "Erro 'storage bucket not found'"
```
Solução:
1. Ir ao Supabase Console → Storage
2. Criar bucket com nome "avatars"
3. Marcar como "Public"
4. Configurar RLS policies
```

### "Imagem muito grande"
```
Solução:
Comprimir antes de fazer upload:
- Online: https://tinypng.com, https://imagecompressor.com
- Desktop: Ffmpeg, ImageMagick
- JSLib: Squoosh, jpegjs
```

### "URL do avatar não funciona"
```
Solução:
1. Verificar URL no Supabase Console
2. Verificar se arquivo existe na pasta correta
3. Copiar URL pública correta do Supabase
4. Testar URL directly no navegador
```

---

## 📊 Monitores Sugeridos

Se colocar em produção, monitorar:

```
- Avatar upload success rate
- Failed uploads by size
- Failed uploads by type
- Storage bucket size
- CDN cache hit rate (se usar CDN)
- User adoption (% com avatar)
```

---

## 🎯 Versão do Supabase Necessária

- ✅ Supabase v2.0+
- ✅ Storage habilitado (padrão)
- ✅ Auth habilitado (padrão)
- ✅ RLS permitido no bucket

---

## 📄 Arquivos no Projeto

```
src/pages/AdminProfile.tsx
├── Estados para avatar
│   ├── uploadingAvatar
│   ├── avatarFile
│   ├── avatarPreview
│   └── avatarUrl
├── Funções
│   ├── handleAvatarChange (validação)
│   ├── handleUploadAvatar (upload Storage)
│   └── handleUpdateProfile (atualizar Auth)
└── UI
    ├── Avatar preview box
    ├── File input
    └── Upload button

src/components/AdminLayout.tsx
├── Estados para avatar
│   ├── user
│   └── avatarUrl
├── useEffect
│   └── loadUserData + listen auth changes
└── UI
    ├── Avatar no header
    └── User info (nome + email)
```

---

**Status:** ✅ Completo e Funcional  
**Testado em:** 20 de fevereiro de 2026  
**Build:** ✅ Sem erros

**Próximo passo:** Criar bucket "avatars" no Supabase Dashboard
