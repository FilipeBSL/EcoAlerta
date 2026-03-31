# EcoAlerta — Sistema de Mapeamento de Pontos de Descarte Irregular de Lixo

> Projeto Acadêmico | ODS 11 — Cidades e Comunidades Sustentáveis

---

## Sumário

1. [Descrição](#descrição)
2. [Problema e Justificativa](#problema-e-justificativa)
3. [Objetivos](#objetivos)
4. [Escopo](#escopo)
5. [Relação com o ODS 11](#relação-com-o-ods-11)
6. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
7. [Tecnologias Sugeridas](#tecnologias-sugeridas)
8. [Cronograma](#cronograma)
9. [Equipe](#equipe)
10. [Evidências Extensionistas](#evidências-extensionistas)

---

## Descrição

O **EcoAlerta** é uma plataforma web e mobile que permite a cidadãos registrar, visualizar e acompanhar ocorrências de descarte irregular de lixo em ambiente urbano. As denúncias são georreferenciadas em um mapa interativo, possibilitando que órgãos públicos e equipes de limpeza urbana priorizem e gerenciem as ações de coleta e limpeza de forma mais eficiente.

---

## Problema e Justificativa

O descarte irregular de lixo em vias públicas, terrenos baldios e cursos d'água é um problema crônico nas cidades brasileiras. Suas consequências incluem:

- Proliferação de vetores de doenças (dengue, leptospirose, etc.)
- Entupimento de bueiros e alagamentos
- Degradação visual e desvalorização de bairros
- Impacto negativo no meio ambiente e na saúde pública

A ausência de um canal digital centralizado, acessível e georreferenciado dificulta que a população reporte ocorrências e que as prefeituras respondam com agilidade. Canais tradicionais como telefone e formulários físicos são fragmentados, lentos e não fornecem visibilidade espacial do problema.

O **EcoAlerta** resolve essa lacuna ao oferecer uma ferramenta simples, visual e colaborativa, conectando cidadãos e gestão pública em torno de um objetivo comum: cidades mais limpas e sustentáveis.

---

## Objetivos

### Objetivo Geral

Desenvolver um sistema de mapeamento colaborativo de pontos de descarte irregular de lixo, promovendo a participação cidadã e apoiando a gestão pública na resolução de problemas urbanos.

### Objetivos Específicos

- Permitir que cidadãos registrem denúncias de descarte irregular com localização, foto e descrição
- Disponibilizar um mapa interativo público com os pontos registrados e seus respectivos status
- Oferecer um painel administrativo para que prefeituras e equipes de limpeza gerenciem as ocorrências
- Notificar o cidadão denunciante sobre a evolução do atendimento de sua denúncia
- Gerar relatórios e indicadores para apoiar a tomada de decisão da gestão pública

---

## Escopo

### Dentro do Escopo

| # | Funcionalidade |
|---|----------------|
| 1 | Cadastro e autenticação de usuários (cidadão e administrador) |
| 2 | Registro de denúncias com foto, localização GPS e descrição |
| 3 | Mapa interativo com marcadores por status |
| 4 | Painel administrativo com gestão de ocorrências |
| 5 | Atualização de status das denúncias pela equipe responsável |
| 6 | Notificações por e-mail ao denunciante |
| 7 | Relatórios básicos (quantidade por bairro, status, período) |
| 8 | API REST pública para integração com outros sistemas |

### Fora do Escopo (versão 1.0)

- Integração com sistemas legados de prefeituras
- Aplicativo mobile nativo (iOS/Android) — fase futura
- Gamificação e sistema de pontos
- Inteligência artificial para triagem automática de denúncias

---

## Relação com o ODS 11

O **EcoAlerta** está diretamente alinhado ao **Objetivo de Desenvolvimento Sustentável 11 — Cidades e Comunidades Sustentáveis**, da Agenda 2030 da ONU.

| Meta ODS 11 | Como o EcoAlerta contribui |
|-------------|---------------------------|
| **11.6** — Reduzir o impacto ambiental negativo per capita nas cidades | Facilita a detecção e remoção de pontos de descarte irregular, reduzindo a poluição urbana |
| **11.7** — Proporcionar acesso universal a espaços públicos seguros e inclusivos | Contribui para espaços públicos mais limpos e seguros |
| **11.b** — Aumentar o número de cidades com políticas de resiliência urbana | Oferece dados georreferenciados para embasar políticas públicas locais |

O projeto incentiva a **participação cidadã**, fortalece a **governança urbana colaborativa** e gera **dados abertos** que podem subsidiar decisões de gestão ambiental e urbana.

---

## Visão Geral da Arquitetura

O sistema segue uma arquitetura **cliente-servidor em camadas (MVC)**, organizada em três camadas principais:

```
[ Cliente Web / Mobile PWA ]
          |
          | HTTPS / REST API
          |
[ Servidor de Aplicação — API REST (Node.js / Express) ]
          |
     _____|______
    |            |
[ Banco de  [ Serviço de
  Dados ]     Armazenamento
 (PostgreSQL) de Arquivos ]
                (S3 / Local)
```

### Componentes Principais

| Camada | Tecnologia Sugerida | Responsabilidade |
|--------|---------------------|------------------|
| Frontend | React.js + Leaflet.js | Interface do usuário e mapa interativo |
| Backend | Node.js + Express | Lógica de negócio e API REST |
| Banco de Dados | PostgreSQL + PostGIS | Persistência relacional com suporte geoespacial |
| Armazenamento | MinIO ou AWS S3 | Upload e armazenamento de fotos das denúncias |
| Autenticação | JWT (JSON Web Tokens) | Controle de acesso seguro |
| Notificações | Nodemailer / SendGrid | Envio de e-mails transacionais |

### Diagrama de Arquitetura (descrição para Draw.io / Lucidchart)

Representar como diagrama de blocos com as seguintes camadas (de cima para baixo):

1. **Camada de Apresentação**: Bloco "Navegador Web" conectado ao bloco "PWA Mobile" — ambos se comunicam via HTTPS com a camada abaixo.
2. **Camada de API**: Bloco central "API REST — Node.js/Express" recebendo requisições dos clientes. Dentro deste bloco, subdividir em módulos: Auth, Denúncias, Usuários, Relatórios.
3. **Camada de Dados**: Dois blocos paralelos — "PostgreSQL + PostGIS" (dados relacionais e geoespaciais) e "Armazenamento de Arquivos S3/MinIO" (fotos). Ambos conectados ao bloco de API por setas bidirecionais.
4. **Serviços Externos**: Bloco "Serviço de E-mail (SendGrid)" conectado ao módulo de notificações da API.

---

## Tecnologias Sugeridas

### Frontend

| Tecnologia | Finalidade |
|------------|-----------|
| React.js | Framework de interface |
| Leaflet.js + React-Leaflet | Mapa interativo |
| Axios | Requisições HTTP |
| TailwindCSS | Estilização responsiva |
| React Hook Form | Formulários |

### Backend

| Tecnologia | Finalidade |
|------------|-----------|
| Node.js + Express | Servidor e roteamento |
| Sequelize ORM | Mapeamento objeto-relacional |
| JWT | Autenticação stateless |
| Multer | Upload de arquivos |
| Nodemailer | Envio de e-mails |

### Banco de Dados e Infra

| Tecnologia | Finalidade |
|------------|-----------|
| PostgreSQL | Banco relacional principal |
| PostGIS | Extensão geoespacial |
| MinIO / AWS S3 | Armazenamento de imagens |
| Docker + Docker Compose | Containerização do ambiente |
| Nginx | Proxy reverso e serving estático |

### Ferramentas de Desenvolvimento

| Ferramenta | Uso |
|------------|-----|
| Figma | Prototipagem de telas |
| Draw.io | Diagramas de arquitetura e ER |
| Postman | Teste de endpoints da API |
| Jest + Supertest | Testes automatizados |
| GitHub + GitHub Actions | Versionamento e CI/CD |
| ESLint + Prettier | Qualidade e padronização de código |

---

## Cronograma

> Projeto com duração de **14 semanas** (Etapa 2 do projeto acadêmico)

| Semana | Fase | Atividades |
|--------|------|-----------|
| 1–2 | Planejamento | Levantamento de requisitos, definição de escopo, formação da equipe |
| 3–4 | Design | Modelagem do banco de dados, prototipagem de telas no Figma, design da API |
| 5–6 | Setup e Infraestrutura | Configuração do ambiente Docker, banco de dados, estrutura inicial do projeto |
| 7–9 | Desenvolvimento — Backend | Implementação da API REST: autenticação, CRUD de denúncias, upload de fotos |
| 10–12 | Desenvolvimento — Frontend | Implementação das telas: mapa, cadastro de denúncia, painel admin |
| 13 | Testes e QA | Testes funcionais, testes de API, correção de bugs, testes de usabilidade |
| 14 | Entrega | Documentação final, apresentação, deploy em ambiente de demonstração |

---

## Equipe

| Nome (Fictício) | Papel | Responsabilidades |
|-----------------|-------|------------------|
| Ana Lima | Gerente de Projeto / Scrum Master | Coordenação geral, gestão de sprints, comunicação com stakeholders |
| Bruno Carvalho | Desenvolvedor Backend | API REST, banco de dados, autenticação, lógica de negócio |
| Carla Mendes | Desenvolvedora Frontend | Interfaces React, integração com API, mapa interativo |
| Diego Souza | Designer UX/UI | Prototipagem no Figma, guia de estilos, testes de usabilidade |
| Eduarda Rocha | QA / Testes | Plano de testes, testes funcionais, automação com Jest |

---

## Evidências Extensionistas

> Esta seção documenta as ações de extensão universitária realizadas no contexto do projeto, simulando a interação com a comunidade e órgãos públicos.

### Atividade 1 — Entrevistas com Moradores

**Data simulada:** Março de 2026
**Local:** Bairros com alta incidência de descarte irregular (simulado: Bairro Central e Jardim Progresso)
**Participantes:** 12 moradores entrevistados

**Resumo:** Foram realizadas entrevistas semiestruturadas para compreender como os moradores percebem o problema do descarte irregular, quais canais utilizam para reportar ocorrências e qual seria a aceitação de uma plataforma digital para este fim. Os resultados indicaram que 83% dos entrevistados nunca havia reportado uma ocorrência por não saber como fazê-lo, e 91% afirmaram que usariam um aplicativo para denunciar.

### Atividade 2 — Reunião com Secretaria Municipal de Meio Ambiente

**Data simulada:** Abril de 2026
**Participantes:** Representantes da equipe do projeto e 2 servidores da Secretaria (simulado)

**Resumo:** Apresentação do conceito do sistema para validação dos requisitos funcionais do painel administrativo. Os servidores destacaram a necessidade de filtros por bairro e geração de relatórios mensais para justificar ações de limpeza no orçamento municipal.

### Atividade 3 — Workshop de Validação de Protótipos

**Data simulada:** Maio de 2026
**Participantes:** 8 cidadãos voluntários, 1 servidor municipal

**Resumo:** Sessão de teste de usabilidade dos protótipos de alta fidelidade criados no Figma. Os participantes realizaram tarefas guiadas (registrar denúncia, verificar status, navegar no mapa). Taxa de conclusão das tarefas: 87%. Principais pontos de melhoria identificados: simplificar o formulário de cadastro de denúncia e aumentar o contraste dos marcadores no mapa.

### Impacto Social Esperado

- Redução do tempo de resposta da prefeitura a ocorrências de descarte irregular
- Aumento da consciência cidadã sobre responsabilidade ambiental urbana
- Geração de dados geoespaciais abertos para políticas públicas de saneamento
- Fortalecimento da participação democrática na gestão urbana
