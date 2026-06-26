'use client';

import {
  Calendar,
  Check,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  Phone,
  ShieldCheck,
  ShieldX,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import AdminShell from '@/components/layout/AdminShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    status: string | null;
  } | null;
}

type StatusFilter = 'pending' | 'approved' | 'all';

// ── Details Modal ────────────────────────────────────────────────────────────

interface DetailsModalProps {
  request: AccessRequest | null;
  processingId: string | null;
  onClose: () => void;
  onApprove: (id: string, approved: boolean, notes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function DetailsModal({ request, processingId, onClose, onApprove, onDelete }: DetailsModalProps) {
  const [notes, setNotes] = useState('');
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotes(request?.adminNotes ?? '');
  }, [request]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!request) return null;

  const isProcessing = processingId === request.id;
  const userStatus = request.user?.status ?? 'pending';
  const isApproved = userStatus === 'approved';
  const isRejected = userStatus === 'rejected';
  const isAlreadyDecided = isApproved || isRejected;

  const initials = request.user?.name
    ? request.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (request.user?.phoneNumber?.slice(-2) ?? '?');

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click handler
    // biome-ignore lint/a11y/useKeyWithClickEvents: escape key is handled globally or via children
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === backdropRef.current && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-6 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {request.user?.name || 'Unknown User'}
              </h2>
              <p className="text-sm text-muted-foreground">Access Request Details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          {/* Status banner */}
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              isApproved
                ? 'border-emerald-500/20 bg-emerald-500/10'
                : isRejected
                  ? 'border-destructive/20 bg-destructive/10'
                  : 'border-amber-500/20 bg-amber-500/10'
            }`}
          >
            {isApproved ? (
              <ShieldCheck className="size-5 text-emerald-600" />
            ) : isRejected ? (
              <ShieldX className="size-5 text-destructive" />
            ) : (
              <Clock className="size-5 text-amber-600" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  isApproved
                    ? 'text-emerald-700'
                    : isRejected
                      ? 'text-destructive'
                      : 'text-amber-700'
                }`}
              >
                {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending Review'}
              </p>
              {request.approvedAt && (
                <p
                  className={`text-xs ${isApproved ? 'text-emerald-600' : 'text-destructive-foreground/70'}`}
                >
                  {isApproved ? 'Approved' : 'Rejected'} on{' '}
                  {new Date(request.approvedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </p>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Phone Number
                </p>
                <p className="mt-0.5 text-sm font-medium">{request.user?.phoneNumber ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
              <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Requested On
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {new Date(request.requestedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(request.requestedAt).toLocaleTimeString('en-IN', {
                      timeStyle: 'short',
                    })}
                  </span>
                </p>
              </div>
            </div>

            {request.useCase && (
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
                <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Use Case
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed">
                    {request.useCase || (
                      <span className="italic text-muted-foreground">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Admin notes */}
          {!isAlreadyDecided && (
            <div>
              <label
                htmlFor="admin-notes-textarea"
                className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                <MessageSquare className="size-3.5" />
                Admin Notes (optional)
              </label>
              <textarea
                id="admin-notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note for this decision…"
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Existing admin notes (read-only if already decided) */}
          {isAlreadyDecided && request.adminNotes && (
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
              <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Admin Notes
                </p>
                <p className="mt-0.5 text-sm italic text-muted-foreground">{request.adminNotes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => onDelete(request.id)}
            disabled={isProcessing}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              {isAlreadyDecided ? 'Close' : 'Cancel'}
            </Button>
            {!isAlreadyDecided && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => onApprove(request.id, false, notes)}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <ShieldX className="size-4" />
                  {isProcessing ? 'Rejecting…' : 'Reject'}
                </Button>
                <Button
                  onClick={() => onApprove(request.id, true, notes)}
                  disabled={isProcessing}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <ShieldCheck className="size-4" />
                  {isProcessing ? 'Approving…' : 'Approve'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const perPage = 10;

  const fetchRequests = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const res = await fetch(`/api/access/approve?status=${statusFilter}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const all: AccessRequest[] = (data.requests ?? []).map(
          (
            r: Omit<AccessRequest, 'requestedAt' | 'approvedAt'> & {
              requestedAt: string | number | Date;
              approvedAt: string | number | Date | null;
            },
          ) => ({
            ...r,
            requestedAt:
              typeof r.requestedAt === 'string'
                ? r.requestedAt
                : new Date(r.requestedAt).toISOString(),
            approvedAt: r.approvedAt
              ? typeof r.approvedAt === 'string'
                ? r.approvedAt
                : new Date(r.approvedAt).toISOString()
              : null,
          }),
        );
        const start = (page - 1) * perPage;
        setRequests(all.slice(start, start + perPage));
        setTotal(all.length);
        setTotalPages(Math.ceil(all.length / perPage));
      } catch (err) {
        console.error('Failed to fetch requests:', err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, page],
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleApproval = async (requestId: string, approved: boolean, notes: string) => {
    setProcessingId(requestId);
    try {
      const res = await fetch('/api/access/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, approved, adminNotes: notes || undefined }),
      });
      if (!res.ok) throw new Error('Failed to process request');
      toast.success(`Request ${approved ? 'approved' : 'rejected'} successfully`);
      setSelectedRequest(null);
      fetchRequests(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to permanently delete this access request?')) {
      return;
    }
    try {
      const res = await fetch('/api/access/approve', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) throw new Error('Failed to delete request');
      toast.success('Request deleted successfully');
      setSelectedRequest(null);
      fetchRequests(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <AdminTableSkeleton
          title="Access Requests"
          description="Manage developer access requests"
          headers={['User', 'Phone', 'Use Case', 'Requested At', 'Status', 'Actions']}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      {/* Details modal */}
      <DetailsModal
        request={selectedRequest}
        processingId={processingId}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApproval}
        onDelete={handleDeleteRequest}
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">Access Requests</h1>
            <p className="text-sm text-muted-foreground">Review and approve user access requests</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('pending')}
            >
              <Clock className="mr-1.5 size-3.5" />
              Pending
            </Button>
            <Button
              variant={statusFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('approved')}
            >
              <Check className="mr-1.5 size-3.5" />
              Approved
            </Button>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('all')}
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
                <p className="mt-1 text-sm text-muted-foreground">
                  {statusFilter === 'pending'
                    ? 'All caught up! No pending requests.'
                    : 'No requests match the current filter.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden sm:table-cell">Use Case</TableHead>
                      <TableHead className="hidden md:table-cell">Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => {
                      const userStatus = req.user?.status ?? 'pending';
                      const isApproved = userStatus === 'approved';
                      const isRejected = userStatus === 'rejected';
                      const isAlreadyDecided = isApproved || isRejected;

                      return (
                        <TableRow
                          key={req.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="size-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate max-w-[120px] sm:max-w-none">
                                  {req.user?.name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                                  {req.user?.phoneNumber}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <p className="line-clamp-1 max-w-xs text-sm text-muted-foreground">
                              {req.useCase || <span className="italic">Not provided</span>}
                            </p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="size-3.5 text-muted-foreground" />
                              {new Date(req.requestedAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isAlreadyDecided ? 'secondary' : 'outline'}
                              className={
                                isApproved
                                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                                  : isRejected
                                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                                    : 'text-amber-700 border-amber-500/40'
                              }
                            >
                              {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {/* biome-ignore lint/a11y/noStaticElementInteractions: stops propagation from triggering row click */}
                            {/* biome-ignore lint/a11y/useKeyWithClickEvents: wrapper div only stops propagation */}
                            <div
                              className="flex items-center justify-end gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => setSelectedRequest(req)}
                              >
                                <Eye className="size-3.5" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive p-2"
                                onClick={() => handleDeleteRequest(req.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="p-4">
                  <Pagination
                    page={page}
                    perPage={perPage}
                    total={total}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
