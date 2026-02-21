# 🔒 Proteção Contra Duplicatas

## Problema
Sem proteção, usuários podem:
- Clicar 2x no botão (double-submit)
- Fazer múltiplas requisições simultâneas
- Enviar dados duplicados ao banco

## ✅ Soluções Implementadas

### 1. **UNIQUE Constraint (Banco de Dados)**
```sql
ALTER TABLE event_registrations ADD CONSTRAINT unique_email_per_event UNIQUE(email, event_id);
```

**O que faz:** Garante que apenas 1 inscrição por email por evento no banco.

---

### 2. **Verificação Prévia (Frontend)**
```typescript
// Antes de inserir, verifica se email já existe
supabase
  .from("event_registrations")
  .select("id")
  .eq("event_id", id!)
  .eq("email", form.email.trim())
  .neq("status", "cancelled")
  .single()
  .then(({ data }) => {
    if (data) {
      // Email já inscrito - rejeita
      toast("Você já está inscrito");
      return;
    }
    // Proceed com inscrição
    registerMutation.mutate();
  })
```

**O que faz:** Consulta BD antes de inserir. Se email existe, avisa usuário.

---

### 3. **Double-Submit Protection (UI)**
```typescript
const [isChecking, setIsChecking] = useState(false);

// Botão fica desabilitado durante verificação E envio
<Button disabled={registerMutation.isPending || isChecking} />
```

**O que faz:** Desabilita botão enquanto verifica duplicata ou processa inscrição.

---

### 4. **Tratamento de Erro (Redundância)**
```typescript
onError: (err: any) => {
  if (errorMessage.includes("unique") || err.code === "23505") {
    // UNIQUE constraint violado no banco
    toast("Você já está inscrito");
  } else {
    toast("Erro: " + errorMessage);
  }
}
```

**O que faz:** Se mesmo assim uma duplicata chegar ao banco, captura o erro UNIQUE e avisa.

---

## 🎯 Cenários Cobertos

| Cenário | Proteção |
|---------|----------|
| Usuário clica 2x botão | ✅ Button desabilitado |
| Múltiplas requisições simultâneas | ✅ Verificação prévia + UNIQUE |
| Email duplicado no BD | ✅ UNIQUE constraint + erro capturado |
| Race condition | ✅ Verificação + UNIQUE redundantes |
| Usuário tira screenshot e reenvia | ✅ UNIQUE constraint |

---

## 📊 Fluxo Completo

```
Usuário clica "Inscrever"
    ↓
[Botão desabilitado → Verificando...]
    ↓
Consulta BD: SELECT onde email=X e event_id=Y
    ↓
┌─ Encontrou? → Toast "Você já está inscrito" → FIM
│
└─ Não encontrou? → INSERT nova inscrição
    ↓
┌─ Sucesso → Toast "Inscrito!" → Mostrar link pagamento
│
└─ Erro UNIQUE → Captura erro → Toast "Você já está inscrito"
```

---

## 🧪 Teste

1. Preencher formulário com email `teste@example.com`
2. Clicar "Inscrever"
3. Tentar inscrever novamente com o mesmo email

**Resultado esperado:**
- 1ª tentativa: ✅ Sucesso
- 2ª tentativa: ❌ "Você já está inscrito"

---

## 📝 Mudanças Feitas

### EventDetailPage.tsx
- ✅ Adicionado estado `isChecking`
- ✅ Verificação de duplicata antes de INSERT
- ✅ Desabilitar botão durante verificação
- ✅ Mensagens de erro melhoradas

### SCRIPT_CORRIGIR_RLS.sql
- ✅ Adicionado UNIQUE constraint em event_registrations

---

## 🚀 Próximos Passos

1. Execute o script SQL:
   ```sql
   ALTER TABLE event_registrations ADD CONSTRAINT unique_email_per_event UNIQUE(email, event_id);
   ```

2. Teste a inscrição do formulário

3. Se erro 401/422 persistir, veja [DEBUG_ERROS_401_422.md](DEBUG_ERROS_401_422.md)
