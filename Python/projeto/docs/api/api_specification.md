# Especificação da API REST — EcoAlerta

> Versão: 1.0 | Base URL: `https://api.ecoalerta.local/api/v1`
> Padrão: REST | Formato: JSON | Autenticação: JWT Bearer Token

---

## Sumário

1. [Convenções Gerais](#convenções-gerais)
2. [Autenticação](#autenticação)
3. [Módulo: Usuários](#módulo-usuários)
4. [Módulo: Denúncias](#módulo-denúncias)
5. [Módulo: Fotos](#módulo-fotos)
6. [Módulo: Mapa](#módulo-mapa)
7. [Módulo: Relatórios](#módulo-relatórios)
8. [Módulo: Bairros](#módulo-bairros)
9. [Códigos de Erro](#códigos-de-erro)

---

## Convenções Gerais

### Headers Obrigatórios

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}    ← apenas endpoints protegidos
```

### Paginação

Endpoints de listagem suportam paginação via query params:

```
?page=1&limit=20
```

A resposta inclui metadados de paginação:

```json
{
  "data": [...],
  "pagination": {
    "total": 143,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Formato de Datas

Todas as datas são retornadas no formato **ISO 8601** em UTC:
`2026-03-28T14:30:00.000Z`

### Versão da API

A versão está no path: `/api/v1/`. Mudanças não retrocompatíveis implicam nova versão.

---

## Autenticação

### Como funciona

O sistema utiliza **JWT (JSON Web Token)**. Após o login bem-sucedido, o cliente recebe um token que deve ser enviado no header `Authorization: Bearer {token}` em todas as requisições a endpoints protegidos.

O token tem validade de **24 horas**. Após expiração, o cliente deve realizar novo login.

### Níveis de Acesso

| Símbolo | Descrição |
|---------|-----------|
| 🌐 | Público — não requer autenticação |
| 🔐 | Requer autenticação (qualquer perfil) |
| 👤 | Cidadão autenticado |
| 🛡️ | Administrador |
| 🧹 | Equipe de Limpeza ou superior |

---

### POST /auth/register

**Descrição:** Registra um novo usuário cidadão.
**Acesso:** 🌐 Público

**Requisição:**

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "MinhaSenh@123"
}
```

**Validações:**
- `nome`: obrigatório, 2–150 caracteres
- `email`: obrigatório, formato válido, único no sistema
- `senha`: obrigatório, mínimo 8 caracteres, deve conter letra maiúscula, minúscula e número

**Resposta 201 Created:**

```json
{
  "message": "Cadastro realizado com sucesso.",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "perfil": "cidadao",
    "criado_em": "2026-03-28T14:00:00.000Z"
  }
}
```

**Erros:**

| Código | Situação |
|--------|----------|
| 400 | Dados inválidos ou ausentes |
| 409 | E-mail já cadastrado |

---

### POST /auth/login

**Descrição:** Autentica o usuário e retorna um token JWT.
**Acesso:** 🌐 Público

**Requisição:**

```json
{
  "email": "maria@email.com",
  "senha": "MinhaSenh@123"
}
```

**Resposta 200 OK:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nome": "Maria Silva",
    "perfil": "cidadao"
  }
}
```

**Erros:**

| Código | Situação |
|--------|----------|
| 400 | Campos ausentes |
| 401 | Credenciais inválidas |
| 429 | Muitas tentativas — rate limit atingido |

---

### POST /auth/logout

**Descrição:** Invalida o token do usuário atual (adiciona à blacklist).
**Acesso:** 🔐 Autenticado

**Resposta 200 OK:**

```json
{
  "message": "Logout realizado com sucesso."
}
```

---

### POST /auth/forgot-password

**Descrição:** Envia e-mail com link de recuperação de senha.
**Acesso:** 🌐 Público

**Requisição:**

```json
{
  "email": "maria@email.com"
}
```

**Resposta 200 OK:** (mesmo que o e-mail não exista, por segurança)

```json
{
  "message": "Se este e-mail estiver cadastrado, você receberá as instruções em breve."
}
```

---

## Módulo: Usuários

### GET /usuarios/me

**Descrição:** Retorna os dados do usuário autenticado.
**Acesso:** 🔐 Autenticado

**Resposta 200 OK:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "perfil": "cidadao",
  "ativo": true,
  "criado_em": "2026-03-28T14:00:00.000Z"
}
```

---

### PUT /usuarios/me

**Descrição:** Atualiza nome ou senha do usuário autenticado.
**Acesso:** 🔐 Autenticado

**Requisição:**

```json
{
  "nome": "Maria Santos Silva",
  "senha_atual": "MinhaSenh@123",
  "senha_nova": "NovaSenha@456"
}
```

**Resposta 200 OK:**

```json
{
  "message": "Dados atualizados com sucesso.",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nome": "Maria Santos Silva",
    "email": "maria@email.com"
  }
}
```

---

## Módulo: Denúncias

### POST /denuncias

**Descrição:** Registra uma nova denúncia de descarte irregular.
**Acesso:** 👤 Cidadão
**Content-Type:** `multipart/form-data`

**Parâmetros do formulário:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `descricao` | string | Sim | Descrição da ocorrência (10–500 chars) |
| `latitude` | number | Sim | Latitude do ponto |
| `longitude` | number | Sim | Longitude do ponto |
| `endereco_texto` | string | Não | Endereço manual (fallback) |
| `fotos` | file[] | Sim | 1 a 3 arquivos de imagem (JPG/PNG/WEBP, max 5MB cada) |

**Resposta 201 Created:**

```json
{
  "message": "Denúncia registrada com sucesso!",
  "denuncia": {
    "id": "f1e2d3c4-b5a6-7890-cdef-ab1234567890",
    "protocolo": "ECO-2026-000042",
    "status": "pendente",
    "descricao": "Lixo acumulado ao lado do posto de saúde, bloqueando a calçada.",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "bairro": "Centro",
    "fotos": [
      "https://storage.ecoalerta.local/fotos/foto1.jpg"
    ],
    "criado_em": "2026-03-28T15:00:00.000Z"
  }
}
```

**Erros:**

| Código | Situação |
|--------|----------|
| 400 | Campos obrigatórios ausentes ou inválidos |
| 413 | Arquivo excede o tamanho máximo (5MB) |
| 415 | Tipo de arquivo não suportado |
| 422 | Coordenadas fora da área do município configurado |

---

### GET /denuncias

**Descrição:** Lista denúncias com filtros (admin vê todas; cidadão vê apenas as suas).
**Acesso:** 🔐 Autenticado

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | string | Filtrar por status (ex: `pendente,em_analise`) |
| `bairro_id` | integer | Filtrar por bairro |
| `data_inicio` | date | Data mínima de criação (ISO 8601) |
| `data_fim` | date | Data máxima de criação (ISO 8601) |
| `page` | integer | Página (padrão: 1) |
| `limit` | integer | Itens por página (padrão: 20, max: 100) |

**Exemplo de requisição:**

```
GET /denuncias?status=pendente,em_analise&page=1&limit=20
Authorization: Bearer {token}
```

**Resposta 200 OK:**

```json
{
  "data": [
    {
      "id": "f1e2d3c4-b5a6-7890-cdef-ab1234567890",
      "protocolo": "ECO-2026-000042",
      "status": "pendente",
      "descricao": "Lixo acumulado ao lado do posto de saúde...",
      "bairro": "Centro",
      "foto_capa": "https://storage.ecoalerta.local/fotos/foto1.jpg",
      "criado_em": "2026-03-28T15:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### GET /denuncias/:id

**Descrição:** Retorna detalhes completos de uma denúncia específica.
**Acesso:** 🔐 Autenticado (cidadão vê apenas suas próprias; admin vê todas)

**Resposta 200 OK:**

```json
{
  "id": "f1e2d3c4-b5a6-7890-cdef-ab1234567890",
  "protocolo": "ECO-2026-000042",
  "status": "em_analise",
  "descricao": "Lixo acumulado ao lado do posto de saúde, bloqueando a calçada.",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "endereco_texto": "Rua das Flores, 123",
  "bairro": {
    "id": 5,
    "nome": "Centro"
  },
  "fotos": [
    {
      "id": 1,
      "url": "https://storage.ecoalerta.local/fotos/foto1.jpg",
      "ordem": 1
    }
  ],
  "historico": [
    {
      "status_anterior": null,
      "status_novo": "pendente",
      "comentario": null,
      "criado_em": "2026-03-28T15:00:00.000Z",
      "usuario": "Maria Silva"
    },
    {
      "status_anterior": "pendente",
      "status_novo": "em_analise",
      "comentario": "Denúncia verificada e encaminhada para análise.",
      "criado_em": "2026-03-29T09:00:00.000Z",
      "usuario": "Admin Municipal"
    }
  ],
  "criado_em": "2026-03-28T15:00:00.000Z",
  "atualizado_em": "2026-03-29T09:00:00.000Z"
}
```

**Erros:**

| Código | Situação |
|--------|----------|
| 403 | Cidadão tentando acessar denúncia de outro usuário |
| 404 | Denúncia não encontrada |

---

### PATCH /denuncias/:id/status

**Descrição:** Atualiza o status de uma denúncia.
**Acesso:** 🛡️ Administrador

**Requisição:**

```json
{
  "status": "em_atendimento",
  "comentario": "Equipe designada para coleta amanhã às 08h.",
  "equipe_id": 3
}
```

**Resposta 200 OK:**

```json
{
  "message": "Status atualizado com sucesso.",
  "denuncia": {
    "id": "f1e2d3c4-b5a6-7890-cdef-ab1234567890",
    "protocolo": "ECO-2026-000042",
    "status": "em_atendimento",
    "atualizado_em": "2026-03-30T10:00:00.000Z"
  }
}
```

**Erros:**

| Código | Situação |
|--------|----------|
| 400 | Transição de status inválida |
| 403 | Usuário sem permissão |
| 404 | Denúncia não encontrada |

---

### DELETE /denuncias/:id

**Descrição:** Cancela uma denúncia (apenas pelo cidadão que a criou, quando status = "pendente").
**Acesso:** 👤 Cidadão

**Resposta 200 OK:**

```json
{
  "message": "Denúncia cancelada com sucesso."
}
```

**Erros:**

| Código | Situação |
|--------|----------|
| 403 | Denúncia pertence a outro usuário ou status não permite cancelamento |
| 404 | Denúncia não encontrada |

---

## Módulo: Mapa

### GET /mapa/pontos

**Descrição:** Retorna todos os pontos de denúncia ativos para exibição no mapa. **Endpoint público.**
**Acesso:** 🌐 Público

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | string | Filtrar por status (padrão: todos exceto `cancelada` e `invalida`) |
| `dias` | integer | Denúncias dos últimos N dias (ex: `30`) |
| `bbox` | string | Bounding box: `minLng,minLat,maxLng,maxLat` |

**Exemplo de requisição:**

```
GET /mapa/pontos?dias=30&bbox=-46.7,-23.6,-46.5,-23.4
```

**Resposta 200 OK:**

```json
{
  "total": 47,
  "pontos": [
    {
      "id": "f1e2d3c4-b5a6-7890-cdef-ab1234567890",
      "protocolo": "ECO-2026-000042",
      "status": "pendente",
      "latitude": -23.5505,
      "longitude": -46.6333,
      "bairro": "Centro",
      "foto_capa": "https://storage.ecoalerta.local/fotos/foto1_thumb.jpg",
      "descricao_curta": "Lixo acumulado ao lado do posto de saúde...",
      "criado_em": "2026-03-28T15:00:00.000Z"
    }
  ]
}
```

> **Nota:** Este endpoint é otimizado para performance. Retorna apenas os campos necessários para renderização dos marcadores. Para detalhes completos, usar `GET /denuncias/:id`.

---

## Módulo: Relatórios

### GET /relatorios/indicadores

**Descrição:** Retorna indicadores gerais para o painel administrativo.
**Acesso:** 🛡️ Administrador

**Query Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `data_inicio` | date | Data de início do período |
| `data_fim` | date | Data de fim do período |

**Resposta 200 OK:**

```json
{
  "periodo": {
    "inicio": "2026-03-01T00:00:00.000Z",
    "fim": "2026-03-31T23:59:59.000Z"
  },
  "totais": {
    "geral": 143,
    "pendente": 45,
    "em_analise": 20,
    "em_atendimento": 15,
    "resolvida": 58,
    "cancelada": 3,
    "invalida": 2
  },
  "por_bairro": [
    { "bairro": "Centro", "total": 42 },
    { "bairro": "Jardim das Flores", "total": 31 }
  ],
  "tempo_medio_resolucao_horas": 72.5
}
```

---

### GET /relatorios/exportar

**Descrição:** Exporta relatório de denúncias filtrado em formato CSV.
**Acesso:** 🛡️ Administrador

**Query Parameters:** Mesmos filtros de `GET /denuncias`

**Resposta 200 OK:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="ecoalerta_relatorio_2026-03.csv"
```

```csv
protocolo,data_criacao,bairro,endereco,status,data_resolucao
ECO-2026-000001,2026-03-01,Centro,"Rua A, 100",resolvida,2026-03-05
ECO-2026-000002,2026-03-02,Norte,"Av. B, 200",pendente,
```

---

## Módulo: Bairros

### GET /bairros

**Descrição:** Lista todos os bairros cadastrados.
**Acesso:** 🌐 Público

**Resposta 200 OK:**

```json
{
  "data": [
    { "id": 1, "nome": "Centro", "municipio": "São Paulo", "uf": "SP" },
    { "id": 2, "nome": "Jardim das Flores", "municipio": "São Paulo", "uf": "SP" }
  ]
}
```

---

## Códigos de Erro

### Formato Padrão de Erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos.",
    "details": [
      {
        "field": "descricao",
        "message": "A descrição deve ter entre 10 e 500 caracteres."
      }
    ]
  }
}
```

### Tabela de Códigos HTTP

| HTTP Status | Código de Erro | Descrição |
|------------|---------------|-----------|
| 400 | `VALIDATION_ERROR` | Dados de entrada inválidos |
| 400 | `INVALID_STATUS_TRANSITION` | Transição de status não permitida |
| 401 | `UNAUTHORIZED` | Token ausente ou inválido |
| 401 | `TOKEN_EXPIRED` | Token JWT expirado |
| 403 | `FORBIDDEN` | Sem permissão para esta ação |
| 404 | `NOT_FOUND` | Recurso não encontrado |
| 409 | `CONFLICT` | Recurso já existe (ex: e-mail duplicado) |
| 413 | `FILE_TOO_LARGE` | Arquivo excede o tamanho máximo |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Tipo de arquivo não aceito |
| 422 | `UNPROCESSABLE_ENTITY` | Dados semanticamente inválidos |
| 429 | `RATE_LIMIT_EXCEEDED` | Muitas requisições — aguardar e tentar novamente |
| 500 | `INTERNAL_SERVER_ERROR` | Erro interno do servidor |

---

## Exemplos de Fluxo Completo

### Fluxo: Cidadão registra e acompanha uma denúncia

```
1. POST /auth/login                    → obter token JWT
2. POST /denuncias (multipart)         → registrar denúncia
3. GET  /denuncias/{id}                → verificar status e histórico
4. POST /auth/logout                   → encerrar sessão
```

### Fluxo: Administrador gerencia ocorrências

```
1. POST /auth/login                    → obter token JWT (perfil admin)
2. GET  /relatorios/indicadores        → ver resumo do período
3. GET  /denuncias?status=pendente     → listar denúncias pendentes
4. GET  /denuncias/{id}                → ver detalhes de uma denúncia
5. PATCH /denuncias/{id}/status        → atualizar status para em_analise
6. GET  /relatorios/exportar           → baixar relatório CSV
```
