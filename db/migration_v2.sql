
-- ==========================================================
-- MIGRAÇÃO V2 - Carteiras (Wallets) e Orçamentos (Budgets)
-- ==========================================================

-- 1. Criação da Tabela de Carteiras
CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL, -- Ex: 'Nubank', 'Carteira Física', 'Investimentos'
    type TEXT NOT NULL CHECK(type IN ('checking', 'credit_card', 'cash', 'investment', 'savings')),
    color TEXT NOT NULL, -- Cor do cartão visual
    balance DECIMAL(10, 2) DEFAULT 0.00, -- Saldo inicial/atual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Criação da Tabela de Orçamentos (Budgets)
CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, -- Limite de gasto mensal
    period TEXT DEFAULT 'monthly', -- Preparado para futuro (semanal/anual)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(user_id, category_id) -- Apenas um orçamento por categoria por enquanto
);

-- 3. Atualização da Tabela de Transações
-- Adiciona a coluna wallet_id
ALTER TABLE transactions ADD COLUMN wallet_id TEXT;

-- Adiciona a constraint de Foreign Key (Postgres syntax)
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_wallet 
FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL;

-- 4. Criação de Carteira Padrão para Usuários Existentes (Opcional - Migração de Dados)
-- Isso evita que transações antigas fiquem "orfãs" de carteira.
-- A lógica abaixo é um exemplo procedimental. Em produção, execute via script backend.
-- INSERT INTO wallets (id, user_id, name, type, color, balance)
-- SELECT gen_random_uuid(), id, 'Conta Principal', 'checking', '#14b8a6', 0 FROM users;

-- UPDATE transactions 
-- SET wallet_id = (SELECT id FROM wallets WHERE wallets.user_id = transactions.user_id LIMIT 1)
-- WHERE wallet_id IS NULL;
