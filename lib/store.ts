import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isDarkMode: boolean;
  isPrivacyMode: boolean;
  toggleDarkMode: () => void;
  togglePrivacyMode: () => void;
  setDarkMode: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      isPrivacyMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      togglePrivacyMode: () => set((state) => ({ isPrivacyMode: !state.isPrivacyMode })),
      setDarkMode: (value) => set({ isDarkMode: value }),
    }),
    {
      name: 'sos-controle-ui-storage',
    }
  )
);
