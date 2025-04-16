'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ className, type, variant = 'default', error, ...props }, ref) => {
  const variants = {
    default: `bg-white dark:bg-dark-800 
              border border-gray-200 dark:border-dark-700 
              focus:border-primary-500 dark:focus:border-primary-400
              placeholder:text-gray-400 dark:placeholder:text-gray-500`,
    glass: `bg-white/10 dark:bg-dark-800/30 
            backdrop-blur-lg border border-white/20 dark:border-dark-700/50
            focus:border-white/30 dark:focus:border-dark-600/70
            placeholder:text-gray-500/70 dark:placeholder:text-gray-400/70`,
    premium: `bg-gradient-to-r from-white to-gray-50 dark:from-dark-800 dark:to-dark-900
              border border-gray-200 dark:border-dark-700
              focus:border-primary-500 dark:focus:border-primary-400
              placeholder:text-gray-400/80 dark:placeholder:text-gray-500/80
              shadow-sm focus:shadow-md`,
  };

  return (
    <input
      type={type}
      className={cn(
        // Base styles
        "h-10 px-3 py-2 text-sm rounded-lg transition-all duration-200",
        "text-gray-900 dark:text-white",
        // Focus styles
        "focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20",
        // Error styles
        error && "border-error-500 dark:border-error-400 focus:border-error-500 dark:focus:border-error-400",
        // Disabled styles
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Variant styles
        variants[variant],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };