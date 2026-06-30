"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  defaultLanguage,
  interpolate,
  languages,
  translations,
  type Language,
  type TranslationKey,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const storageKey = "swim-lessons-katy-language";
const languageSubscribers = new Set<() => void>();

function isLanguage(value: string | null): value is Language {
  return Boolean(value && languages.includes(value as Language));
}

function getStoredLanguage(): Language {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  const savedLanguage = window.localStorage.getItem(storageKey);
  return isLanguage(savedLanguage) ? savedLanguage : defaultLanguage;
}

function subscribeToLanguage(callback: () => void) {
  languageSubscribers.add(callback);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    languageSubscribers.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getStoredLanguage,
    () => defaultLanguage,
  );

  const setLanguage = (nextLanguage: Language) => {
    window.localStorage.setItem(storageKey, nextLanguage);
    document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
    languageSubscribers.forEach((callback) => callback());
  };

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, values) => interpolate(translations[language][key], values),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}

export function translatedMessage(
  t: LanguageContextValue["t"],
  key?: TranslationKey,
  fallback = "",
) {
  return key ? t(key) : fallback;
}
