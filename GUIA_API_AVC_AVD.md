# Guia de API - Consulta AVC e AVD

## Autenticação

Todas as requisições para as APIs de AVC e AVD requerem autenticação Basic Auth.

**Credenciais:**
- Usuário: `admin`
- Senha: `plataforma2024`

## Endpoints

### 1. Consultar AVD (Análise de Valores Distribuídos)

**Endpoint:** `GET /api/avd`

**Descrição:** Retorna o relatório de análise de valores distribuídos por pagador.

**Headers:**
```
Authorization: Basic YWRtaW46cGxhdGFmb3JtYTIwMjQ=
```

**Parâmetros de Query (opcionais):**
- `pagadorCodigo` - Filtrar por código específico do pagador

**Exemplo de Requisição:**

```bash
# Consultar todos os AVDs
curl -X GET https://api.plataformaunica.com.br/api/avd \
  -H "Authorization: Basic YWRtaW46cGxhdGFmb3JtYTIwMjQ="

# Consultar AVD de um pagador específico
curl -X GET "https://api.plataformaunica.com.br/api/avd?pagadorCodigo=1001" \
  -H "Authorization: Basic YWRtaW46cGxhdGFmb3JtYTIwMjQ="
```

**Exemplo de Resposta:**

```json
{
  "success": true,
  "data": {
    "metadata": {
      "dataConsulta": "2024-01-15T10:30:00.000Z",
      "totalPagadores": 15,
      "valorTotal": 125000.50
    },
    "pagadores": [
      {
        "pagadorCodigo": "1001",
        "pagadorNome": "Empresa ABC Ltda",
        "pagadorCnpj": "12345678901234",
        "credores": [
          {
            "credorCodigo": "2001",
            "credorNome": "Fornecedor XYZ",
            "valor": 5000.00
          },
          {
            "credorCodigo": "2002",
            "credorNome": "Prestador de Serviços",
            "valor": 3000.00
          }
        ],
        "total": 8000.00
      }
    ]
  },
  "message": "Relatório AVD consultado com sucesso"
}
```

### 2. Consultar AVC (Aviso de Crédito)

**Endpoint:** `GET /api/avc`

**Descrição:** Retorna o relatório de avisos de crédito por credor.

**Headers:**
```
Authorization: Basic YWRtaW46cGxhdGFmb3JtYTIwMjQ=
```

**Parâmetros de Query (opcionais):**
- `credorCodigo` - Filtrar por código específico do credor

**Exemplo de Requisição:**

```bash
# Consultar todos os AVCs
curl -X GET https://api.plataformaunica.com.br/api/avc \
  -H "Authorization: Basic YWRtaW46cGxhdGFmb3JtYTIwMjQ="

# Consultar AVC de um credor específico
curl -X GET "https://api.plataformaunica.com.br/api/avc?credorCodigo=2001" \
  -H "Authorization: Basic YWRtaW46cGxhdGFmb3JtYTIwMjQ="
```

**Exemplo de Resposta:**

```json
{
  "success": true,
  "data": {
    "metadata": {
      "dataConsulta": "2024-01-15T10:30:00.000Z",
      "totalCredores": 12,
      "valorTotal": 95000.75
    },
    "credores": [
      {
        "credorCodigo": "2001",
        "credorNome": "Fornecedor XYZ",
        "credorCnpj": "98765432109876",
        "pagadores": [
          {
            "pagadorCodigo": "1001",
            "pagadorNome": "Empresa ABC Ltda",
            "valor": 5000.00
          },
          {
            "pagadorCodigo": "1002",
            "pagadorNome": "Empresa DEF SA",
            "valor": 7500.00
          }
        ],
        "total": 12500.00
      }
    ]
  },
  "message": "Relatório AVC consultado com sucesso"
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `401` - Não autorizado (credenciais inválidas)
- `500` - Erro interno do servidor

## Respostas de Erro

**401 - Não Autorizado:**
```json
{
  "error": "Não autorizado",
  "message": "Credenciais inválidas"
}
```

**500 - Erro Interno:**
```json
{
  "error": "Erro interno do servidor",
  "message": "Não foi possível processar a consulta"
}
```

## Exemplos de Uso

### JavaScript/Fetch

```javascript
// Função auxiliar para criar o header de autenticação
function createAuthHeader(username, password) {
  const credentials = btoa(`${username}:${password}`)
  return `Basic ${credentials}`
}

// Consultar AVD
async function consultarAVD(pagadorCodigo = null) {
  const url = pagadorCodigo 
    ? `https://api.plataformaunica.com.br/api/avd?pagadorCodigo=${pagadorCodigo}`
    : 'https://api.plataformaunica.com.br/api/avd'
    
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': createAuthHeader('admin', 'plataforma2024')
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}

// Consultar AVC
async function consultarAVC(credorCodigo = null) {
  const url = credorCodigo 
    ? `https://api.plataformaunica.com.br/api/avc?credorCodigo=${credorCodigo}`
    : 'https://api.plataformaunica.com.br/api/avc'
    
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': createAuthHeader('admin', 'plataforma2024')
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}

// Uso
consultarAVD()
  .then(data => console.log('AVD:', data))
  .catch(error => console.error('Erro:', error))

consultarAVC('2001')
  .then(data => console.log('AVC:', data))
  .catch(error => console.error('Erro:', error))
```

### Python

```python
import requests
import base64

# Credenciais
username = 'admin'
password = 'plataforma2024'

# Criar header de autenticação
credentials = f"{username}:{password}"
encoded_credentials = base64.b64encode(credentials.encode()).decode()
headers = {
    'Authorization': f'Basic {encoded_credentials}'
}

# Consultar AVD
response = requests.get('https://api.plataformaunica.com.br/api/avd', headers=headers)
if response.status_code == 200:
    avd_data = response.json()
    print('AVD:', avd_data)
else:
    print('Erro:', response.status_code, response.text)

# Consultar AVC específico
response = requests.get(
    'https://api.plataformaunica.com.br/api/avc',
    headers=headers,
    params={'credorCodigo': '2001'}
)
if response.status_code == 200:
    avc_data = response.json()
    print('AVC:', avc_data)
else:
    print('Erro:', response.status_code, response.text)
```

## Notas Importantes

1. **Segurança:** As credenciais estão fixas no código para fins de demonstração. Em produção, use variáveis de ambiente e considere implementar OAuth2 ou JWT.

2. **Dados:** Atualmente a API retorna dados mockados. Em produção, integre com um banco de dados real.

3. **CORS:** Configure CORS adequadamente se a API for consumida por aplicações web de diferentes origens.

4. **Rate Limiting:** Considere implementar rate limiting para evitar abuso da API.

5. **Logs:** Implemente logging adequado para auditoria e debugging.
