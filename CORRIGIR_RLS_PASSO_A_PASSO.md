# 📸 Guia Visual: Corrigir Erro de RLS no Supabase

## ❌ O Erro

```
new row violates row-level security policy for table 'event_registrations'
```

Este erro significa que **não há permissão para inserir** dados na tabela.

---

## ✅ Solução em 5 Passos

### Passo 1: Acessar Supabase

```
1. Ir para: https://supabase.com
2. Fazer login
3. Selecionar projeto: "vale-church-manager"
```

### Passo 2: Abrir SQL Editor

```
No menu lateral:
- Clicar em "SQL Editor"
- Clicar em "New Query"
```

### Passo 3: Copiar Script

**Arquivo:** [SCRIPT_CORRIGIR_RLS.sql](SCRIPT_CORRIGIR_RLS.sql)

```sql
-- Copiar TODO o conteúdo deste arquivo
```

### Passo 4: Colar e Executar

```
1. No SQL Editor, colar o script completo
2. Clicar botão "RUN" (ou Ctrl+Enter)
3. Aguardar execução
4. Verificar se passou (checkmark ✅)
```

### Passo 5: Testar

```
1. Voltar ao app
2. Tentar inscrever em evento
3. Deve funcionar sem erro! ✅
```

---

## 🎯 Resultado Esperado

### Antes
```
❌ Erro: new row violates row-level security policy
```

### Depois
```
✅ Inscrição criada com sucesso!
✅ Redirecionado para AbacatePay
✅ Cobrança gerada
```

---

## 🐛 Troubleshooting

### "Erro ao executar"
- [ ] Copiar TUDO o script (não há sintaxe errada)
- [ ] Verificar que está no projeto correto
- [ ] Tentar com outro navegador

### "Ainda dá erro de RLS após executar"
- [ ] Limpar cache: Ctrl+Shift+Delete
- [ ] Hard refresh: Ctrl+F5
- [ ] Fechar aba e reabrir

### "Não encontro SQL Editor"
- [ ] Clicar em "Supabase" no menu
- [ ] Procurar aba "SQL" ou "Query"
- [ ] Pode estar em "Development" → "SQL Editor"

---

## 📊 Políticas Criadas

| Tabela | Operação | Permitir |
|--------|----------|---------|
| event_registrations | INSERT | ✅ Sim |
| event_registrations | SELECT | ✅ Sim |
| event_registrations | UPDATE | ✅ Sim |
| event_registrations | DELETE | ✅ Sim |
| events | SELECT | ✅ Sim |
| events | INSERT | ✅ Sim |
| events | UPDATE | ✅ Sim |
| payments | INSERT | ✅ Sim |
| payments | SELECT | ✅ Sim |
| payments | UPDATE | ✅ Sim |
| payments | DELETE | ✅ Sim |

---

## 🔒 Nota de Segurança

**Para Desenvolvimento:** Estas políticas são abertas (qualquer pessoa pode inserir)

**Para Produção:** Você deve:
1. Implementar autenticação via JWT
2. Restringir por user_id
3. Validar dados no backend
4. Adicionar mais camadas de segurança

---

## ✅ Confirmação

Após executar:
- [ ] Script executou sem erros
- [ ] Voltei ao app
- [ ] Testei inscrição
- [ ] Funcionou! ✅

Se tudo passou, pode agora:
1. **Testar pagamento PIX** (confira TESTE_PAGAMENTO_PIX.md)
2. **Deploy na Vercel** (confira GUIA_DEPLOYMENT_VERCEL.md)
3. **Configurar produção**

---

**Dúvidas?** Veja [SOLUCAO_ERRO_RLS.md](SOLUCAO_ERRO_RLS.md) para mais detalhes.
