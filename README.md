<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://raw.githubusercontent.com/andsilvarosa/controle/refs/heads/main/assets/ghbanner.png" />
</div>

<div align="center">
  <h1>SOS Controle</h1>
  <p>Dashboard premium para gestão financeira pessoal</p>
  <p>
    <img src="https://img.shields.io/badge/version-3.3.0-blue.svg" alt="Versão" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6.svg" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-19-61DAFB.svg" alt="React" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="Licença" />
  </p>
</div>

---

## Sobre o Projeto

O **SOS Controle** é uma aplicação web completa para controle financeiro pessoal, desenvolvida com foco em simplicidade, segurança e experiência visual. O sistema permite gerenciar receitas, despesas, carteiras multi-moeda, orçamentos por categoria, relatórios visuais com gráficos interativos e projeções financeiras futuras.

Inspirado no design do PicPay, o app adota uma paleta verde como identidade visual e é totalmente voltado ao público brasileiro — com suporte a Real (BRL), datas no formato local e interface em Português.

---

## Funcionalidades

### Controle Financeiro
- **Dashboard (Extrato)** — Visão geral com cartões de KPI (receitas, despesas, saldo), lista de transações agrupadas por data, filtros por categoria e busca textual
- **Horizonte Financeiro** — Projeção de saldo para os próximos 6 meses com base no comportamento atual
- **Transações Recorrentes** — Suporte a recorrência semanal, mensal, trimestral, semestral, anual e parcelas fixas com exceções
- **Categorização Automática** — Regas de automação que classificam transações automaticamente por palavras-chave na descrição

### Carteiras
- **Multi-moeda** — Suporte a BRL, USD, EUR e GBP com taxas de câmbio
- **Tipos de carteira** — Conta corrente, cartão de crédito, dinheiro, investimento, poupança e viagem
- **Visual em cards** — Interface visual com cartões coloridos por tipo

### Orçamentos (Metas)
- **Limites por categoria** — Defina tetos mensais de gasto por categoria de despesa
- **Barras de progresso** — Acompanhamento visual com alertas de estouro
- **Porcentagem em tempo real** — Percentual utilizado vs. limite definido

### Agenda Financeira (Calendário)
- **Visão mensal** — Calendário com indicadores de receitas e despesas por dia
- **Detalhes por dia** — Clique em qualquer dia para ver as transações correspondentes

### Relatórios (Inteligência de Dados)
- **Por Categoria** — Gráfico de rosca (donut) com distribuição de despesas por categoria
- **Mensal** — Gráfico de barras comparando receitas vs. despesas nos últimos 6 meses
- **Evolução** — Gráfico de área com saldo acumulado diário
- **Import/Export Excel** — Importe e exporte dados via planilhas XLSX

### Categorias
- **CRUD completo** — Crie, edite e exclua categorias de receita e despesa
- **Ícones e cores** — Personalize cada categoria com ícone e cor customizados

### Autenticação e Segurança
- **Login/Registro** — Fluxo completo com validação de e-mail e senha
- **2FA (TOTP)** — Autenticação em dois fatores com QR Code e códigos temporários
- **Recuperação de senha** — E-mail com código de 6 dígitos via Resend
- **Bloqueio de conta** — Após 5 tentativas falhas, conta bloqueada por 15 minutos
- **Rate Limiting** — Proteção contra força bruta em login, registro e 2FA
- **Gerenciamento de sessões** — Liste e revogue sessões ativas por dispositivo
- **Audit Logs** — Registro de todas as ações do usuário
- **Alertas de novos dispositivos** — Notificação por e-mail ao acessar de um dispositivo desconhecido
- **Hash PBKDF2** — Senhas criptografadas com 100.000 iterações e salt aleatório

### Score de Saúde Financeira
- **Score 0–1000** — Calculado com base em saldos, transações vencidas e taxa de economia
- **Conquistas (Badges)** — 4 medalhas: Guardião (orçamentos ativos), Economista (>20% economia), Em Dia (sem vencidos), Viajante (carteira em moeda estrangeira)

