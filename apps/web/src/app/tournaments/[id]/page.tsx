'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import type { Tournament, PublicUser, TournamentStatus, TournamentParticipant } from '@tecno-gamerz/types';
import { 
  Calendar, 
  Users, 
  Trophy, 
  Gamepad2, 
  ArrowLeft, 
  Crown, 
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  MapPin,
  Clock,
  Video
} from 'lucide-react';
import { StreamEmbed } from '@/components/ui/stream-embed';

export default function TournamentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;
  
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [userParticipation, setUserParticipation] = useState<TournamentParticipant | null>(null);

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
    loadTournament();
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getTournament(tournamentId, true);

      if (response.success && response.data) {
        setTournament(response.data);
        
        // Extract participants if included
        if (response.data.participants) {
          setParticipants(response.data.participants);
          
          // Check if current user is participating
          if (user) {
            const userParticipant = response.data.participants.find(
              p => p.userId === user.id
            );
            setUserParticipation(userParticipant || null);
          }
        }
      } else {
        setError('Tournament not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournament');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTournament = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsJoining(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      apiClient.setAccessToken(accessToken);
      const response = await apiClient.joinTournament(tournamentId);

      if (response.success) {
        await loadTournament(); // Reload to update participant list
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
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTournament = async () => {
    if (!user || !userParticipation) return;

    if (!confirm('Are you sure you want to leave this tournament?')) return;

    setIsLeaving(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      apiClient.setAccessToken(accessToken);
      const response = await apiClient.leaveTournament(tournamentId);

      if (response.success) {
        await loadTournament(); // Reload to update participant list
        alert('Successfully left tournament');
      } else {
        alert('Failed to leave tournament');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to leave tournament');
    } finally {
      setIsLeaving(false);
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatTimeUntil = (date: string | Date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days, ${hours} hours`;
    return `${hours} hours`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-neon"></div>
          <p className="mt-4 text-muted-foreground">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || 'Tournament not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const status = getTournamentStatus(tournament);
  const canJoin = user && status !== 'COMPLETED' && !userParticipation;
  const canLeave = user && userParticipation && status !== 'COMPLETED';
  const canEdit = user && (tournament.createdById === user.id || user.role === 'ADMIN');

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
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/tournaments')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </Button>

          {/* Tournament Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {tournament.isTecnoGamerzOfficial && (
                    <Crown className="w-8 h-8 text-yellow-500" />
                  )}
                  <h1 className="text-4xl font-bold text-foreground">
                    {tournament.title}
                  </h1>
                  <Badge className={getStatusColor(status)} size="lg">
                    {status}
                  </Badge>
                </div>
                {tournament.isTecnoGamerzOfficial && (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <span className="font-medium">Tecno Gamerz Official Tournament</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/tournaments/${tournament.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {canJoin && (
                  <Button
                    onClick={handleJoinTournament}
                    disabled={isJoining}
                    className="bg-gaming-neon hover:bg-gaming-neon/90"
                  >
                    {isJoining ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Tournament
                      </>
                    )}
                  </Button>
                )}
                {canLeave && (
                  <Button
                    variant="outline"
                    onClick={handleLeaveTournament}
                    disabled={isLeaving}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    {isLeaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                        Leaving...
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Leave Tournament
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="flex items-center p-4">
                  <Gamepad2 className="w-6 h-6 text-gaming-neon mr-3" />
                  <div>
                    <p className="font-medium text-gaming-neon">{tournament.game}</p>
                    <p className="text-xs text-muted-foreground">Game</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="flex items-center p-4">
                  <Users className="w-6 h-6 text-gaming-electric mr-3" />
                  <div>
                    <p className="font-medium text-gaming-electric">{tournament.participantCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Participants</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="flex items-center p-4">
                  <Calendar className="w-6 h-6 text-gaming-purple mr-3" />
                  <div>
                    <p className="font-medium text-gaming-purple">{formatTimeUntil(tournament.startDate)}</p>
                    <p className="text-xs text-muted-foreground">Until Start</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur">
                <CardContent className="flex items-center p-4">
                  <Clock className="w-6 h-6 text-yellow-500 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-500">
                      {Math.round((new Date(tournament.endDate).getTime() - new Date(tournament.startDate).getTime()) / (1000 * 60 * 60))}h
                    </p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tournament Details */}
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className={`grid w-full ${tournament.streamUrl ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="participants">Participants ({tournament.participantCount || 0})</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              {tournament.streamUrl && (
                <TabsTrigger value="stream">
                  <Video className="w-4 h-4 mr-2" />
                  Live Stream
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-card/50 backdrop-blur">
                    <CardHeader>
                      <CardTitle>About This Tournament</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {tournament.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Tournament Info */}
                  <Card className="bg-card/50 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-lg">Tournament Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Organizer</p>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={tournament.createdBy?.image} />
                            <AvatarFallback>
                              {tournament.createdBy?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{tournament.createdBy?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              @{tournament.createdBy?.username || 'unknown'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Start Date</p>
                        <p className="text-foreground">{formatDate(tournament.startDate)}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">End Date</p>
                        <p className="text-foreground">{formatDate(tournament.endDate)}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                        <p className="text-foreground">
                          {new Date(tournament.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Participation Status */}
                  {user && (
                    <Card className="bg-card/50 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-lg">Your Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userParticipation ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-400">
                              <Trophy className="w-4 h-4" />
                              <span className="font-medium">Participating</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Joined on {new Date(userParticipation.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>Not participating</span>
                            </div>
                            {status !== 'COMPLETED' && (
                              <p className="text-sm text-muted-foreground">
                                Join now to participate in this tournament!
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="participants">
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Participants ({participants.length})</CardTitle>
                  <CardDescription>
                    Players who have joined this tournament
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {participants.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No participants yet</p>
                      <p className="text-sm text-muted-foreground">Be the first to join!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {participants.map((participant, index) => (
                        <div
                          key={participant.id}
                          className="flex items-center gap-3 p-4 bg-background/50 rounded-lg"
                        >
                          <Avatar>
                            <AvatarImage src={participant.user?.image} />
                            <AvatarFallback>
                              {participant.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {participant.user?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              @{participant.user?.username || 'unknown'}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Tournament Schedule</CardTitle>
                  <CardDescription>
                    Important dates and times for this tournament
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg">
                      <div className="w-2 h-16 bg-gaming-neon rounded-full"></div>
                      <div className="flex-1">
                        <h3 className="font-medium">Tournament Start</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(tournament.startDate)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registration closes and tournament begins
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg">
                      <div className="w-2 h-16 bg-gaming-electric rounded-full"></div>
                      <div className="flex-1">
                        <h3 className="font-medium">Tournament End</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(tournament.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Final matches and winner announcement
                        </p>
                      </div>
                    </div>

                    {status === 'UPCOMING' && (
                      <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Clock className="w-8 h-8 text-blue-400" />
                        <div>
                          <h3 className="font-medium text-blue-300">Registration Open</h3>
                          <p className="text-sm text-muted-foreground">
                            Tournament starts in {formatTimeUntil(tournament.startDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    {status === 'ACTIVE' && (
                      <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <Trophy className="w-8 h-8 text-green-400" />
                        <div>
                          <h3 className="font-medium text-green-300">Tournament Live!</h3>
                          <p className="text-sm text-muted-foreground">
                            Tournament is currently active
                          </p>
                        </div>
                      </div>
                    )}

                    {status === 'COMPLETED' && (
                      <div className="flex items-center gap-4 p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                        <Trophy className="w-8 h-8 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-300">Tournament Completed</h3>
                          <p className="text-sm text-muted-foreground">
                            This tournament has ended
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {tournament.streamUrl && (
              <TabsContent value="stream">
                <Card className="bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Live Stream
                      {tournament.isTecnoGamerzOfficial && (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          Official Stream
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {status === 'ACTIVE' 
                        ? 'Watch the tournament live!' 
                        : status === 'UPCOMING' 
                        ? 'Stream will be available when the tournament starts'
                        : 'Tournament stream has ended'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StreamEmbed
                      url={tournament.streamUrl}
                      title={tournament.title}
                      isOfficialStream={tournament.isTecnoGamerzOfficial}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}