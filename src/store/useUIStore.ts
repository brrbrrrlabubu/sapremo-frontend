import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

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
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
      }),
      setLang: (lang) => {
        i18n.changeLanguage(lang);
        set({ lang });
      },
    }),
    {
      name: 'sapremo-ui-settings', // Ключ в localStorage
    }
  ) // Закрываем persist
); // Закрываем create