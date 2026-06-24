"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Clock, User, Calendar } from "lucide-react";
import AdminShell from "@/components/layout/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc/client";

interface AccessRequest {
  id: string;
  userId: string;
  useCase: string;
  requestedAt: string;
  approvedAt: string | null;
  adminNotes: string | null;
  user: {
    id: string;
    phoneNumber: string;
    name: string | null;
  } | null;
}

type StatusFilter = "pending" | "approved" | "all";

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const perPage = 10;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const result = await orpc.admin.accessRequests.list({
        page,
        perPage,
        status: statusFilter,
      }) as any;
      setRequests(result.items ?? []);
      setTotal(result.total ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleApproval = async (requestId: string, approved: boolean) => {
    setProcessingId(requestId);
    try {
      const res = await fetch("/api/access/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, approved }),
      });

      if (!res.ok) {
        throw new Error("Failed to process request");
      }

      toast.success(`Request ${approved ? "approved" : "rejected"} successfully`);
      fetchRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">Access Requests</h1>
            <p className="text-sm text-muted-foreground">Review and approve user access requests</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("pending")}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("approved")}
            >
              Approved
            </Button>
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange("all")}
            >
              All
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Clock className="mb-4 size-12 text-muted-foreground" />
                <h3 className="font-semibold">No requests found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusFilter === "pending"
                    ? "All caught up! No pending requests."
                    : "No requests match the current filter."}
                </p>
              </div>
            ) : (
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Use Case</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="size-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {req.user?.name || "Unknown User"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {req.user?.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="line-clamp-2 text-sm">
                              {req.useCase}
                            </p>
                            {req.adminNotes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Admin: {req.adminNotes}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(req.requestedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.approvedAt ? "secondary" : "outline"}>
                            {req.approvedAt ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!req.approvedAt && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproval(req.id, true)}
                                disabled={processingId === req.id}
                              >
                                <Check className="size-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproval(req.id, false)}
                                disabled={processingId === req.id}
                              >
                                <X className="size-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {req.approvedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(req.approvedAt).toLocaleDateString()}
                            </span>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
