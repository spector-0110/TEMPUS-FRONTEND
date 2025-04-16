'use client';

import { useTheme } from '@/context/ThemeProvider';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed bottom-5 right-5 p-3 rounded-full bg-primary-500/10 hover:bg-primary-500/20 dark:bg-primary-400/10 dark:hover:bg-primary-400/20 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      ) : (
        <MoonIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
      )}
    </button>
  );
}