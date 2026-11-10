"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  LOCALE_KEY,
  translate,
  type Locale,
  type TranslationKey,
} from "@/i18n/dictionary";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const LOCALE_EVENT = "gph:locale";

function readLocale(): Locale {
  if (typeof document === "undefined") return "en";
  return document.documentElement.dataset.locale === "hi" ? "hi" : "en";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(LOCALE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LOCALE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(
    subscribe,
    readLocale,
    () => "en",
  );

  const setLocale = useCallback((next: Locale) => {
    document.documentElement.dataset.locale = next;
    try {
      window.localStorage.setItem(LOCALE_KEY, next);
    } catch {
      // Locale still applies for this session when storage is blocked.
    }
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: TranslationKey) => translate(locale, key),
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return context;
}
