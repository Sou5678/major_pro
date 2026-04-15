import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-12 w-96 rounded-2xl" />
        </div>
        <Skeleton className="h-10 w-36 rounded-2xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    </div>
  );
}
