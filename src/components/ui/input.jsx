import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, value, defaultValue, ...props }, ref) => {
  // Convert null/undefined values to empty string to avoid React controlled/uncontrolled warning
  const inputValue = value === null || value === undefined ? '' : value;
  
  // Prevent both value and defaultValue from being passed to the input
  // If value is provided, we use it as a controlled component (ignoring defaultValue)
  // If value is undefined but defaultValue exists, we use defaultValue as an uncontrolled component
  // If neither exists, we use an empty string for value
  
  const inputProps = {
    ...(value !== undefined ? { value: inputValue } : { defaultValue })
  };
  
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
