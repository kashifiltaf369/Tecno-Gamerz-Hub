'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import XpProgressBar from '@/components/gamification/XpProgressBar';
import BadgeDisplay, { AllBadgesGrid } from '@/components/gamification/BadgeDisplay';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import type { PublicUser, UserRankStats, MatchResult, UserGameProfile, ProfileStats } from '@tecno-gamerz/types';
import { Trophy, Crown, Medal, Users, Target, Star, Calendar, Gamepad2, TrendingUp, Zap, Award } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [userStats, setUserStats] = useState<UserRankStats | null>(null);
  const [gameProfile, setGameProfile] = useState<UserGameProfile | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
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
            setCurrentUser(response.data);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserStats();
    }
  }, [userId]);

  const loadUserStats = async () => {
    try {
      setIsLoading(true);
      
      // Load both leaderboard stats and game profile
      const [statsResponse, profileResponse] = await Promise.all([
        apiClient.getUserRankStats(userId),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/users/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }).then(res => res.json()).catch(() => ({ success: false }))
      ]);

      if (statsResponse.success && statsResponse.data) {
        setUserStats(statsResponse.data);
      }

      if (profileResponse.success && profileResponse.data) {
        setGameProfile(profileResponse.data.gameProfile);
        setProfileStats(profileResponse.data.stats);
      }

      if (!statsResponse.success && !profileResponse.success) {
        setError('Failed to load user profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
          <Trophy className="w-3 h-3 mr-1" />
          Champion
        </Badge>
      );
    } else if (rank <= 3) {
      return (
        <Badge className="bg-amber-600/20 text-amber-600 border-amber-600/30">
          <Medal className="w-3 h-3 mr-1" />
          Top 3
        </Badge>
      );
    } else if (rank <= 10) {
      return (
        <Badge className="bg-gaming-neon/20 text-gaming-neon border-gaming-neon/30">
          Top 10
        </Badge>
      );
    } else if (rank <= 100) {
      return (
        <Badge className="bg-gaming-electric/20 text-gaming-electric border-gaming-electric/30">
          Top 100
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          #{rank}
        </Badge>
      );
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
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
                  onClick={() => router.push('/leaderboard')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Leaderboard
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {currentUser.name || currentUser.username || 'Gamer'}!
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
              {!currentUser && (
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
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Leaderboard
          </Button>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-neon mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
          ) : userStats ? (
            <>
              {/* Profile Header */}
              <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
                <CardHeader>
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={userStats.user.image || ''} />
                      <AvatarFallback className="text-xl">
                        {getInitials(userStats.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-3xl">{userStats.user.name}</CardTitle>
                        {getRankBadge(userStats.rank)}
                      </div>
                      <CardDescription className="text-lg">
                        @{userStats.user.username}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gaming-neon">
                            {userStats.user.totalPoints?.toLocaleString() || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Total Points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gaming-electric">#{userStats.rank}</p>
                          <p className="text-xs text-muted-foreground">Global Rank</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gaming-purple">{userStats.percentile}%</p>
                          <p className="text-xs text-muted-foreground">Percentile</p>
                        </div>
                        {gameProfile && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-500">
                              Lv.{gameProfile.level}
                            </p>
                            <p className="text-xs text-muted-foreground">Level</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* XP Progress and Badges */}
              {gameProfile && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* XP Progress */}
                  <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-gaming-electric" />
                        Experience Progress
                      </CardTitle>
                      <CardDescription>
                        Level progression and XP statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <XpProgressBar 
                        levelInfo={gameProfile.levelInfo}
                        totalXp={gameProfile.xp}
                        showDetails={true}
                      />
                    </CardContent>
                  </Card>

                  {/* Badges */}
                  <Card className="bg-card/50 backdrop-blur border-gaming-purple/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-gaming-purple" />
                        Achievement Badges
                      </CardTitle>
                      <CardDescription>
                        Earned badges and accomplishments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BadgeDisplay 
                        badges={gameProfile.badges}
                        showAllBadges={true}
                        size="md"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* All Badges Grid */}
              {gameProfile && (
                <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
                  <CardHeader>
                    <CardTitle>Badge Collection</CardTitle>
                    <CardDescription>
                      Track your progress towards earning all badges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AllBadgesGrid earnedBadges={gameProfile.badges} />
                  </CardContent>
                </Card>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
                  <CardContent className="flex items-center p-4">
                    <Users className="w-8 h-8 text-gaming-neon mr-3" />
                    <div>
                      <p className="text-xl font-bold text-gaming-neon">
                        {userStats.rank} / {userStats.totalUsers}
                      </p>
                      <p className="text-xs text-muted-foreground">Global Ranking</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur border-yellow-500/20">
                  <CardContent className="flex items-center p-4">
                    <Crown className="w-8 h-8 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-xl font-bold text-yellow-500">
                        {userStats.pointsFromOfficialTournaments.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Official Points</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur border-gaming-electric/20">
                  <CardContent className="flex items-center p-4">
                    <Trophy className="w-8 h-8 text-gaming-electric mr-3" />
                    <div>
                      <p className="text-xl font-bold text-gaming-electric">
                        {userStats.pointsFromRegularTournaments.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Regular Points</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur border-gaming-purple/20">
                  <CardContent className="flex items-center p-4">
                    <TrendingUp className="w-8 h-8 text-gaming-purple mr-3" />
                    <div>
                      <p className="text-xl font-bold text-gaming-purple">
                        {userStats.percentile}th
                      </p>
                      <p className="text-xs text-muted-foreground">Percentile</p>
                    </div>
                  </CardContent>
                </Card>

                {profileStats && (
                  <>
                    <Card className="bg-card/50 backdrop-blur border-blue-500/20">
                      <CardContent className="flex items-center p-4">
                        <Gamepad2 className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                          <p className="text-xl font-bold text-blue-500">
                            {profileStats.totalTournaments}
                          </p>
                          <p className="text-xs text-muted-foreground">Tournaments</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur border-green-500/20">
                      <CardContent className="flex items-center p-4">
                        <Target className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                          <p className="text-xl font-bold text-green-500">
                            {profileStats.winRate}%
                          </p>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Points Breakdown */}
              <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
                <CardHeader>
                  <CardTitle>Points Breakdown</CardTitle>
                  <CardDescription>
                    Distribution of points from different tournament types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Official Tournaments (1.5x multiplier)
                      </span>
                      <span className="font-semibold">
                        {userStats.pointsFromOfficialTournaments.toLocaleString()} pts
                      </span>
                    </div>
                    <Progress 
                      value={(userStats.pointsFromOfficialTournaments / (userStats.user.totalPoints || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-gaming-electric" />
                        Regular Tournaments
                      </span>
                      <span className="font-semibold">
                        {userStats.pointsFromRegularTournaments.toLocaleString()} pts
                      </span>
                    </div>
                    <Progress 
                      value={(userStats.pointsFromRegularTournaments / (userStats.user.totalPoints || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Match Results */}
              <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
                <CardHeader>
                  <CardTitle>Recent Match Results</CardTitle>
                  <CardDescription>
                    Latest tournament performances and points earned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userStats.recentResults.length > 0 ? (
                    <div className="space-y-3">
                      {userStats.recentResults.map((result) => (
                        <div 
                          key={result.id}
                          className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-gaming-neon/10"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-2">
                              <Gamepad2 className="w-5 h-5 text-gaming-neon" />
                              <div>
                                <p className="font-medium flex items-center gap-2">
                                  {result.tournament?.title}
                                  {result.tournament?.isTecnoGamerzOfficial && (
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {result.tournament?.game} • {formatDate(result.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gaming-neon">
                              +{result.awardedPoints} pts
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Score: {result.score}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No match results yet</p>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/tournaments')}
                        className="mt-3"
                      >
                        Join a Tournament
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}