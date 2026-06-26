import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoginLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(97,31,105,0.13),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(53,91,146,0.12),transparent_30%),linear-gradient(135deg,rgba(97,31,105,0.06),transparent_42%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(97,31,105,0.05),transparent)]" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        {/* Left — Branding */}
        <section className="flex flex-col justify-center gap-8 px-6 py-12 lg:flex-1 lg:px-12 lg:py-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="max-w-xl">
            <Skeleton className="mb-5 h-6 w-36 rounded-full" />
            <Skeleton className="h-10 w-full max-w-lg rounded-2xl" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
        </section>

        {/* Right — Form */}
        <section className="flex flex-col justify-center px-6 pt-8 pb-16 lg:flex-1 lg:px-16 lg:py-0">
          <div className="mx-auto w-full max-w-sm">
            <Skeleton className="h-8 w-44 mb-2" />
            <Skeleton className="h-4 w-72 mb-8" />

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-md" />
              </div>
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="mx-auto h-3 w-56" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
