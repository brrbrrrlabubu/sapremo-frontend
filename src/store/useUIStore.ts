import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';
type LangMode = 'ru' | 'en';

interface UIState {
  theme: ThemeMode;
  lang: LangMode;
  toggleTheme: () => void;
  setLang: (lang: LangMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark', // По умолчанию ставим темную тему
      lang: 'ru',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'sapremo-ui-settings', // Ключ в localStorage
    }
  ) // Закрываем persist
); // Закрываем create