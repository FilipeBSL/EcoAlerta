# Protótipos de Interface — EcoAlerta

> Versão: 1.0 | Ferramenta sugerida: Figma
> Referência de design: Material Design 3 + TailwindCSS

---

## Guia de Estilo Visual

Antes de descrever as telas, definir os elementos visuais base do sistema.

### Paleta de Cores

| Nome | Hex | Uso |
|------|-----|-----|
| Verde Principal | `#2E7D32` | Botões primários, cabeçalhos, elementos de destaque |
| Verde Claro | `#A5D6A7` | Backgrounds de sucesso, badges |
| Amarelo Alerta | `#F9A825` | Status "Pendente", alertas |
| Laranja Ativo | `#EF6C00` | Status "Em Atendimento" |
| Vermelho | `#C62828` | Status "Inválida", erros |
| Cinza Claro | `#F5F5F5` | Backgrounds de página |
| Cinza Médio | `#9E9E9E` | Textos secundários |
| Branco | `#FFFFFF` | Superfícies de cards |
| Texto Principal | `#212121` | Títulos e corpo de texto |

### Marcadores do Mapa por Status

| Status | Cor do Marcador | Ícone |
|--------|----------------|-------|
| Pendente | Amarelo `#F9A825` | Ponto de exclamação |
| Em Análise | Azul `#1565C0` | Lupa |
| Em Atendimento | Laranja `#EF6C00` | Caminhão |
| Resolvida | Verde `#2E7D32` | Check |

### Tipografia

- **Títulos:** Inter Bold, 20–32px
- **Corpo:** Inter Regular, 14–16px
- **Labels:** Inter Medium, 12–14px

---

## Tela 1 — Página Inicial (Home Pública)

**URL:** `/`
**Acesso:** Público (sem login)
**Objetivo:** Apresentar o sistema e permitir acesso imediato ao mapa e às principais ações.

---

### Layout

**Cabeçalho (Header):**
- Fundo branco com sombra suave
- Logo à esquerda: ícone de folha verde + texto "EcoAlerta" em verde escuro
- Navegação central: links "Início", "Mapa", "Sobre"
- Canto direito: botão "Entrar" (outline verde) + botão "Cadastrar" (verde sólido)
- Em mobile: menu hamburger substituindo a navegação

---

**Seção Hero (acima da dobra):**
- Background: foto de cidade limpa em contraste com lixo irregular (split visual)
- Título grande: "Juntos por cidades mais limpas"
- Subtítulo: "Registre pontos de descarte irregular de lixo e ajude sua cidade a agir mais rápido."
- Dois botões em destaque:
  - "Fazer uma denúncia" (verde sólido, grande) → direciona para login ou cadastro
  - "Ver mapa" (outline verde, grande) → direciona para `/mapa`
- Contador animado abaixo dos botões: "X denúncias registradas este mês | X resolvidas"

---

**Seção Como Funciona (3 colunas):**
- Card 1 — Ícone de câmera: "1. Fotografe" — "Tire uma foto do local com descarte irregular."
- Card 2 — Ícone de localização: "2. Registre" — "Informe a localização e uma breve descrição."
- Card 3 — Ícone de prefeitura: "3. Acompanhe" — "Veja o status e aguarde o atendimento."

---

**Seção Mapa Preview:**
- Título: "Veja os pontos registrados na sua cidade"
- Mapa estático (screenshot ou mapa embutido leve) com marcadores coloridos
- Botão: "Abrir mapa completo" → `/mapa`

---

**Rodapé:**
- Links: Termos de Uso | Política de Privacidade | Contato
- Alinhamento com ODS 11: logotipo ODS 11 + texto "Projeto alinhado ao ODS 11 — Cidades e Comunidades Sustentáveis"

---

## Tela 2 — Login

**URL:** `/login`
**Acesso:** Público
**Objetivo:** Autenticar cidadãos e administradores.

---

### Layout

**Estrutura:** Tela centralizada, duas colunas em desktop (coluna esquerda: visual; direita: formulário), uma coluna em mobile (apenas formulário).

**Coluna Esquerda (desktop only):**
- Fundo verde escuro (`#1B5E20`)
- Logo grande centralizada
- Frase: "Sua denúncia faz a diferença."
- Imagem ilustrativa de cidade limpa

