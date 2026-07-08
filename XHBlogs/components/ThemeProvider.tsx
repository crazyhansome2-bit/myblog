"use client";

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: true, toggleTheme: () => {} });

const getTimeBasedDarkMode = () => {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return getTimeBasedDarkMode();
  });
  const [isAutoMode, setIsAutoMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    if (!isAutoMode) return;

    const timer = window.setInterval(() => {
      setIsDark(getTimeBasedDarkMode());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, [isAutoMode]);

  const toggleTheme = () => {
    setIsAutoMode(false);
    setIsDark((current) => !current);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
