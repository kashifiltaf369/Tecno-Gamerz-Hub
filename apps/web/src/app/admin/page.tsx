import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardLayout } from '@tecno-gamerz/ui';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { PageHeader, Container } from '@/components/ui/page-header';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check if user has admin role
  if (!session.user.roles?.includes('ADMIN')) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-8">
        <PageHeader
          title="Admin Dashboard"
          description="Manage users, content, and platform settings."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin' },
          ]}
        />
        
        <AdminDashboard />
      </div>
    </DashboardLayout>
  );
}