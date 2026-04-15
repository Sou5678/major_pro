import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-white shadow-[0_12px_30px_rgba(99,102,241,0.3)] hover:bg-accent-hover",
        secondary:
          "border border-border-bright bg-surface-elevated text-text-primary hover:border-accent hover:bg-surface",
        ghost: "text-text-secondary hover:bg-white/5 hover:text-text-primary",
        danger: "bg-danger/90 text-white hover:bg-danger",
      },
      size: {
        default: "h-10 sm:h-11 px-4 sm:px-5",
        sm: "h-8 sm:h-9 px-2.5 sm:px-3 text-xs",
        lg: "h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base",
        icon: "h-9 w-9 sm:h-10 sm:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
