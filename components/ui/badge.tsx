import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-border-bright bg-white/5 text-text-primary",
        accent: "border-accent/40 bg-accent/10 text-indigo-200",
        success: "border-success/30 bg-success/10 text-emerald-300",
        warning: "border-warning/30 bg-warning/10 text-amber-300",
        danger: "border-danger/30 bg-danger/10 text-rose-300",
        outline: "border-border text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
