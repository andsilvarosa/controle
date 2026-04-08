export interface CommandPayload {
  action: string;
  payload: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  status: 'pending' | 'completed';
  created_at: string;
}