**Coluna Direita — Formulário:**
- Título: "Bem-vindo(a) de volta"
- Subtítulo: "Entre com sua conta para registrar ou acompanhar denúncias."
- Campo de texto: "E-mail" — placeholder: `seu@email.com`
- Campo de senha: "Senha" — com toggle de visibilidade (ícone olho)
- Link: "Esqueceu a senha?" — alinhado à direita do campo senha
- Botão: "Entrar" (verde, largura total)
- Divisor: "— ou —"
- Link abaixo: "Não tem conta? **Cadastre-se grátis**" → `/cadastro`

**Estados do formulário:**
- Loading: botão "Entrar" exibe spinner
- Erro: borda vermelha nos campos + mensagem de erro abaixo do botão
- Bloqueio por rate limit: contador regressivo "Tente novamente em X segundos"

---

## Tela 3 — Cadastro de Usuário

**URL:** `/cadastro`
**Acesso:** Público
**Objetivo:** Registrar novo cidadão no sistema.

---

### Layout

**Estrutura similar ao Login, com formulário na direita.**

**Formulário:**
- Título: "Crie sua conta"
- Campo: "Nome completo" — placeholder: `João da Silva`
- Campo: "E-mail" — placeholder: `joao@email.com`
- Campo: "Senha" — com toggle de visibilidade + indicador de força da senha (barra colorida: vermelho → amarelo → verde)
- Campo: "Confirmar senha"
- Checkbox: "Li e concordo com os [Termos de Uso] e a [Política de Privacidade]"
- Botão: "Criar conta" (verde, largura total)
- Link: "Já tenho conta. **Entrar**" → `/login`

**Indicador de força da senha:**
- Fraca: barra vermelha + texto "Senha fraca"
- Média: barra amarela + texto "Senha razoável"
- Forte: barra verde + texto "Senha forte"

---

## Tela 4 — Mapa Interativo

**URL:** `/mapa`
**Acesso:** Público (visualização) | Cidadão para ações
**Objetivo:** Exibir todos os pontos de denúncia geolocalizados com filtros.

---

### Layout

**Estrutura:** Mapa ocupa tela inteira (100vw × 100vh). Elementos de UI sobrepostos ao mapa.

---

**Barra Superior (overlay no topo do mapa):**
- Fundo branco semitransparente com blur
- Logo pequena à esquerda
- Filtros rápidos (chips/pills selecionáveis):
  - "Todos" | "Pendentes" | "Em Análise" | "Em Atendimento" | "Resolvidas"
- Seletor de período: "Últimos 7 dias / 30 dias / 90 dias / Todos"
- Botão de busca por endereço (lupa) → expande campo de texto

---

**Mapa (Leaflet.js com tiles OpenStreetMap):**
- Marcadores circulares coloridos por status
- Clustering automático quando zoom afastado (números sobre o cluster)
- Controles de zoom padrão (canto inferior direito)
- Botão "Centralizar na minha localização" (ícone de mira)

---

**Popup de Marcador (ao clicar em um ponto):**
- Card flutuante sobre o mapa (300px de largura)
- Foto em miniatura (160px altura, objeto-fit: cover)
- Badge de status colorido (ex: "● Pendente")
- Texto: bairro + data de registro
- Descrição resumida (máximo 80 caracteres + "ver mais")
- Botão: "Ver detalhes" → `/denuncia/{id}`
- Botão X para fechar

---

**Painel Lateral (desktop) / Bottom Sheet (mobile):**
- Aparece ao selecionar um marcador com informações detalhadas
- Em mobile: sobe da parte inferior da tela como um drawer

---

**Botão Flutuante (FAB — Floating Action Button):**
- Canto inferior direito (acima dos controles de zoom)
- Ícone de "+" + texto "Denunciar"
- Cor: verde principal
- Ao clicar: redireciona para `/denuncia/nova` (se logado) ou `/login?redirect=/denuncia/nova` (se não logado)

---

**Legenda (canto inferior esquerdo):**
- Card compacto com as cores dos marcadores e seus status

---

## Tela 5 — Cadastro de Denúncia

**URL:** `/denuncia/nova`
**Acesso:** 👤 Cidadão autenticado
**Objetivo:** Registrar nova ocorrência de descarte irregular.

---

### Layout

**Estrutura:** Formulário em etapas (stepper) com 3 passos. Barra de progresso no topo.

---

**Barra de Progresso:**
```
● Localização  ——  ○ Detalhes  ——  ○ Foto
```
Cada etapa completada torna o passo anterior verde com checkmark.

---

**Etapa 1 — Localização**

