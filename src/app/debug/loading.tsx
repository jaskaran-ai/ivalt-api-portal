import { Skeleton } from '@/components/ui/skeleton';

export default function DebugLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>

        {/* Overall Status Banner */}
        <div className="mb-8 flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-3">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-3 w-32" />
        </div>

        {/* Check Cards */}
        <div className="mb-8 flex flex-col gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border/80 bg-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="ml-auto h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Send Test Email Section */}
        <div className="rounded-xl border border-border/80 bg-card p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="h-6 w-36" />
          </div>

          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 flex-1 rounded-xl" />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
