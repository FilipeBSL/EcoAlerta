# Modelo de Banco de Dados — EcoAlerta

> Versão: 1.0 | Data: Março de 2026 | SGBD: PostgreSQL 15+ com extensão PostGIS

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Entidades e Relacionamentos](#entidades-e-relacionamentos)
3. [Descrição das Tabelas](#descrição-das-tabelas)
4. [Dicionário de Dados](#dicionário-de-dados)
5. [Diagrama ER (Descrição Textual)](#diagrama-er-descrição-textual)
6. [Índices e Otimizações](#índices-e-otimizações)
7. [Observações Técnicas](#observações-técnicas)

---

## Visão Geral

O banco de dados do EcoAlerta é relacional, normalizado até a **3ª Forma Normal (3FN)**, com uso da extensão **PostGIS** para suporte a dados geoespaciais. O modelo é centrado na entidade `denuncias`, que se relaciona com usuários, fotos, histórico de status e bairros.

### Diagrama de Entidades (visão macro)

```
usuarios ──< denuncias >── fotos_denuncia
               │
               ├──< historico_status
               │
               ├── bairros
               │
               └── equipes_limpeza
```

---

## Entidades e Relacionamentos

| Entidade | Descrição |
|----------|-----------|
| `usuarios` | Todos os usuários do sistema (cidadãos, admins, equipes) |
| `denuncias` | Ocorrências de descarte irregular registradas |
| `fotos_denuncia` | Fotos associadas às denúncias (até 3 por denúncia) |
| `historico_status` | Registro cronológico de todas as mudanças de status de uma denúncia |
| `bairros` | Cadastro dos bairros do município |
| `equipes_limpeza` | Equipes de campo responsáveis pelo atendimento |

### Relacionamentos

| Relacionamento | Cardinalidade | Descrição |
|---------------|--------------|-----------|
| `usuarios` → `denuncias` | 1:N | Um usuário pode registrar várias denúncias |
| `denuncias` → `fotos_denuncia` | 1:N | Uma denúncia pode ter 1 a 3 fotos |
| `denuncias` → `historico_status` | 1:N | Cada mudança de status gera um registro no histórico |
| `bairros` → `denuncias` | 1:N | Um bairro pode ter várias denúncias |
| `equipes_limpeza` → `denuncias` | 1:N | Uma equipe pode ser responsável por várias denúncias |
| `usuarios` → `historico_status` | 1:N | Um usuário (admin) pode gerar vários registros de histórico |

---

## Descrição das Tabelas

### Tabela: `usuarios`

Armazena todos os usuários do sistema, independentemente do perfil.

| Coluna | Tipo | Nulo | PK/FK | Descrição |
|--------|------|------|-------|-----------|
| `id` | UUID | Não | PK | Identificador único do usuário |
| `nome` | VARCHAR(150) | Não | — | Nome completo |
| `email` | VARCHAR(255) | Não | — | E-mail único para login |
| `senha_hash` | VARCHAR(255) | Não | — | Senha criptografada com bcrypt |
| `perfil` | ENUM | Não | — | `cidadao`, `administrador`, `equipe_limpeza` |
| `ativo` | BOOLEAN | Não | — | Indica se a conta está ativa |
| `municipio_id` | INTEGER | Sim | FK → municipios | Município ao qual o usuário pertence (obrigatório para admin/equipe) |
| `criado_em` | TIMESTAMPTZ | Não | — | Data e hora de criação do registro |
| `atualizado_em` | TIMESTAMPTZ | Não | — | Data e hora da última atualização |

---

### Tabela: `bairros`

Cadastro dos bairros do município para associação às denúncias.

| Coluna | Tipo | Nulo | PK/FK | Descrição |
|--------|------|------|-------|-----------|
| `id` | SERIAL | Não | PK | Identificador único do bairro |
| `nome` | VARCHAR(100) | Não | — | Nome do bairro |
| `municipio` | VARCHAR(100) | Não | — | Nome do município |
| `uf` | CHAR(2) | Não | — | Unidade Federativa (estado) |
| `geom` | GEOMETRY(MultiPolygon, 4326) | Sim | — | Polígono do bairro para lookup geoespacial |

---

### Tabela: `equipes_limpeza`

Cadastro das equipes de campo responsáveis pelo atendimento.

| Coluna | Tipo | Nulo | PK/FK | Descrição |
|--------|------|------|-------|-----------|
| `id` | SERIAL | Não | PK | Identificador único da equipe |
| `nome` | VARCHAR(100) | Não | — | Nome/código da equipe |
| `responsavel` | VARCHAR(150) | Não | — | Nome do supervisor responsável |
| `ativa` | BOOLEAN | Não | — | Indica se a equipe está em operação |
| `criado_em` | TIMESTAMPTZ | Não | — | Data de cadastro |

---

### Tabela: `denuncias`

Entidade central do sistema. Registra cada ocorrência de descarte irregular.

| Coluna | Tipo | Nulo | PK/FK | Descrição |
|--------|------|------|-------|-----------|
| `id` | UUID | Não | PK | Identificador único da denúncia |
| `usuario_id` | UUID | Não | FK → usuarios | Cidadão que registrou a denúncia |
| `bairro_id` | INTEGER | Sim | FK → bairros | Bairro inferido das coordenadas |
| `equipe_id` | INTEGER | Sim | FK → equipes_limpeza | Equipe designada para atendimento |
| `descricao` | VARCHAR(500) | Não | — | Descrição textual da ocorrência (10–500 chars) |
| `status` | ENUM | Não | — | `pendente`, `em_analise`, `em_atendimento`, `resolvida`, `cancelada`, `invalida` |
| `endereco_texto` | VARCHAR(300) | Sim | — | Endereço digitado manualmente (fallback) |
| `coordenada` | GEOMETRY(Point, 4326) | Não | — | Ponto geográfico (longitude, latitude) no sistema WGS84 |
| `latitude` | DECIMAL(10,8) | Não | — | Latitude (redundante para facilitar queries simples) |
| `longitude` | DECIMAL(11,8) | Não | — | Longitude (redundante para facilitar queries simples) |
| `protocolo` | VARCHAR(20) | Não | — | Código único legível para o cidadão (ex: `ECO-2026-000123`) |
| `criado_em` | TIMESTAMPTZ | Não | — | Data e hora do registro |
| `atualizado_em` | TIMESTAMPTZ | Não | — | Data e hora da última atualização |
| `resolvido_em` | TIMESTAMPTZ | Sim | — | Data e hora da resolução (quando aplicável) |

---

### Tabela: `fotos_denuncia`

Armazena as referências às fotos enviadas para cada denúncia.

| Coluna | Tipo | Nulo | PK/FK | Descrição |
|--------|------|------|-------|-----------|
| `id` | SERIAL | Não | PK | Identificador único da foto |
| `denuncia_id` | UUID | Não | FK → denuncias | Denúncia à qual a foto pertence |
| `url` | VARCHAR(500) | Não | — | URL pública do arquivo no MinIO/S3 |
| `nome_arquivo` | VARCHAR(255) | Não | — | Nome original do arquivo |
| `tamanho_bytes` | INTEGER | Não | — | Tamanho do arquivo em bytes |
| `mime_type` | VARCHAR(50) | Não | — | Tipo MIME validado (ex: `image/jpeg`) |
| `ordem` | SMALLINT | Não | — | Ordem de exibição (1, 2 ou 3) |
| `criado_em` | TIMESTAMPTZ | Não | — | Data do upload |

---

### Tabela: `historico_status`

Registra o histórico completo de todas as transições de status de uma denúncia.

| Coluna | Tipo | Nulo | PK/FK | Descrição |
|--------|------|------|-------|-----------|
| `id` | SERIAL | Não | PK | Identificador único do registro |
| `denuncia_id` | UUID | Não | FK → denuncias | Denúncia referenciada |
| `usuario_id` | UUID | Não | FK → usuarios | Usuário que realizou a mudança |
| `status_anterior` | ENUM | Sim | — | Status antes da mudança (nulo na criação) |
| `status_novo` | ENUM | Não | — | Novo status atribuído |
| `comentario` | VARCHAR(500) | Sim | — | Comentário opcional sobre a mudança |
| `criado_em` | TIMESTAMPTZ | Não | — | Data e hora da mudança de status |

---

## Dicionário de Dados

### ENUM: `perfil_usuario`

| Valor | Descrição |
|-------|-----------|
| `cidadao` | Usuário cidadão com permissões básicas |
| `administrador` | Servidor público com acesso ao painel admin completo |
| `equipe_limpeza` | Operador de campo com acesso restrito às suas ocorrências |

### ENUM: `status_denuncia`

| Valor | Descrição | Transições Permitidas |
|-------|-----------|----------------------|
| `pendente` | Recém-registrada, aguardando análise | → `em_analise`, `invalida`, `cancelada` |
| `em_analise` | Sendo avaliada pelo administrador | → `em_atendimento`, `invalida` |
| `em_atendimento` | Equipe de limpeza designada e em campo | → `resolvida` |
| `resolvida` | Problema foi solucionado | — (estado final) |
| `cancelada` | Cancelada pelo próprio cidadão | — (estado final) |
| `invalida` | Denúncia reprovada pelo administrador | — (estado final) |

### Padrão de Protocolo

O campo `protocolo` segue o formato: `ECO-{ANO}-{SEQUENCIAL_6_DIGITOS}`

Exemplos: `ECO-2026-000001`, `ECO-2026-000042`

É gerado automaticamente pelo backend no momento da criação, utilizando uma sequence do PostgreSQL.

### Sistema de Referência de Coordenadas

O sistema utiliza **EPSG:4326 (WGS 84)**, que é o padrão do GPS e do OpenStreetMap. Latitudes variam de -90 a +90 e longitudes de -180 a +180.

---

## Diagrama ER (Descrição Textual)

> Reproduzir em Draw.io, dbdiagram.io ou MySQL Workbench

### Entidades (retângulos)

```
┌─────────────────────┐    ┌─────────────────────────────────┐
│      usuarios        │    │           denuncias              │
├─────────────────────┤    ├─────────────────────────────────┤
│ PK id (UUID)        │    │ PK id (UUID)                    │
│    nome             │    │ FK usuario_id → usuarios        │
│    email (UNIQUE)   │    │ FK bairro_id → bairros          │
│    senha_hash       │    │ FK equipe_id → equipes_limpeza  │
│    perfil (ENUM)    │    │    descricao                    │
│    ativo            │    │    status (ENUM)                │
│    criado_em        │    │    coordenada (GEOMETRY)        │
│    atualizado_em    │    │    latitude                     │
└─────────────────────┘    │    longitude                    │
         │  1              │    protocolo (UNIQUE)           │
         │                 │    criado_em                    │
         │ N               │    resolvido_em                 │
         ▼                 └─────────────────────────────────┘
  (registra)                         │ 1          │ 1
                              ───────┘            └───────
                             │ N                        │ N
                             ▼                          ▼
              ┌──────────────────────┐  ┌───────────────────────┐
              │    fotos_denuncia    │  │   historico_status     │
              ├──────────────────────┤  ├───────────────────────┤
              │ PK id               │  │ PK id                 │
              │ FK denuncia_id      │  │ FK denuncia_id        │
              │    url              │  │ FK usuario_id         │
              │    nome_arquivo     │  │    status_anterior    │
              │    tamanho_bytes    │  │    status_novo        │
              │    mime_type        │  │    comentario         │
              │    ordem            │  │    criado_em          │
              └──────────────────────┘  └───────────────────────┘

┌─────────────────┐    ┌──────────────────────┐
│     bairros      │    │   equipes_limpeza    │
├─────────────────┤    ├──────────────────────┤
│ PK id           │    │ PK id               │
│    nome         │    │    nome             │
│    municipio    │    │    responsavel      │
│    uf           │    │    ativa            │
│    geom         │    │    criado_em        │
└─────────────────┘    └──────────────────────┘
      │ 1                      │ 1
      │                        │
      │ N                      │ N
      └──── denuncias ─────────┘
```

### Regras de Integridade

- `denuncias.usuario_id` → DELETE RESTRICT (não apaga usuário com denúncias)
- `denuncias.bairro_id` → SET NULL (bairro pode ser removido sem perder denúncias)
- `fotos_denuncia.denuncia_id` → DELETE CASCADE (apagar denúncia apaga suas fotos)
- `historico_status.denuncia_id` → DELETE CASCADE (apagar denúncia apaga seu histórico)

---

## Índices e Otimizações

| Tabela | Coluna(s) | Tipo de Índice | Justificativa |
|--------|-----------|---------------|--------------|
| `usuarios` | `email` | UNIQUE B-Tree | Unicidade + lookup no login |
| `denuncias` | `usuario_id` | B-Tree | Busca por denúncias do usuário |
| `denuncias` | `status` | B-Tree | Filtro por status (query mais comum) |
| `denuncias` | `coordenada` | GIST (PostGIS) | Consultas geoespaciais (bounding box, ST_DWithin) |
| `denuncias` | `criado_em` | B-Tree | Filtro e ordenação por data |
| `denuncias` | `bairro_id` | B-Tree | Filtro por bairro |
| `denuncias` | `protocolo` | UNIQUE B-Tree | Busca por protocolo |
| `historico_status` | `denuncia_id` | B-Tree | Histórico de uma denúncia específica |
| `fotos_denuncia` | `denuncia_id` | B-Tree | Fotos de uma denúncia específica |

---

## Observações Técnicas

1. **UUIDs como PK:** Utilizar UUID v4 para as tabelas `usuarios` e `denuncias` evita a enumeração de recursos via IDs sequenciais, aumentando a segurança.

2. **Redundância de lat/lng:** As colunas `latitude` e `longitude` na tabela `denuncias` são redundantes em relação ao campo `coordenada` (PostGIS), mas facilitam integrações com sistemas que não suportam PostGIS e evitam a necessidade de `ST_X()`/`ST_Y()` em queries simples.

3. **Timezone:** Todos os campos de data/hora utilizam `TIMESTAMPTZ` (timestamp with time zone), armazenando em UTC. A conversão para o fuso local é responsabilidade do frontend.

4. **Extensão PostGIS:** Deve ser habilitada no banco com o comando `CREATE EXTENSION IF NOT EXISTS postgis;` antes das migrações.