- Título: "Onde está o problema?"
- Mapa pequeno (400px altura) com marcador arrastável
  - Botão: "Usar minha localização atual" (ícone GPS) — centraliza o mapa e coloca o pin nas coordenadas do dispositivo
- Campo de texto (alternativo): "Ou digite o endereço manualmente"
  - Autocomplete de endereços via geocoding
- Exibe as coordenadas detectadas em formato legível: "Rua das Flores, 123 — Centro"
- Botão: "Próximo →"

---

**Etapa 2 — Detalhes**

- Título: "Descreva a ocorrência"
- Textarea: "Descrição" — placeholder: "Descreva o que você está vendo. Ex: Lixo doméstico jogado na calçada próximo à esquina."
  - Contador de caracteres: "X / 500"
- Seletor opcional: "Tipo de resíduo" (chips selecionáveis)
  - Doméstico | Entulho | Móveis | Hospitalar | Outros
- Botão: "← Voltar" | "Próximo →"

---

**Etapa 3 — Foto**

- Título: "Adicione fotos"
- Área de upload com drag & drop (desktop) ou botão de câmera/galeria (mobile)
  - Texto central: "Clique ou arraste até 3 fotos aqui"
  - Formatos aceitos: JPG, PNG, WEBP | Tamanho máx: 5MB cada
- Preview das fotos adicionadas em grade (thumbnails com botão X para remover)
- Mínimo obrigatório: 1 foto (exibir aviso em vermelho se não houver)
- Botão: "← Voltar" | "Registrar Denúncia" (verde, sólido)

---

**Tela de Confirmação (após envio bem-sucedido):**

- Ícone de check verde grande animado
- Título: "Denúncia registrada com sucesso!"
- Protocolo gerado: "Protocolo: **ECO-2026-000042**"
- Texto: "Você receberá atualizações no e-mail cadastrado."
- Dois botões:
  - "Ver no mapa" → `/mapa` (com foco no novo ponto)
  - "Registrar outra denúncia" → reinicia o fluxo

---

## Tela 6 — Minhas Denúncias (Cidadão)

**URL:** `/minhas-denuncias`
**Acesso:** 👤 Cidadão autenticado
**Objetivo:** Acompanhar o histórico e status das denúncias do cidadão logado.

---

### Layout

**Cabeçalho de página:**
- Título: "Minhas Denúncias"
- Subtítulo: "Acompanhe o status das suas ocorrências registradas."

**Filtros rápidos (chips):** "Todas | Pendentes | Em Andamento | Resolvidas"

**Lista de cards (ordenados por data, mais recente primeiro):**

Cada card contém:
- Foto miniatura (80×80px, canto esquerdo)
- Badge colorido de status (canto superior direito)
- Protocolo: "ECO-2026-000042"
- Bairro + data de criação
- Linha de resumo da descrição (truncada com "...")
- Linha do último evento do histórico: "Atualizado em 29/03/2026 — Em análise"
- Botão: "Ver detalhes" (texto + chevron)

**Estado vazio (sem denúncias):**
- Ícone de lixeira com X
- Texto: "Você ainda não registrou nenhuma denúncia."
- Botão: "Fazer primeira denúncia" → `/denuncia/nova`

---

## Tela 7 — Painel Administrativo

**URL:** `/admin`
**Acesso:** 🛡️ Administrador
**Objetivo:** Visão geral, gestão de denúncias e geração de relatórios.

---

### Layout

**Sidebar (menu lateral — desktop):**
- Logo + nome do sistema
- Menu com ícones:
  - Dashboard (ícone de gráfico)
  - Denúncias (ícone de lista)
  - Mapa (ícone de mapa)
  - Relatórios (ícone de arquivo)
  - Equipes (ícone de grupo)
  - Configurações (ícone de engrenagem)
- Rodapé da sidebar: foto/avatar do admin + nome + "Sair"

**Em mobile:** sidebar substituída por bottom navigation bar com 4 ícones principais.

---

**Área Principal — Dashboard:**

**Cards de Indicadores (linha superior, 4 cards):**

| Card | Ícone | Dado |
|------|-------|------|
| Total do mês | Soma | N denúncias |
| Pendentes | Relógio | N aguardando |
| Em Atendimento | Caminhão | N em campo |
| Resolvidas | Check | N este mês |

Cada card tem o número principal grande e uma linha de comparação: "▲ 12% em relação ao mês anterior" (verde se melhora, vermelho se piora).

---

**Gráfico de Barras (linha do meio, 2/3 da largura):**
- Título: "Denúncias por mês (últimos 6 meses)"
- Barras agrupadas por status