### Experiência do Usuário
- **Modo Privacidade** — Ofusca valores financeiros em toda a interface
- **Modo Escuro** — Tema dark completo com persistência em localStorage
- **Paleta de Comandos** — Acesso rápido via `Ctrl+K` para navegação e ações
- **FAB (Botão Flutuante)** — Adição rápida de receitas e despesas
- **Responsivo** — Layout adaptável com menu lateral colapsável e menu mobile

### Integração Mobile (Bancos)
- **Parsing de notificações** — Leitura de push notifications de bancos brasileiros (Nubank, Itaú, Inter, Bradesco, Santander)
- **Pré-preenchimento** — Dados da transação extraídos automaticamente da notificação
- **Capacitor Bridge** — Integração nativa via Capacitor no app Expo/React Native

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                     │
│   Vite 6 • React 19 • Tailwind CSS • Zustand • Framer      │
│   Motion • Recharts • Lucide Icons • XLSX                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP POST (command pattern)
┌────────────────────────▼────────────────────────────────────┐
│              Backend (Cloudflare Pages Functions)           │
│   JWT Auth • Rate Limiting • Audit Logs • Email (Resend)   │
└────────────────────────┬────────────────────────────────────┘
                         │ Serverless Driver
┌────────────────────────▼────────────────────────────────────┐
│                 Database (Neon PostgreSQL)                  │
│   12 tabelas: users, sessions, transactions, wallets,       │
│   budgets, categories, rules, audit_logs, etc.              │
└─────────────────────────────────────────────────────────────┘
```

### Padrão de API
O backend utiliza um **padrão de comando** — todos os endpoints aceitam `POST` com um campo `action` no body (ex: `create`, `update`, `delete`, `list`) em vez de métodos RESTful tradicionais. Isso reduz o número de rotas e centraliza a lógica por domínio.

### State Management
- **`useFinanceStore`** — Store principal: dados financeiros, operações CRUD, lógica de negócio, engine de recorrência, cálculo de score e badges
- **`useAuthStore`** — Store dedicado à autenticação
- **`useUIStore`** — Estado puramente visual: view ativa, sidebar, tema, modais, modo privacidade

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript 5.7 (strict mode) |
| Frontend | React 19 + Vite 6 |
| Estilização | Tailwind CSS |
| Estado | Zustand 5 |
| Animações | Framer Motion 12 |
| Ícones | Lucide React |
| Gráficos | Recharts 3 |
| Excel | SheetJS (xlsx) |
| Backend | Cloudflare Pages Functions (serverless) |
| Banco de Dados | Neon PostgreSQL (serverless) |
| Auth | JWT (`@tsndr/cloudflare-worker-jwt`) |
| 2FA | TOTP (`otpauth`) |
| E-mail | Resend |
| QR Code | `qrcode` + `pngjs` |
| Deploy | Cloudflare Pages (Wrangler) |
| Mobile | Expo/React Native + Capacitor |

---

## Pré-requisitos

- **Node.js** >= 18
- **npm** ou **pnpm**
- Conta na [Neon](https://neon.tech) (PostgreSQL serverless)
- Conta na [Cloudflare](https://cloudflare.com) (para deploy)
- Conta na [Resend](https://resend.com) (para envio de e-mails)

---

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sos-controle.git
cd sos-controle
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (ou configure no dashboard do Cloudflare Pages):

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=sua_chave_secreta_aqui
RESEND_API_KEY=re_sua_chave_aqui
APP_URL=http://localhost:5173
ADMIN_SECRET=senha_admin_para_setup_db
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão com o banco Neon PostgreSQL |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT |
| `RESEND_API_KEY` | Chave da API Resend para envio de e-mails |
| `APP_URL` | URL base da aplicação |
| `ADMIN_SECRET` | Senha para acessar o endpoint de inicialização do banco |

### 4. Inicialize o banco de dados

Após configurar as variáveis, acesse o endpoint de setup (protegido por `ADMIN_SECRET`):

```bash
curl -X POST http://localhost:8788/api/setup-db \
  -H "Content-Type: application/json" \
  -d '{"adminSecret": "sua_senha_admin"}'
