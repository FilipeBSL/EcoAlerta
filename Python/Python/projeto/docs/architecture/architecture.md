# Documento de Arquitetura — EcoAlerta

> Versão: 1.0 | Data: Março de 2026 | Status: Aprovado

---

## Sumário

1. [Tipo e Estilo Arquitetural](#tipo-e-estilo-arquitetural)
2. [Descrição Geral](#descrição-geral)
3. [Componentes do Sistema](#componentes-do-sistema)
4. [Tecnologias Sugeridas](#tecnologias-sugeridas)
5. [Padrões Arquiteturais](#padrões-arquiteturais)
6. [Justificativas Técnicas](#justificativas-técnicas)
7. [Diagrama de Arquitetura](#diagrama-de-arquitetura)
8. [Fluxo de Dados](#fluxo-de-dados)
9. [Considerações de Segurança](#considerações-de-segurança)
10. [Estrutura de Diretórios](#estrutura-de-diretórios)

---

## Tipo e Estilo Arquitetural

### Estilo Principal: Arquitetura em Camadas (Layered / N-Tier) com padrão MVC

O **EcoAlerta** adota uma arquitetura **monolítica modular em camadas**, organizada segundo o padrão **MVC (Model-View-Controller)**. Esta escolha é adequada para o escopo acadêmico e para uma primeira versão do produto, oferecendo simplicidade, velocidade de desenvolvimento e facilidade de manutenção.

A aplicação é dividida em:

| Camada | Responsabilidade |
|--------|-----------------|
| **View (Apresentação)** | Interface do usuário — aplicação React.js rodando no navegador |
| **Controller (Controle)** | Lógica de roteamento e orquestração — Express.js no backend |
| **Model (Dados/Negócio)** | Lógica de negócio, validações e acesso ao banco — Sequelize ORM |

### Estilo Complementar: API-First

O backend é desenvolvido como uma **API RESTful independente**, desacoplada do frontend. Isso permite que no futuro um aplicativo mobile nativo consuma a mesma API sem alterações no servidor, seguindo o princípio de **separação de responsabilidades**.

---

## Descrição Geral

O sistema é composto por dois processos principais:

1. **Frontend SPA (Single Page Application):** Aplicação React.js servida como arquivos estáticos via Nginx. O usuário interage com a interface no navegador, que se comunica com o backend exclusivamente via chamadas HTTP à API REST.

2. **Backend API REST:** Servidor Node.js com Express que recebe as requisições do frontend, aplica regras de negócio, acessa o banco de dados e retorna respostas JSON. É o único componente com acesso direto ao banco de dados e ao serviço de armazenamento de arquivos.

A comunicação entre os dois processos é feita **exclusivamente via API REST sobre HTTPS**, sem compartilhamento de estado via sessões no servidor (arquitetura *stateless*).

---

## Componentes do Sistema

### C1 — Frontend (React.js)

**Tipo:** Single Page Application (SPA)
**Responsabilidade:** Renderizar a interface do usuário, gerenciar estado local da aplicação, consumir a API REST.

**Sub-módulos:**

| Módulo | Funcionalidade |
|--------|---------------|
| `Auth` | Telas de login, cadastro e recuperação de senha |
| `Map` | Mapa interativo com Leaflet.js, marcadores e filtros |
| `Denuncia` | Formulário de cadastro e visualização de denúncias |
| `Dashboard` | Painel administrativo — tabelas, filtros, indicadores |
| `Profile` | Histórico de denúncias do cidadão logado |
| `Services` | Módulo de chamadas HTTP (Axios) para a API |

---

### C2 — Backend (Node.js + Express)

**Tipo:** API REST stateless
**Responsabilidade:** Processar requisições, aplicar regras de negócio, autenticar usuários, orquestrar acesso a dados e serviços externos.

**Camadas internas:**

```
routes/ → controllers/ → services/ → models/ → database
                      ↘ middlewares/
                      ↘ utils/
```

| Camada | Responsabilidade |
|--------|-----------------|
| `routes/` | Define os endpoints HTTP e mapeia para controllers |
| `controllers/` | Recebe requisição, delega ao service, retorna resposta |
| `services/` | Contém a lógica de negócio pura |
| `models/` | Definição das entidades e acesso ao banco via Sequelize |
| `middlewares/` | Autenticação JWT, validação de entrada, tratamento de erros |
| `utils/` | Funções auxiliares (formatação, geolocalização, e-mail) |

---

### C3 — Banco de Dados (PostgreSQL + PostGIS)

**Tipo:** Banco relacional com extensão geoespacial
**Responsabilidade:** Persistência de todos os dados do sistema.

A extensão **PostGIS** habilita tipos de dados e funções geográficas nativas no PostgreSQL, permitindo armazenar coordenadas como tipo `GEOMETRY(Point, 4326)` e realizar consultas espaciais eficientes (ex: "buscar denúncias em um raio de X metros").

---

### C4 — Armazenamento de Arquivos (MinIO / AWS S3)

**Tipo:** Object Storage
**Responsabilidade:** Armazenar as fotos enviadas nas denúncias.

O backend realiza o upload para o bucket de armazenamento e salva apenas a URL pública do arquivo no banco de dados. O frontend acessa as fotos diretamente pela URL, sem passar pelo servidor da API.

---

### C5 — Serviço de E-mail (SendGrid / Nodemailer)

**Tipo:** Serviço externo de envio de e-mail
**Responsabilidade:** Envio de notificações transacionais (confirmação de denúncia, atualização de status, recuperação de senha).

---

### C6 — Proxy Reverso (Nginx)

**Tipo:** Servidor HTTP / Proxy
**Responsabilidade:**
- Servir os arquivos estáticos do frontend React
- Encaminhar requisições `/api/*` para o servidor Node.js
- Gerenciar certificados SSL/TLS

---

## Tecnologias Sugeridas

### Stack Completo

| Camada | Tecnologia | Versão Sugerida | Justificativa |
|--------|-----------|----------------|--------------|
| Frontend Framework | React.js | 18+ | Ecossistema maduro, ampla comunidade, componentes reutilizáveis |
| Mapa Interativo | Leaflet.js + React-Leaflet | 4+ | Open source, leve, excelente suporte a tiles e marcadores customizados |
| Estilização | TailwindCSS | 3+ | Produtividade alta, design responsivo por padrão |
| Formulários | React Hook Form + Zod | Atual | Validação eficiente e integrada com TypeScript |
| HTTP Client | Axios | 1+ | Interceptors para JWT, cancelamento de requisições |
| Backend Runtime | Node.js | 20 LTS | Assíncrono, ideal para I/O intensivo, mesmo ecossistema JS |
| Framework HTTP | Express.js | 4+ | Minimalista, flexível, amplamente conhecido |
| ORM | Sequelize | 6+ | Suporte a PostgreSQL, migrações, seeds |
| Banco de Dados | PostgreSQL | 15+ | Robusto, ACID, suporte nativo a JSON e geoespacial |
| Extensão Geo | PostGIS | 3+ | Padrão de mercado para dados geoespaciais em PostgreSQL |
| Autenticação | jsonwebtoken | Atual | Tokens stateless, amplamente padronizado (RFC 7519) |
| Hash de Senha | bcrypt | Atual | Algoritmo seguro e lento por design |
| Upload de Arquivos | Multer | Atual | Middleware para multipart/form-data no Express |
| Object Storage | MinIO (self-hosted) | Atual | Compatível com API S3, ideal para ambiente local e acadêmico |
| Envio de E-mail | Nodemailer + Ethereal | Atual | Simples, sem custo para ambiente de desenvolvimento/testes |
| Containerização | Docker + Docker Compose | Atual | Ambiente reprodutível, facilita onboarding da equipe |
| Proxy/Serving | Nginx | 1.25+ | Leve, performático, padrão de mercado |
| Testes Backend | Jest + Supertest | Atual | Testes unitários e de integração da API |
| Testes Frontend | React Testing Library | Atual | Testes orientados a comportamento do usuário |

---

## Padrões Arquiteturais

### REST (Representational State Transfer)

A API segue os princípios REST: recursos identificados por URIs, uso semântico dos verbos HTTP (GET, POST, PUT, DELETE), respostas em JSON, comunicação stateless com autenticação via token no header.

### Repository Pattern (implícito via Sequelize)

A camada de acesso a dados é abstraída pelos models do Sequelize, isolando a lógica de negócio dos detalhes de persistência. Isso facilita a troca do banco de dados ou a criação de mocks para testes.

### Middleware Chain (Express)

O Express utiliza uma cadeia de middlewares para processar requisições. O sistema define middlewares para: autenticação JWT, autorização por perfil, validação de payload, logging e tratamento centralizado de erros.

### DTO (Data Transfer Object)

As requisições e respostas da API utilizam schemas de validação (Zod/Joi) para garantir que apenas os campos esperados trafeguem entre as camadas, prevenindo over-posting e exposição indevida de dados.

---

## Justificativas Técnicas

| Decisão | Justificativa |
|---------|--------------|
| **Monolito modular ao invés de microsserviços** | O escopo do projeto não justifica a complexidade operacional de microsserviços (orquestração, service discovery, etc.). O monolito modular oferece simplicidade com boa organização interna. |
| **PostgreSQL + PostGIS ao invés de MongoDB** | O domínio do sistema é eminentemente relacional (usuários, denúncias, status, histórico) e exige consultas geoespaciais eficientes. O PostGIS é a solução mais robusta para isso. |
| **React.js ao invés de Vue ou Angular** | Maior adoção no mercado, ecossistema mais rico (especialmente para mapas com React-Leaflet), e ampla disponibilidade de recursos de aprendizado. |
| **JWT ao invés de sessões no servidor** | Arquitetura stateless permite escalabilidade horizontal futura sem necessidade de session store compartilhado. |
| **MinIO ao invés de AWS S3** | Para fins acadêmicos, o MinIO pode ser executado localmente via Docker, sem custo e sem dependência de conta na nuvem. A API é 100% compatível com S3, facilitando a migração futura. |
| **Docker Compose** | Garante que toda a equipe trabalhe com o mesmo ambiente (versões de banco, serviços de terceiros), eliminando o clássico problema "funciona na minha máquina". |

---

## Diagrama de Arquitetura

> Descrição para reprodução em Draw.io, Lucidchart ou Excalidraw

### Elementos e Disposição

**Título do diagrama:** "EcoAlerta — Arquitetura do Sistema (v1.0)"

**Layout:** Diagrama de blocos em 3 colunas verticais, da esquerda para a direita.

---

**Coluna Esquerda — Clientes:**
- Bloco retangular: "Navegador Web (Desktop)" com ícone de computador
- Bloco retangular: "Navegador Web (Mobile / PWA)" com ícone de smartphone
- Ambos conectados por seta com rótulo "HTTPS" apontando para a coluna central

---

**Coluna Central — Servidor (fundo cinza claro):**
- Bloco superior: "Nginx — Proxy Reverso"
  - Duas setas saindo dele:
    - Seta 1 (para baixo): "Arquivos Estáticos" → Bloco "React.js SPA"
    - Seta 2 (para baixo, rótulo `/api/*`): → Bloco "Node.js + Express — API REST"
- Bloco "Node.js + Express — API REST" com subdivisão interna em 4 módulos menores lado a lado:
  - `Auth Module`
  - `Denúncias Module`
  - `Usuários Module`
  - `Relatórios Module`

---

**Coluna Direita — Serviços de Dados:**
- Bloco "PostgreSQL + PostGIS" (ícone de banco de dados)
- Bloco "MinIO — Object Storage" (ícone de nuvem/balde)
- Bloco "Serviço de E-mail (Nodemailer)" (ícone de envelope)

---

**Conexões da API para os serviços (setas bidirecionais exceto e-mail):**
- API → PostgreSQL: "SQL / Sequelize ORM"
- API → MinIO: "Upload/Download S3 API"
- API → E-mail: "SMTP (unidirecional)"

---

**Contêiner Docker Compose** (borda tracejada envolvendo todos os blocos do servidor e dos serviços de dados, com rótulo "Docker Network: ecoalerta_network")

---

## Fluxo de Dados

### Fluxo 1 — Cidadão registra uma denúncia

```
1. Cidadão preenche formulário no React (foto + localização + descrição)
2. Frontend envia POST /api/denuncias (multipart/form-data) com JWT no header
3. Nginx recebe e encaminha ao Node.js
4. Middleware de Auth valida o JWT → extrai userId
5. Middleware de Validação verifica os campos obrigatórios
6. Controller chama DenunciaService.create()
7. Service faz upload da foto para o MinIO → obtém URL pública
8. Service salva a denúncia no PostgreSQL (com coordenada GEOMETRY)
9. Service dispara e-mail de confirmação via Nodemailer (assíncrono)
10. Controller retorna 201 Created com os dados da denúncia
11. Frontend exibe mensagem de sucesso e redireciona ao mapa
12. Novo marcador aparece no mapa
```

### Fluxo 2 — Visitante visualiza o mapa

```
1. Visitante acessa a URL do sistema
2. Nginx serve os arquivos estáticos do React
3. React renderiza o componente de mapa
4. Frontend envia GET /api/denuncias?status=ativo
5. API busca denúncias no PostgreSQL (sem exigir JWT)
6. API retorna array JSON com coordenadas, status e metadados
7. React-Leaflet renderiza os marcadores no mapa
```

---

## Considerações de Segurança

| Ameaça | Controle Implementado |
|--------|----------------------|
| Acesso não autorizado | JWT com expiração + verificação de perfil em cada endpoint protegido |
| Injeção SQL | Uso exclusivo de ORM com queries parametrizadas (Sequelize) |
| Upload de arquivos maliciosos | Validação de tipo MIME real, limite de tamanho (5MB), armazenamento isolado no MinIO |
| XSS (Cross-Site Scripting) | React faz escape automático de conteúdo dinâmico; CSP headers configurados no Nginx |
| CSRF | API stateless com JWT no header (não em cookie), imune a CSRF por padrão |
| Força bruta no login | Rate limiting com express-rate-limit (5 tentativas / 10 min por IP) |
| Exposição de dados sensíveis | Campos de senha nunca retornados nas respostas da API; variáveis sensíveis em .env |
| Man-in-the-Middle | HTTPS obrigatório em produção via Nginx + Let's Encrypt |

---

## Estrutura de Diretórios

```
ecoalerta/
├── frontend/                    # Aplicação React.js
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas da aplicação
│   │   │   ├── Home/
│   │   │   ├── Login/
│   │   │   ├── Cadastro/
│   │   │   ├── Mapa/
│   │   │   ├── NovaDenuncia/
│   │   │   ├── MinhasDenuncias/
│   │   │   └── Admin/
│   │   ├── services/            # Chamadas à API (Axios)
│   │   ├── context/             # Context API (auth, etc.)
│   │   ├── hooks/               # Custom hooks
│   │   └── utils/
│   └── package.json
│
├── backend/                     # API Node.js + Express
│   ├── src/
│   │   ├── config/              # Configurações (DB, JWT, S3)
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/              # Modelos Sequelize
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── app.js
│   ├── migrations/              # Migrações do banco de dados
│   ├── seeders/                 # Dados iniciais
│   └── package.json
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
├── .env.example
└── docs/                        # Esta documentação
```
