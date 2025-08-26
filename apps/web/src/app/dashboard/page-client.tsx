'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import type { PublicUser } from '@tecno-gamerz/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const apiClient = createBrowserApiClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
          router.push('/login');
          return;
        }

        apiClient.setAccessToken(accessToken);
        const response = await apiClient.me();

        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Token might be expired, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/login');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
        // Redirect to login on error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [apiClient, router]);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-neon"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b border-gaming-neon/20 bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gaming-neon to-gaming-electric bg-clip-text text-transparent">
                Tecno Gamerz Hub
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name || user?.username || 'Gamer'}!
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-gaming-neon/50 hover:bg-gaming-neon/10"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here&apos;s what&apos;s happening in your gaming world.
            </p>
          </div>

          {/* User Info Card */}
          <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Your Profile</span>
                <span className="px-2 py-1 text-xs bg-gaming-neon/20 text-gaming-neon rounded-full">
                  {user?.role}
                </span>
              </CardTitle>
              <CardDescription>
                Your account information and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-foreground">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-foreground">{user?.username || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-foreground capitalize">{user?.status?.toLowerCase()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gaming-neon">0</p>
                <p className="text-xs text-muted-foreground">Participated</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-gaming-electric/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gaming-electric">0</p>
                <p className="text-xs text-muted-foreground">Uploaded</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-gaming-purple/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gaming-purple">0</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Welcome Message */}
          <Card className="bg-gradient-to-r from-gaming-neon/10 to-gaming-electric/10 border-gaming-neon/20">
            <CardHeader>
              <CardTitle>🎮 Welcome to Tecno Gamerz Hub!</CardTitle>
              <CardDescription>
                Your gaming journey starts here. This is the first working feature of the platform!
              </CardDescription>
            </CardContent>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Authentication is now fully functional. You can register, login, and access your profile.
                More exciting features like tournaments, video uploads, and community features are coming soon!
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled className="opacity-50">
                  Join Tournament (Coming Soon)
                </Button>
                <Button size="sm" disabled className="opacity-50">
                  Upload Video (Coming Soon)
                </Button>
                <Button size="sm" disabled className="opacity-50">
                  Browse Shop (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}