**Gráfico de Pizza / Donut (1/3 restante):**
- Título: "Distribuição por bairro (top 5)"

---

**Tabela de Denúncias Recentes (parte inferior):**

Colunas: Protocolo | Bairro | Status (badge) | Data | Ações

**Ações por linha:**
- Botão olho (visualizar) → abre modal ou navega para `/admin/denuncia/{id}`
- Botão editar (alterar status)

**Filtros acima da tabela:**
- Dropdown: Status | Bairro | Período (date range picker)
- Campo de busca por protocolo
- Botão: "Exportar CSV"

---

**Modal de Atualização de Status:**

Aparece ao clicar em "Editar" em uma denúncia:
- Título: "Atualizar status — Protocolo ECO-2026-000042"
- Dropdown de status (apenas transições válidas disponíveis)
- Dropdown de equipe (se status = "Em Atendimento")
- Textarea: "Comentário (opcional)"
- Botões: "Cancelar" | "Salvar" (verde)

---

## Ferramentas Recomendadas para Prototipagem

| Ferramenta | Uso | Acesso |
|------------|-----|--------|
| **Figma** | Prototipagem de alta fidelidade, componentes reutilizáveis, colaboração em tempo real | figma.com (gratuito para estudantes) |
| **Draw.io / diagrams.net** | Diagramas de arquitetura, ER, fluxos | diagrams.net (gratuito, sem instalação) |
| **Excalidraw** | Esboços rápidos e wireframes de baixa fidelidade | excalidraw.com (gratuito) |
| **Whimsical** | Fluxogramas de navegação (user flows) | whimsical.com |
| **Coolors** | Geração e validação de paletas de cores | coolors.co (gratuito) |

---

## Estrutura de Testes (QA)

### Tipos de Testes

| Tipo | Ferramenta | Escopo |
|------|-----------|--------|
| **Testes Unitários** | Jest | Funções de serviço, validações, utilitários |
| **Testes de Integração da API** | Supertest + Jest | Endpoints da API com banco de dados de teste |
| **Testes de Componente** | React Testing Library | Componentes React isolados |
| **Testes de Usabilidade** | Figma Prototype + usuários reais | Fluxos críticos com participantes reais |
| **Testes de Acessibilidade** | axe-core / Lighthouse | Conformidade WCAG 2.1 AA |

### Casos de Teste Prioritários

| ID | Caso de Teste | Tipo |
|----|--------------|------|
| TC-01 | Registrar denúncia com foto, descrição e GPS válidos | Integração |
| TC-02 | Tentar registrar denúncia sem foto — deve bloquear | Unitário |
| TC-03 | Login com credenciais corretas retorna token JWT válido | Integração |
| TC-04 | Login com senha errada retorna 401 | Integração |
| TC-05 | Cidadão não consegue atualizar status de denúncia (403) | Integração |
| TC-06 | Mapa exibe marcadores corretos por filtro de status | Componente |
| TC-07 | Administrador exporta CSV com dados filtrados | Integração |
| TC-08 | Upload de arquivo .exe deve ser rejeitado | Unitário |
| TC-09 | Token expirado retorna 401 com código TOKEN_EXPIRED | Integração |
| TC-10 | Formulário de denúncia: botão "Próximo" desabilitado sem localização | Componente |

---

## Melhorias Futuras (Roadmap v2.0)

| # | Melhoria | Impacto |
|---|----------|---------|
| 1 | **App Mobile Nativo (React Native)** — câmera integrada, notificações push, offline-first | Alto |
| 2 | **Gamificação** — pontos e badges para cidadãos que registram e verificam denúncias | Médio |
| 3 | **IA para triagem automática** — detectar tipo de resíduo na foto (visão computacional) | Alto |
| 4 | **Integração com sistemas municipais** — envio automático para protocolo da prefeitura | Alto |
| 5 | **Modo offline** — salvar denúncia localmente e sincronizar ao retornar ao online | Médio |
| 6 | **Heatmap de risco** — predição de áreas com maior probabilidade de descarte irregular | Médio |
| 7 | **API pública aberta** — dados agregados disponíveis para pesquisadores e jornalistas | Baixo |
| 8 | **Suporte multilíngue** — Português, Espanhol, Inglês | Baixo |
| 9 | **Verificação comunitária** — cidadãos podem confirmar ou contestar uma denúncia | Médio |
| 10 | **Painel para vereadores** — visão agregada por zona eleitoral para uso político-social | Baixo |
