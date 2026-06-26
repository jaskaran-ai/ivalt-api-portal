'use client';

import {
  BookOpen,
  ExternalLink,
  FlaskConical,
  Key,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'API Keys', href: '/dashboard/keys', icon: Key },
  { label: 'API Docs', href: '/dashboard/docs', icon: BookOpen },
];

interface DashboardShellProps {
  children: React.ReactNode;
  phoneNumber: string;
  demoMode?: boolean;
}

export default function DashboardShell({
  children,
  phoneNumber,
  demoMode = false,
}: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarContentLayout phoneNumber={phoneNumber} demoMode={demoMode}>
        {children}
      </SidebarContentLayout>
    </SidebarProvider>
  );
}

function SidebarContentLayout({ children, phoneNumber, demoMode }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('ivalt_access_status');
    localStorage.removeItem('ivalt_has_usecase');
    toast.success(demoMode ? 'Exited demo mode' : 'Logged out successfully');
    router.push('/login');
  };

  const maskedPhone = phoneNumber
    ? `${phoneNumber.slice(0, Math.min(4, phoneNumber.length))}••••${phoneNumber.slice(-3)}`
    : 'Unknown';

  const activeItem = navItems.find(
    (n) => n.href === pathname || (n.href !== '/dashboard' && pathname.startsWith(n.href)),
  );

  return (
    <>
      <Sidebar className="border-r border-sidebar-border/80 bg-sidebar" collapsible="offcanvas">
        <SidebarHeader className="border-b border-sidebar-border/80">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-sm shadow-primary/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1 group-data-[state=collapsed]:hidden">
              <p className="text-sm font-semibold">iVALT</p>
              <p className="text-xs text-sidebar-foreground/60">Developer Portal</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-2">
          {/* Demo badge - only show when expanded */}
          {demoMode && (
            <div className="mb-2 px-2 group-data-[state=collapsed]:hidden">
              <div className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                <FlaskConical className="h-4 w-4 shrink-0" />
                <span className="truncate">Demo Mode Active</span>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 py-1 text-xs group-data-[state=collapsed]:hidden">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link href={item.href}>
                          <Icon className="h-5 w-5" />
                          <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                          {isActive && (
                            <div className="ml-auto size-1.5 rounded-full bg-primary group-data-[state=collapsed]:hidden" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-2" />

          {/* Secondary Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 py-1 text-xs group-data-[state=collapsed]:hidden">
              Resources
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Postman Collection" asChild>
                    <a
                      href="https://documenter.getpostman.com/view/10533913/2sB2j4grRW"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span className="group-data-[state=collapsed]:hidden">Postman Docs</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border px-2 py-2 pb-24">
          {/* User section */}
          <div className="mb-2 px-2 group-data-[state=collapsed]:hidden">
            <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/80 p-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-primary text-xs font-bold text-primary-foreground">
                {phoneNumber.slice(-2) || 'DM'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {demoMode ? 'Demo User' : maskedPhone}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {demoMode ? 'Demo account' : 'Verified via iVALT'}
                </p>
              </div>
            </div>
          </div>

          {/* Logout button */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                disabled={loggingOut}
                tooltip={demoMode ? 'Exit Demo' : 'Log out'}
                className="text-sidebar-foreground/80 hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
                <span className="group-data-[state=collapsed]:hidden">
                  {loggingOut ? 'Logging out…' : demoMode ? 'Exit Demo' : 'Log out'}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Rail for expand on hover */}
        <SidebarRail />
      </Sidebar>

      {/* Main content area */}
      <SidebarInset>
        {/* Top bar */}
        <header className="flex shrink-0 items-center gap-3 border-b border-border/80 bg-card/90 px-4 py-3 shadow-sm shadow-foreground/5 backdrop-blur md:gap-4 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="hidden text-xs text-muted-foreground md:inline">⌘B to toggle</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold tracking-[-0.01em] text-foreground md:text-lg">
              {activeItem?.label || 'Dashboard'}
            </h1>
          </div>
          {demoMode && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <FlaskConical className="h-4 w-4" />
              Demo
            </span>
          )}
          <a
            href="https://documenter.getpostman.com/view/10533913/2sB2j4grRW"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm font-medium text-primary underline-offset-4 hover:underline sm:inline"
          >
            API Ref ↗
          </a>
          <ThemeToggle />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(97,31,105,0.06),transparent_32%),var(--background)] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
