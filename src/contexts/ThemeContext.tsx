"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { ThemeId, ThemeConfig, getTheme, THEME_IDS } from "@/lib/themes";

const STORAGE_KEY = "meetgreet-theme";

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setThemeId: (id: ThemeId) => void;
  themeIds: ThemeId[];
}

const defaultThemeId: ThemeId = "mullenlowe";
const defaultTheme = getTheme(defaultThemeId);

const ThemeContext = createContext<ThemeContextType>({
  themeId: defaultThemeId,
  theme: defaultTheme,
  setThemeId: () => {},
  themeIds: THEME_IDS,
});

function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return defaultThemeId;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEME_IDS.includes(stored as ThemeId)) return stored as ThemeId;
  } catch {
    // ignore
  }
  return defaultThemeId;
}

/** Applies theme to document: data-theme, CSS variables, and favicon */
function applyThemeToDocument(theme: ThemeConfig) {
  const doc = document.documentElement;
  doc.setAttribute("data-theme", theme.id);
  doc.style.setProperty("--theme-primary", theme.colors.primary);
  doc.style.setProperty("--theme-primary-dark", theme.colors.primaryDark);
  doc.style.setProperty("--theme-button-gradient", theme.colors.buttonGradient);
  doc.style.setProperty("--theme-logo-container", theme.colors.logoContainerStyle);
  doc.style.setProperty("--theme-font-family", theme.fontFamily);

  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (link) link.href = theme.favicon;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(defaultThemeId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeIdState(readStoredTheme());
    setMounted(true);
  }, []);

  const theme = getTheme(themeId);

  useEffect(() => {
    if (!mounted) return;
    applyThemeToDocument(theme);
  }, [mounted, theme]);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        setThemeId,
        themeIds: THEME_IDS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
