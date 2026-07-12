# PRD Handoff

## Documento

Este documento consolida o contexto do projeto, os problemas identificados, as mudanças implementadas nesta rodada e os próximos passos recomendados. O objetivo e permitir a abertura de uma nova janela de contexto sem perda de continuidade tecnica ou funcional.

## Produto

- Nome: Service Desk
- Tipo de superficie: `product`
- Usuarios principais: equipes operacionais de service desk, atendimento interno e gestao
- Objetivo principal: centralizar tickets, usuarios, base de conhecimento e metricas em uma interface confiavel, agil e profissional
- Diretrizes de UX relevantes:
  - foco em fluxo operacional
  - clareza de estados, prioridades e responsabilidades
  - poucas animacoes
  - alta previsibilidade de comportamento

Referencia estrategica complementar: [PRODUCT.md](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/PRODUCT.md:1)

## Problema Inicial

Antes desta rodada, o projeto tinha tres grupos principais de problemas:

1. Seguranca e autorizacao estavam concentradas demais no frontend.
2. O backend nao aplicava RBAC real nas rotas e operacoes sensiveis.
3. Havia contratos quebrados entre frontend e backend, principalmente em tickets:
   - o frontend chamava `PUT /tickets/:id` sem rota correspondente
   - o frontend chamava `POST /tickets/:id/attachments` sem rota correspondente
   - a UI ainda mostrava acoes que o backend passou a negar corretamente apos o endurecimento de seguranca

## Objetivos Desta Rodada

1. Endurecer autenticacao e seguranca base do backend.
2. Implementar RBAC real no backend.
3. Aplicar regras de ownership e visibilidade em tickets e conhecimento.
4. Alinhar frontend com as novas permissoes.
5. Restaurar os contratos quebrados entre frontend e backend.

## Escopo Implementado

### 1. Contexto do produto

- Foi criado o arquivo [PRODUCT.md](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/PRODUCT.md:1) com:
  - register `product`
  - usuarios, proposito, personalidade
  - anti-referencias
  - principios de design
  - direcionamento de acessibilidade

### 2. Endurecimento de seguranca no backend

Foi criada uma base de seguranca reutilizavel:

- [backend/src/config/env.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/config/env.ts:1)
  - leitura obrigatoria de `JWT_SECRET`
  - allowlist de origens
  - configuracao de rate limit

- [backend/src/utils/errors.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/utils/errors.ts:1)
  - erros operacionais tipados

- [backend/src/middlewares/auth.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/middlewares/auth.ts:1)
  - parse seguro de bearer token
  - validacao JWT sem fallback inseguro
  - carregamento de usuario autenticado minimo e tipado
  - bloqueio de usuario inativo

- [backend/src/middlewares/authorize.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/middlewares/authorize.ts:1)
  - middleware reutilizavel `requireRole`

- [backend/src/middlewares/rateLimit.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/middlewares/rateLimit.ts:1)
  - rate limit simples em memoria

- [backend/src/middlewares/security.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/middlewares/security.ts:1)
  - headers basicos de seguranca

- [backend/src/middlewares/error.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/middlewares/error.ts:1)
  - tratamento padronizado para `ZodError` e `AppError`

### 3. RBAC no backend

#### Regras principais consolidadas

- `Admin`
  - acesso total a usuarios, times, knowledge e dashboard
  - pode excluir tickets
  - pode excluir usuarios

- `Manager`
  - acesso a dashboard, knowledge, usuarios e times
  - pode criar/editar/desativar usuarios nao-admin
  - nao pode promover/criar/excluir `Admin`

- `Agent`
  - acesso a dashboard, knowledge e usuarios para consulta operacional
  - pode operar tickets
  - nao pode gerenciar usuarios

- `User`
  - acesso apenas aos proprios tickets
  - pode comentar nos tickets acessiveis
  - nao pode usar notas internas
  - so ve artigos publicados

#### Arquivos principais

- [backend/src/security/roles.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/security/roles.ts:1)
- [backend/src/routes/userRoutes.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/routes/userRoutes.ts:1)
- [backend/src/routes/ticketRoutes.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/routes/ticketRoutes.ts:1)
- [backend/src/routes/knowledgeRoutes.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/routes/knowledgeRoutes.ts:1)
- [backend/src/routes/dashboardRoutes.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/routes/dashboardRoutes.ts:1)

### 4. Regras de negocio e ownership no backend

#### Usuarios

- `Manager` nao pode criar, editar, desativar, reativar ou excluir `Admin`
- `Admin` nao pode autoexcluir ou autodesativar
- listagem de usuarios passou a aceitar filtro por `role`

