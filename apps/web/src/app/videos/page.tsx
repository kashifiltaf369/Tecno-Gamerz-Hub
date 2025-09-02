'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import { 
  Play, 
  Search, 
  Filter, 
  Crown,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Video,
  Calendar,
  Tag
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
  };
}

interface VideosResponse {
  videos: Video[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function VideosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState<VideosResponse['pagination'] | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [showOfficialOnly, setShowOfficialOnly] = useState(searchParams.get('official') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  
  // Available tags (could be fetched from API)
  const [availableTags] = useState([
    'Gaming', 'PUBG', 'Free Fire', 'Minecraft', 'GTA V', 'Fortnite', 
    'Call of Duty', 'Valorant', 'Among Us', 'Roblox', 'Tutorial', 
    'Live Stream', 'Funny Moments', 'Highlights'
  ]);

  const apiClient = createBrowserApiClient();

  // Load videos
  const loadVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTag) params.append('tag', selectedTag);
      if (showOfficialOnly) params.append('official', 'true');
      params.append('sort', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      // Check if user is authenticated
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        apiClient.setAccessToken(accessToken);
      }

      const response = await fetch(`/api/videos?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setVideos(data.data.videos);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || 'Failed to load videos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedTag, showOfficialOnly, sortBy, currentPage]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedTag) params.append('tag', selectedTag);
    if (showOfficialOnly) params.append('official', 'true');
    if (sortBy !== 'newest') params.append('sort', sortBy);
    if (currentPage > 1) params.append('page', currentPage.toString());

    const newUrl = `/videos${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [searchQuery, selectedTag, showOfficialOnly, sortBy, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadVideos();
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getThumbnailUrl = (video: Video) => {
    if (video.thumbnails?.medium?.url) {
      return video.thumbnails.medium.url;
    }
    return `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
  };

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
                  onClick={() => router.push('/videos')}
                  className="text-foreground bg-gaming-neon/10"
                >
                  Videos
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/community')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Community
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Videos</h1>
          <p className="text-muted-foreground">
            Watch TecnoGamerz official content and gaming videos with enhanced features
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-gaming-neon/50"
                />
              </div>
              <Button type="submit" className="bg-gaming-neon hover:bg-gaming-neon/90">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="tag">Tag</Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All tags</SelectItem>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort">Sort by</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="most_viewed">Most viewed</SelectItem>
                    <SelectItem value="alphabetical">A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="official"
                    checked={showOfficialOnly}
                    onCheckedChange={setShowOfficialOnly}
                  />
                  <Label htmlFor="official" className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Official only
                  </Label>
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag('');
                    setShowOfficialOnly(false);
                    setSortBy('newest');
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur overflow-hidden">
                <div className="animate-pulse">
                  <div className="aspect-video bg-muted"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No videos found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            {/* Results Info */}
            {pagination && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.totalCount)} of {pagination.totalCount} videos
                </p>
              </div>
            )}

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {videos.map((video) => (
                <Card 
                  key={video.id} 
                  className="bg-card/50 backdrop-blur overflow-hidden cursor-pointer hover:bg-card/70 transition-colors"
                  onClick={() => router.push(`/videos/${video.id}`)}
                >
                  <div className="relative">
                    <img
                      src={getThumbnailUrl(video)}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                    
                    {/* Duration */}
                    {video.duration && (
                      <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
                        {formatDuration(video.duration)}
                      </Badge>
                    )}

                    {/* Official Badge */}
                    {video.isOfficial && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <Crown className="w-3 h-3 mr-1" />
                        Official
                      </Badge>
                    )}

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="lg" className="rounded-full bg-gaming-neon hover:bg-gaming-neon/90">
                        <Play className="w-6 h-6 fill-current" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    {video.userProgress && video.userProgress.watchProgress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                        <div 
                          className="h-full bg-gaming-neon" 
                          style={{ width: `${video.userProgress.watchProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2 line-clamp-2 text-sm">
                      {video.title}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {video.channel.name}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.views.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(video.publishedAt || video.createdAt)}
                      </div>
                    </div>

                    {/* Tags */}
                    {video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {video.tags.slice(0, 3).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="text-xs border-gaming-neon/30 text-gaming-neon/80"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {video.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{video.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* User Progress Indicators */}
                    {video.userProgress && (
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        {video.userProgress.hasCompleted && (
                          <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                            ✓ Completed
                          </Badge>
                        )}
                        {video.userProgress.hasLiked && (
                          <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400">
                            ♥ Liked
                          </Badge>
                        )}
                        {video.userProgress.quizzesCompleted > 0 && (
                          <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                            🎯 {video.userProgress.quizzesCompleted} Quiz{video.userProgress.quizzesCompleted > 1 ? 'zes' : ''}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-gaming-neon hover:bg-gaming-neon/90" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <>
                      <span className="text-muted-foreground">...</span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(pagination.totalPages)}
                      >
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}