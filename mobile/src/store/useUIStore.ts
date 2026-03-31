import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
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

  initTheme: () => Promise<void>;
}

export const useUIStore = create<UIState>((set, get) => ({
  view: 'dashboard',
  setView: (view) => set({ view, mobileMenuOpen: false }),
  
  sidebarExpanded: false,
  setSidebarExpanded: (val) => set({ sidebarExpanded: val }),
  
  mobileMenuOpen: false,
  setMobileMenuOpen: (val) => set({ mobileMenuOpen: val }),
  
  theme: 'light', // Default until initTheme runs
  toggleTheme: async () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    await AsyncStorage.setItem('sos_theme', newTheme);
  },

  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),

  isPrivacyMode: false,
  togglePrivacyMode: () => set(state => ({ isPrivacyMode: !state.isPrivacyMode })),

  initTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('sos_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ theme: savedTheme });
      } else {
        const systemTheme = Appearance.getColorScheme();
        set({ theme: systemTheme === 'dark' ? 'dark' : 'light' });
      }
    } catch (e) {
      console.warn('Failed to load theme', e);
    }
  }
}));
