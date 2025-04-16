'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

const FormField = forwardRef(({ 
  className, 
  label, 
  htmlFor, 
  error, 
  description, 
  required, 
  variant = 'default',
  children, 
  ...props 
}, ref) => {
  const generatedId = useId();
  const id = htmlFor || generatedId;
  
  const variants = {
    default: 'text-gray-700 dark:text-gray-300',
    premium: 'text-gray-900 dark:text-gray-100 font-medium',
    glass: 'text-gray-800 dark:text-gray-200',
  };
  
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {label && (
        <label 
          htmlFor={id} 
          className={cn(
            "block text-sm transition-colors duration-200",
            variants[variant]
          )}
        >
          {label}
          {required && (
            <span className="ml-1 text-error-500 dark:text-error-400">*</span>
          )}
        </label>
      )}
      
      {children && (
        typeof children === 'function' 
          ? children({ id, error }) 
          : children
      )}
      
      {description && (
        <p className={cn(
          "text-xs",
          error 
            ? "text-error-500 dark:text-error-400" 
            : "text-gray-500 dark:text-gray-400"
        )}>
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-error-500 dark:text-error-400 animate-slideUp">
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export { FormField };