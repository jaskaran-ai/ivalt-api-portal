'use client';

import { CheckCircle2, Clock, Key, LayoutList, Trash2, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminShell from '@/components/layout/AdminShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { AdminTableSkeleton } from '@/components/ui/skeletons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AdminUser {
  id: string;
  phoneNumber: string;
  name: string | null;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  apiKeyCount: number;
}

type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const perPage = 10;

  const fetchUsers = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // REST endpoint returns { users: [...] } — filter + paginate client-side
        const all: AdminUser[] = (data.users ?? []).map(
          (
            u: Omit<AdminUser, 'createdAt' | 'approvedAt'> & {
              createdAt: string | number | Date;
              approvedAt: string | number | Date | null;
            },
          ) => ({
            ...u,
            createdAt:
              typeof u.createdAt === 'string' ? u.createdAt : new Date(u.createdAt).toISOString(),
            approvedAt: u.approvedAt
              ? typeof u.approvedAt === 'string'
                ? u.approvedAt
                : new Date(u.approvedAt).toISOString()
              : null,
          }),
        );
        const filtered =
          statusFilter === 'all' ? all : all.filter((u) => u.status === statusFilter);
        const start = (page - 1) * perPage;
        const pageItems = filtered.slice(start, start + perPage);
        setUsers(pageItems);
        setTotal(filtered.length);
        setTotalPages(Math.ceil(filtered.length / perPage));
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, page],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This will also permanently delete all their API keys.',
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      toast.success('User deleted successfully');
      fetchUsers(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-700">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <AdminTableSkeleton
          title="Users"
          description="Manage registered users and their access status"
          headers={['Name', 'Phone', 'Status', 'Joined At', 'Actions']}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">Users</h1>
            <p className="text-sm text-muted-foreground">
              Manage registered users and their access status
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'approved', 'pending', 'rejected'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusChange(s)}
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="mt-1 text-xs text-muted-foreground">All registered</p>
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
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Current page</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {users.filter((u) => u.status === 'approved').length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Active access</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {users.filter((u) => u.status === 'pending').length}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <User className="mb-4 size-12 text-muted-foreground" />
                <h3 className="font-semibold">No users found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No users match the current filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">API Keys</TableHead>
                      <TableHead className="hidden md:table-cell">Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <User className="size-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[120px] truncate font-medium sm:max-w-none">
                                {user.name || 'Unknown'}
                              </p>
                              <p className="max-w-[120px] truncate text-xs text-muted-foreground sm:max-w-none">
                                {user.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <Key className="size-4 text-muted-foreground" />
                            <span>{user.apiKeyCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                          >
                            <Trash2 className="size-4" />
                            <span>Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  page={page}
                  perPage={perPage}
                  total={total}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
