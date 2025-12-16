# API de Pagamentos - Plataforma Única

## POST /api/pagamentos

Cria um novo pagamento no sistema com associação ao credor.

### Request

**Endpoint:** `POST /api/pagamentos`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "codigo": "1234",
  "data": "15/01/2024",
  "pagador": "Empresa Exemplo LTDA",
  "cnpj": "12345678000190",
  "valor": 1500.50,
  "canal": "Internet Banking",
  "banco": "Banco do Brasil",
  "identificacao": "TRF123456",
  "formaPagamento": "pix",
  "observacao": "Pagamento referente à fatura 001",
  "credorCodigo": "C001",
  "credorNome": "Fornecedor XYZ",
  "credorDocumento": "98765432000111",
  "credorFormaRecebimento": "PIX"
}
```

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `codigo` | string | Sim | Código do pagador |
| `data` | string | Sim | Data do pagamento no formato DD/MM/YYYY |
| `pagador` | string | Sim | Nome do pagador |
| `cnpj` | string | Sim | CNPJ do pagador (14 dígitos) |
| `valor` | number | Sim | Valor do pagamento (deve ser maior que zero) |
| `canal` | string | Sim | Canal de recebimento |
| `banco` | string | Sim | Nome do banco |
| `identificacao` | string | Sim | Identificação da transação |
| `formaPagamento` | string | Sim | Forma de pagamento: `pix`, `ted`, `boleto` ou `transferencia` |
| `observacao` | string | Não | Observações adicionais sobre o pagamento |
| `credorCodigo` | string | Sim | Código do credor no sistema |
| `credorNome` | string | Sim | Nome do credor |
| `credorDocumento` | string | Sim | CNPJ/CPF do credor |
| `credorFormaRecebimento` | string | Sim | Forma de recebimento preferencial do credor |

### Response

**Sucesso (201 Created):**
```json
{
  "success": true,
  "message": "Pagamento criado com sucesso",
  "data": {
    "id": "PAG-1234567890-abc123def",
    "codigo": "1234",
    "data": "15/01/2024",
    "pagador": "Empresa Exemplo LTDA",
    "cnpj": "12345678000190",
    "valor": 1500.50,
    "valorEsperado": 1500.50,
    "canal": "Internet Banking",
    "banco": "Banco do Brasil",
    "identificacao": "TRF123456",
    "status": "excecao",
    "tipo": "igual",
    "observacao": "Pagamento referente à fatura 001",
    "origem": "api",
    "formaPagamento": "pix",
    "credor": {
      "codigo": "C001",
      "nome": "Fornecedor XYZ",
      "documento": "98765432000111",
      "formaRecebimento": "PIX"
    }
  }
}
```

**Erro de Validação (400 Bad Request):**
```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": [
    "Campo 'codigo' é obrigatório",
    "Campo 'cnpj' é obrigatório e deve ter 14 dígitos",
    "Campo 'credorCodigo' é obrigatório"
  ]
}
```

**Erro do Servidor (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Erro ao processar requisição",
  "error": "Descrição do erro"
}
```

### Exemplos de Uso

**cURL:**
```bash
curl -X POST http://localhost:3000/api/pagamentos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "1234",
    "data": "15/01/2024",
    "pagador": "Empresa Exemplo LTDA",
    "cnpj": "12345678000190",
    "valor": 1500.50,
    "canal": "Internet Banking",
    "banco": "Banco do Brasil",
    "identificacao": "TRF123456",
    "formaPagamento": "pix",
    "credorCodigo": "C001",
    "credorNome": "Fornecedor XYZ",
    "credorDocumento": "98765432000111",
    "credorFormaRecebimento": "PIX"
  }'
```

**JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:3000/api/pagamentos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    codigo: '1234',
    data: '15/01/2024',
    pagador: 'Empresa Exemplo LTDA',
    cnpj: '12345678000190',
    valor: 1500.50,
    canal: 'Internet Banking',
    banco: 'Banco do Brasil',
    identificacao: 'TRF123456',
    formaPagamento: 'pix',
    credorCodigo: 'C001',
    credorNome: 'Fornecedor XYZ',
    credorDocumento: '98765432000111',
    credorFormaRecebimento: 'PIX',
  }),
});

const result = await response.json();
console.log(result);
```

### Notas

- Todos os pagamentos criados via API recebem status inicial `excecao`
- A origem é automaticamente definida como `api`
- O ID é gerado automaticamente no formato `PAG-{timestamp}-{random}`
- O CNPJ é automaticamente normalizado (remove caracteres não numéricos)
- A data deve estar no formato brasileiro (DD/MM/YYYY)
- **Importante:** A associação com o credor é obrigatória para rastreabilidade e conciliação
