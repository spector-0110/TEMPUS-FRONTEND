import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-theme-sm hover:bg-primary-hover hover:shadow-theme-md active:bg-primary-active focus-visible:ring-offset-background transition-all duration-200",
        destructive:
          "bg-destructive text-destructive-foreground shadow-theme-sm hover:bg-destructive-hover active:bg-destructive-active hover:shadow-theme-md focus-visible:ring-destructive transition-all duration-200",
        outline:
          "border border-input bg-surface hover:bg-card-hover hover:text-foreground active:bg-card-pressed focus-visible:ring-primary transition-all duration-200",
        secondary:
          "bg-secondary text-secondary-foreground shadow-theme-sm hover:bg-secondary-hover active:bg-secondary-active focus-visible:ring-primary transition-all duration-200",
        ghost: 
          "hover:bg-card-hover hover:text-foreground active:bg-card-pressed focus-visible:ring-primary transition-all duration-200",
        link: 
          "text-primary underline-offset-4 hover:underline focus-visible:ring-primary transition-all duration-200",
        success:
          "bg-success text-success-foreground shadow-theme-sm hover:bg-success-hover active:bg-success-active focus-visible:ring-success transition-all duration-200",
        warning:
          "bg-warning text-warning-foreground shadow-theme-sm hover:bg-warning-hover active:bg-warning-active focus-visible:ring-warning transition-all duration-200",
        accent:
          "bg-accent text-accent-foreground shadow-theme-sm hover:bg-accent-hover active:bg-accent-active focus-visible:ring-accent transition-all duration-200",
        info:
          "bg-info text-info-foreground shadow-theme-sm hover:bg-info-hover active:bg-info-active focus-visible:ring-info transition-all duration-200",
        subtle:
          "bg-subtle text-subtle-foreground hover:bg-subtle-hover active:bg-muted focus-visible:ring-primary transition-all duration-200",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-9 w-9",
        xl: "h-12 rounded-lg px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
