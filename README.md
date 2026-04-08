<h1 align="center">⚙️ Service Desk - Sistema de Help Desk</h1>

<p align="center">
  <img src="src/assets/hero.png" alt="Service Desk Cover" width="800">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
</p>

> **🌐 Live Demo (Deploy):** https://service-desk-gules.vercel.app/ | **Status:** Em Produção 🚀

Este é um sistema de Service Desk (Help Desk) *Full Stack*, dividido em um **Frontend** moderno e reativo, e um **Backend** robusto. Projetado como parte do meu portfólio pessoal, o sistema apresenta sólidas práticas em construir arquiteturas escaláveis. O sistema foi construído visando gerenciar tickets de suporte, base de conhecimento (artigos) e controle de acesso baseado em roles (Admin, Manager, Agent, User) utilizando comunicação em tempo real.

## 🚀 Tecnologias Utilizadas

### Frontend
A interface foi construída buscando alta performance e ótima experiência de usuário.
- **React.js** com **TypeScript**
- **Vite** como build tool
- **Tailwind CSS** para estilização rápida e responsiva
- **React Router Dom** para roteamento
- **React Query** para gerenciamento de estado assíncrono e cache
- **React Hook Form** + **Zod** para validação e envio de formulários
- **Socket.io-client** para atualizações e notificações em tempo real
- **Recharts** para exibição de gráficos e dashboards
- **Lucide React** para ícones

### Backend
O servidor fornece a API REST e gerencia a lógica de negócios e as conexões em tempo real.
- **Node.js** com **Express** e **TypeScript**
- **Prisma ORM** como interface de banco de dados
- **PostgreSQL** para persistência de dados
- **Socket.IO** para comunicação bidirecional em tempo real (WebSockets)
- **JWT (JSON Web Tokens)** e **Bcrypt** para autenticação e segurança
- **Zod** para validação de esquemas de dados recebidos
- **Multer** para upload de arquivos (anexos em tickets)
- **Supabase** (SDK) para possível integração de storage em nuvem.

## 📂 Estrutura do Projeto

O projeto é tipicamente um monorepo/estrutura dividida nas seguintes pastas principais:
```
/
├── backend/               # Código fonte da API e Banco de Dados
│   ├── prisma/            # Esquemas do Prisma ORM e Seeders
│   ├── src/               # Código TypeScript do Backend
│   │   ├── controllers/   # Regras de comunicação de rotas
│   │   ├── routes/        # Definição das rotas da API
│   │   ├── middlewares/   # Middlewares (ex: Auth, Validações)
│   │   └── index.ts       # Ponto de entrada do Backend
│   ├── package.json       # Dependências do Backend
│   └── .env               # Variáveis de ambiente do Backend
│
├── src/                   # Código fonte do Frontend (React)
│   ├── assets/            # Imagens e arquivos estáticos
│   ├── components/        # Componentes visuais reutilizáveis
│   ├── context/           # Contextos do React (ex: Autenticação)
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Telas da aplicação (Dashboard, Tickets, etc)
│   ├── services/          # Serviços e chamadas de API (Axios)
│   ├── types/             # Definição de Tipos e Interfaces globais do TS
│   └── utils/             # Funções utilitárias
│
├── package.json           # Dependências do Frontend
├── vite.config.ts         # Configuração do Vite
└── tailwind.config.js     # Configuração do Tailwind CSS
```

## ⚙️ Funcionalidades Principais

- 🔐 **Autenticação e Autorização:** Controle de acesso baseado em papéis (RBAC). Acesso hierárquico dividido por perfis informados no banco.
- 🎫 **Gerenciamento de Tickets:** Criação, designação, comentários internos/externos, priorização, status e amplo histórico do chamado.
- 📚 **Base de Conhecimento:** Criação e consulta de artigos com categorias e tags para facilitar o autoatendimento do usuário final.
- 👥 **Equipes e Usuários:** Gestão transparente dos usuários do sistema e criação flexível de equipes de atendimento.
- ⚡ **Tempo Real:** Notificações e atualizações instantâneas de chamados através de WebSockets (Socket.IO).
- 📊 **Dashboards e Métricas:** Visão consolidada e gráfica sobre dados de atendimentos e performance operacional.

