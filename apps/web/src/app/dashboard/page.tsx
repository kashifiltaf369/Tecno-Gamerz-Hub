import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DashboardLayout } from '@tecno-gamerz/ui';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { PageHeader } from '@/components/ui/page-header';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout 
      user={session.user}
      onSignOut={async () => {
        'use server';
        // This will be handled by the client component
      }}
    >
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's what's happening in your gaming world."
        />
        
        <DashboardOverview user={session.user} />
      </div>
    </DashboardLayout>
  );
}