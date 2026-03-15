import { create } from 'zustand';
import { ViewType } from '../types';

interface UIState {
  view: ViewType;
  setView: (view: ViewType) => void;
  
  sidebarExpanded: boolean;
  setSidebarExpanded: (val: boolean) => void;
  
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
  
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  activeModal: 'income' | 'expense' | 'category' | 'rule' | 'profile' | 'security' | 'wallet' | 'budget' | 'recurrence-action' | null;
  setActiveModal: (modal: 'income' | 'expense' | 'category' | 'rule' | 'profile' | 'security' | 'wallet' | 'budget' | 'recurrence-action' | null) => void;

  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

export const useUIStore = create<UIState>((set) => {
  // Tenta ler o tema guardado no navegador do utilizador, se não tiver, usa a preferência do sistema
  const savedTheme = localStorage.getItem('sos_theme') as 'light' | 'dark';
  const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  return {
    view: 'dashboard',
    setView: (view) => set({ view, mobileMenuOpen: false }),
    
    sidebarExpanded: false,
    setSidebarExpanded: (val) => set({ sidebarExpanded: val }),
    
    mobileMenuOpen: false,
    setMobileMenuOpen: (val) => set({ mobileMenuOpen: val }),
    
    theme: initialTheme,
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('sos_theme', newTheme);
        return { theme: newTheme };
    }),

    activeModal: null,
    setActiveModal: (modal) => set({ activeModal: modal }),

    isPrivacyMode: false,
    togglePrivacyMode: () => set(state => ({ isPrivacyMode: !state.isPrivacyMode })),
  };
});
