'use client';

import { CheckCircle2, Key, LayoutList, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminShell from '@/components/layout/AdminShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { AdminTableSkeleton } from '@/components/ui/skeletons';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ApiKey {
  id: string;
  keyName: string;
  awsKeyId: string;
  keyValue: string | null;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  user: {
    id: string;
    phoneNumber: string;
    name: string | null;
    status: string;
  } | null;
}

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const perPage = 10;

  const fetchKeys = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const res = await fetch('/api/admin/keys');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // REST endpoint returns { keys: [...] } — filter + paginate client-side
        let all: ApiKey[] = (data.keys ?? []).map(
          (
            k: Omit<ApiKey, 'createdAt' | 'lastUsedAt'> & {
              createdAt: string | number | Date;
              lastUsedAt: string | number | Date | null;
            },
          ) => ({
            ...k,
            createdAt:
              typeof k.createdAt === 'string' ? k.createdAt : new Date(k.createdAt).toISOString(),
            lastUsedAt: k.lastUsedAt
              ? typeof k.lastUsedAt === 'string'
                ? k.lastUsedAt
                : new Date(k.lastUsedAt).toISOString()
              : null,
          }),
        );
        if (statusFilter === 'active') all = all.filter((k) => k.isActive);
        if (statusFilter === 'inactive') all = all.filter((k) => !k.isActive);
        if (search) {
          const q = search.toLowerCase();
          all = all.filter(
            (k) =>
              k.keyName.toLowerCase().includes(q) ||
              k.awsKeyId.toLowerCase().includes(q) ||
              k.user?.name?.toLowerCase().includes(q),
          );
        }
        const start = (page - 1) * perPage;
        setKeys(all.slice(start, start + perPage));
        setTotal(all.length);
        setTotalPages(Math.ceil(all.length / perPage));
      } catch (err) {
        console.error('Failed to fetch keys:', err);
        setKeys([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search, page],
  );

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggleKey = async (keyId: string, currentState: boolean) => {
    setTogglingId(keyId);
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, isActive: !currentState }),
      });
      if (!res.ok) throw new Error('Failed to toggle key status');
      toast.success(`Key ${!currentState ? 'enabled' : 'disabled'} successfully`);
      fetchKeys(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle key');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (
      !confirm('Are you sure you want to permanently delete this API key? This cannot be undone.')
    ) {
      return;
    }
    setDeletingId(keyId);
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
      });
      if (!res.ok) throw new Error('Failed to delete API key');
      toast.success('API key deleted successfully');
      fetchKeys(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete key');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <AdminTableSkeleton
          title="API Keys"
          description="Manage developer API keys"
          headers={['Name', 'AWS Key ID', 'User', 'Status', 'Created At', 'Actions']}
        />
      </AdminShell>
    );
  }

  const activeCount = keys.filter((k) => k.isActive).length;
  const inactiveCount = keys.filter((k) => !k.isActive).length;

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">API Keys</h1>
          <p className="text-sm text-muted-foreground">Monitor all API keys across the system</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Keys
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Key className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="mt-1 text-xs text-muted-foreground">All API keys</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  On This Page
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10">
                  <LayoutList className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keys.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Current page</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Enabled keys</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Inactive
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10">
                  <XCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{inactiveCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Disabled keys</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Showing {keys.length} keys on this page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search keys..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 rounded-md border px-3 py-2 text-sm"
              />
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('all')}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    statusFilter === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('active')}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    statusFilter === 'active'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('inactive')}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    statusFilter === 'inactive'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : keys.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Key className="mb-4 size-12 text-muted-foreground" />
                <h3 className="font-semibold">No API keys found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No keys match the current filters.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key Name</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="hidden lg:table-cell">Last Used</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{key.keyName}</p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {key.awsKeyId.slice(0, 12)}…
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex hidden size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:flex">
                                <ShieldCheck className="size-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-[100px] truncate font-medium sm:max-w-none">
                                  {key.user?.name || 'Unknown'}
                                </p>
                                <p className="max-w-[100px] truncate text-xs text-muted-foreground sm:max-w-none">
                                  {key.user?.phoneNumber}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className={`mt-1 text-xs ${
                                    key.user?.status === 'approved'
                                      ? 'bg-emerald-500/10 text-emerald-700'
                                      : key.user?.status === 'rejected'
                                        ? 'bg-red-500/10 text-red-700'
                                        : 'bg-amber-500/10 text-amber-700'
                                  }`}
                                >
                                  {key.user?.status || 'pending'}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={key.isActive ? 'secondary' : 'outline'}>
                              {key.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm">
                              {new Date(key.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {key.lastUsedAt ? (
                              <span className="text-sm">
                                {new Date(key.lastUsedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {togglingId === key.id
                                    ? 'Updating'
                                    : key.isActive
                                      ? 'Enabled'
                                      : 'Disabled'}
                                </span>
                                <Switch
                                  checked={key.isActive}
                                  onCheckedChange={() => handleToggleKey(key.id, key.isActive)}
                                  disabled={togglingId === key.id}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteKey(key.id)}
                                disabled={deletingId === key.id}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Pagination
                  page={page}
                  perPage={perPage}
                  total={total}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
