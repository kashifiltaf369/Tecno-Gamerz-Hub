'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import type { PublicUser, LeaderboardEntry, GlobalLeaderboardResponse } from '@tecno-gamerz/types';
import { Trophy, Crown, Medal, Users, Target, Star } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const apiClient = createBrowserApiClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          apiClient.setAccessToken(accessToken);
          const response = await apiClient.me();
          if (response.success && response.data) {
            setUser(response.data);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getGlobalLeaderboard({ limit: 50 });

      if (response.success && response.data) {
        setLeaderboard(response.data);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankCardStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-500/50 bg-yellow-500/5';
      case 2:
        return 'border-gray-400/50 bg-gray-400/5';
      case 3:
        return 'border-amber-600/50 bg-amber-600/5';
      default:
        return 'border-gaming-neon/20 bg-card/50';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
            <div className="flex items-center space-x-8">
              <h1 
                className="text-xl font-bold bg-gradient-to-r from-gaming-neon to-gaming-electric bg-clip-text text-transparent cursor-pointer"
                onClick={() => router.push('/')}
              >
                Tecno Gamerz Hub
              </h1>
              <nav className="hidden md:flex space-x-6">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/dashboard')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/tournaments')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Tournaments
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gaming-neon"
                >
                  Leaderboard
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.name || user.username || 'Gamer'}!
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                      router.push('/login');
                    }}
                    className="border-gaming-neon/50 hover:bg-gaming-neon/10"
                  >
                    Sign Out
                  </Button>
                </>
              )}
              {!user && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/login')}
                    className="border-gaming-neon/50 hover:bg-gaming-neon/10"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push('/register')}
                    className="bg-gaming-neon hover:bg-gaming-neon/90"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Global Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See where you rank among the best gamers. Earn points by participating in tournaments - 
              <Crown className="inline w-5 h-5 text-yellow-500 mx-1" />
              <strong>Tecno Gamerz Official</strong> tournaments give 1.5x points!
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
              <CardContent className="flex items-center p-4">
                <Users className="w-8 h-8 text-gaming-neon mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gaming-neon">{leaderboard?.totalUsers || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Players</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-gaming-electric/20">
              <CardContent className="flex items-center p-4">
                <Target className="w-8 h-8 text-gaming-electric mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gaming-electric">
                    {leaderboard?.entries?.[0]?.totalPoints || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Top Player Score</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-gaming-purple/20">
              <CardContent className="flex items-center p-4">
                <Star className="w-8 h-8 text-gaming-purple mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gaming-purple">
                    {leaderboard?.entries?.filter(e => e.hasOfficialTournamentPoints).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Official Champions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-neon mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top 3 Podium */}
              {leaderboard && leaderboard.entries.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* 2nd Place */}
                  <Card className={`order-2 md:order-1 ${getRankCardStyle(2)} backdrop-blur`}>
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-2">
                        {getRankIcon(2)}
                      </div>
                      <div className="flex justify-center">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={leaderboard.entries[1].user.image || ''} />
                          <AvatarFallback>{getInitials(leaderboard.entries[1].user.name)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-lg flex items-center justify-center gap-2">
                        {leaderboard.entries[1].user.name}
                        {leaderboard.entries[1].hasOfficialTournamentPoints && (
                          <Crown className="w-4 h-4 text-yellow-500" title="Has Official Tournament Points" />
                        )}
                      </CardTitle>
                      <CardDescription>@{leaderboard.entries[1].user.username}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold text-gaming-electric">
                        {leaderboard.entries[1].totalPoints.toLocaleString()} pts
                      </p>
                    </CardContent>
                  </Card>

                  {/* 1st Place */}
                  <Card className={`order-1 md:order-2 ${getRankCardStyle(1)} backdrop-blur transform md:scale-105`}>
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-2">
                        {getRankIcon(1)}
                      </div>
                      <div className="flex justify-center">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={leaderboard.entries[0].user.image || ''} />
                          <AvatarFallback>{getInitials(leaderboard.entries[0].user.name)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-xl flex items-center justify-center gap-2">
                        {leaderboard.entries[0].user.name}
                        {leaderboard.entries[0].hasOfficialTournamentPoints && (
                          <Crown className="w-5 h-5 text-yellow-500" title="Has Official Tournament Points" />
                        )}
                      </CardTitle>
                      <CardDescription>@{leaderboard.entries[0].user.username}</CardDescription>
                      <Badge className="mt-2 bg-yellow-500/20 text-yellow-500">Champion</Badge>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-3xl font-bold text-yellow-500">
                        {leaderboard.entries[0].totalPoints.toLocaleString()} pts
                      </p>
                    </CardContent>
                  </Card>

                  {/* 3rd Place */}
                  <Card className={`order-3 md:order-3 ${getRankCardStyle(3)} backdrop-blur`}>
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-2">
                        {getRankIcon(3)}
                      </div>
                      <div className="flex justify-center">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={leaderboard.entries[2].user.image || ''} />
                          <AvatarFallback>{getInitials(leaderboard.entries[2].user.name)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="text-lg flex items-center justify-center gap-2">
                        {leaderboard.entries[2].user.name}
                        {leaderboard.entries[2].hasOfficialTournamentPoints && (
                          <Crown className="w-4 h-4 text-yellow-500" title="Has Official Tournament Points" />
                        )}
                      </CardTitle>
                      <CardDescription>@{leaderboard.entries[2].user.username}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {leaderboard.entries[2].totalPoints.toLocaleString()} pts
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Rest of Leaderboard */}
              {leaderboard && leaderboard.entries.length > 3 && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Top Players</h2>
                  {leaderboard.entries.slice(3).map((entry) => (
                    <Card 
                      key={entry.user.id} 
                      className={`${getRankCardStyle(entry.rank)} backdrop-blur hover:border-gaming-neon/40 transition-colors cursor-pointer`}
                      onClick={() => router.push(`/profile/${entry.user.id}`)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10">
                            {getRankIcon(entry.rank)}
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={entry.user.image || ''} />
                            <AvatarFallback>{getInitials(entry.user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-2">
                              {entry.user.name}
                              {entry.hasOfficialTournamentPoints && (
                                <Crown className="w-4 h-4 text-yellow-500" title="Has Official Tournament Points" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">@{entry.user.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gaming-neon">
                            {entry.totalPoints.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!leaderboard || leaderboard.entries.length === 0) && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No rankings yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to participate in tournaments and earn points!
              </p>
              <Button
                onClick={() => router.push('/tournaments')}
                className="bg-gaming-neon hover:bg-gaming-neon/90"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Browse Tournaments
              </Button>
            </div>
          )}

          {/* Footer Info */}
          {leaderboard && (
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Last updated: {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(leaderboard.lastUpdated))}
              </p>
              <p className="mt-1">
                <Crown className="inline w-4 h-4 text-yellow-500 mr-1" />
                Official tournaments provide 1.5x points bonus
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}