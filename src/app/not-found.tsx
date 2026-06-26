'use client';

import { ArrowLeft, Compass, HelpCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Top Right Glow */}
        <div className="absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        {/* Bottom Left Glow */}
        <div className="absolute -bottom-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-border/40 px-6 py-6 backdrop-blur-sm">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <Logo className="h-7 w-auto" />
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="relative flex w-full max-w-lg flex-col items-center rounded-2xl border border-border/80 bg-card/60 p-8 shadow-xl backdrop-blur-md md:p-12 dark:shadow-2xl/40">
          {/* Decorative Floating Icon */}
          <div className="relative mb-6 animate-pulse rounded-2xl bg-primary/10 p-4 text-primary">
            <Compass className="h-12 w-12" />
            <div className="absolute inset-0 animate-ping rounded-2xl border border-primary/20 opacity-75" />
          </div>

          {/* Heading */}
          <h1 className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text font-heading text-7xl font-extrabold tracking-tight text-transparent select-none md:text-8xl dark:from-purple-400 dark:to-indigo-400">
            404
          </h1>

          <h2 className="mt-4 font-heading text-xl font-bold tracking-tight md:text-2xl">
            Lost in the Portal?
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
            The page you are looking for doesn&apos;t exist or has been moved to another coordinate.
            Let&apos;s get you back on track.
          </p>

          {/* Navigation Buttons */}
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 transition-all duration-200 hover:bg-muted/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/30"
            >
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Support Link */}
        <p className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <HelpCircle className="h-3.5 w-3.5" />
          Need assistance?{' '}
          <a
            href="mailto:support@ivalt.com"
            className="font-medium text-primary transition-all hover:underline"
          >
            Contact iVALT Support
          </a>
        </p>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-7xl border-t border-border/20 px-6 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} iVALT. All rights reserved.</p>
      </footer>
    </div>
  );
}
