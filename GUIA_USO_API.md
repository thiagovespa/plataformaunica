# Guia de Uso da API - Plataforma Única

## Visão Geral

Este guia apresenta instruções práticas para usar a API REST de inserção de pagamentos da Plataforma Única.

## Endpoint Disponível

### Inserir Novo Pagamento

**URL:** `POST /api/pagamentos`

**Tipo de Conteúdo:** `application/json`

---

## Passo a Passo

### 1. Preparar os Dados do Pagamento

Antes de enviar a requisição, você precisa coletar as seguintes informações:

#### Dados Obrigatórios do Pagador:
- **data**: Data do pagamento (formato: YYYY-MM-DD)
- **valor**: Valor do pagamento (número com até 2 casas decimais)
- **pagador**: Nome completo do pagador
- **cnpj**: CNPJ do pagador (14 dígitos, sem formatação)
- **formaPagamento**: Forma como o pagamento foi feito (ex: PIX, TED, DOC, Boleto)

#### Dados Obrigatórios do Credor:
- **credorCodigo**: Código identificador do credor
- **credorNome**: Nome ou razão social do credor
- **credorDocumento**: CNPJ do credor (14 dígitos)
- **credorFormaRecebimento**: Como o credor recebe (ex: PIX, TED, DOC)

#### Dados Opcionais:
- **codigo**: Código interno do pagador
- **banco**: Nome do banco
- **canal**: Canal de pagamento
- **identificacao**: Identificação adicional
- **observacao**: Observações sobre o pagamento

### 2. Montar o JSON

Exemplo de estrutura JSON:

```json
{
  "data": "2024-01-15",
  "valor": 2500.75,
  "pagador": "Empresa ABC Ltda",
  "cnpj": "12345678901234",
  "codigo": "PAG001",
  "formaPagamento": "PIX",
  "banco": "Banco Bradesco",
  "canal": "Internet Banking",
  "identificacao": "TRX-2024-001",
  "credorCodigo": "CRED001",
  "credorNome": "Fornecedor XYZ S.A.",
  "credorDocumento": "98765432109876",
  "credorFormaRecebimento": "TED",
  "observacao": "Pagamento referente à nota fiscal 12345"
}
```

### 3. Enviar a Requisição

#### Usando cURL (Terminal/Linha de Comando):

```bash
curl -X POST http://localhost:3000/api/pagamentos \
  -H "Content-Type: application/json" \
  -d '{
    "data": "2024-01-15",
    "valor": 2500.75,
    "pagador": "Empresa ABC Ltda",
    "cnpj": "12345678901234",
    "codigo": "PAG001",
    "formaPagamento": "PIX",
    "banco": "Banco Bradesco",
    "credorCodigo": "CRED001",
    "credorNome": "Fornecedor XYZ S.A.",
    "credorDocumento": "98765432109876",
    "credorFormaRecebimento": "TED"
  }'
```

#### Usando JavaScript/Node.js:

```javascript
const novoPagamento = {
  data: "2024-01-15",
  valor: 2500.75,
  pagador: "Empresa ABC Ltda",
  cnpj: "12345678901234",
  codigo: "PAG001",
  formaPagamento: "PIX",
  banco: "Banco Bradesco",
  credorCodigo: "CRED001",
  credorNome: "Fornecedor XYZ S.A.",
  credorDocumento: "98765432109876",
  credorFormaRecebimento: "TED"
};

fetch('http://localhost:3000/api/pagamentos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(novoPagamento)
})
  .then(response => response.json())
  .then(data => {
    console.log('Sucesso:', data);
  })
  .catch(error => {
    console.error('Erro:', error);
  });
```

#### Usando Python:

