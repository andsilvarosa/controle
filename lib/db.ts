
import { neon } from '@neondatabase/serverless';

// No Cloudflare Pages Functions, a conexão deve ser criada PER REQUEST
export const getDb = (databaseUrl: string) => {
  if (!databaseUrl || typeof databaseUrl !== 'string') {
    console.error("CRITICAL: DATABASE_URL está vazia ou indefinida.");
    throw new Error("CONFIG ERROR: DATABASE_URL não encontrada.");
  }
  const cleanUrl = databaseUrl.trim();
  return neon(cleanUrl);
};

export const initSchema = async (sql: any) => {
  try {
    // --- USERS ---
    await sql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        password TEXT,
        avatar TEXT,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        two_factor_secret TEXT,
        failed_attempts INTEGER DEFAULT 0,
        lock_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
        await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0`);
        await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP`);
    } catch (e) { console.log("Migration warning (Users Security):", e); }

    // --- AUDIT LOGS ---
    await sql(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        action TEXT,
        details TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
        await sql(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`);
        await sql(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)`);
    } catch (e) { console.log("Migration warning (Audit Logs Indexes):", e); }

    // --- PASSWORD RESETS ---
    await sql(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // --- CATEGORIES ---
    await sql(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT,
        icon TEXT,
        color TEXT,
        type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // --- WALLETS ---
    await sql(`
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT,
        type TEXT,
        color TEXT,
        balance DECIMAL(10, 2) DEFAULT 0.00,
        currency TEXT DEFAULT 'BRL',
        exchange_rate DECIMAL(10, 4) DEFAULT 1.0000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrations para Wallets
    try {
       await sql(`ALTER TABLE wallets ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL'`);
       await sql(`ALTER TABLE wallets ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4) DEFAULT 1.0000`);
       await sql(`ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_type_check`);
    } catch (e) { console.log("Migration info (Wallets):", e); }

    // --- TRANSACTIONS ---
    await sql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        description TEXT,
        amount DECIMAL(10, 2),
        date DATE,
        due_date DATE,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        type TEXT,
        is_paid INTEGER DEFAULT 0,
        notes TEXT,
        wallet_id TEXT REFERENCES wallets(id) ON DELETE SET NULL,
        is_recurring INTEGER DEFAULT 0,
        recurrence TEXT DEFAULT 'none',
        installments INTEGER DEFAULT 1,
        master_id TEXT,
        installment_id TEXT,
        is_subscription INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrations para Transactions
    try {
      await sql(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_id TEXT`);
      await sql(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS master_id TEXT`);
      await sql(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'none'`);
      await sql(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring INTEGER DEFAULT 0`);
      await sql(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1`);
    } catch (e) { console.log("Migration warning (Transactions):", e); }

    // --- BUDGETS ---
    await sql(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2),
        period TEXT DEFAULT 'monthly',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // --- RULES ---
    await sql(`
      CREATE TABLE IF NOT EXISTS rules (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        active INTEGER DEFAULT 1,
        condition TEXT,
        category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // --- EXCEPTIONS ---
    await sql(`
      CREATE TABLE IF NOT EXISTS recurrence_exceptions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        transaction_id TEXT,
        excluded_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    try {
       await sql(`CREATE UNIQUE INDEX IF NOT EXISTS idx_recurrence_exceptions_unique ON recurrence_exceptions (transaction_id, excluded_date)`);
    } catch (e) { /* Ignora se já existir */ }
    
  } catch (e: any) {
    console.error("[Schema Init Error]", e.message);
    throw e;
  }
};
