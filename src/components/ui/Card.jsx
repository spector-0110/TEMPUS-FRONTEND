'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Card = forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700',
    glass: 'bg-white/10 dark:bg-dark-800/30 backdrop-blur-lg border border-white/20 dark:border-dark-700/50',
    premium: `bg-gradient-to-b from-white to-gray-50 dark:from-dark-800 dark:to-dark-900
              shadow-premium dark:shadow-premium-dark border border-gray-100 dark:border-dark-700
              hover:shadow-lg dark:hover:shadow-lg`,
    gradient: `bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-primary-900/20 dark:to-accent-900/20
               border border-primary-100 dark:border-primary-800`,
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl shadow-sm transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-white",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };