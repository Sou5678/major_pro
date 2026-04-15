import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.08)_37%,rgba(255,255,255,0.04)_63%)] bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}
