'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  ExternalLink, 
  Crown, 
  AlertCircle 
} from 'lucide-react';

interface StreamEmbedProps {
  streamUrl?: string | null;
  tournamentTitle: string;
  isTecnoGamerzOfficial?: boolean;
}

export function StreamEmbed({ streamUrl, tournamentTitle, isTecnoGamerzOfficial }: StreamEmbedProps) {
  if (!streamUrl) {
    return (
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Live Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No live stream available</p>
            <p className="text-sm text-muted-foreground">
              Stream will appear here when tournament goes live
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      
      // YouTube handling
      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
        }
      } else if (urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.pathname.slice(1);
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
        }
      }
      
      // Twitch handling
      if (urlObj.hostname.includes('twitch.tv')) {
        const channel = urlObj.pathname.slice(1);
        if (channel) {
          return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true&muted=true`;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(streamUrl);
  const isYoutube = streamUrl.includes('youtube.com') || streamUrl.includes('youtu.be');
  const isTwitch = streamUrl.includes('twitch.tv');

  const getPlatformName = (): string => {
    if (isYoutube) return 'YouTube';
    if (isTwitch) return 'Twitch';
    return 'Stream';
  };

  const getPlatformColor = (): string => {
    if (isYoutube) return 'bg-red-500/20 text-red-300';
    if (isTwitch) return 'bg-purple-500/20 text-purple-300';
    return 'bg-blue-500/20 text-blue-300';
  };

  if (!embedUrl) {
    return (
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Live Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Stream URL not supported</p>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to embed this stream format
            </p>
            <Button
              variant="outline"
              onClick={() => window.open(streamUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Stream
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Live Stream
            {isTecnoGamerzOfficial && (
              <Crown className="w-5 h-5 text-yellow-500" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getPlatformColor()}>
              {getPlatformName()}
            </Badge>
            {isTecnoGamerzOfficial && (
              <Badge className="bg-yellow-500/20 text-yellow-300">
                Official
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-b-lg"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen"
              title={`${tournamentTitle} - Live Stream`}
            />
          </div>
        </div>
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{tournamentTitle}</p>
              <p className="text-sm text-muted-foreground">Live on {getPlatformName()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(streamUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in {getPlatformName()}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}