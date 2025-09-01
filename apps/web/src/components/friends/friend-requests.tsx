'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Trophy, Zap, Clock, Send } from 'lucide-react';

interface FriendRequest {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    username?: string;
    image?: string;
    level: number;
    xp: number;
  };
  createdAt: string;
}

interface FriendRequestsData {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

interface FriendRequestsProps {
  friendRequests: FriendRequestsData;
  onRespondToRequest: (friendshipId: string, status: 'ACCEPTED' | 'DECLINED') => Promise<void>;
  onRemoveRequest: (friendshipId: string) => Promise<void>;
}

export function FriendRequests({ friendRequests, onRespondToRequest, onRemoveRequest }: FriendRequestsProps) {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [canceling, setCanceling] = useState<string | null>(null);

  const handleAccept = async (requestId: string) => {
    setRespondingTo(requestId);
    try {
      await onRespondToRequest(requestId, 'ACCEPTED');
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setRespondingTo(requestId);
    try {
      await onRespondToRequest(requestId, 'DECLINED');
    } finally {
      setRespondingTo(null);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setCanceling(requestId);
    try {
      await onRemoveRequest(requestId);
    } finally {
      setCanceling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Incoming Friend Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Incoming Requests ({friendRequests.incoming.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friendRequests.incoming.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No pending friend requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friendRequests.incoming.map((request) => (
                <Card key={request.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.user.image || ''} />
                          <AvatarFallback>
                            {request.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{request.user.name}</h4>
                            {request.user.username && (
                              <Badge variant="outline" className="text-xs">
                                @{request.user.username}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              Level {request.user.level}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {request.user.xp.toLocaleString()} XP
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request.id)}
                          disabled={respondingTo === request.id}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                          {respondingTo === request.id ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecline(request.id)}
                          disabled={respondingTo === request.id}
                          className="flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-4 w-4" />
                          {respondingTo === request.id ? 'Declining...' : 'Decline'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outgoing Friend Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Sent Requests ({friendRequests.outgoing.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friendRequests.outgoing.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No pending outgoing requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friendRequests.outgoing.map((request) => (
                <Card key={request.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.user.image || ''} />
                          <AvatarFallback>
                            {request.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{request.user.name}</h4>
                            {request.user.username && (
                              <Badge variant="outline" className="text-xs">
                                @{request.user.username}
                              </Badge>
                            )}
                            <Badge className="text-xs bg-yellow-100 text-yellow-800">
                              Pending
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              Level {request.user.level}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {request.user.xp.toLocaleString()} XP
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelRequest(request.id)}
                          disabled={canceling === request.id}
                          className="flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-4 w-4" />
                          {canceling === request.id ? 'Canceling...' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}