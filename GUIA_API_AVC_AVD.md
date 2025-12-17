# Guia de API - Consulta AVC e AVD

## Autenticação

Todas as requisições para as APIs de AVC e AVD requerem autenticação JWT (JSON Web Token).

### Fluxo de Autenticação

1. **Obter Token:** Faça login com credenciais para obter um token JWT
2. **Usar Token:** Inclua o token no header `Authorization: Bearer <token>` em todas as requisições
3. **Renovar Token:** Tokens expiram em 24 horas. Faça login novamente quando necessário

### Endpoint de Login

**Endpoint:** `POST /api/auth/login`

**Body:**
```
{
  "username": "admin",
  "password": "plataforma2024"
}
```

**Exemplo de Requisição:**

```bash
curl -X POST https://api.plataformaunica.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"plataforma2024"}'
```

**Resposta de Sucesso:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

## Endpoints

### 1. Consultar AVD (Análise de Valores Distribuídos)

**Endpoint:** `GET /api/avd`

**Descrição:** Retorna o relatório de análise de valores distribuídos por pagador.

**Headers:**
```
Authorization: Bearer <seu_token_jwt>
```

**Parâmetros de Query (opcionais):**
- `pagadorCodigo` - Filtrar por código específico do pagador

**Exemplo de Requisição:**

```bash
# Obter token primeiro
TOKEN=$(curl -X POST https://api.plataformaunica.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"plataforma2024"}' \
  | jq -r '.token')

# Consultar todos os AVDs
curl -X GET https://api.plataformaunica.com.br/api/avd \
  -H "Authorization: Bearer $TOKEN"

# Consultar AVD de um pagador específico
curl -X GET "https://api.plataformaunica.com.br/api/avd?pagadorCodigo=1001" \
  -H "Authorization: Bearer $TOKEN"
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
Authorization: Bearer <seu_token_jwt>
```

**Parâmetros de Query (opcionais):**
- `credorCodigo` - Filtrar por código específico do credor

**Exemplo de Requisição:**

```bash
# Obter token primeiro
TOKEN=$(curl -X POST https://api.plataformaunica.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"plataforma2024"}' \
  | jq -r '.token')

# Consultar todos os AVCs
curl -X GET https://api.plataformaunica.com.br/api/avc \
  -H "Authorization: Bearer $TOKEN"

# Consultar AVC de um credor específico
curl -X GET "https://api.plataformaunica.com.br/api/avc?credorCodigo=2001" \
  -H "Authorization: Bearer $TOKEN"
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
- `401` - Não autorizado (token inválido, expirado ou ausente)
- `500` - Erro interno do servidor

## Respostas de Erro

**401 - Não Autorizado:**
```json
{
  "error": "Não autorizado",
  "message": "Token inválido ou expirado"
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

### JavaScript/Fetch com Gerenciamento de Token

```javascript
class PlataformaUnicaAPI {
  constructor() {
    this.baseUrl = 'https://api.plataformaunica.com.br'
    this.token = null
    this.tokenExpiry = null
  }

  async login(username = 'admin', password = 'plataforma2024') {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) {
      throw new Error('Falha no login')
    }

    const data = await response.json()
    this.token = data.token
    // Expira em 24h - renovar 1h antes
    this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000)
    return data
  }

  async ensureValidToken() {
    if (!this.token || Date.now() >= this.tokenExpiry) {
      await this.login()
    }
  }

  async consultarAVD(pagadorCodigo = null) {
    await this.ensureValidToken()

    const url = pagadorCodigo 
      ? `${this.baseUrl}/api/avd?pagadorCodigo=${pagadorCodigo}`
      : `${this.baseUrl}/api/avd`
      
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  }

  async consultarAVC(credorCodigo = null) {
    await this.ensureValidToken()

    const url = credorCodigo 
      ? `${this.baseUrl}/api/avc?credorCodigo=${credorCodigo}`
      : `${this.baseUrl}/api/avc`
      
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  }
}

// Uso
const api = new PlataformaUnicaAPI()

// Consultar AVD (login automático)
api.consultarAVD()
  .then(data => console.log('AVD:', data))
  .catch(error => console.error('Erro:', error))

// Consultar AVC específico
api.consultarAVC('2001')
  .then(data => console.log('AVC:', data))
  .catch(error => console.error('Erro:', error))
```

### Python com Gerenciamento de Token

```python
import requests
from datetime import datetime, timedelta

class PlataformaUnicaAPI:
    def __init__(self):
        self.base_url = 'https://api.plataformaunica.com.br'
        self.token = None
        self.token_expiry = None

    def login(self, username='admin', password='plataforma2024'):
        response = requests.post(
            f'{self.base_url}/api/auth/login',
            json={'username': username, 'password': password}
        )
        
        if response.status_code != 200:
            raise Exception('Falha no login')
        
        data = response.json()
        self.token = data['token']
        # Expira em 24h - renovar 1h antes
        self.token_expiry = datetime.now() + timedelta(hours=23)
        return data

    def ensure_valid_token(self):
        if not self.token or datetime.now() >= self.token_expiry:
            self.login()

    def consultar_avd(self, pagador_codigo=None):
        self.ensure_valid_token()
        
        url = f'{self.base_url}/api/avd'
        params = {'pagadorCodigo': pagador_codigo} if pagador_codigo else None
        headers = {'Authorization': f'Bearer {self.token}'}
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f'Erro: {response.status_code} - {response.text}')

    def consultar_avc(self, credor_codigo=None):
        self.ensure_valid_token()
        
        url = f'{self.base_url}/api/avc'
        params = {'credorCodigo': credor_codigo} if credor_codigo else None
        headers = {'Authorization': f'Bearer {self.token}'}
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f'Erro: {response.status_code} - {response.text}')

# Uso
api = PlataformaUnicaAPI()

# Consultar AVD (login automático)
try:
    avd_data = api.consultar_avd()
    print('AVD:', avd_data)
except Exception as e:
    print('Erro:', e)

# Consultar AVC específico
try:
    avc_data = api.consultar_avc('2001')
    print('AVC:', avc_data)
except Exception as e:
    print('Erro:', e)
```

## Notas Importantes

1. **Segurança:** 
   - Tokens JWT expiram em 24 horas
   - Use HTTPS em produção
   - Armazene tokens de forma segura (não em localStorage para aplicações sensíveis)
   - Em produção, use variáveis de ambiente para credenciais

2. **Gerenciamento de Token:**
   - Implemente renovação automática antes da expiração
   - Trate erros 401 renovando o token e repetindo a requisição
   - Considere implementar refresh tokens para sessões longas

3. **Dados:** Atualmente a API retorna dados mockados. Em produção, integre com um banco de dados real.

4. **CORS:** Configure CORS adequadamente se a API for consumida por aplicações web de diferentes origens.

5. **Logs:** Implemente logging adequado para auditoria e debugging, incluindo tentativas de autenticação.
