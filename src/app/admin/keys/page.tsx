"use client";

import { useEffect, useState } from "react";
import { Key, ShieldCheck, CheckCircle2, XCircle, LayoutList } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const perPage = 10;

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/keys");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // REST endpoint returns { keys: [...] } — filter + paginate client-side
      let all: ApiKey[] = (data.keys ?? []).map((k: any) => ({
        ...k,
        createdAt: typeof k.createdAt === "string" ? k.createdAt : new Date(k.createdAt).toISOString(),
        lastUsedAt: k.lastUsedAt
          ? typeof k.lastUsedAt === "string" ? k.lastUsedAt : new Date(k.lastUsedAt).toISOString()
          : null,
      }));
      if (statusFilter === "active") all = all.filter((k) => k.isActive);
      if (statusFilter === "inactive") all = all.filter((k) => !k.isActive);
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
      console.error("Failed to fetch keys:", err);
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [page, statusFilter, search]);

  const handleStatusChange = (status: "all" | "active" | "inactive") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Keys</CardTitle>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">On This Page</CardTitle>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
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
            <CardDescription>
              Showing {keys.length} keys on this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search keys..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleStatusChange("all")}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusChange("active")}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    statusFilter === "active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusChange("inactive")}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    statusFilter === "inactive" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{key.keyName}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {key.awsKeyId.slice(0, 12)}…
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hidden sm:flex">
                              <ShieldCheck className="size-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[100px] sm:max-w-none">
                                {key.user?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-none">
                                {key.user?.phoneNumber}
                              </p>
                              <Badge
                                variant="secondary"
                                className={`text-xs mt-1 ${
                                  key.user?.status === "approved"
                                    ? "bg-emerald-500/10 text-emerald-700"
                                    : key.user?.status === "rejected"
                                      ? "bg-red-500/10 text-red-700"
                                      : "bg-amber-500/10 text-amber-700"
                                }`}
                              >
                                {key.user?.status || "pending"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.isActive ? "secondary" : "outline"}>
                            {key.isActive ? "Active" : "Inactive"}
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
