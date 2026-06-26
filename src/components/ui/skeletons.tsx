import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96" />
      </header>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="my-8 border-b border-border" />

      {/* Table Skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-36 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between border-b pb-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border/40">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminTableSkeleton({
  title = 'Items',
  description = 'Manage your items',
  headers = ['Name', 'Status', 'Date'],
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-9 w-64 rounded-md" />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-36 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between border-b pb-2">
              {headers.map((_h, i) => {
                return <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: headers list is static
                  key={i}
                  className={`h-4 ${i === 0 ? 'w-1/4' : i === headers.length - 1 ? 'w-1/12' : 'w-1/6'}`}
                />;
              })}
            </div>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between py-3 border-b border-border/40">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccessRequestSkeleton() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.08fr_0.82fr]">
        <div className="hidden flex-col gap-8 lg:flex">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-2xl" />
            <Skeleton className="h-8 w-44" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-full max-w-lg rounded-2xl" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-5 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 w-full">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-primary/10 bg-card/95 shadow-xl shadow-foreground/10 backdrop-blur">
          <CardHeader className="p-6 pb-0">
            <Skeleton className="mb-4 size-12 rounded-3xl" />
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <Skeleton className="h-11 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AccessStatusSkeleton() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <Card className="w-full max-w-md border-primary/10 bg-card/95 shadow-xl shadow-foreground/10 backdrop-blur">
          <CardHeader className="p-6 pb-0 flex flex-col items-start gap-4">
            <Skeleton className="size-12 rounded-3xl" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-11 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
