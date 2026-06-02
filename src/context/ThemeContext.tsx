import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  colors,
  darkColors,
  highContrastColors,
  highContrastDarkColors,
  type Colors,
} from '../theme/tokens';

const THEME_KEY = 'locvac:theme:dark';
const HIGH_CONTRAST_KEY = 'locvac:theme:highContrast';

type ThemeContextValue = {
  isDark: boolean;
  colors: Colors;
  toggleTheme: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors,
  toggleTheme: () => {},
  highContrast: false,
  toggleHighContrast: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'true') setIsDark(true);
    });
    AsyncStorage.getItem(HIGH_CONTRAST_KEY).then((val) => {
      if (val === 'true') setHighContrast(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, String(next));
      return next;
    });
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      AsyncStorage.setItem(HIGH_CONTRAST_KEY, String(next));
      return next;
    });
  }, []);

  const value = useMemo(() => {
    const activeColors = highContrast
      ? isDark
        ? highContrastDarkColors
        : highContrastColors
      : isDark
      ? darkColors
      : colors;
    return { isDark, colors: activeColors, toggleTheme, highContrast, toggleHighContrast };
  }, [isDark, highContrast, toggleTheme, toggleHighContrast]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
