import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

interface AppState {
  token: string | null;
  isDarkMode: boolean;
  isPrivacyMode: boolean;
  setToken: (token: string | null) => void;
  toggleDarkMode: () => void;
  togglePrivacyMode: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      isDarkMode: false,
      isPrivacyMode: false,
      setToken: (token) => set({ token }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      togglePrivacyMode: () => set((state) => ({ isPrivacyMode: !state.isPrivacyMode })),
    }),
    {
      name: 'sos-controle-mobile-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
