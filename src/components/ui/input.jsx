import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, value, defaultValue, variant, ...props }, ref) => {
  // Convert null/undefined values to empty string to avoid React controlled/uncontrolled warning
  const inputValue = value === null || value === undefined ? '' : value;
  
  // Prevent both value and defaultValue from being passed to the input
  // If value is provided, we use it as a controlled component (ignoring defaultValue)
  // If value is undefined but defaultValue exists, we use defaultValue as an uncontrolled component
  // If neither exists, we use an empty string for value
  
  const inputProps = {
    ...(value !== undefined ? { value: inputValue } : { defaultValue })
  };
  
  const baseClasses = "flex w-full rounded-md border transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-input-focus disabled:cursor-not-allowed disabled:opacity-50";
  
  const variantClasses = {
    default: "h-9 bg-input-background border-input px-3 py-1 text-base shadow-theme-sm hover:border-input-hover md:text-sm",
    filled: "h-9 bg-surface border-border px-3 py-1 text-base shadow-theme-sm hover:bg-card-hover md:text-sm",
    ghost: "h-9 bg-transparent border-transparent px-3 py-1 text-base hover:bg-card-hover focus-visible:bg-input-background focus-visible:border-input md:text-sm",
    large: "h-11 bg-input-background border-input px-4 py-2 text-base shadow-theme-sm hover:border-input-hover",
  };
  
  return (
    <input
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant || "default"],
        className
      )}
      ref={ref}
      {...props}
      {...inputProps} // Apply these after props so they take precedence
    />
  );
})
Input.displayName = "Input"

export { Input }
