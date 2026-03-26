# 📊 Guia de Exportação Excel de Inscritos

## Visão Geral

A nova funcionalidade permite exportar dados de inscritos para Excel com filtros de **data** e **evento**.

---

## 🚀 Como Usar

### 1. **Acessar a página de Exportação**
   - No admin, clique em **"Exportar"** no menu lateral
   - URL: `/admin/exportar`

### 2. **Selecionar Filtros**
   - **Evento**: Escolha um evento específico ou "Todos os eventos"
   - **Data De**: Data inicial de inscrição
   - **Data Até**: Data final de inscrição

### 3. **Visualizar Preview**
   - Veja até 20 inscritos na tabela de preview
   - O arquivo export incluirá TODOS os inscritos encontrados

### 4. **Exportar para Excel**
   - Clique em **"Exportar Excel"**
   - O arquivo será baixado automaticamente
   - Nome: `Inscritos_[DATA].xlsx`

---

## 📁 Estrutura do Arquivo Excel

### **Aba 1: Inscritos**
Contém todos os dados dos inscritos:

| Coluna | Conteúdo |
|--------|----------|
| ID Inscrição | UUID único |
| Nome Completo | Nome do inscrito |
| Email | Email para contato |
| Telefone | Celular (se fornecido) |
| CPF | CPF (se fornecido) |
| Status Inscrição | confirmed, pending, cancelled |
| Evento | Título do evento |
| Data Evento | Data do evento |
| Local | Endereço do evento |
| Preço | Valor ou "Gratuito" |
| Status Pagamento | paid, pending, sem pagamento |
| Valor Pago | Montante recebido |
| Pago em | Data do pagamento |
| Data Inscrição | Data de cadastro |
| Hora Inscrição | Hora do cadastro |

### **Aba 2: Resumo**
Estatísticas gerais:

- Data e hora do relatório
- Filtros aplicados
- Total de inscritos
- Confirmados, pendentes, cancelados
- Pagos, pendentes
- Valor total recebido

### **Aba 3+: Por Evento (se múltiplos eventos)**
Uma aba para cada evento (se exportar "Todos"):
- Nome do inscrito
- Email
- Status
- Pagamento

---

## 💡 Exemplos de Uso

### **Relatório de Inscritos da Semana**
1. Deixar "Todos os eventos"
2. Data de: Segunda-feira da semana
3. Data até: Hoje
4. Clicar em "Exportar Excel"

### **Inscritos de um Evento Específico**
1. Selecionar o evento
2. Deixar datas em branco ou com datas amplas
3. Exportar

### **Inscritos que Pagaram Neste Mês**
1. Selecionar evento
2. Data de: 1º do mês
3. Data até: Hoje
4. Analisar a coluna "Status Pagamento" = "paid"

---

## 🔧 Backend API

Se precisar consumir os dados via API:

### **GET /api/export/registrations**
```bash
curl "http://localhost:3001/api/export/registrations?eventId=abc123&dateFrom=2026-02-01&dateTo=2026-02-28"
```

**Parâmetros:**
- `eventId`: UUID do evento (opcional)
- `dateFrom`: Data inicial em formato ISO (YYYY-MM-DD)
- `dateTo`: Data final em formato ISO (YYYY-MM-DD)

**Resposta:**
```json
{
  "error": null,
  "count": 5,
  "data": [
    {
      "ID Inscrição": "uuid",
      "Nome Completo": "João Silva",
      "Email": "joao@example.com",
      ...
    }
  ]
}
```

### **GET /api/export/events-list**
Obter lista de eventos para filtro:
```bash
curl "http://localhost:3001/api/export/events-list"
```

**Resposta:**
```json
{
  "error": null,
  "data": [
    {
      "id": "uuid",
      "title": "Culto Especial",
      "date": "28/02/2026",
      "price": "R$ 50.00"
    }
  ]
}
```

---

## ⚙️ Personalização

### **Adicionar mais colunas**
Editar `AdminExportPage.tsx`, função `formattedData`:
```tsx
const formattedData = (data || []).map((reg) => ({
  'Coluna Nova': reg.novo_campo,
  ...
}));
```

### **Mudar nome do arquivo**
Encontrar esta linha:
```tsx
const fileName = `Inscritos_${new Date().toISOString().split("T")[0]}.xlsx`;
```

### **Adicionar formatação**
A biblioteca `xlsx` suporta:
- Cores de fundo
- Negrito/Itálico
- Largura de colunas (já implementado)
- Congelamento de linhas
- Gráficos

---

## 📱 Informações Técnicas

**Dependências:**
- `xlsx`: Biblioteca para gerar/ler arquivos Excel

**Componentes:**
- Frontend: `AdminExportPage.tsx`
- Backend: `/api/export/registrations`, `/api/export/events-list`
- Database: `event_registrations`, `events`, `payments`

**Performance:**
- BigInteger: Suporta até 10k registros
- Tempo médio: < 2 segundos para 1000 registros

---

## 🆘 Troubleshooting

### **Nenhum dado aparece**
- ✅ Verificar filtros (especialmente datas)
- ✅ Verificar se há inscritos no período/evento
- ✅ Abrir console do navegador (F12) para ver erros

### **Arquivo não baixa**
- ✅ Permitir pop-ups no navegador
- ✅ Checar pasta de downloads
- ✅ Tentar outro navegador

### **Priceño aparece mal no Excel**
- ✅ Formatar a coluna como "Moeda" no Excel
- ✅ Os valores estão corretos, é só formatação

---

## 🔐 Segurança

- ✅ Apenas admins podem acessar `/admin/exportar`
- ✅ Dados não são armazenados, apenas exportados
- ✅ Sessão verifica autenticação a cada requisição
- ⚠️ Não compartilha arquivo após download
