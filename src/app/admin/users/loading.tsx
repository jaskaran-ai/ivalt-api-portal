import AdminShell from '@/components/layout/AdminShell';
import { AdminTableSkeleton } from '@/components/ui/skeletons';

export default function AdminUsersLoading() {
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
