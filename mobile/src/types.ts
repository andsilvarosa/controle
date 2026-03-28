export type TransactionType = 'income' | 'expense';
export type RecurrencePeriod = 'none' | 'fixed' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
export type WalletType = 'checking' | 'credit_card' | 'cash' | 'investment' | 'savings' | 'travel'; 
export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP';

export interface Wallet {
  id: string;
  userId?: string;
  name: string;
  type: WalletType;
  color: string;
  balance: number; 
  currency?: CurrencyCode; 
  exchangeRate?: number; 
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly';
  spent?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; 
  date: string; 
  dueDate: string; 
  categoryId: string;
  walletId?: string;
  type: TransactionType;
  isPaid: boolean;
  notes?: string;
  isRecurring?: boolean; 
  recurrence: RecurrencePeriod;
  installments?: number; 
  installmentId?: string; 
  currentInstallment?: number; 
  isVirtual?: boolean; 
  masterId?: string; 
}

export interface Rule {
  id: string;
  active: boolean;
  condition: string;
  categoryId: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string; 
  avatar: string;
  createdAt?: string;
  twoFactorEnabled?: boolean; 
}

export interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  achieved: boolean;
  color: string;
}

export interface RecurrenceException {
  id: string;
  transactionId: string; // Master ID
  excludedDate: string; // YYYY-MM-DD
}

export interface UserRecord extends UserProfile {
  password: string;
  transactions: Transaction[];
  categories: Category[];
  rules: Rule[];
  wallets: Wallet[];
  budgets: Budget[];
}

export type ViewType = 'dashboard' | 'calendar' | 'reports' | 'categories' | 'rules' | 'settings' | 'auth' | 'wallets' | 'budgets';