Arquivo principal:
- [backend/src/controllers/userController.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/controllers/userController.ts:1)

#### Tickets

- usuario comum so lista os proprios tickets
- detalhe do ticket respeita ownership/atribuicao/staff
- comentarios internos sao bloqueados para usuario comum
- comentarios internos nao sao retornados para usuario comum no detalhe do ticket
- atribuicao de ticket valida se o destino e um membro ativo de staff
- edicao completa de ticket foi implementada como endpoint real
- upload de anexo foi implementado como endpoint real

Arquivo principal:
- [backend/src/controllers/ticketController.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/controllers/ticketController.ts:1)

#### Knowledge

- `User` so recebe artigos publicados
- `User` nao pode acessar artigo nao-publicado por ID
- criacao/edicao restritas a staff
- exclusao restrita a `Admin` e `Manager`

Arquivo principal:
- [backend/src/controllers/knowledgeController.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/controllers/knowledgeController.ts:1)

### 5. Bootstrap do servidor e Socket.IO

Arquivo principal:
- [backend/src/index.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/index.ts:1)

Mudancas:

- `x-powered-by` desabilitado
- CORS com allowlist
- `express.json` e `urlencoded` com limite de payload
- rate limit aplicado em `/api`
- rota estatica para `/uploads`
- autenticacao obrigatoria no handshake do Socket.IO

### 6. Contratos frontend/backend alinhados

#### Contratos restaurados

Os fluxos abaixo agora tem suporte real no backend e alinhamento no frontend:

- `PUT /api/tickets/:id`
- `POST /api/tickets/:id/attachments`
- `GET /api/users?role=Agent`

#### Arquivos atualizados

- [src/services/ticketService.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/services/ticketService.ts:1)
- [src/hooks/useTickets.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/hooks/useTickets.ts:1)
- [src/services/userService.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/services/userService.ts:1)
- [src/hooks/useUsers.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/hooks/useUsers.ts:1)
- [src/components/tickets/TicketForm.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/components/tickets/TicketForm.tsx:1)

### 7. Permissoes centralizadas no frontend

Foi criado um helper de permissoes para refletir a politica do backend na UI:

- [src/utils/permissions.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/utils/permissions.ts:1)

Esse arquivo passou a orientar:

- rotas protegidas
- exibicao de itens do sidebar
- exibicao de botao de editar ticket
- exibicao de acoes em usuarios
- papeis disponiveis no formulario de usuario
- acoes da knowledge base
- opcao de comentario interno
- acoes do sidebar do ticket

Arquivos principais que consumiram essas permissoes:

- [src/App.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/App.tsx:1)
- [src/components/layout/Sidebar.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/components/layout/Sidebar.tsx:1)
- [src/pages/UsersPage.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/pages/UsersPage.tsx:1)
- [src/components/users/UserForm.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/components/users/UserForm.tsx:1)
- [src/pages/KnowledgePage.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/pages/KnowledgePage.tsx:1)
- [src/components/knowledge/ArticleCard.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/components/knowledge/ArticleCard.tsx:1)
- [src/pages/TicketDetailPage.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/pages/TicketDetailPage.tsx:1)
- [src/components/tickets/TicketSidebar.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/components/tickets/TicketSidebar.tsx:1)
- [src/components/tickets/CommentSection.tsx](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/components/tickets/CommentSection.tsx:1)

## Validacoes Executadas

Os seguintes comandos foram executados com sucesso:

- `backend/npm run build`
- `npm run build`

Resultado:

- backend compilando com Prisma + TypeScript
- frontend compilando com TypeScript + Vite

Observacoes do build frontend:

- ha warnings de bundle grande
- ha warnings deprecados ligados ao plugin React/Vite
- nao houve erro bloqueante

## Estado Atual dos Contratos

### Auth

- `POST /api/auth/login`
  - retorna `tokens.accessToken`, `tokens.refreshToken`, `user`
- `GET /api/auth/me`
  - retorna usuario autenticado minimo para o frontend
- logout continua client-driven

### Tickets

- `GET /api/tickets`
  - usuario comum recebe apenas tickets proprios
- `GET /api/tickets/:id`
  - aplica ownership/atribuicao/staff
- `POST /api/tickets`
  - cria ticket
- `PUT /api/tickets/:id`
  - staff edita ticket
- `PATCH /api/tickets/:id/assign`
  - staff atribui ticket para membro ativo de staff
- `PATCH /api/tickets/:id/status`
  - staff altera status
- `PATCH /api/tickets/:id/escalate`
  - staff escala prioridade
- `POST /api/tickets/:id/comments`
  - usuario comum comenta, mas sem nota interna
