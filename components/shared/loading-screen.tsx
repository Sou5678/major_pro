import { Skeleton } from "@/components/ui/skeleton";

export function LoadingScreen() {
  return (
    <div className="space-y-6 rounded-[32px] border border-white/5 bg-black/10 p-6">
      <Skeleton className="h-6 w-32 rounded-full" />
      <Skeleton className="h-12 w-72 rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-36 w-full rounded-3xl" />
        <Skeleton className="h-36 w-full rounded-3xl" />
        <Skeleton className="h-36 w-full rounded-3xl" />
      </div>
    </div>
  );
}
