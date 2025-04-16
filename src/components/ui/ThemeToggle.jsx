'use client';

import { useTheme } from '@/context/ThemeProvider';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const icons = {
    light: <SunIcon className="w-[1.2rem] h-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />,
    dark: <MoonIcon className="absolute w-[1.2rem] h-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />,
    system: <ComputerDesktopIcon className="absolute w-[1.2rem] h-[1.2rem] rotate-90 scale-0 transition-all" />
  };

  const themes = ['light', 'dark', 'system'];
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];

  return (
    <button
      onClick={() => toggleTheme(nextTheme)}
      className="fixed bottom-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80 p-2 backdrop-blur hover:bg-background/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
      aria-label="Toggle theme"
    >
      <div className="relative h-full w-full">
        {Object.entries(icons).map(([key, icon]) => (
          <div
            key={key}
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 
              ${theme === key ? 'transform-none' : 'scale-0 opacity-0'}`}
          >
            {icon}
          </div>
        ))}
      </div>
    </button>
  );
}