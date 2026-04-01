import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { Transaction, Category, Rule, ViewType, UserProfile, Wallet, Budget, TransactionType, RecurrenceException, Badge } from '../types';

interface FinanceState {
  view: ViewType;
  setView: (view: ViewType) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (val: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
  
  theme: 'light' | 'dark';
  toggleTheme: () => Promise<void>;

  isAuthenticated: boolean; isReady: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  user: UserProfile & { id?: string };
  
  checkSession: () => Promise<void>;
  login: (email: string, password: string, twoFactorToken?: string) => Promise<{ success: boolean; message?: string; require2fa?: boolean; tempId?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
  fetchUserData: () => Promise<void>;

  verifyPhone: (phone: string) => Promise<boolean>;
  resetPasswordByPhone: (phone: string, next: string) => Promise<boolean>;
  updatePassword: (current: string, next: string) => Promise<{ success: boolean; message: string }>;
  
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;

  generate2FA: () => Promise<{ secret: string; otpauthUrl: string }>;
  enable2FA: (secret: string, token: string) => Promise<{ success: boolean; message: string }>;
  disable2FA: (password: string) => Promise<{ success: boolean; message: string }>;

  activeModal: 'income' | 'expense' | 'category' | 'rule' | 'profile' | 'security' | 'wallet' | 'budget' | 'recurrence-action' | null;
  setActiveModal: (modal: 'income' | 'expense' | 'category' | 'rule' | 'profile' | 'security' | 'wallet' | 'budget' | 'recurrence-action' | null) => void;
  
  pendingBankTransaction: Partial<Transaction> | null;
  setPendingBankTransaction: (t: Partial<Transaction> | null) => void;

  recurrencePendingAction: { 
     type: 'edit' | 'delete'; 
     transaction: Transaction; 
     newTransactionData?: Transaction; 
  } | null;
  setRecurrencePendingAction: (data: any) => void;
  confirmRecurrenceAction: (scope: 'single' | 'all') => Promise<void>;

  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;
  editingCategory: Category | null;
  setEditingCategory: (c: Category | null) => void;
  editingRule: Rule | null;
  setEditingRule: (r: Rule | null) => void;
  editingWallet: Wallet | null;
  setEditingWallet: (w: Wallet | null) => void;
  editingBudget: Budget | null;
  setEditingBudget: (b: Budget | null) => void;

  transactions: Transaction[];
  categories: Category[];
  rules: Rule[];
  wallets: Wallet[];
  budgets: Budget[];
  recurrenceExceptions: RecurrenceException[];
  
  getHealthScore: () => number;
  getBadges: () => Badge[];

  is2FAEnabled: boolean;
  set2FAEnabled: (val: boolean) => void;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;

  activeSessions: any[];
  currentSessionId: string | null;
  isSessionLoading: boolean;
  fetchActiveSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeOtherSessions: () => Promise<void>;

  addTransaction: (t: Transaction) => Promise<void>;
  bulkAddTransactions: (transactions: Transaction[]) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addCategory: (c: Category) => Promise<void>;
  updateCategory: (c: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  addRule: (r: Rule) => Promise<void>;
  updateRule: (r: Rule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string) => Promise<void>;

  addWallet: (w: Wallet) => Promise<void>;
  updateWallet: (w: Wallet) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;

  addBudget: (b: Budget) => Promise<void>;
  updateBudget: (b: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  setUser: (u: UserProfile) => Promise<void>;
}

// 🎫 O APP AGORA SABE ENVIAR O CRACHÁ NAS REQUISIÇÕES
const api = async (endpoint: string, method: string, body?: any) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  try {
    const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://sos-controle-api.andsilvarosa.workers.dev';
    const url = `${API_BASE}/api/${endpoint}`;
    
    // Pega o token salvo no navegador (mantido por compatibilidade)
    const token = await AsyncStorage.getItem('sos_token');
    const headers: any = { 'Content-Type': 'application/json' };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }

    if (!res.ok) {
      const error = new Error(data.error || `Erro ${res.status}: ${res.statusText}`) as Error & { status?: number; data?: any };
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return data;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      console.error(`API Timeout [${endpoint}]`);
      throw new Error('Tempo de resposta excedido. Verifique sua conexão.');
    }
    console.error(`API Error [${endpoint}]:`, e);
    throw e;
  }
};

const emptyUser = { name: "", email: "", avatar: "" };

const clearStoredSession = async () => {
  await AsyncStorage.multiRemove(['sos_token', 'sos_user']);
};

const normalizeDate = (dateString: string | undefined | null): string => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  let cleanStr = dateString.trim();
  if (cleanStr.includes('T')) cleanStr = cleanStr.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) return cleanStr;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
};

