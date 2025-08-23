'use client';

import { StatsCard, Card, CardContent, CardHeader, CardTitle } from '@tecno-gamerz/ui';
import { RequireRole, When } from '@tecno-gamerz/ui/auth';
import type { Role } from '@tecno-gamerz/types';

interface DashboardOverviewProps {
  user: {
    id: string;
    email: string;
    username?: string;
    image?: string;
    roles: Role[];
  };
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const displayName = user.username || user.email.split('@')[0];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-gaming-purple/10 to-gaming-electric/10 p-6">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {displayName}! 🎮
        </h2>
        <p className="text-muted-foreground">
          {user.roles.includes('ADMIN') && "You have admin access to manage the platform."}
          {user.roles.includes('GAMER') && !user.roles.includes('ADMIN') && "Ready to create content and host tournaments?"}
          {user.roles.includes('FAN') && !user.roles.includes('GAMER') && !user.roles.includes('ADMIN') && "Discover tournaments and connect with the gaming community."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Your Rank"
          value="#1,337"
          change="+23 this week"
          changeType="positive"
          icon={<TrophyIcon />}
        />
        <StatsCard
          title="Tournaments Joined"
          value="12"
          change="+3 this month"
          changeType="positive"
          icon={<GamepadIcon />}
        />
        <StatsCard
          title="Videos Watched"
          value="89"
          change="+15 this week"
          changeType="positive"
          icon={<VideoIcon />}
        />
        <StatsCard
          title="Community Points"
          value="2,847"
          change="+127 today"
          changeType="positive"
          icon={<StarIcon />}
        />
      </div>

      {/* Role-specific sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Admin Section */}
        <RequireRole roles={['ADMIN']} userRoles={user.roles}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldIcon className="h-5 w-5 text-gaming-red" />
                <span>Admin Dashboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage users, tournaments, and platform settings.
              </p>
              <div className="space-y-2">
                <a href="/admin/users" className="block text-sm text-gaming-neon hover:underline">
                  → Manage Users
                </a>
                <a href="/admin/analytics" className="block text-sm text-gaming-neon hover:underline">
                  → View Analytics
                </a>
                <a href="/admin/settings" className="block text-sm text-gaming-neon hover:underline">
                  → Platform Settings
                </a>
              </div>
            </CardContent>
          </Card>
        </RequireRole>

        {/* Gamer Section */}
        <RequireRole roles={['GAMER', 'ADMIN']} userRoles={user.roles}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <VideoIcon className="h-5 w-5 text-gaming-electric" />
                <span>Creator Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create content and manage your gaming presence.
              </p>
              <div className="space-y-2">
                <a href="/tournaments/create" className="block text-sm text-gaming-electric hover:underline">
                  → Create Tournament
                </a>
                <a href="/videos/upload" className="block text-sm text-gaming-electric hover:underline">
                  → Upload Video
                </a>
                <a href="/giveaways/create" className="block text-sm text-gaming-electric hover:underline">
                  → Host Giveaway
                </a>
              </div>
            </CardContent>
          </Card>
        </RequireRole>

        {/* Community Section - For all users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UsersIcon className="h-5 w-5 text-gaming-purple" />
              <span>Community</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Connect with other gamers and join the conversation.
            </p>
            <div className="space-y-2">
              <a href="/tournaments" className="block text-sm text-gaming-purple hover:underline">
                → Browse Tournaments
              </a>
              <a href="/videos" className="block text-sm text-gaming-purple hover:underline">
                → Watch Videos
              </a>
              <a href="/giveaways" className="block text-sm text-gaming-purple hover:underline">
                → Join Giveaways
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BoltIcon className="h-5 w-5 text-gaming-neon" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="block w-full text-left text-sm text-muted-foreground hover:text-foreground">
                → Update Profile
              </button>
              <button className="block w-full text-left text-sm text-muted-foreground hover:text-foreground">
                → Change Settings
              </button>
              <button className="block w-full text-left text-sm text-muted-foreground hover:text-foreground">
                → View Notifications
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-gaming-neon" />
              <span>Joined tournament "Pro League Championship"</span>
              <span className="text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-gaming-electric" />
              <span>Uploaded new gaming highlight</span>
              <span className="text-muted-foreground">1 day ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-gaming-purple" />
              <span>Won giveaway "Gaming Headset Pro"</span>
              <span className="text-muted-foreground">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Simple icon components
function TrophyIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function GamepadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}