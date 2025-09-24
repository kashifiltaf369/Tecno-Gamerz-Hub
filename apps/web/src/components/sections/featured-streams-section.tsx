'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StreamEmbed } from '@/components/ui/stream-embed';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import type { Tournament, UserContent } from '@tecno-gamerz/types';
import { Container } from '@/components/ui/container';
import { 
  Crown, 
  Video, 
  ArrowRight, 
  Play,
  Users
} from 'lucide-react';

export function FeaturedStreamsSection() {
  const router = useRouter();
  const [featuredTournament, setFeaturedTournament] = useState<Tournament | null>(null);
  const [featuredContent, setFeaturedContent] = useState<UserContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const apiClient = createBrowserApiClient();

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    try {
      setIsLoading(true);
      
      // Load tournaments to find one with active stream
      const tournamentsResponse = await apiClient.getTournaments({
        limit: 10,
        sortBy: 'startDate',
        sortOrder: 'desc'
      });

      // Look for tournament with stream URL
      if (tournamentsResponse.success && tournamentsResponse.data) {
        const tournamentsWithStreams = tournamentsResponse.data.data.filter(t => t.streamUrl);
        if (tournamentsWithStreams.length > 0) {
          // Prioritize official tournaments
          const officialTournament = tournamentsWithStreams.find(t => t.isTecnoGamerzOfficial);
          setFeaturedTournament(officialTournament || tournamentsWithStreams[0]);
        }
      }

      // Load community content
      const contentResponse = await apiClient.getContent();
      if (contentResponse.success && contentResponse.data) {
        // Get first few pieces of content, prioritizing official content
        const sortedContent = contentResponse.data
          .sort((a, b) => {
            const aIsOfficial = a.user.username === 'tecnogamerz' || a.user.name?.toLowerCase().includes('tecno gamerz');
            const bIsOfficial = b.user.username === 'tecnogamerz' || b.user.name?.toLowerCase().includes('tecno gamerz');
            
            if (aIsOfficial && !bIsOfficial) return -1;
            if (!aIsOfficial && bIsOfficial) return 1;
            
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .slice(0, 3); // Take top 3

        setFeaturedContent(sortedContent);
      }
    } catch (error) {
      console.error('Failed to load featured content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isOfficialContent = (content: UserContent) => {
    return content.user.username === 'tecnogamerz' || 
           content.user.name?.toLowerCase().includes('tecno gamerz');
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <Container>
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Featured Streams</h2>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // Don't render if no content
  if (!featuredTournament && featuredContent.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <Container>
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center">
            <div className="inline-flex items-center rounded-full border border-gaming-neon/20 bg-gaming-neon/10 px-4 py-2 text-sm font-medium text-gaming-neon mb-4">
              <Video className="w-4 h-4 mr-2" />
              Live Gaming Content
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gaming-neon to-gaming-electric bg-clip-text text-transparent">
              Featured Streams
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Watch live tournaments and discover amazing content from the Tecno Gamerz community
            </p>
          </div>

          {/* Featured Tournament Stream */}
          {featuredTournament && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">🏆 Live Tournament</h3>
                  {featuredTournament.isTecnoGamerzOfficial && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      Official
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/tournaments/${featuredTournament.id}`)}
                  className="border-gaming-neon/50 text-gaming-neon hover:bg-gaming-neon/10"
                >
                  View Tournament
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <Card className="bg-card/50 backdrop-blur overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video">
                    <StreamEmbed
                      url={featuredTournament.streamUrl!}
                      title={featuredTournament.title}
                      isOfficialStream={featuredTournament.isTecnoGamerzOfficial}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{featuredTournament.title}</h4>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {featuredTournament.description}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {featuredTournament.participantCount || 0} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            {featuredTournament.game}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Community Content Grid */}
          {featuredContent.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">🎮 Community Highlights</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/community')}
                  className="border-gaming-electric/50 text-gaming-electric hover:bg-gaming-electric/10"
                >
                  View All Content
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredContent.map((content) => (
                  <Card key={content.id} className="bg-card/50 backdrop-blur overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-video">
                        <StreamEmbed
                          url={content.videoUrl}
                          title={content.title}
                          isOfficialStream={isOfficialContent(content)}
                          className="w-full h-full"
                        />
                        {isOfficialContent(content) && (
                          <Badge 
                            variant="secondary" 
                            className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            Official
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium line-clamp-1 mb-2">{content.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          By {content.user.name || content.user.username || 'Unknown'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center pt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/tournaments')}
                className="bg-gaming-neon hover:bg-gaming-neon/90"
              >
                Join Tournaments
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/community')}
                className="border-gaming-electric/50 text-gaming-electric hover:bg-gaming-electric/10"
              >
                Share Your Content
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}