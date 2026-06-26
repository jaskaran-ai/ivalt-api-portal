import AdminShell from '@/components/layout/AdminShell';
import { AdminTableSkeleton } from '@/components/ui/skeletons';

export default function AdminKeysLoading() {
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
