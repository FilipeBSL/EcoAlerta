# Documento de Requisitos — EcoAlerta

> Versão: 1.0 | Data: Março de 2026 | Status: Aprovado

---

## Sumário

1. [Perfis de Usuário](#perfis-de-usuário)
2. [Requisitos Funcionais](#requisitos-funcionais)
3. [Requisitos Não Funcionais](#requisitos-não-funcionais)
4. [Regras de Negócio](#regras-de-negócio)
5. [Histórias de Usuário](#histórias-de-usuário)

---

## Perfis de Usuário

### PU-01 — Cidadão

Morador ou frequentador da cidade que identifica pontos de descarte irregular de lixo e deseja reportá-los. Possui conhecimento básico de smartphones e internet. Pode registrar denúncias, acompanhar o status das suas ocorrências e visualizar o mapa público.

### PU-02 — Administrador Municipal

Servidor público da Secretaria de Meio Ambiente, Obras ou Limpeza Urbana. Responsável por visualizar e gerenciar as denúncias recebidas, atribuir equipes de atendimento e atualizar o status das ocorrências. Possui acesso ao painel administrativo completo.

### PU-03 — Equipe de Limpeza

Operadores de campo responsáveis pela coleta e limpeza dos pontos reportados. Acessam o sistema para verificar as ocorrências atribuídas a eles e atualizar o status após o atendimento (simplificado, via painel ou link direto).

---

## Requisitos Funcionais

### Módulo de Autenticação

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-01 | O sistema deve permitir o cadastro de novos usuários (cidadãos) com nome, e-mail e senha | Alta |
| RF-02 | O sistema deve autenticar usuários via e-mail e senha, retornando um token JWT | Alta |
| RF-03 | O sistema deve permitir a recuperação de senha via link enviado ao e-mail | Média |
| RF-04 | O sistema deve diferenciar perfis de acesso: Cidadão, Administrador e Equipe de Limpeza | Alta |
| RF-05 | O sistema deve permitir logout, invalidando a sessão do usuário | Alta |

### Módulo de Denúncias

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-06 | O cidadão deve poder registrar uma denúncia informando: localização (GPS ou endereço manual), descrição textual e pelo menos uma foto | Alta |
| RF-07 | O sistema deve aceitar upload de até 3 fotos por denúncia, nos formatos JPG, PNG e WEBP | Alta |
| RF-08 | O sistema deve associar automaticamente a denúncia ao bairro correspondente às coordenadas informadas | Alta |
| RF-09 | O cidadão deve poder visualizar o histórico de suas próprias denúncias com o status atual de cada uma | Alta |
| RF-10 | O sistema deve permitir que o cidadão cancele uma denúncia enquanto ela estiver no status "Pendente" | Média |
| RF-11 | O administrador deve poder visualizar todas as denúncias recebidas com filtros por: status, bairro, data e prioridade | Alta |
| RF-12 | O administrador deve poder atualizar o status de uma denúncia | Alta |
| RF-13 | O administrador deve poder adicionar comentários internos a uma denúncia | Média |
| RF-14 | O administrador deve poder atribuir uma denúncia a uma equipe de limpeza | Média |
| RF-15 | O sistema deve permitir marcar uma denúncia como duplicada, associando-a à ocorrência original | Baixa |

### Módulo de Mapa

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-16 | O sistema deve exibir um mapa interativo público com todos os pontos de denúncia ativos | Alta |
| RF-17 | Os marcadores no mapa devem ser diferenciados visualmente por status (cores distintas) | Alta |
| RF-18 | Ao clicar em um marcador, o sistema deve exibir um card com: foto em miniatura, descrição, bairro, data e status | Alta |
| RF-19 | O mapa deve suportar filtro por status e por período de tempo | Média |
| RF-20 | O mapa deve suportar agrupamento de marcadores próximos (clustering) quando houver muitos pontos na mesma área | Média |

### Módulo de Notificações

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-21 | O sistema deve enviar e-mail de confirmação ao cidadão após o registro de uma denúncia | Alta |
| RF-22 | O sistema deve notificar o cidadão por e-mail sempre que o status da sua denúncia for atualizado | Alta |
| RF-23 | O sistema deve notificar o administrador por e-mail quando novas denúncias forem registradas | Média |

### Módulo de Relatórios

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-24 | O painel administrativo deve exibir indicadores: total de denúncias, por status, por bairro e por período | Alta |
| RF-25 | O administrador deve poder exportar um relatório em formato CSV com as denúncias filtradas | Média |

---

## Requisitos Não Funcionais

### Desempenho

| ID | Requisito |
|----|-----------|
| RNF-01 | O mapa interativo deve carregar em até 3 segundos em conexões 4G com até 500 marcadores visíveis |
| RNF-02 | O tempo de resposta da API para operações de leitura (GET) deve ser inferior a 500ms em condições normais |
| RNF-03 | O upload de fotos deve suportar arquivos de até 5MB por imagem |
| RNF-04 | O sistema deve suportar ao menos 200 usuários simultâneos sem degradação perceptível |

### Segurança

| ID | Requisito |
|----|-----------|
| RNF-05 | Todas as comunicações devem ocorrer via HTTPS com TLS 1.2 ou superior |
| RNF-06 | As senhas devem ser armazenadas com hash bcrypt (fator de custo mínimo: 10) |
| RNF-07 | Tokens JWT devem ter expiração de 24 horas e devem ser revogados no logout |
| RNF-08 | O sistema deve implementar proteção contra ataques de força bruta: bloqueio após 5 tentativas de login falhas em 10 minutos |
| RNF-09 | Uploads de arquivos devem ser validados por tipo MIME real, não apenas pela extensão |
| RNF-10 | O painel administrativo deve ser acessível apenas por usuários com perfil Administrador ou Equipe de Limpeza |

### Usabilidade

| ID | Requisito |
|----|-----------|
| RNF-11 | A interface deve ser responsiva e funcional em dispositivos móveis (telas a partir de 320px) |
| RNF-12 | O fluxo de registro de uma denúncia não deve exigir mais do que 4 etapas/cliques |
| RNF-13 | O sistema deve exibir mensagens de erro claras e orientadas à ação para o usuário |
| RNF-14 | O contraste de cores deve seguir as diretrizes WCAG 2.1 nível AA para acessibilidade |

### Disponibilidade e Manutenibilidade

| ID | Requisito |
|----|-----------|
| RNF-15 | O sistema deve ter disponibilidade mínima de 99% (excluindo janelas de manutenção programada) |
| RNF-16 | O código deve seguir padrão de nomenclatura consistente e ser acompanhado de documentação técnica |
| RNF-17 | O sistema deve registrar logs de erros e de operações críticas (autenticação, criação/atualização de denúncias) |

---

## Regras de Negócio

| ID | Regra |
|----|-------|
| RN-01 | Uma denúncia pode assumir os seguintes status, nesta ordem: **Pendente → Em Análise → Em Atendimento → Resolvida** (ou **Cancelada** / **Inválida**) |
| RN-02 | Somente o cidadão que criou a denúncia pode cancelá-la, e apenas enquanto ela estiver no status "Pendente" |
| RN-03 | A transição de status de "Pendente" para "Em Análise" é exclusiva do Administrador |
| RN-04 | Uma denúncia marcada como "Inválida" ou "Cancelada" não aparece no mapa público |
| RN-05 | Toda denúncia deve ter pelo menos uma foto e uma localização geográfica válida (coordenadas dentro dos limites municipais configurados) |
| RN-06 | Um usuário não autenticado pode visualizar o mapa, mas não pode registrar denúncias |
| RN-07 | O sistema não aceita denúncias com coordenadas duplicadas (mesma latitude/longitude com raio de 10 metros) registradas pelo mesmo usuário nas últimas 24 horas |
| RN-08 | Relatórios exportados só podem conter dados das denúncias do município ao qual o administrador pertence |
| RN-09 | O campo "descrição" de uma denúncia é obrigatório e deve ter entre 10 e 500 caracteres |

---

## Histórias de Usuário

### Épico 1 — Registro de Denúncias

---

**US-01**
**Como** cidadão,
**Quero** registrar um ponto de descarte irregular de lixo com foto e localização,
**Para que** a prefeitura tome conhecimento e providências.

**Critérios de Aceite:**
- O formulário deve solicitar: localização (GPS automático ou endereço digitado), descrição e pelo menos 1 foto
- O sistema deve confirmar o registro com uma mensagem de sucesso e enviar e-mail de confirmação
- A denúncia deve aparecer imediatamente no mapa com status "Pendente"

---

**US-02**
**Como** cidadão,
**Quero** acompanhar o status das minhas denúncias,
**Para que** eu saiba se minha ocorrência está sendo atendida.

**Critérios de Aceite:**
- Deve existir uma seção "Minhas Denúncias" após o login
- Cada denúncia deve exibir: data, foto em miniatura, endereço, status atual e histórico de atualizações
- O cidadão deve receber e-mail a cada mudança de status

---

### Épico 2 — Visualização do Mapa

---

**US-03**
**Como** cidadão (ou visitante),
**Quero** visualizar um mapa com todos os pontos de descarte irregular registrados,
**Para que** eu possa ver o cenário do meu bairro e me engajar com o problema.

**Critérios de Aceite:**
- O mapa deve ser acessível sem necessidade de login
- Os marcadores devem ter cores diferentes por status
- Clicar em um marcador deve exibir: foto, descrição, endereço, data e status
- Deve haver filtro por status e por período (últimos 7, 30, 90 dias)

---

**US-04**
**Como** administrador,
**Quero** visualizar o mapa com indicadores de calor (heatmap) de ocorrências,
**Para que** eu identifique as áreas com maior concentração de problemas.

**Critérios de Aceite:**
- O painel admin deve ter uma opção de visualização em heatmap
- A intensidade do calor deve refletir a quantidade de denúncias por área

---

### Épico 3 — Gestão de Ocorrências (Administrador)

---

**US-05**
**Como** administrador,
**Quero** visualizar e filtrar todas as denúncias recebidas,
**Para que** eu possa priorizar e gerenciar o atendimento.

**Critérios de Aceite:**
- A tabela deve ter filtros por: status, bairro, data de criação, data de atualização
- Deve ser possível ordenar por qualquer coluna
- Deve exibir paginação (20 itens por página)

---

**US-06**
**Como** administrador,
**Quero** atualizar o status de uma denúncia e adicionar um comentário,
**Para que** o cidadão saiba o progresso do atendimento.

**Critérios de Aceite:**
- Ao atualizar o status, o campo de comentário é opcional
- O sistema deve registrar o histórico de todas as mudanças de status com data, hora e usuário responsável
- O cidadão deve ser notificado por e-mail automaticamente

---

**US-07**
**Como** administrador,
**Quero** exportar um relatório mensal de denúncias em CSV,
**Para que** eu possa apresentar os dados em reuniões de gestão.

**Critérios de Aceite:**
- O arquivo CSV deve conter: ID, data, bairro, endereço, status, data de resolução
- O filtro de período deve ser aplicado antes da exportação
- O download deve iniciar imediatamente após a solicitação
