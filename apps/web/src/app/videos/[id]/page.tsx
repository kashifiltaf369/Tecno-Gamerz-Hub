'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import { 
  Play, 
  Heart, 
  Share2, 
  Crown,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  FileText,
  PlayCircle,
  Trophy,
  Scissors,
  ArrowLeft,
  Calendar,
  Tag,
  User
} from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description?: string;
  youtubeId: string;
  duration?: number;
  publishedAt?: string;
  thumbnails?: any;
  tags: string[];
  transcript?: string;
  views: number;
  channel: {
    id: string;
    name: string;
    externalId: string;
  };
  createdAt: string;
  updatedAt: string;
  isOfficial?: boolean;
  userProgress?: {
    watchProgress: number;
    hasLiked: boolean;
    hasCompleted: boolean;
    quizzesCompleted: number;
    likedClips: string[];
  };
  videoQuizzes?: any[];
  videoClips?: any[];
  relatedVideos?: Video[];
}

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [user, setUser] = useState<any>(null);

  const apiClient = createBrowserApiClient();

  // Load video data
  const loadVideo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Check if user is authenticated
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        apiClient.setAccessToken(accessToken);
        // Get user data
        try {
          const userResponse = await apiClient.me();
          if (userResponse.success) {
            setUser(userResponse.data);
          }
        } catch (err) {
          console.error('Failed to get user data:', err);
        }
      }

      const response = await fetch(`/api/videos/${params.id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setVideo(data.data);
        if (data.data.userProgress) {
          setWatchProgress(data.data.userProgress.watchProgress);
        }
      } else {
        setError(data.message || 'Failed to load video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  // Record watch progress
  const updateWatchProgress = useCallback(async (progress: number) => {
    if (!user || !video) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      apiClient.setAccessToken(accessToken);
      
      await fetch(`/api/videos/${video.id}/interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'WATCH',
          progress: Math.round(progress),
        }),
      });

      setWatchProgress(progress);

      // Auto-complete at 90%
      if (progress >= 90 && video.userProgress && !video.userProgress.hasCompleted) {
        await fetch(`/api/videos/${video.id}/interaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            action: 'COMPLETE',
          }),
        });
        
        // Update local state
        setVideo(prev => prev ? {
          ...prev,
          userProgress: prev.userProgress ? {
            ...prev.userProgress,
            hasCompleted: true,
          } : prev.userProgress,
        } : prev);
      }
    } catch (err) {
      console.error('Failed to update watch progress:', err);
    }
  }, [user, video]);

  // Toggle like
  const toggleLike = async () => {
    if (!user || !video) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch(`/api/videos/${video.id}/interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'LIKE',
        }),
      });

      if (response.ok) {
        setVideo(prev => prev ? {
          ...prev,
          userProgress: prev.userProgress ? {
            ...prev.userProgress,
            hasLiked: !prev.userProgress.hasLiked,
          } : prev.userProgress,
        } : prev);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
              </div>
            </div>
          </div>
        </nav>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="aspect-video bg-muted rounded-lg"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background">
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
              </div>
            </div>
          </div>
        </nav>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Video not found'}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/videos')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Videos
          </Button>
        </div>
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
                  onClick={() => router.push('/videos')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Videos
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                  title={video.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              
              {/* Progress Bar */}
              {user && video.userProgress && watchProgress > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                    <span>Watch Progress</span>
                    <span>{Math.round(watchProgress)}%</span>
                  </div>
                  <Progress value={watchProgress} className="h-2" />
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {video.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{video.channel.name}</span>
                      {video.isOfficial && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Official
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views.toLocaleString()} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(video.publishedAt || video.createdAt)}
                    </div>
                    {video.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {user && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={toggleLike}
                      className={`border-red-500/50 ${
                        video.userProgress?.hasLiked 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${video.userProgress?.hasLiked ? 'fill-current' : ''}`} />
                      {video.userProgress?.hasLiked ? 'Liked' : 'Like'}
                    </Button>
                    
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                )}
              </div>

              {/* Tags */}
              {video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="border-gaming-neon/30 text-gaming-neon/80 cursor-pointer hover:bg-gaming-neon/10"
                      onClick={() => router.push(`/videos?tag=${encodeURIComponent(tag)}`)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* User Progress Indicators */}
              {user && video.userProgress && (
                <div className="flex items-center gap-3 p-4 bg-card/50 rounded-lg">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Your Progress: </span>
                    <div className="flex items-center gap-3 mt-1">
                      {video.userProgress.hasCompleted && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          ✓ Completed
                        </Badge>
                      )}
                      {video.userProgress.quizzesCompleted > 0 && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          🎯 {video.userProgress.quizzesCompleted} Quiz{video.userProgress.quizzesCompleted > 1 ? 'zes' : ''}
                        </Badge>
                      )}
                      {video.videoClips && video.videoClips.length > 0 && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          <Scissors className="w-3 h-3 mr-1" />
                          {video.videoClips.length} Clip{video.videoClips.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {video.description && (
                <Card className="bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {video.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Transcript */}
              {video.transcript && (
                <Collapsible open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
                  <Card className="bg-card/50 backdrop-blur">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-card/70 transition-colors">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Transcript
                          </div>
                          {isTranscriptOpen ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="max-h-64 overflow-y-auto">
                          <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                            {video.transcript}
                          </p>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}

              {/* Tabs for additional content */}
              <Tabs defaultValue="clips" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="clips" className="flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Clips ({video.videoClips?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="quizzes" className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Quizzes ({video.videoQuizzes?.length || 0})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="clips" className="space-y-4">
                  {video.videoClips && video.videoClips.length > 0 ? (
                    <div className="space-y-3">
                      {video.videoClips.map((clip: any) => (
                        <Card key={clip.id} className="bg-card/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground mb-1">
                                  {clip.title}
                                </h4>
                                {clip.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {clip.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {clip.user.name || clip.user.username}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(clip.startTime)} - {formatDuration(clip.endTime)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {clip.views || 0} views
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  // Jump to clip time in video
                                  const iframe = document.querySelector('iframe') as HTMLIFrameElement;
                                  if (iframe) {
                                    iframe.src = `https://www.youtube.com/embed/${video.youtubeId}?start=${clip.startTime}&end=${clip.endTime}&autoplay=1`;
                                  }
                                }}
                              >
                                <PlayCircle className="w-4 h-4 mr-1" />
                                Play Clip
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Scissors className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No clips created yet</p>
                      {user && (
                        <p className="text-sm mt-1">Be the first to create a highlight!</p>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="quizzes" className="space-y-4">
                  {video.videoQuizzes && video.videoQuizzes.length > 0 ? (
                    <div className="space-y-3">
                      {video.videoQuizzes.map((quiz: any) => (
                        <Card key={quiz.id} className="bg-card/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground mb-1">
                                  {quiz.title}
                                </h4>
                                {quiz.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {quiz.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div>Rewards: {quiz.xpReward} XP, {quiz.coinsReward} Coins</div>
                                  <div>{quiz.questions?.length || 0} Questions</div>
                                </div>
                              </div>
                              <Button size="sm" className="bg-gaming-neon hover:bg-gaming-neon/90">
                                <Trophy className="w-4 h-4 mr-1" />
                                Take Quiz
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No quizzes available</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Videos */}
            {video.relatedVideos && video.relatedVideos.length > 0 && (
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Related Videos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {video.relatedVideos.map((relatedVideo) => (
                    <div
                      key={relatedVideo.id}
                      className="flex gap-3 cursor-pointer hover:bg-card/50 p-2 rounded-lg transition-colors"
                      onClick={() => router.push(`/videos/${relatedVideo.id}`)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${relatedVideo.youtubeId}/mqdefault.jpg`}
                        alt={relatedVideo.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                          {relatedVideo.title}
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          <div>{relatedVideo.channel.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span>{relatedVideo.views.toLocaleString()} views</span>
                            {relatedVideo.duration && (
                              <span>{formatDuration(relatedVideo.duration)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}