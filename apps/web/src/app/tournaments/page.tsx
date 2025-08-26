'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import type { Tournament, PublicUser, TournamentStatus } from '@tecno-gamerz/types';
import { Calendar, Users, Trophy, Gamepad2, Search, Plus, Crown } from 'lucide-react';

export default function TournamentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTournaments, setTotalTournaments] = useState(0);

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
    loadTournaments();
  }, [page, searchTerm, gameFilter, statusFilter]);

  const loadTournaments = async () => {
    try {
      setIsLoading(true);
      const filters: any = {
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      if (searchTerm) filters.search = searchTerm;
      if (gameFilter) filters.game = gameFilter;
      if (statusFilter) filters.status = statusFilter;

      const response = await apiClient.getTournaments(filters);

      if (response.success && response.data) {
        setTournaments(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalTournaments(response.data.pagination.total);
      } else {
        setError('Failed to load tournaments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      apiClient.setAccessToken(accessToken);
      const response = await apiClient.joinTournament(tournamentId);

      if (response.success) {
        // Reload tournaments to update participant count
        await loadTournaments();
        alert('Successfully joined tournament!');
      } else {
        alert('Failed to join tournament');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join tournament';
      if (message.includes('already participating')) {
        alert('You are already participating in this tournament');
      } else {
        alert(message);
      }
    }
  };

  const getTournamentStatus = (tournament: Tournament): TournamentStatus => {
    const now = new Date();
    const start = new Date(tournament.startDate);
    const end = new Date(tournament.endDate);

    if (now < start) return 'UPCOMING';
    if (now >= start && now <= end) return 'ACTIVE';
    return 'COMPLETED';
  };

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-500/20 text-blue-300';
      case 'ACTIVE': return 'bg-green-500/20 text-green-300';
      case 'COMPLETED': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
                  className="text-gaming-neon"
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
              {user && (
                <>
                  <Button
                    onClick={() => router.push('/tournaments/create')}
                    className="bg-gaming-neon hover:bg-gaming-neon/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tournament
                  </Button>
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
              Gaming Tournaments
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join epic tournaments, compete with the best, and win amazing prizes. 
              Tournaments marked with the crown are <strong>Tecno Gamerz Official</strong>!
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
              <CardContent className="flex items-center p-4">
                <Trophy className="w-8 h-8 text-gaming-neon mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gaming-neon">{totalTournaments}</p>
                  <p className="text-xs text-muted-foreground">Total Tournaments</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-gaming-electric/20">
              <CardContent className="flex items-center p-4">
                <Users className="w-8 h-8 text-gaming-electric mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gaming-electric">
                    {tournaments.reduce((sum, t) => sum + (t.participantCount || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Participants</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-gaming-purple/20">
              <CardContent className="flex items-center p-4">
                <Gamepad2 className="w-8 h-8 text-gaming-purple mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gaming-purple">
                    {new Set(tournaments.map(t => t.game)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Different Games</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Games</SelectItem>
                <SelectItem value="Call of Duty">Call of Duty</SelectItem>
                <SelectItem value="Fortnite">Fortnite</SelectItem>
                <SelectItem value="Valorant">Valorant</SelectItem>
                <SelectItem value="PUBG">PUBG</SelectItem>
                <SelectItem value="Minecraft">Minecraft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TournamentStatus | '')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tournament Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-neon mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading tournaments...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => {
                const status = getTournamentStatus(tournament);
                return (
                  <Card 
                    key={tournament.id} 
                    className="bg-card/50 backdrop-blur border-gaming-neon/20 hover:border-gaming-neon/40 transition-colors cursor-pointer"
                    onClick={() => router.push(`/tournaments/${tournament.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {tournament.isTecnoGamerzOfficial && (
                            <Crown className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className="line-clamp-1">{tournament.title}</span>
                        </CardTitle>
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {tournament.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-muted-foreground">
                          <Gamepad2 className="w-4 h-4 mr-1" />
                          {tournament.game}
                        </span>
                        <span className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-1" />
                          {tournament.participantCount || 0}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(tournament.startDate)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/tournaments/${tournament.id}`);
                          }}
                        >
                          View Details
                        </Button>
                        {status !== 'COMPLETED' && (
                          <Button
                            size="sm"
                            className="flex-1 bg-gaming-neon hover:bg-gaming-neon/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinTournament(tournament.id);
                            }}
                          >
                            Join
                          </Button>
                        )}
                      </div>

                      {tournament.isTecnoGamerzOfficial && (
                        <div className="flex items-center justify-center p-2 bg-yellow-500/10 rounded-lg">
                          <Crown className="w-4 h-4 text-yellow-500 mr-2" />
                          <span className="text-sm text-yellow-500 font-medium">
                            Tecno Gamerz Official
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && tournaments.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No tournaments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || gameFilter || statusFilter
                  ? 'Try adjusting your filters or search terms.'
                  : 'Be the first to create an amazing tournament!'}
              </p>
              {user && (
                <Button
                  onClick={() => router.push('/tournaments/create')}
                  className="bg-gaming-neon hover:bg-gaming-neon/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tournament
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}