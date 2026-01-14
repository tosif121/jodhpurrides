import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setLightTheme: () => void;
  setDarkTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    setIsDark(themeMode === 'dark');
  }, [themeMode]);

  const loadThemePreference = async (): Promise<void> => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode: ThemeMode): Promise<void> => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = (): void => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  const setLightTheme = (): void => {
    setThemeMode('light');
    saveThemePreference('light');
  };

  const setDarkTheme = (): void => {
    setThemeMode('dark');
    saveThemePreference('dark');
  };

  const value: ThemeContextType = {
    isDark,
    themeMode,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};