- `POST /api/tickets/:id/attachments`
  - upload local com `multer`
- `GET /api/tickets/:id/history`
  - respeita acesso ao ticket
- `DELETE /api/tickets/:id`
  - admin apenas

### Users

- `GET /api/users`
  - aceita `role` opcional
- `POST /api/users`
  - admin/manager
- `PUT /api/users/:id`
  - admin/manager com restricoes sobre alvo
- `PATCH /api/users/:id/deactivate`
  - admin/manager com restricoes
- `PATCH /api/users/:id/reactivate`
  - admin/manager com restricoes
- `DELETE /api/users/:id`
  - admin apenas

### Knowledge

- `GET /api/knowledge`
  - usuario comum recebe so `Published`
- `GET /api/knowledge/:id`
  - bloqueia acesso a nao-publicado para `User`
- `POST /api/knowledge`
  - staff
- `PUT /api/knowledge/:id`
  - staff
- `DELETE /api/knowledge/:id`
  - admin/manager

## Decisoes Tecnicas Importantes

1. O refresh token nao foi redesenhado nesta rodada.
   - O contrato atual com o frontend foi preservado para nao abrir um terceiro front de mudanca ao mesmo tempo.
   - O backend ainda devolve `refreshToken` igual ao `accessToken`.
   - Isso deve ser tratado em uma proxima fase dedicada a sessao/refresh.

2. O rate limit e em memoria.
   - Serve para endurecimento inicial e ambiente simples.
   - Para escala horizontal, o ideal e migrar para Redis ou camada externa.

3. O upload de anexos e local.
   - Os arquivos vao para `uploads/`.
   - O acesso publico e servido por `/uploads`.
   - Futuramente, pode migrar para storage dedicado.

4. A politica de permissao do frontend agora e espelho do backend, nao fonte da verdade.
   - O backend continua sendo a autoridade real.
   - O frontend so melhora UX evitando acoes inviaveis.

## Limites / Pendencias Conhecidas

1. Fluxo de refresh token ainda nao esta realmente implementado.
2. Nao foram adicionados testes automatizados de RBAC nesta rodada.
3. A resposta de erro do frontend ainda pode ser melhor refinada para `403`, `409` e mensagens operacionais.
4. Upload de anexos esta funcional, mas sem politica mais robusta de validacao de tipo MIME e antivrus.
5. O projeto ainda nao tem `DESIGN.md`.
6. O script `npm run lint` do frontend segue precisando ajuste separado por causa da migracao de ESLint flat config.

## Proximos Passos Recomendados

### Prioridade Alta

1. Refinar feedbacks de erro no frontend para `403`, `404`, `409` e falhas de upload.
2. Adicionar testes de autorizacao backend por rota e por papel.
3. Implementar refresh token real com expiracao/rotacao e opcao de revogacao.

### Prioridade Media

4. Evoluir controle de anexos:
   - MIME allowlist
   - nomes seguros
   - storage externo
5. Padronizar respostas da API com envelope consistente.
6. Introduzir camada de services no backend para reduzir regra de negocio em controllers.

### Prioridade de Produto / UX

7. Revisar estados vazios, mensagens de permissao e affordances bloqueadas.
8. Criar `DESIGN.md` para consolidar o sistema visual.
9. Reduzir peso do bundle frontend.

## Arquivos Novos ou Estruturais Criados

- [PRODUCT.md](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/PRODUCT.md:1)
- [PRD_HANDOFF.md](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/PRD_HANDOFF.md:1)
- [backend/src/config/env.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/config/env.ts:1)
- [backend/src/middlewares/authorize.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/middlewares/authorize.ts:1)
- [backend/src/middlewares/rateLimit.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/middlewares/rateLimit.ts:1)
- [backend/src/middlewares/security.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/middlewares/security.ts:1)
- [backend/src/security/roles.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/security/roles.ts:1)
- [backend/src/types/auth.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/types/auth.ts:1)
- [backend/src/types/express.d.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/types/express.d.ts:1)
- [backend/src/utils/errors.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/backend/src/utils/errors.ts:1)
- [src/utils/permissions.ts](/C:/Users/luiz_/OneDrive/Documentos/ServiceDesk/src/utils/permissions.ts:1)

## Resumo Executivo

Esta rodada transformou a seguranca do projeto de uma protecao majoritariamente visual para uma protecao real no backend, alinhou a UI com essa nova realidade e restaurou fluxos quebrados de ticket. O sistema agora esta em um estado mais coerente para seguir com:

- refinamento de UX para erros/permissoes
- testes automatizados
- sessao/refresh token real
- evolucao arquitetural mais profunda
