import AdminShell from '@/components/layout/AdminShell';
import { AdminTableSkeleton } from '@/components/ui/skeletons';

export default function AdminRequestsLoading() {
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
