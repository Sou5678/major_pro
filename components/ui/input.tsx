import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 sm:h-11 w-full rounded-lg border border-border bg-surface-elevated px-3 sm:px-4 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
