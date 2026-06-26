'use client';

import { Activity, Key, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface UsageStats {
  summary?: {
    totalUsers: number;
    usersThisWeek: number;
    totalKeys: number;
    activeKeys: number;
    inactiveKeys: number;
    recentlyUsed: number;
    totalRequests: number;
  };
  usage?: Array<{
    id: string;
    keyName: string;
    isActive: boolean;
    usageCount: number;
    user: { name: string; phoneNumber: string } | null;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/usage');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Overview of API key usage and user statistics
          </p>
        </header>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.summary?.totalUsers ?? 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                +{stats?.summary?.usersThisWeek ?? 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total API Keys
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Key className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.summary?.totalKeys ?? 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats?.summary?.activeKeys ?? 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Requests
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.summary?.totalRequests ?? 0).toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recently Used
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                  <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.summary?.recentlyUsed ?? 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Used in last 24h</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Usage Table */}
        <Card>
          <CardHeader>
            <CardTitle>API Key Usage</CardTitle>
            <CardDescription>Real-time usage statistics from AWS API Gateway</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-3 text-left">Key Name</th>
                    <th className="px-2 py-3 text-left">User</th>
                    <th className="px-2 py-3 text-right">Requests</th>
                    <th className="px-2 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.usage ?? []).slice(0, 10).map((key) => (
                    <tr key={key.id} className="border-b">
                      <td className="px-2 py-3 font-medium">{key.keyName}</td>
                      <td className="px-2 py-3">
                        {key.user ? (
                          <div>
                            <div>{key.user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {key.user.phoneNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right">{key.usageCount.toLocaleString()}</td>
                      <td className="px-2 py-3 text-right">
                        <Badge variant={key.isActive ? 'secondary' : 'destructive'}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
