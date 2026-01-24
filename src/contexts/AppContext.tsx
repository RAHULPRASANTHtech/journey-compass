import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IndianCity, LANGUAGES } from "@/lib/data";

type Language = typeof LANGUAGES[number];

interface AppContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  fromCity: IndianCity | null;
  setFromCity: (city: IndianCity | null) => void;
  toCity: IndianCity | null;
  setToCity: (city: IndianCity | null) => void;
  journeyDate: Date | undefined;
  setJourneyDate: (date: Date | undefined) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("busyatra-theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const [language, setLanguageState] = useState<Language>(LANGUAGES[0]);
  const [fromCity, setFromCity] = useState<IndianCity | null>(null);
  const [toCity, setToCity] = useState<IndianCity | null>(null);
  const [journeyDate, setJourneyDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("busyatra-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        fromCity,
        setFromCity,
        toCity,
        setToCity,
        journeyDate,
        setJourneyDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
