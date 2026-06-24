"use client";

import { useEffect, useState } from "react";
import { Key, ShieldCheck } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { orpc } from "@/lib/orpc/client";

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
      const result = await orpc.admin.keys.list({
        page,
        perPage,
        status: statusFilter,
        search: search || undefined,
      }) as any;
      setKeys(result.items ?? []);
      setTotal(result.total ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch {
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
          <p className="text-sm text-muted-foreground">
            Monitor all API keys across the system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">On This Page</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keys.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{inactiveCount}</div>
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
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search keys..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange("all")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusChange("active")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === "active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusChange("inactive")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === "inactive" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : keys.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Key className="size-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold">No API keys found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No keys match the current filters.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key Name</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
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
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <ShieldCheck className="size-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {key.user?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
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
                        <TableCell>
                          <span className="text-sm">
                            {new Date(key.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
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
