import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "ruralLearn.language";
const SUPPORTED = ["en", "ta"];
const DEFAULT = "en";

const LanguageContext = createContext(null);

function readInitial() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {
    // localStorage may be unavailable (private mode, some enterprise
    // configurations). Fall through to the default.
  }
  return DEFAULT;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Non-fatal: the app still functions for this session.
    }
    // Reflect the language on <html lang> for screen readers and for the
    // browser's own font selection (important for Tamil rendering).
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", language);
    }
  }, [language]);

  function setLanguage(next) {
    if (SUPPORTED.includes(next)) {
      setLanguageState(next);
    }
  }

  function toggleLanguage() {
    setLanguageState((prev) => (prev === "en" ? "ta" : "en"));
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}

export const SUPPORTED_LANGUAGES = SUPPORTED;
