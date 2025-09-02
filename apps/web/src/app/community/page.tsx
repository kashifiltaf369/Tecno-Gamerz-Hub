'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import { CreateUserContentSchema } from '@tecno-gamerz/types';
import type { UserContent, PublicUser, CreateUserContentInput } from '@tecno-gamerz/types';
import { StreamEmbed } from '@/components/ui/stream-embed';
import { 
  Plus, 
  Video, 
  Users, 
  Clock,
  Crown,
  Trash2,
  Upload
} from 'lucide-react';

export default function CommunityPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<PublicUser | null>(null);
  const [contents, setContents] = useState<UserContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserContentInput>({
    title: '',
    videoUrl: '',
  });
  const [createError, setCreateError] = useState<string>('');

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
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getContent();

      if (response.success && response.data) {
        // Sort content to prioritize Tecno Gamerz official content
        const sortedContent = response.data.sort((a, b) => {
          // Check if user is Tecno Gamerz official (you might need to add an isOfficial field to user)
          const aIsOfficial = a.user.username === 'tecnogamerz' || a.user.name?.toLowerCase().includes('tecno gamerz');
          const bIsOfficial = b.user.username === 'tecnogamerz' || b.user.name?.toLowerCase().includes('tecno gamerz');
          
          if (aIsOfficial && !bIsOfficial) return -1;
          if (!aIsOfficial && bIsOfficial) return 1;
          
          // Then sort by creation date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setContents(sortedContent);
      } else {
        setError('Failed to load content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    try {
      // Validate input
      const validatedData = CreateUserContentSchema.parse(createForm);
      
      if (!user) {
        router.push('/login');
        return;
      }

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      setIsCreating(true);
      apiClient.setAccessToken(accessToken);
      
      const response = await apiClient.createContent(validatedData);

      if (response.success) {
        setCreateForm({ title: '', videoUrl: '' });
        setIsCreateDialogOpen(false);
        await loadContent(); // Reload content
      } else {
        setCreateError('Failed to create content');
      }
    } catch (err) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError('Failed to create content');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      apiClient.setAccessToken(accessToken);
      const response = await apiClient.deleteContent(contentId);

      if (response.success) {
        await loadContent(); // Reload content
      } else {
        alert('Failed to delete content');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete content');
    }
  };

  const isOfficialContent = (content: UserContent) => {
    return content.user.username === 'tecnogamerz' || 
           content.user.name?.toLowerCase().includes('tecno gamerz');
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
                  onClick={() => router.push('/community')}
                  className="text-foreground bg-gaming-neon/10"
                >
                  Community
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Community</h1>
              <p className="text-muted-foreground mt-2">
                Share your gaming content and discover amazing videos from the community
              </p>
            </div>
            
            {user && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gaming-neon hover:bg-gaming-neon/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Share Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Your Content</DialogTitle>
                    <DialogDescription>
                      Share your gaming videos with the community
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateContent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter content title"
                        value={createForm.title}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Video URL</Label>
                      <Input
                        id="videoUrl"
                        placeholder="https://youtube.com/watch?v=... or https://twitch.tv/..."
                        value={createForm.videoUrl}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Supports YouTube and Twitch videos
                      </p>
                    </div>
                    {createError && (
                      <Alert variant="destructive">
                        <AlertDescription>{createError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isCreating}
                        className="flex-1 bg-gaming-neon hover:bg-gaming-neon/90"
                      >
                        {isCreating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Share
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="flex items-center p-4">
                <Video className="w-6 h-6 text-gaming-neon mr-3" />
                <div>
                  <p className="font-medium text-gaming-neon">{contents.length}</p>
                  <p className="text-xs text-muted-foreground">Total Content</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="flex items-center p-4">
                <Crown className="w-6 h-6 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-yellow-500">
                    {contents.filter(isOfficialContent).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Official Content</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="flex items-center p-4">
                <Users className="w-6 h-6 text-gaming-electric mr-3" />
                <div>
                  <p className="font-medium text-gaming-electric">
                    {new Set(contents.map(c => c.userId)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Content Creators</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur">
                  <CardContent className="p-0">
                    <div className="animate-pulse">
                      <div className="aspect-video bg-muted rounded-t-lg"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : contents.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No content yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your gaming content with the community!
              </p>
              {user && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gaming-neon hover:bg-gaming-neon/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Share Content
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <Card key={content.id} className="bg-card/50 backdrop-blur overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <StreamEmbed
                        url={content.videoUrl}
                        title={content.title}
                        isOfficialStream={isOfficialContent(content)}
                        className="aspect-video"
                      />
                      
                      {/* Official Badge */}
                      {isOfficialContent(content) && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          Official Stream
                        </Badge>
                      )}
                      
                      {/* Delete Button (for own content) */}
                      {user && content.userId === user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteContent(content.id)}
                          className="absolute top-2 right-2 border-red-500/50 text-red-400 hover:bg-red-500/10 bg-background/80 backdrop-blur"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-foreground mb-2 line-clamp-2">
                        {content.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={content.user.image} />
                            <AvatarFallback className="text-xs">
                              {content.user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {content.user.name || content.user.username || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(content.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}