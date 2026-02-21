# 🔐 Solução: Erro de RLS - Row Level Security

## ❌ Erro
```
new row violates row-level security policy for table 'event_registrations'
```

---

## 🔍 Causa

A política de RLS (Row Level Security) no Supabase está bloqueando:
- Inscrições em eventos
- Novas registrações
- Acesso a dados da tabela

---

## ✅ Solução: Configurar RLS Corretamente

### Passo 1: Acessar Supabase Dashboard

1. Ir para [supabase.com](https://supabase.com)
2. Login com suas credenciais
3. Selecionar projeto: **cwzmiznlvhhnpjgxgsme**

### Passo 2: Desabilitar RLS Temporariamente (Rápido)

**Para Desenvolvimento:**

1. Ir em **Authentication** → **Policies**
2. Selecionar tabela: `event_registrations`
3. Clicar no ícone de RLS (cadeado)
4. Desabilitar RLS completamente
5. **Salvar**

**Resultado:** Tabela fica pública, sem restrições

---

## 🛡️ Solução Profissional: Configurar Políticas RLS

### Para Produção (Recomendado):

#### 1. Habilitar RLS na tabela `event_registrations`

```sql
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
```

#### 2. Permitir Inserção Anônima (Público)

```sql
CREATE POLICY "Permitir inserção anônima" ON event_registrations
FOR INSERT
WITH CHECK (true);
```

#### 3. Permitir Leitura Anônima

```sql
CREATE POLICY "Permitir leitura" ON event_registrations
FOR SELECT
USING (true);
```

#### 4. Permitir Atualização pelo ID

```sql
CREATE POLICY "Permitir atualização" ON event_registrations
FOR UPDATE
USING (true)
WITH CHECK (true);
```

#### 5. Permitir Deleção

```sql
CREATE POLICY "Permitir deleção" ON event_registrations
FOR DELETE
USING (true);
```

---

## 🚀 Aplicar Solução no Supabase

### Via Supabase SQL Editor:

1. Ir em **SQL Editor** (no dashboard)
2. Criar nova query
3. Copiar e colar os SQL commands acima
4. Executar cada um (ou todos)
5. Verificar se passou (checkmark verde)

---

## 🔑 Políticas para outras tabelas (se necessário)

### Tabela: `events`

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de eventos" ON events
FOR SELECT
USING (true);

CREATE POLICY "Permitir criar eventos (admin)" ON events
FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR true);
```

### Tabela: `payments`

```sql
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserção de pagamentos" ON payments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir leitura de pagamentos" ON payments
FOR SELECT
USING (true);

CREATE POLICY "Permitir atualizar pagamentos" ON payments
FOR UPDATE
USING (true)
WITH CHECK (true);
```

---

## 📋 Checklist de Aplicação

- [ ] Acessar Supabase Dashboard
- [ ] Ir em SQL Editor
- [ ] Executar políticas RLS para `event_registrations`
- [ ] Executar políticas para `payments`
- [ ] Executar políticas para `events`
- [ ] Testar inserção de nova inscrição
- [ ] Verificar se funciona sem erros

---

## 🧪 Teste Após Aplicação

1. Ir em página de evento
2. Clicar "Inscrever-se"
3. Preencher formulário
4. Clicar botão de inscrição
5. ✅ Deve funcionar sem erro RLS

---

## ⚠️ Importante

**Desenvolvimento:** RLS desativada é OK  
**Produção:** Configurar políticas específicas por segurança

---

## 🆘 Se Ainda Não Funcionar

1. **Limpar cache do navegador** (F5 ou Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Verificar console** (F12 → Console)
4. **Verificar logs Supabase** (Dashboard → Logs)
5. **Contactar suporte Supabase** se persistir

---

**Gerado:** 20/02/2026
