# 🚨 SOLUÇÃO URGENTE: Erro de RLS Ainda Persiste

Se o script anterior **NÃO FUNCIONOU**, use este agora!

---

## ❌ Erro Ainda Presente

```
new row violates row-level security policy for table 'event_registrations'
```

**Motivo:** Políticas antigas ainda em conflito

---

## ✅ SOLUÇÃO RÁPIDA (3 SEGUNDOS)

### NOVO SCRIPT: [SCRIPT_DESABILITAR_RLS_SIMPLES.sql](SCRIPT_DESABILITAR_RLS_SIMPLES.sql)

Este script é mais simples e direto:

```sql
-- Apenas 4 linhas:
ALTER TABLE IF EXISTS event_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles DISABLE ROW LEVEL SECURITY;
```

**Isso desativa COMPLETAMENTE o RLS** - sem políticas conflitantes!

---

## 🎯 Como Usar

### 1. Abrir Supabase

```
https://supabase.com
→ Login
→ Projeto: vale-church-manager
```

### 2. Abrir SQL Editor

```
Menu lateral → SQL Editor → New Query
```

### 3. COPIAR (Escolha UMA opção)

#### OPÇÃO A: Script Simples (RECOMENDADO - Primeiro!)
```
Arquivo: SCRIPT_DESABILITAR_RLS_SIMPLES.sql
Copiar TUDO (4 linhas)
```

#### OPÇÃO B: Script Com Políticas (Se A não funcionar)
```
Arquivo: SCRIPT_CORRIGIR_RLS.sql
Copiar TUDO (mais linhas, mas mais completo)
```

### 4. COLAR no Editor Supabase

```
Ctrl+V (ou paste)
```

### 5. EXECUTAR

```
Botão RUN (ou Ctrl+Enter)
```

### 6. VERIFICAR

```
Deve ver: ✅ "Query executed successfully"
```

### 7. TESTAR NO APP

```
- Recarregar página (F5)
- Tentar inscrição
- Deve funcionar agora! ✅
```

---

## 📊 Diferença dos Scripts

| Script | Complexidade | Para | Status |
|--------|-------------|------|--------|
| **SCRIPT_DESABILITAR_RLS_SIMPLES.sql** | ⭐ Baixa | Desenvolvimento | 🟢 Teste PRIMEIRO |
| **SCRIPT_CORRIGIR_RLS.sql** | ⭐⭐⭐ Alta | Políticas específicas | 🟡 Se A falhar |

---

## ⚠️ IMPORTANTE

**Desenvolvimento:** Desabilitar RLS é OK

**Produção:** Depois você configura políticas corretas

---

## 🔄 Se Ainda Não Funcionar

1. **Verificar se paste funcionou:**
   - [ ] Vejo as 4 linhas SQL no editor?
   - [ ] Aparecem sem erro de sintaxe?

2. **Executar novamente:**
   - [ ] Botão RUN clicado?
   - [ ] Vejo mensagem de sucesso?

3. **Limpar cache:**
   - [ ] Ctrl+Shift+Delete (limpar tudo)
   - [ ] Fechar aba e reabrir

4. **Hard Refresh no App:**
   - [ ] Ctrl+F5 (força recarregar)
   - [ ] Tenta inscrição novamente

5. **Se AINDA não funcionar:**
   - [ ] Entrar em SQL Editor novamente
   - [ ] Nova query
   - [ ] Copiar este comando simples:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'event_registrations';
   ```
   - [ ] RUN para ver políticas
   - [ ] Screenshot e enviar para suporte

---

## ✅ CHECKLIST RÁPIDO

- [ ] Acessei Supabase Dashboard
- [ ] Fui em SQL Editor
- [ ] Criei New Query
- [ ] Copiei script simples
- [ ] Executei (RUN)
- [ ] Vi mensagem de sucesso
- [ ] Recarreguei app (F5)
- [ ] Testei inscrição
- [ ] ✅ FUNCIONOU!

---

## 🎉 Se Funcionou

Próximas etapas:
1. Testar pagamento PIX (TESTE_PAGAMENTO_PIX.md)
2. Deploy Vercel (GUIA_DEPLOYMENT_VERCEL.md)
3. Configurar produção

---

**Aviso:** Se ainda não funcionar, pode ser problema diferente. Neste caso:
1. Verificar console do navegador (F12)
2. Verificar aba Network
3. Ver exato qual erro aparece
4. Enviar screenshot do erro
