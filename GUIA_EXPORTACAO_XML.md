# 📄 Exportação XML de Inscritos

## Visão Geral

A funcionalidade de exportação XML permite exportar dados de inscritos em formato XML com estrutura padronizada. O nome do arquivo inclui automaticamente o nome do evento selecionado.

---

## 🚀 Como Usar

### 1. **Acessar Inscrições**
   - No admin, acesse **Inscrições**
   - URL: `/admin/inscricoes`

### 2. **Aplicar Filtros (Opcional)**
   - **Filtre por evento** - o nome do evento aparecerá no arquivo XML
   - **Busque por nome/email** - exportará apenas os resultados filtrados

### 3. **Clicar em "XML"**
   - Botão fica ao lado de "Excel"
   - Arquivo será baixado automaticamente

### 4. **Resultado**
   - Arquivo XML estruturado
   - Nome: `[NomeDoEvento]_[data_hora].xml`
   - Exemplo: `Culto_Especial_28-02-2026_19-30-45.xml`

---

## 📝 Estrutura do XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Inscritos>
  <Inscrito>
    <ID>uuid-1234</ID>
    <Nome>João Silva</Nome>
    <Email>joao@example.com</Email>
    <Telefone>35999512568</Telefone>
    <CPF>123.456.789-00</CPF>
    <Evento>Culto Especial das Mulheres</Evento>
    <Status>Confirmada</Status>
    <DataInscricao>28/02/2026 19:43:46</DataInscricao>
    <StatusPagamento>Pago</StatusPagamento>
    <DataCadastro>2026-02-28</DataCadastro>
  </Inscrito>
  <Inscrito>
    ...
  </Inscrito>
</Inscritos>
```

---

## 🏷️ Campos do XML

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `ID` | UUID único da inscrição | `550e8400-e29b-41d4-a716-446655440000` |
| `Nome` | Nome completo do inscrito | `João Silva` |
| `Email` | Email para contato | `joao@example.com` |
| `Telefone` | Celular (ou "-" se não fornecido) | `35999512568` |
| `CPF` | CPF (ou "-" se não fornecido) | `123.456.789-00` |
| `Evento` | Nome do evento | `Culto Especial das Mulheres` |
| `Status` | Status da inscrição | `Confirmada`, `Pendente`, `Cancelada` |
| `DataInscricao` | Data/hora da inscrição | `28/02/2026 19:43:46` |
| `StatusPagamento` | Status do pagamento | `Pago`, `Pendente` |
| `DataCadastro` | Data em formato ISO | `2026-02-28` |

---

## 📂 Nome do Arquivo

O arquivo XML é nomeado de forma inteligente:

### **Se filtrar por evento específico:**
```
NomeDoEvento_28-02-2026_19-43-46.xml
Exemplo: Culto_Especial_28-02-2026_19-43-46.xml
```

### **Se selecionar "Todos os eventos":**
```
Inscritos_28-02-2026_19-43-46.xml
```

### **Tratamento de caracteres especiais:**
- Caracteres especiais (acentos, símbolos) são removidos
- Espaços são substituídos por `_`
- Unicode é convertido para ASCII

Exemplos:
- `"Acampamento de Carnaval"` → `Acampamento_de_Carnaval`
- `"Culto @ Igreja"` → `Culto_Igreja`
- `"Reunião #02"` → `Reuniao_02`

---

## 💡 Casos de Uso

### **Integração com Sistemas Externos**
- XML é facilmente importável em bancos de dados
- APIs externas podem processar XML
- Compatível com ETL (Extract, Transform, Load)

### **Backup de Dados**
- Formato legível por humanos e máquinas
- Preserva todas as informações
- Fácil de arquivar

### **Relatórios Personalizados**
- Importar em Excel via XML import
- Processar com scripts Python/JavaScript
- Gerar PDFs com ferramentas externas

### **Sincronização com CRM**
- Muitos CRMs (HubSpot, Salesforce) importam XML
- Estrutura padronizada facilita mapeamento

---

## 🔧 Tratamento de Caracteres Especiais

O XML escapa automaticamente:

| Caractere | Escape |
|-----------|--------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&apos;` |

Exemplo:
```xml
<Nome>João &amp; Maria</Nome>  <!-- Salvo como: João & Maria -->
```

---

## 📋 Diferenças: XML vs Excel

| Aspecto | XML | Excel |
|---------|-----|-------|
| Estrutura | Tags XML | Colunas/Linhas |
| Humano-legível | ✅ Sim | ✅ Sim |
| Máquina-processável | ✅ Alto | ✅ Médio |
| Integração APIs | ✅ Nativa | ❌ Requer parsing |
| Formatação visual | ❌ Não | ✅ Sim |
| Tamanho de arquivo | Médio | Pequeno |
| Importação em DB | ✅ Fácil | ⚠️ Médio |

---

## 🎯 Exemplo Completo

### Cenário: Exportar inscritos do "Acampamento"

1. **Filtro**: Selecione evento "Acampamento de Carnaval"
2. **Buscar**: (deixe em branco ou busque por nome)
3. **Clicar**: "XML"
4. **Download**: `Acampamento_de_Carnaval_28-02-2026_19-54-30.xml`

### Arquivo gerado:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Inscritos>
  <Inscrito>
    <ID>f7133ea1-2fed-4e2c-8b4a-5392f4109dd3</ID>
    <Nome>Eliezer de Jesus Miranda</Nome>
    <Email>zertec.eliezer@hotmail.com</Email>
    <Telefone>35999512568</Telefone>
    <CPF>064.972.646-49</CPF>
    <Evento>Acampamento de Carnaval</Evento>
    <Status>Confirmada</Status>
    <DataInscricao>28/02/2026 19:54:47</DataInscricao>
    <StatusPagamento>Pago</StatusPagamento>
    <DataCadastro>2026-02-28</DataCadastro>
  </Inscrito>
</Inscritos>
```

---

## 📞 Suporte

- ✅ Arquivo não abre? Tente abrir com um editor de texto (VS Code, Notepad++)
- ✅ Caracteres estranhos? Certifique-se de usar UTF-8
- ✅ Precisa de JSON? Processe o XML via script

---

## 🔮 Próximas Melhorias

- [ ] Exportar com validação XSD
- [ ] Adicionar mais metadados (IP, navegador, etc)
- [ ] Compactar XML em ZIP
- [ ] Suporte a múltiplos formatos (JSON, CSV)
