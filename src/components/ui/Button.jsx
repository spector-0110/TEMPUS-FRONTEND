import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"
import { forwardRef } from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 dark:bg-red-700 dark:text-white dark:hover:bg-red-600",
        outline:
          "border border-input bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800 shadow-sm",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
        ghost: "text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        link: "text-primary underline-offset-4 hover:underline dark:text-neutral-100",
        iconPrimary: "bg-white text-gray-700 shadow-md hover:bg-gray-50 hover:shadow-lg dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
        iconSecondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
        iconGhost: "text-gray-700 hover:bg-gray-100 dark:text-neutral-100 dark:hover:bg-neutral-800",
      },
      size: {
        default: "h-9 px-4 py-2 md:h-10 md:px-6",
        sm: "h-7 rounded-md px-2 text-xs md:h-8 md:px-3",
        lg: "h-10 rounded-md px-6 text-base md:h-12 md:px-8",
        icon: "h-10 w-10 rounded-full p-2",
        iconSm: "h-8 w-8 rounded-full p-1.5",
        iconLg: "h-12 w-12 rounded-full p-2.5",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
)

const Button = forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
