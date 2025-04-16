'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Button = forwardRef(
  ({ className, variant = 'default', size = 'default', fullWidth, isLoading, ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      // Premium variants
      gradient: 'bg-gradient-to-r from-primary to-blue-600 text-white hover:opacity-90',
      medical: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90',
      premium: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 shadow-md hover:shadow-lg',
      glass: 'backdrop-blur-md bg-white/20 border border-white/30 text-foreground shadow-sm hover:bg-white/30',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      xl: 'h-12 rounded-md px-10 text-base',
      icon: 'h-10 w-10',
    };

    const loadingClass = isLoading ? 'opacity-70 cursor-wait' : '';

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          loadingClass,
          className
        )}
        ref={ref}
        disabled={isLoading}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };