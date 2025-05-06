'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { HeartPulse } from "lucide-react"; 

const Card = forwardRef(({ className, variant = 'glass', ...props }, ref) => {
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md',
    glass: 'bg-white/10 dark:bg-gray-800/30 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-lg',
    premium: `bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
              shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700
              hover:shadow-2xl dark:hover:shadow-3xl transition-all duration-300`,
    gradient: `bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-secondary-500/10 
               dark:from-primary-400/20 dark:via-accent-400/20 dark:to-secondary-400/20
               border border-primary-100 dark:border-primary-800 shadow-lg hover:shadow-xl`
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg p-2 transition-all duration-200 card-hover',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";


const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "text-4xl md:text-5xl font-extrabold tracking-tight text-center text-primary-700 dark:text-primary-300 flex items-center justify-center space-x-3",
      className
    )}
    {...props}
  >
    <HeartPulse className="w-10 h-10 text-primary-500" />
    <span>{children}</span>
  </h1>
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