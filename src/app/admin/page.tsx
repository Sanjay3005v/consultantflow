import AdminConsole from '@/components/admin-console';
import { getAllConsultants } from '@/lib/data';

export default function AdminPage() {
  const consultants = getAllConsultants();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Console</h1>
        <p className="text-muted-foreground">Manage, search, and generate reports for consultants.</p>
      </div>
      <AdminConsole consultants={consultants} />
    </div>
  );
}