const addMonthsToString = (dateStr: string, monthsToAdd: number): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1 + monthsToAdd, 1));
  const targetYear = target.getUTCFullYear();
  const targetMonth = target.getUTCMonth();
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const finalDay = Math.min(d, daysInTargetMonth);
  const mm = String(targetMonth + 1).padStart(2, '0');
  const dd = String(finalDay).padStart(2, '0');
  return `${targetYear}-${mm}-${dd}`;
};

const addDaysToString = (dateStr: string, daysToAdd: number): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

export const useFinanceStore = create<FinanceState>((set, get) => {
  let savedTheme = 'light';
  
  // LINHA CORRIGIDA ABAIXO 👇
  const initialTheme = 'light';

  const resetAuthState = () => {
    set({
      isAuthenticated: false,
      isLoading: false,
      user: emptyUser,
      is2FAEnabled: false,
      transactions: [],
      categories: [],
      rules: [],
      wallets: [],
      budgets: [],
      recurrenceExceptions: [],
      activeSessions: [],
      currentSessionId: null,
      activeModal: null,
      pendingBankTransaction: null,
      recurrencePendingAction: null,
      editingTransaction: null,
      editingCategory: null,
      editingRule: null,
      editingWallet: null,
      editingBudget: null,
      mobileMenuOpen: false,
      view: 'auth'
    });
  };

  const applyRules = (t: Transaction): Transaction => {
    const rules = get().rules;
    let finalCategoryId = t.categoryId;
    const matchingRule = rules.find(r => 
      r.active && t.description.toLowerCase().includes(r.condition.toLowerCase())
    );
    if (matchingRule) finalCategoryId = matchingRule.categoryId;
    return { ...t, categoryId: finalCategoryId };
  };

  const updateLocalWalletBalance = (walletId: string | undefined, amount: number, type: TransactionType, reverse: boolean = false) => {
    if (!walletId) return;
    const wallets = get().wallets.map(w => {
      if (w.id === walletId) {
        let adjustment = type === 'income' ? amount : -amount;
        if (reverse) adjustment = -adjustment;
        return { ...w, balance: w.balance + adjustment };
      }
      return w;
    });
    set({ wallets });
  };

  const processTransactions = (rawTransactions: Transaction[]): Transaction[] => {
    const expanded: Transaction[] = [];
    const deleteExceptions = get().recurrenceExceptions || [];
    
    const cleanTransactions = rawTransactions.map(t => ({
      ...t,
      date: normalizeDate(t.date),
      dueDate: normalizeDate(t.dueDate)
    }));

    const normalizedExceptions = deleteExceptions.map(e => ({
        ...e,
        excludedDate: normalizeDate(e.excludedDate)
    }));

    const overrides = cleanTransactions.filter(t => t.masterId);
    const masters = cleanTransactions.filter(t => t.isRecurring && !t.masterId);
    const singles = cleanTransactions.filter(t => !t.isRecurring && !t.masterId);

    expanded.push(...singles);
    expanded.push(...overrides);

    masters.forEach(master => {
      const baseDate = master.date; 
      const baseDueDate = master.dueDate; 
      
      let iterations = 1;
      let isFinite = false;

      if (master.recurrence === 'fixed') iterations = 60; 
      else if (master.installments && master.installments > 1) {
        iterations = master.installments;
        isFinite = true;
      } else if (['monthly', 'weekly', 'annual', 'quarterly', 'semiannual'].includes(master.recurrence)) {
        iterations = 60; 
      }

      for (let i = 0; i < iterations; i++) {
        let instanceDate = baseDate;
        let instanceDueDate = baseDueDate;

        if (i > 0) {
            if (master.recurrence === 'weekly') {
                instanceDate = addDaysToString(baseDate, i * 7);
                instanceDueDate = addDaysToString(baseDueDate, i * 7);
            } else if (master.recurrence === 'annual') {
                instanceDate = addMonthsToString(baseDate, i * 12);
                instanceDueDate = addMonthsToString(baseDueDate, i * 12);
            } else if (master.recurrence === 'quarterly') {
                instanceDate = addMonthsToString(baseDate, i * 3);
                instanceDueDate = addMonthsToString(baseDueDate, i * 3);
            } else if (master.recurrence === 'semiannual') {
                instanceDate = addMonthsToString(baseDate, i * 6);
                instanceDueDate = addMonthsToString(baseDueDate, i * 6);
            } else {
                instanceDate = addMonthsToString(baseDate, i);
                instanceDueDate = addMonthsToString(baseDueDate, i);
            }
        }

        const isExcluded = normalizedExceptions.some(ex => ex.transactionId === master.id && ex.excludedDate === instanceDueDate);
        if (isExcluded) continue;

        const hasOverride = overrides.some(ov => ov.masterId === master.id && ov.dueDate === instanceDueDate);
        if (hasOverride) continue;

        expanded.push({
          ...master,
          id: `virtual-${master.id}-${i}`,
          dueDate: instanceDueDate,
          date: instanceDate,
          isPaid: i === 0 ? master.isPaid : false,
          isVirtual: true,
          masterId: master.id,
          currentInstallment: isFinite ? i + 1 : undefined,
          description: master.description
        });
      }
    });
    
    const uniqueExpanded = Array.from(new Map(expanded.map(item => [item.id, item])).values());
    return uniqueExpanded.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  };

  return {
    view: 'dashboard',
    setView: (view) => set({ view, mobileMenuOpen: false }),
    sidebarExpanded: false,
    setSidebarExpanded: (val) => set({ sidebarExpanded: val }),
    mobileMenuOpen: false,
    setMobileMenuOpen: (val) => set({ mobileMenuOpen: val }),
    
    theme: initialTheme,
    toggleTheme: async () => { const newTheme = get().theme === 'light' ? 'dark' : 'light'; await AsyncStorage.setItem('sos_theme', newTheme); set({ theme: newTheme }); },

    isAuthenticated: false, isReady: false,
    isInitialLoading: true,
    isLoading: false,
    user: { name: "", email: "", avatar: "" },
    transactions: [],
    categories: [],
    rules: [],
    wallets: [],
    budgets: [],
    recurrenceExceptions: [],
    is2FAEnabled: false,
    isPrivacyMode: false,
    activeSessions: [],
    currentSessionId: null,
    isSessionLoading: false,

    activeModal: null,
    setActiveModal: (modal) => set({ activeModal: modal }),
    
    pendingBankTransaction: null,
    setPendingBankTransaction: (t) => set({ pendingBankTransaction: t }),
    
    getHealthScore: () => {
        const { wallets, transactions } = get();
        let points = 600;

        const totalWalletBalance = wallets.reduce((acc, w) => acc + (w.balance * (w.exchangeRate || 1)), 0);
        if (totalWalletBalance > 0) points += 100;
        if (totalWalletBalance > 5000) points += 50;
        else if (totalWalletBalance < 0) points -= 100;

        const todayISO = new Date().toISOString().split('T')[0];
        const hasOverdue = transactions.some(t => !t.isPaid && t.dueDate < todayISO);
        if (!hasOverdue) points += 300;
        else points -= 150;

        const now = new Date();
        const currentMonthT = transactions.filter(t => {
            if(!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const income = currentMonthT.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = currentMonthT.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        
        if (income > 0) {
            const savingsRate = (income - expense) / income;
            if (savingsRate >= 0.20) points += 150;
            else if (savingsRate >= 0.10) points += 50;
            else if (savingsRate < 0) points -= 50;
        }

        return Math.min(1000, Math.max(0, points));
    },

    getBadges: () => {
        const { budgets, transactions, wallets } = get();
        const now = new Date();
        const todayISO = now.toISOString().split('T')[0];

        const currentMonthT = transactions.filter(t => {
            if(!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const income = currentMonthT.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = currentMonthT.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const badgeList: Badge[] = [
            { id: '1', icon: 'Shield', title: 'Guardião', description: 'Orçamentos sob controle', achieved: false, color: 'blue' },
            { id: '2', icon: 'PiggyBank', title: 'Poupador', description: '> 20% Poupança', achieved: false, color: 'green' },
            { id: '3', icon: 'CheckCircle2', title: 'Em Dia', description: 'Zero atrasos', achieved: false, color: 'teal' },
            { id: '4', icon: 'Globe2', title: 'Viajante', description: 'Conta Global', achieved: false, color: 'purple' },
        ];

        if (budgets.length > 0) {
            const categorySpending: Record<string, number> = {};
            currentMonthT.filter(t => t.type === 'expense').forEach(t => {
                categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + t.amount;
            });
            const anyBudgetExceeded = budgets.some(b => (categorySpending[b.categoryId] || 0) > b.amount);
            badgeList[0].achieved = !anyBudgetExceeded;
        }

        if (income > 0) {
            const savingsRate = (income - expense) / income;
            badgeList[1].achieved = savingsRate >= 0.20;
        }

        const hasOverdue = transactions.some(t => !t.isPaid && t.dueDate < todayISO);
        badgeList[2].achieved = !hasOverdue;

        badgeList[3].achieved = wallets.some(w => w.currency && w.currency !== 'BRL');

        return badgeList;
    },

    recurrencePendingAction: null,
    setRecurrencePendingAction: (data) => set({ recurrencePendingAction: data }),
    
    confirmRecurrenceAction: async (scope) => {
        const actionData = get().recurrencePendingAction;
        if (!actionData) return;

        const { type, transaction, newTransactionData } = actionData;
        const userId = get().user.id;
        
        set({ activeModal: null, recurrencePendingAction: null });

        const masterId = transaction.isVirtual ? transaction.masterId! : (transaction.masterId || transaction.id);
        const occurrenceDueDate = normalizeDate(transaction.dueDate);

        if (type === 'delete') {
            if (scope === 'all') {
                set(state => ({
                   transactions: state.transactions.filter(t => t.id !== masterId && t.masterId !== masterId)
                }));
            } else {
                set(state => ({
                   transactions: state.transactions.filter(t => t.id !== transaction.id)
                }));
            }

            await api('transactions', 'POST', { 
                action: 'delete', 
                id: masterId, 
                userId, 
                scope, 
                exceptionDate: occurrenceDueDate,
                masterId: masterId 
            });
        } 
        else if (type === 'edit' && newTransactionData) {
            const payload = JSON.parse(JSON.stringify(newTransactionData));
            payload.date = normalizeDate(payload.date);
            payload.dueDate = normalizeDate(payload.dueDate);
            payload.amount = Number(payload.amount);
            
            if (!payload.walletId || payload.walletId.trim() === '') {
                payload.walletId = undefined;
            }

            const shouldDetach = !!transaction.isVirtual || (transaction.id === masterId && scope === 'single');

            if (scope === 'single') {
                if (shouldDetach) {
                    payload.id = Crypto.randomUUID();
                    payload.masterId = masterId;
                    payload.isRecurring = false; 
                    payload.recurrence = 'none';
                    payload.isVirtual = false;
                    
                    set({ isLoading: true });

                    try {
                        await api('transactions', 'POST', { 
                            action: 'create_override', 
                            transaction: payload, 
                            userId, 
                            masterId, 
                            exceptionDate: occurrenceDueDate
                        });
                    } catch (e: any) {
                        console.error("Override failed:", e);
                        alert(`Falha ao salvar: ${e.message}`);
                    } finally {
                        set({ isLoading: false });
                    }

                } else {
                    payload.id = transaction.id; 
                    payload.masterId = masterId;
                    payload.isVirtual = false;
                    
                    set(state => ({ 
                        transactions: state.transactions.map(t => t.id === transaction.id ? payload : t), 
                        editingTransaction: null 
                    }));

                    await api('transactions', 'POST', { 
                        action: 'update', 
                        transaction: payload, 
                        userId, 
                        scope: 'single',
                        id: transaction.id
                    });
                }

            } else {
                payload.id = masterId;
                payload.masterId = undefined;
                payload.isVirtual = false;
                
                await api('transactions', 'POST', { 
                    action: 'update', 
                    transaction: payload, 
                    userId, 
                    scope: 'all',
                    id: masterId 
                });
            }
        }
        
        setTimeout(() => {
            get().fetchUserData().then(() => set({ isLoading: false }));
        }, 500);
    },

    editingTransaction: null,
    setEditingTransaction: (t) => set({ editingTransaction: t }),
    editingCategory: null,
    setEditingCategory: (c) => set({ editingCategory: c }),
    editingRule: null,
    setEditingRule: (r) => set({ editingRule: r }),
    editingWallet: null,
    setEditingWallet: (w) => set({ editingWallet: w }),
    editingBudget: null,
    setEditingBudget: (b) => set({ editingBudget: b }),

    checkSession: async () => {
        try {
            const res = await api('auth', 'POST', { action: 'check_session' });
            if (res.id) {
                const userData = { ...res, twoFactorEnabled: res.two_factor_enabled };
                await AsyncStorage.setItem('sos_user', JSON.stringify(userData));
                set({ isAuthenticated: true, user: userData, is2FAEnabled: userData.twoFactorEnabled });
                await get().fetchUserData();
            } else {
                await clearStoredSession();
                resetAuthState();
            }
        } catch (e) {
            console.log("Nenhuma sessão ativa.");
            await clearStoredSession();
            resetAuthState();
        } finally {
            set({ isInitialLoading: false });
        }
    },

    // 🎫 SALVA O CRACHÁ NO LOGIN
    login: async (email, password, twoFactorToken) => {
      set({ isLoading: true });
      console.log("Store: Iniciando processo de login...", { email, hasToken: !!twoFactorToken, tokenLength: twoFactorToken?.length });
      try {
        const res = await api('auth', 'POST', { action: 'login', email, password, twoFactorToken });
        console.log("Store: Resposta da API recebida:", { 
            require2fa: res.require2fa, 
            hasToken: !!res.token,
            error: res.error
        });

        if (res.require2fa) {
            set({ isLoading: false });
            console.log("Store: 2FA requerido, interrompendo fluxo e aguardando código.");
            return { success: false, require2fa: true, tempId: res.tempId };
        }
        
        if (res.token) {
            await AsyncStorage.setItem('sos_token', res.token);
            await AsyncStorage.setItem('sos_user', JSON.stringify({ ...res, twoFactorEnabled: res.two_factor_enabled }));
            console.log("Token e usuário salvos no AsyncStorage");
        }

        const userData = { ...res, twoFactorEnabled: res.two_factor_enabled };
        set({ isAuthenticated: true, user: userData, is2FAEnabled: userData.twoFactorEnabled });
        
        console.log("Buscando dados do usuário...");
        await get().fetchUserData();
        
        set({ isLoading: false, view: 'dashboard' });
        console.log("Login concluído com sucesso.");
        return { success: true };
      } catch (e: any) {
        console.error("Erro durante o login:", e);
        set({ isLoading: false });
        return { success: false, message: e.message || "Erro ao realizar login." };
      }
    },

    // 🎫 SALVA O CRACHÁ NO CADASTRO
    signup: async (userData) => {
      set({ isLoading: true });
      try {
        const id = Crypto.randomUUID(); 
        const userToCreate = { ...userData, id };
        const res = await api('auth', 'POST', { action: 'signup', email: userData.email, userData: userToCreate });
        
        if (res.token) {
            await AsyncStorage.setItem('sos_token', res.token);
            await AsyncStorage.setItem('sos_user', JSON.stringify({ ...res, twoFactorEnabled: res.two_factor_enabled }));
        }

        set({ isAuthenticated: true, user: { ...res, twoFactorEnabled: res.two_factor_enabled }, is2FAEnabled: false });
        await get().fetchUserData();
        set({ isLoading: false, view: 'dashboard' });
        return { success: true };
      } catch (e: any) {
        set({ isLoading: false });
        return { success: false, message: e.message || "Erro." };
      }
    },
    
    generate2FA: async () => {
        const userId = get().user.id;
        return await api('auth', 'POST', { action: '2fa_generate', userId });
    },

    enable2FA: async (secret, token) => {
        const userId = get().user.id;
        try {
            await api('auth', 'POST', { action: '2fa_enable', userId, secret, twoFactorToken: token });
            set(state => ({ user: { ...state.user, twoFactorEnabled: true }, is2FAEnabled: true }));
            return { success: true, message: "2FA Ativado com sucesso!" };
        } catch(e: any) {
            return { success: false, message: e.message || "Código inválido." };
        }
    },

    disable2FA: async (password) => {
        const userId = get().user.id;
        try {
            await api('auth', 'POST', { action: '2fa_disable', userId, currentPassword: password });
            set(state => ({ user: { ...state.user, twoFactorEnabled: false }, is2FAEnabled: false }));
            return { success: true, message: "2FA Desativado." };
        } catch(e: any) {
            return { success: false, message: e.message || "Senha incorreta." };
        }
    },

    forgotPassword: async (email) => {
        try {
            const res = await api('auth', 'POST', { action: 'forgot_password', email });
            return { success: true, message: res.message };
        } catch (e: any) {
            return { success: false, message: e.message || "Erro ao solicitar recuperação." };
        }
    },

    resetPassword: async (token, newPassword) => {
        try {
            const res = await api('auth', 'POST', { action: 'reset_password_confirm', token, newPassword });
            return { success: true, message: res.message };
        } catch (e: any) {
            return { success: false, message: e.message || "Erro ao redefinir senha." };
        }
    },

   // 🎫 ENVIA O CRACHÁ AO BUSCAR DADOS
    fetchUserData: async () => {
      const userId = get().user.id;
      if (!userId) {
          console.warn("fetchUserData: userId não encontrado.");
          return;
      }
      
      console.log(`Buscando dados para o usuário ${userId}...`);
      try {
        const data = await api(`data?userId=${userId}`, 'GET');
        console.log("Dados recebidos da API:", Object.keys(data));
        
        // 1. Traduz as Exceções
          const fetchedExceptions = (data.recurrenceExceptions || []).map((ex: any) => ({
              ...ex,
              transactionId: ex.transaction_id || ex.transactionId,
              excludedDate: normalizeDate(ex.excluded_date || ex.excludedDate)
          }));
          
          set({ recurrenceExceptions: fetchedExceptions });
          
          // 2. A MÁGICA: Traduz o snake_case do Postgres para o camelCase do React
          const rawTransactions = (data.transactions || []).map((t: any) => ({
            ...t,
            amount: Number(t.amount),
            date: normalizeDate(t.date),
            dueDate: normalizeDate(t.due_date || t.dueDate),
            categoryId: t.category_id || t.categoryId,
            walletId: t.wallet_id || t.walletId,
            masterId: t.master_id || t.masterId,
            isPaid: t.is_paid === 1 || t.is_paid === true || t.isPaid === true,
            isRecurring: t.is_recurring === 1 || t.is_recurring === true || t.isRecurring === true,
          }));
          
          const processedTransactions = processTransactions(rawTransactions);
          
          // 3. Traduz o restante das tabelas
          set({ 
            transactions: processedTransactions,
            categories: (data.categories || []).map((c: any) => ({ ...c, userId: c.user_id || c.userId })),
            rules: (data.rules || []).map((r: any) => ({ 
                ...r, 
                categoryId: r.category_id || r.categoryId, 
                userId: r.user_id || r.userId,
                active: r.active === 1 || r.active === true 
            })),
            wallets: (data.wallets || []).map((w: any) => ({ 
                ...w, 
                balance: Number(w.balance), 
                exchangeRate: w.exchange_rate || w.exchangeRate, 
                userId: w.user_id || w.userId 
            })),
            budgets: (data.budgets || []).map((b: any) => ({ 
                ...b, 
                amount: Number(b.amount), 
                categoryId: b.category_id || b.categoryId, 
                userId: b.user_id || b.userId 
            }))
          });
      } catch (e: any) {
        console.error("Erro ao carregar dados", e);
        if (e?.status === 401 || e?.status === 403) {
          await clearStoredSession();
          resetAuthState();
        }
      }
    },

    addTransaction: async (t) => {
      const userId = get().user.id;
      if (!t.walletId && get().wallets.length > 0) t.walletId = get().wallets[0].id;
      const processedT = applyRules(t);
      
      set({ transactions: [processedT, ...get().transactions], activeModal: null });
      
      if (processedT.isPaid) updateLocalWalletBalance(processedT.walletId, processedT.amount, processedT.type, false);
      await api('transactions', 'POST', { action: 'create', transaction: processedT, userId });
      get().fetchUserData();
    },

    bulkAddTransactions: async (transactions) => {
      const userId = get().user.id;
      const processedTransactions = transactions.map(t => {
          if (!t.walletId && get().wallets.length > 0) t.walletId = get().wallets[0].id;
          return applyRules(t);
      });
      
      set(state => ({ transactions: [...processedTransactions, ...state.transactions], activeModal: null }));
      
      processedTransactions.forEach(t => {
          if (t.isPaid) updateLocalWalletBalance(t.walletId, t.amount, t.type, false);
      });

      await api('transactions', 'POST', { action: 'bulk_create', transactions: processedTransactions, userId });
      get().fetchUserData();
    },

    updateTransaction: async (updated) => {
      const userId = get().user.id;
      const sanitized = { 
          ...updated, 
          amount: Number(updated.amount), 
          date: normalizeDate(updated.date), 
          dueDate: normalizeDate(updated.dueDate),
          walletId: updated.walletId?.trim() === '' ? undefined : updated.walletId
      };
      
      set({ transactions: get().transactions.map(t => t.id === sanitized.id ? sanitized : t), activeModal: null, editingTransaction: null });
      
      await api('transactions', 'POST', { action: 'update', transaction: sanitized, userId, id: sanitized.id });
      get().fetchUserData(); 
    },

    deleteTransaction: async (id) => {
      const userId = get().user.id;
      const transaction = get().transactions.find(t => t.id === id);
      
      set({ transactions: get().transactions.filter(t => t.id !== id && t.masterId !== id) });

      if (transaction && transaction.masterId) {
          await api('transactions', 'POST', { action: 'delete', id, userId });
          await api('transactions', 'POST', { 
              action: 'delete', 
              id: transaction.masterId, 
              userId, 
              scope: 'single', 
              exceptionDate: transaction.dueDate,
              masterId: transaction.masterId
          });
      } else {
          await api('transactions', 'POST', { action: 'delete', id, userId });
      }
      
      get().fetchUserData();
    },

    addCategory: async (c) => {
      const userId = get().user.id;
      set({ categories: [...get().categories, c], activeModal: null });
      await api('categories', 'POST', { action: 'create', category: c, userId });
    },
    updateCategory: async (c) => {
      const userId = get().user.id;
      set({ categories: get().categories.map(cat => cat.id === c.id ? c : cat), activeModal: null });
      await api('categories', 'POST', { action: 'update', category: c, userId });
    },
    deleteCategory: async (id) => {
      const userId = get().user.id;
      set({ categories: get().categories.filter(c => c.id !== id) });
      await api('categories', 'POST', { action: 'delete', id, userId });
    },
    addRule: async (r) => {
      const userId = get().user.id;
      set({ rules: [r, ...get().rules], activeModal: null });
      await api('rules', 'POST', { action: 'create', rule: r, userId });
    },
    updateRule: async (r) => {
      const userId = get().user.id;
      set({ rules: get().rules.map(rule => rule.id === r.id ? r : rule), activeModal: null });
      await api('rules', 'POST', { action: 'update', rule: r, userId });
    },
    deleteRule: async (id) => {
      const userId = get().user.id;
      set({ rules: get().rules.filter(r => r.id !== id) });
      await api('rules', 'POST', { action: 'delete', id, userId });
    },
    toggleRule: async (id) => {
      const rule = get().rules.find(r => r.id === id);
      if (rule) get().updateRule({ ...rule, active: !rule.active });
    },
    addWallet: async (w) => {
      const userId = get().user.id;
      set({ wallets: [...get().wallets, w], activeModal: null });
      await api('wallets', 'POST', { action: 'create', wallet: w, userId });
      get().fetchUserData(); 
    },
    updateWallet: async (w) => {
      const userId = get().user.id;
      set({ wallets: get().wallets.map(wa => wa.id === w.id ? w : wa), activeModal: null });
      await api('wallets', 'POST', { action: 'update', wallet: w, userId });
      get().fetchUserData(); 
    },
    deleteWallet: async (id) => {
      const userId = get().user.id;
      set({ wallets: get().wallets.filter(w => w.id !== id) });
      await api('wallets', 'POST', { action: 'delete', id, userId });
      get().fetchUserData(); 
    },
    addBudget: async (b) => {
      const userId = get().user.id;
      set({ budgets: [...get().budgets.filter(bu => bu.categoryId !== b.categoryId), b], activeModal: null });
      await api('budgets', 'POST', { action: 'create', budget: b, userId });
    },
    updateBudget: async (b) => {
      const userId = get().user.id;
      set({ budgets: get().budgets.map(bu => bu.id === b.id ? b : bu), activeModal: null });
      await api('budgets', 'POST', { action: 'update', budget: b, userId });
    },
    deleteBudget: async (id) => {
      const userId = get().user.id;
      set({ budgets: get().budgets.filter(b => b.id !== id) });
      await api('budgets', 'POST', { action: 'delete', id, userId });
    },
    setUser: async (u) => {
      const updatedUser = { ...get().user, ...u };
      set({ user: updatedUser, activeModal: null });
      try { await api('auth', 'POST', { action: 'update_profile', userData: updatedUser }); } catch (e) {}
    },
    verifyPhone: async () => true,
    resetPasswordByPhone: async () => true,
    updatePassword: async (currentPassword, newPassword) => {
       const userId = get().user.id;
       if (!userId) return { success: false, message: "Usuário não identificado." };
       try {
          const res = await api('auth', 'POST', { action: 'update_password', currentPassword, newPassword, userId });
          return { success: true, message: "Senha alterada com sucesso!" };
       } catch(e: any) {
          return { success: false, message: e.message || "Erro." };
       }
    },
    set2FAEnabled: (val) => set({ is2FAEnabled: val }),
    togglePrivacyMode: () => set(state => ({ isPrivacyMode: !state.isPrivacyMode })),
    
    fetchActiveSessions: async () => {
        set({ isSessionLoading: true });
        try {
            const sessions = await api('sessions', 'POST', { action: 'list' });
            const current = sessions.find((s: any) => s.isCurrent)?.id || null;
            set({ activeSessions: sessions, currentSessionId: current });
        } catch (e) {
            console.error("Erro ao buscar sessões:", e);
        } finally {
            set({ isSessionLoading: false });
        }
    },

    revokeSession: async (sessionId: string) => {
        try {
            await api('sessions', 'POST', { action: 'revoke', sessionId });
            // Se revogou a própria sessão, desloga
            if (sessionId === get().currentSessionId) {
                get().logout();
            } else {
                await get().fetchActiveSessions();
            }
        } catch (e) {
            console.error("Erro ao revogar sessão:", e);
        }
    },

    revokeOtherSessions: async () => {
        try {
            await api('sessions', 'POST', { action: 'revoke_others' });
            await get().fetchActiveSessions();
        } catch (e) {
            console.error("Erro ao revogar outras sessões:", e);
        }
    },

    // 🎫 APAGA O CRACHÁ NO LOGOUT
    init: async () => {
      console.log("useFinanceStore: Iniciando init...");
      try {
        const savedTheme = await AsyncStorage.getItem('sos_theme') as 'light' | 'dark';
        if (savedTheme) { set({ theme: savedTheme }); }
        
        const token = await AsyncStorage.getItem('sos_token');
        if (token) {
          await get().checkSession();
        } else {
          console.log("useFinanceStore: Nenhum usuário logado encontrado.");
          await AsyncStorage.removeItem('sos_user');
          resetAuthState();
          set({ isInitialLoading: false });
        }
      } catch (e) {
        console.error("Erro no init:", e);
        await clearStoredSession();
        resetAuthState();
        set({ isInitialLoading: false });
      } finally {
        set({ isReady: true });
        console.log("useFinanceStore: Init finalizado, isReady: true");
      }
    },
    logout: async () => {
        await clearStoredSession();
        try {
            await api('auth', 'POST', { action: 'logout' });
        } catch (e) {}
        resetAuthState();
        set({ isReady: true, isInitialLoading: false });
    }
  };
});