---

## 📸 Galeria de Telas (Screenshots)

*Aqui estão as imagens do sistema em funcionamento.*

> **Dica para o Portfólio:** Salve as capturas de tela do seu sistema na pasta `public/` ou `src/assets/` e substitua as URLs dos placeholders abaixo pelos caminhos corretos das imagens (exemplo: `src/assets/tela-login.png`).

<details>
<summary><b>Clique para expandir e visualizar as imagens do sistema</b></summary>
<br>

<div align="center">
  <img src="public/tela login.png" alt="Tela de Login" width="800">
  <p><i>Tela de Login com Validação</i></p>
  <br>

  <img src="public/dashboard.png" alt="Dashboard Principal" width="800">
  <p><i>Dashboard de Métricas</i></p>
  <br>

  <img src="public/chamados.png" width="800">
  <p><i>Lista de Atendimentos e Detalhe de um Ticket em Tempo Real</i></p>
</div>
</details>

---

## 🛠️ Como Rodar o Projeto

### 1. Pré-Requisitos
Você precisará das seguintes ferramentas instaladas:
- [Node.js](https://nodejs.org/en/) (Versão LTS recomendada, 18+ ou 20+)
- [PostgreSQL](https://www.postgresql.org/) (Para o banco de dados) ou uma conta no Supabase

### 2. Configurando o Backend

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as Variáveis de Ambiente:
   Crie ou edite o arquivo `.env` baseado no arquivo `.env.example` (se existir) dentro da pasta `/backend`. Assegure-se de preencher informações como a `DATABASE_URL` (Sua conexão PostgresSQL) e `JWT_SECRET`.
   Exemplo de `.env`:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/servicedesk?schema=public"
   DIRECT_URL="postgresql://usuario:senha@localhost:5432/servicedesk?schema=public"
   PORT=3000
   JWT_SECRET="seu-segredo-aqui"
   ```
4. Configure o Banco de Dados com Prisma:
   *Gere os tipos do Prisma e aplique as migrations no seu banco:*
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *(Opcional)* Você pode rodar a semente (seed) para popular o banco de dados com dados iniciais:
   ```bash
   npm run prisma db seed
   ```
5. Inicie o Servidor de Desenvolvimento:
   ```bash
   npm run dev
   ```
   O backend deverá estar rodando (geralmente em `http://localhost:3000`).

### 3. Configurando o Frontend

Abra um **novo terminal** para não fechar o processo do backend.

1. Se você estiver na raiz do projeto, certifique-se de instalar as dependências do painel front:
   ```bash
   npm install
   ```
2. Configure as Variáveis de Ambiente do Frontend:
   Crie um arquivo `.env` na raiz do projeto (se necessário) apontando para o seu backend.
   Exemplo:
   ```env
   VITE_API_URL="http://localhost:3000/api"
   ```
3. Inicie o Servidor de Desenvolvimento do React:
   ```bash
   npm run dev
   ```
4. Abra o navegador no link fornecido pelo Vite (Geralmente `http://localhost:5173`).

---

## 💡 Dicas de Desenvolvimento

- **Sincronização de Tipos**: Lembre-se, sempre que fizer alterações no esquema do banco (`backend/prisma/schema.prisma`), rode o comando `npx prisma generate` para o seu cliente TypeScript ser atualizado.
- **Tipagem**: Há verificação de tipos acontecendo. Se utilizar o terminal utilize o `npm run lint` ocasionalmente para garantir boas práticas.

---
> 🚀 **Desenvolvido por [Luiz Muller Costa de Abreu](https://github.com/LuizAbreuu)** | Conecte-se comigo no [LinkedIn] (https://www.linkedin.com/in/luizmullercostadeabreu/) !
