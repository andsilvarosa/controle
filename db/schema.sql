
-- Habilita verificação de chave estrangeira para integridade dos dados
PRAGMA foreign_keys = ON;

-- 1. Tabela de Usuários
-- Armazena dados de login, perfil e autenticação
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- UUID gerado pelo frontend ou backend
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT, -- Campo opcional para recuperação via SMS
    password TEXT NOT NULL, -- Em produção, armazene apenas o HASH da senha
    avatar TEXT, -- URL ou string de configuração do avatar
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Categorias
-- Personalizações de categorias por usuário
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL, -- Nome do ícone (ex: 'Utensils')
    color TEXT NOT NULL, -- Código Hex (ex: '#ef4444')
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabela de Transações
-- O coração do sistema financeiro
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, -- Armazena valores monetários com precisão
    date TEXT NOT NULL, -- Data do lançamento (ISO 8601: YYYY-MM-DD)
    due_date TEXT NOT NULL, -- Data de vencimento (ISO 8601: YYYY-MM-DD)
    category_id TEXT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    is_paid INTEGER DEFAULT 0 CHECK(is_paid IN (0, 1)), -- SQLite usa 0/1 para Boolean
    notes TEXT,
    
    -- Campos de Recorrência
    recurrence TEXT DEFAULT 'none', -- 'fixed', 'weekly', 'monthly', etc.
    installments INTEGER DEFAULT 1,
    current_installment INTEGER,
    parent_id TEXT, -- ID da transação original (para parcelas)
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Tabela de Regras de Automação
-- Para categorização automática baseada na descrição
CREATE TABLE rules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    active INTEGER DEFAULT 1 CHECK(active IN (0, 1)), -- Boolean
    condition TEXT NOT NULL, -- Texto a ser buscado na descrição
    category_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Índices para melhorar performance de consultas
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_duedate ON transactions(user_id, due_date);
CREATE INDEX idx_categories_user ON categories(user_id);
