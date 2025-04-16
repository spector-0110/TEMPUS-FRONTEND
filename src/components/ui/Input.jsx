'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({ className, type, variant = 'default', error, ...props }, ref) => {
  const variants = {
    default: `bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700 
              focus:border-primary-500 dark:focus:border-primary-400
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              input-focus`,
    glass: `bg-white/10 dark:bg-gray-800/30 
            backdrop-blur-lg border border-white/20 dark:border-gray-700/50
            focus:border-white/30 dark:focus:border-gray-600/70
            placeholder:text-gray-500/70 dark:placeholder:text-gray-400/70
            input-focus`,
    premium: `bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
              border border-gray-200 dark:border-gray-700
              focus:border-primary-500 dark:focus:border-primary-400
              placeholder:text-gray-400/80 dark:placeholder:text-gray-500/80
              shadow-sm focus:shadow-md input-focus`
  };

  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md px-3 py-2 text-sm transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        error && 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };