'use client';

import { StatsCard, Card, CardContent, CardHeader, CardTitle } from '@tecno-gamerz/ui';

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Admin Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value="1,337"
          change="+23 this week"
          changeType="positive"
          icon={<UsersIcon />}
        />
        <StatsCard
          title="Active Tournaments"
          value="42"
          change="+5 this month"
          changeType="positive"
          icon={<TournamentIcon />}
        />
        <StatsCard
          title="Total Videos"
          value="856"
          change="+89 this week"
          changeType="positive"
          icon={<VideoIcon />}
        />
        <StatsCard
          title="Revenue"
          value="$12,543"
          change="+8.3% from last month"
          changeType="positive"
          icon={<DollarIcon />}
        />
      </div>

      {/* Admin Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UsersIcon className="h-5 w-5 text-gaming-neon" />
              <span>User Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage user accounts, roles, and permissions.
            </p>
            <div className="space-y-2">
              <a href="/admin/users" className="block text-sm text-gaming-neon hover:underline">
                → View All Users
              </a>
              <a href="/admin/roles" className="block text-sm text-gaming-neon hover:underline">
                → Manage Roles
              </a>
              <a href="/admin/permissions" className="block text-sm text-gaming-neon hover:underline">
                → Configure Permissions
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TournamentIcon className="h-5 w-5 text-gaming-electric" />
              <span>Tournament Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Oversee tournaments and competitions.
            </p>
            <div className="space-y-2">
              <a href="/admin/tournaments" className="block text-sm text-gaming-electric hover:underline">
                → All Tournaments
              </a>
              <a href="/admin/tournaments/pending" className="block text-sm text-gaming-electric hover:underline">
                → Pending Approval
              </a>
              <a href="/admin/tournaments/reports" className="block text-sm text-gaming-electric hover:underline">
                → Tournament Reports
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <VideoIcon className="h-5 w-5 text-gaming-purple" />
              <span>Content Moderation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Review and moderate user-generated content.
            </p>
            <div className="space-y-2">
              <a href="/admin/videos" className="block text-sm text-gaming-purple hover:underline">
                → Review Videos
              </a>
              <a href="/admin/comments" className="block text-sm text-gaming-purple hover:underline">
                → Moderate Comments
              </a>
              <a href="/admin/reports" className="block text-sm text-gaming-purple hover:underline">
                → Content Reports
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AnalyticsIcon className="h-5 w-5 text-gaming-orange" />
              <span>Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View platform analytics and insights.
            </p>
            <div className="space-y-2">
              <a href="/admin/analytics/users" className="block text-sm text-gaming-orange hover:underline">
                → User Analytics
              </a>
              <a href="/admin/analytics/engagement" className="block text-sm text-gaming-orange hover:underline">
                → Engagement Metrics
              </a>
              <a href="/admin/analytics/revenue" className="block text-sm text-gaming-orange hover:underline">
                → Revenue Reports
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-gaming-red" />
              <span>Platform Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Configure platform-wide settings.
            </p>
            <div className="space-y-2">
              <a href="/admin/settings/general" className="block text-sm text-gaming-red hover:underline">
                → General Settings
              </a>
              <a href="/admin/settings/features" className="block text-sm text-gaming-red hover:underline">
                → Feature Flags
              </a>
              <a href="/admin/settings/integrations" className="block text-sm text-gaming-red hover:underline">
                → Integrations
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SecurityIcon className="h-5 w-5 text-gaming-neon" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Monitor security and audit logs.
            </p>
            <div className="space-y-2">
              <a href="/admin/security/audit-logs" className="block text-sm text-gaming-neon hover:underline">
                → Audit Logs
              </a>
              <a href="/admin/security/sessions" className="block text-sm text-gaming-neon hover:underline">
                → Active Sessions
              </a>
              <a href="/admin/security/blocked-ips" className="block text-sm text-gaming-neon hover:underline">
                → Blocked IPs
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admin Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-gaming-neon" />
              <span>New user registered: gamer123@example.com</span>
              <span className="text-muted-foreground">5 minutes ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-gaming-electric" />
              <span>Tournament "Pro Championship" approved</span>
              <span className="text-muted-foreground">1 hour ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-gaming-purple" />
              <span>Content moderation: 3 videos reviewed</span>
              <span className="text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-gaming-orange" />
              <span>System backup completed successfully</span>
              <span className="text-muted-foreground">4 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Icon components
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

function TournamentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SecurityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}