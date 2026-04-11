import { create } from 'zustand';
import { UserProfile } from '../types';
import { useFinanceStore } from './useFinanceStore';
import { useUIStore } from './useUIStore';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile & { id?: string };
  is2FAEnabled: boolean;

  login: (email: string, password: string, twoFactorToken?: string) => Promise<{ success: boolean; message?: string; require2fa?: boolean; tempId?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  
  updatePassword: (current: string, next: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;

  generate2FA: () => Promise<{ secret: string; otpauthUrl: string }>;
  enable2FA: (secret: string, token: string) => Promise<{ success: boolean; message: string }>;
  disable2FA: (password: string) => Promise<{ success: boolean; message: string }>;
  
  setUser: (u: UserProfile) => Promise<void>;
  set2FAEnabled: (val: boolean) => void;
}

// 🎫 O COMUNICADOR DE AUTENTICAÇÃO
const api = async (endpoint: string, method: string, body?: any) => {
  try {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const url = `${API_BASE}/api/${endpoint}`;
    const token = localStorage.getItem('sos_token');
    const headers: any = { 'Content-Type': 'application/json' };
    
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      method,
      headers,
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined
    });
    
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }

    if (!res.ok) throw new Error(data.error || `Erro ${res.status}: ${res.statusText}`);
    return data;
  } catch (e: any) {
    console.error(`API Error [${endpoint}]:`, e);
    throw e;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  user: { name: "", email: "", avatar: "" },
  is2FAEnabled: false,

  login: async (email, password, twoFactorToken) => {
    set({ isLoading: true });
    try {
      const res = await api('auth', 'POST', { action: 'login', email, password, twoFactorToken });
      
      if (res.require2fa) {
          set({ isLoading: false });
          return { success: false, require2fa: true, tempId: res.tempId };
      }
      
      const userData = { ...res, twoFactorEnabled: res.two_factor_enabled };
      set({ isAuthenticated: true, user: userData, is2FAEnabled: userData.twoFactorEnabled });
      
      // MÁGICA: Avisa os outros departamentos para começarem a trabalhar!
      await useFinanceStore.getState().fetchUserData();
      useUIStore.getState().setView('dashboard');
      
      set({ isLoading: false });
      return { success: true };
    } catch (e: any) {
      set({ isLoading: false });
      return { success: false, message: e.message || "Erro." };
    }
  },

  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const id = crypto.randomUUID(); 
      const userToCreate = { ...userData, id };
      const res = await api('auth', 'POST', { action: 'signup', email: userData.email, userData: userToCreate });

      set({ isAuthenticated: true, user: res, is2FAEnabled: false });
      
      await useFinanceStore.getState().fetchUserData();
      useUIStore.getState().setView('dashboard');
      
      set({ isLoading: false });
      return { success: true };
    } catch (e: any) {
      set({ isLoading: false });
      return { success: false, message: e.message || "Erro." };
    }
  },

  logout: async () => {
      try { await api('auth', 'POST', { action: 'logout' }); } catch (e) {}
      localStorage.removeItem('sos_token'); // Keep for backward compatibility cleanup
      set({ isAuthenticated: false, user: { name: "", email: "", avatar: "" } });
      
      // Quando o utilizador sai, desliga as luzes e limpa os relatórios financeiros
      if (useFinanceStore.getState().clearData) {
          useFinanceStore.getState().clearData();
      }
      useUIStore.getState().setView('dashboard');
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

  updatePassword: async (currentPassword, newPassword) => {
     const userId = get().user.id;
     if (!userId) return { success: false, message: "Usuário não identificado." };
     try {
        await api('auth', 'POST', { action: 'update_password', currentPassword, newPassword, userId });
        return { success: true, message: "Senha alterada com sucesso!" };
     } catch(e: any) {
        return { success: false, message: e.message || "Erro." };
     }
  },

  setUser: async (u) => {
    const updatedUser = { ...get().user, ...u };
    set({ user: updatedUser });
    try { await api('auth', 'POST', { action: 'update_profile', userData: updatedUser }); } catch (e) {}
  },

  set2FAEnabled: (val) => set({ is2FAEnabled: val }),
}));