```python
import requests
import json

novo_pagamento = {
    "data": "2024-01-15",
    "valor": 2500.75,
    "pagador": "Empresa ABC Ltda",
    "cnpj": "12345678901234",
    "codigo": "PAG001",
    "formaPagamento": "PIX",
    "banco": "Banco Bradesco",
    "credorCodigo": "CRED001",
    "credorNome": "Fornecedor XYZ S.A.",
    "credorDocumento": "98765432109876",
    "credorFormaRecebimento": "TED"
}

response = requests.post(
    'http://localhost:3000/api/pagamentos',
    headers={'Content-Type': 'application/json'},
    data=json.dumps(novo_pagamento)
)

if response.status_code == 201:
    print('Sucesso:', response.json())
else:
    print('Erro:', response.json())
```

### 4. Interpretar a Resposta

#### Resposta de Sucesso (201 Created):

```json
{
  "success": true,
  "message": "Pagamento inserido com sucesso",
  "pagamento": {
    "id": "1234567890",
    "data": "2024-01-15T00:00:00.000Z",
    "valor": 2500.75,
    "pagador": "Empresa ABC Ltda",
    "cnpj": "12345678901234",
    "codigo": "PAG001",
    "formaPagamento": "PIX",
    "banco": "Banco Bradesco",
    "status": "pendente",
    "credor": {
      "codigo": "CRED001",
      "nome": "Fornecedor XYZ S.A.",
      "documento": "98765432109876",
      "formaRecebimento": "TED"
    }
  }
}
```

#### Resposta de Erro (400 Bad Request):

```json
{
  "success": false,
  "error": "Campos obrigatórios faltando: credorCodigo, credorDocumento"
}
```

---

## Validações Importantes

### 1. Formato de Data
- Deve estar no formato `YYYY-MM-DD`
- Exemplo válido: `2024-01-15`
- Exemplos inválidos: `15/01/2024`, `2024/01/15`, `15-01-2024`

### 2. Formato de CNPJ
- Deve conter exatamente 14 dígitos numéricos
- Não deve conter formatação (pontos, barras, hífens)
- Exemplo válido: `12345678901234`
- Exemplos inválidos: `12.345.678/9012-34`, `123456789012` (13 dígitos)

### 3. Formato de Valor
- Deve ser um número positivo
- Pode ter até 2 casas decimais
- Exemplos válidos: `1500`, `1500.50`, `1500.5`
- Exemplos inválidos: `-1500`, `abc`, `1500.999`

---

## Erros Comuns e Soluções

### Erro: "Campos obrigatórios faltando"
**Causa:** Um ou mais campos obrigatórios não foram enviados.

**Solução:** Verifique se todos os campos obrigatórios estão presentes no JSON.

### Erro: "CNPJ inválido"
**Causa:** O CNPJ não tem 14 dígitos ou contém caracteres não numéricos.

**Solução:** Remova toda formatação e certifique-se de que o CNPJ tem exatamente 14 dígitos.

### Erro: "Data inválida"
**Causa:** A data não está no formato YYYY-MM-DD.

**Solução:** Converta a data para o formato correto antes de enviar.

### Erro: "Valor deve ser maior que zero"
**Causa:** O valor é negativo ou zero.

**Solução:** Envie um valor positivo.

---

## Testando a API

### Usando Postman:

1. Abra o Postman
2. Crie uma nova requisição POST
3. Configure a URL: `http://localhost:3000/api/pagamentos`
4. Na aba "Headers", adicione:
   - Key: `Content-Type`
   - Value: `application/json`
5. Na aba "Body", selecione "raw" e cole o JSON de exemplo
6. Clique em "Send"

### Usando Insomnia:

1. Abra o Insomnia
2. Crie uma nova requisição HTTP
3. Selecione o método POST
4. Configure a URL: `http://localhost:3000/api/pagamentos`
5. No corpo da requisição, selecione "JSON"
6. Cole o JSON de exemplo
7. Clique em "Send"

---

## Integração em Produção

Quando a aplicação estiver em produção, substitua `http://localhost:3000` pela URL de produção:

```
https://seu-dominio.com/api/pagamentos
```

---

## Suporte

Para dúvidas ou problemas com a API, consulte a documentação técnica completa em `API_DOCUMENTATION.md` ou entre em contato com a equipe de desenvolvimento.
