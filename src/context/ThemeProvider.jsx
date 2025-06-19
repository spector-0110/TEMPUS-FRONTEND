"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Enhanced Theme Context
const ThemeContext = createContext({});

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Theme utilities and constants
export const themeConfig = {
  themes: ['light', 'dark', 'system'],
  defaultTheme: 'system',
  transitions: {
    duration: '0.3s',
    easing: 'ease-in-out',
  },
  colorSchemes: {
    light: {
      name: 'Light Mode',
      description: 'Clean and bright interface with high contrast',
      icon: 'sun',
    },
    dark: {
      name: 'Dark Mode', 
      description: 'Easy on the eyes with muted colors and deep backgrounds',
      icon: 'moon',
    },
    system: {
      name: 'System',
      description: 'Follows your device preference automatically',
      icon: 'laptop',
    },
  },
};

// Enhanced Theme Provider Component
export function EnhancedThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = useState(false);
  const [themePreference, setThemePreference] = useState('system');

  useEffect(() => {
    setMounted(true);
    
    // Apply smooth transitions after initial mount
    const applyThemeTransitions = () => {
      document.documentElement.style.setProperty(
        '--theme-transition',
        `background-color ${themeConfig.transitions.duration} ${themeConfig.transitions.easing}, 
         color ${themeConfig.transitions.duration} ${themeConfig.transitions.easing},
         border-color ${themeConfig.transitions.duration} ${themeConfig.transitions.easing}`
      );
      
      // Ensure cursor remains functional during theme transitions
      document.documentElement.style.setProperty('cursor', 'auto');
      document.body.style.pointerEvents = 'auto';
    };

    // Apply transitions after a short delay to prevent flash
    const timeoutId = setTimeout(applyThemeTransitions, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const contextValue = {
    mounted,
    themeConfig,
    themePreference,
    setThemePreference,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <NextThemesProvider
        attribute="class"
        defaultTheme={themeConfig.defaultTheme}
        enableSystem
        disableTransitionOnChange={false}
        {...props}
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}

// Custom hook for theme management
export const useThemeManager = () => {
  const { theme, setTheme, resolvedTheme, systemTheme } = useContext(NextThemesProvider);
  const { mounted, themeConfig } = useThemeContext();

  // Enhanced setTheme that ensures cursor remains functional
  const setThemeWithCursorFix = (newTheme) => {
    // Temporarily ensure cursor remains active
    document.body.style.cursor = 'auto';
    document.body.style.pointerEvents = 'auto';
    
    setTheme(newTheme);
    
    // Ensure cursor stays active after theme change
    setTimeout(() => {
      document.body.style.cursor = 'auto';
      document.body.style.pointerEvents = 'auto';
    }, 50);
  };

  const getThemeInfo = (themeName) => {
    return themeConfig.colorSchemes[themeName] || null;
  };

  const toggleTheme = () => {
    const currentIndex = themeConfig.themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeConfig.themes.length;
    setThemeWithCursorFix(themeConfig.themes[nextIndex]);
  };

  const isThemeActive = (themeName) => {
    if (themeName === 'system') {
      return theme === 'system';
    }
    return resolvedTheme === themeName;
  };

  return {
    theme,
    setTheme: setThemeWithCursorFix,
    resolvedTheme,
    systemTheme,
    mounted,
    toggleTheme,
    getThemeInfo,
    isThemeActive,
    availableThemes: themeConfig.themes,
  };
};

// Theme Detection Hook
export const useThemeDetection = () => {
  const [prefersDark, setPrefersDark] = useState(false);
  const [supportsColorScheme, setSupportsColorScheme] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      setPrefersDark(mediaQuery.matches);
      setSupportsColorScheme(true);

      const handleChange = (e) => {
        setPrefersDark(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return {
    prefersDark,
    supportsColorScheme,
  };
};

// Theme persistence utilities
export const themeStorage = {
  key: 'tiqora-theme-preference',
  
  save: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(themeStorage.key, theme);
    }
  },
  
  load: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(themeStorage.key);
    }
    return null;
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(themeStorage.key);
    }
  },
};