```

### 5. Execute em modo desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173` no navegador.

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento Vite |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Build + preview local com Cloudflare Pages (Wrangler) |
| `npm run lint` | Verificação de tipos TypeScript |
| `npm run type-check` | Alias para `tsc --noEmit` |

---

## Estrutura do Projeto

```
sos-controle/
├── functions/api/          # Cloudflare Pages Functions (backend)
│   ├── auth.ts             # Login, registro, 2FA, recuperação de senha
│   ├── data.ts             # Fetch de todos os dados do usuário
│   ├── transactions.ts     # CRUD de transações + recorrências
│   ├── categories.ts       # CRUD de categorias
│   ├── wallets.ts          # CRUD de carteiras
│   ├── budgets.ts          # CRUD de orçamentos
│   ├── rules.ts            # CRUD de regras de automação
│   ├── sessions.ts         # Gerenciamento de sessões
│   └── setup-db.ts         # Inicialização do schema do banco
├── pages/                  # Páginas da aplicação
│   ├── Dashboard.tsx       # Extrato principal com KPIs e horizonte
│   ├── Reports.tsx         # Relatórios com gráficos
│   ├── Calendar.tsx        # Agenda financeira
│   ├── Wallets.tsx         # Carteiras multi-moeda
│   ├── Budgets.tsx         # Metas e orçamentos
│   ├── Categories.tsx      # Gerenciamento de categorias
│   ├── Rules.tsx           # Regras de automação
│   ├── Settings.tsx        # Configurações e perfil
│   └── Auth.tsx            # Login, registro, 2FA
├── components/
│   ├── Layout/             # Sidebar, Header
│   └── UI/                 # CommandPalette, FAB, modais
├── store/                  # Zustand stores
│   ├── useFinanceStore.ts  # Store principal (dados + lógica)
│   ├── useAuthStore.ts     # Store de autenticação
│   └── useUIStore.ts       # Store de estado visual
├── lib/                    # Utilitários
│   ├── db.ts               # Conexão Neon + schema
│   ├── security.ts         # JWT, rate limiting, sanitização
│   ├── bankParser.ts       # Parser de notificações bancárias
│   └── useBankNotifications.ts  # Hook Capacitor
├── mobile/                 # App mobile (Expo + Capacitor)
├── types.ts                # Interfaces TypeScript
├── App.tsx                 # Componente raiz + rotas
├── index.tsx               # Entry point
├── vite.config.ts          # Configuração Vite
├── wrangler.toml           # Configuração Cloudflare
├── tsconfig.json           # Configuração TypeScript
└── _headers                # Headers de segurança
```

---

## Esquema do Banco de Dados

O banco possui 12 tabelas principais:

| Tabela | Descrição |
|---|---|
| `users` | Usuários, perfil, segredos 2FA, bloqueio |
| `sessions` | Sessões ativas para gerenciamento multi-dispositivo |
| `known_devices` | Rastreamento de dispositivos conhecidos |
| `audit_logs` | Log de auditoria de todas as ações |
| `password_resets` | Tokens de recuperação de senha |
| `rate_limits` | Armazenamento de rate limiting |
| `categories` | Categorias de receita/despesa |
| `wallets` | Carteiras multi-moeda |
| `transactions` | Transações com suporte a recorrência |
| `budgets` | Orçamentos mensais por categoria |
| `rules` | Regras de auto-categorização |
| `recurrence_exceptions` | Exceções de datas para transações recorrentes |

---

## Deploy

### Cloudflare Pages

1. Conecte seu repositório GitHub ao Cloudflare Pages
2. Configure as variáveis de ambiente no dashboard
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy automático a cada push na branch principal

```bash
# Preview local do build de produção
npm run preview
```

---

## Mobile

O projeto inclui um sub-projeto mobile separado na pasta `mobile/` construído com Expo/React Native e Capacitor para parsing de notificações bancárias.

```bash
cd mobile
npm install
npm start
```

---

## Licença

Este projeto é privado e proprietário.

---

<div align="center">
  <p>Desenvolvido com React, TypeScript e Cloudflare Pages</p>
</div>
