
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Locale, TranslationKey } from '@/lib/translations';
import { translations, getTranslatedString as getTString } from '@/lib/translations';

type Theme = 'light' | 'dark';

interface SettingsContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: TranslationKey, replacements?: Record<string, string>) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useLocalStorage<Locale>('app-language', 'de');
  const [theme, setTheme] = useLocalStorage<Theme>('app-theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.lang = language;
  }, [theme, language]);

  const t = (key: TranslationKey, replacements?: Record<string, string>) => {
    return getTString(language, key, replacements);
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
