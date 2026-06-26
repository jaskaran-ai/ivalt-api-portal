import AdminShell from '@/components/layout/AdminShell';
import { AdminDashboardSkeleton } from '@/components/ui/skeletons';

export default function AdminDashboardLoading() {
  return (
    <AdminShell>
      <AdminDashboardSkeleton />
    </AdminShell>
  );
}
