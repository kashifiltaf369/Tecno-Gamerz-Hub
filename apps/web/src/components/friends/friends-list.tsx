'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, UserMinus, Trophy, Zap } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Friend {
  id: string;
  status: string;
  createdAt: string;
  friend: {
    id: string;
    name: string;
    email: string;
    username?: string;
    image?: string;
    level: number;
    xp: number;
  };
}

interface FriendsListProps {
  friends: Friend[];
  onRemoveFriend: (friendshipId: string) => Promise<void>;
}

export function FriendsList({ friends, onRemoveFriend }: FriendsListProps) {
  const [removingFriend, setRemovingFriend] = useState<string | null>(null);

  const handleRemoveFriend = async (friendshipId: string) => {
    setRemovingFriend(friendshipId);
    try {
      await onRemoveFriend(friendshipId);
    } finally {
      setRemovingFriend(null);
    }
  };

  const handleStartChat = (friendId: string) => {
    // TODO: Open chat with friend
    console.log('Start chat with friend:', friendId);
  };

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
        <p className="text-muted-foreground mb-4">
          Add some friends to start chatting and playing together!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friendship) => (
        <Card key={friendship.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={friendship.friend.image || ''} />
                  <AvatarFallback>
                    {friendship.friend.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {friendship.friend.name}
                    </h3>
                    {friendship.friend.username && (
                      <Badge variant="outline" className="text-xs">
                        @{friendship.friend.username}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Level {friendship.friend.level}
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {friendship.friend.xp.toLocaleString()} XP
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Friends since {new Date(friendship.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartChat(friendship.friend.id)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={removingFriend === friendship.id}
                      className="flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <UserMinus className="h-4 w-4" />
                      {removingFriend === friendship.id ? 'Removing...' : 'Remove'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Friend</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {friendship.friend.name} from your friends list? 
                        You won't be able to chat with them anymore and they won't appear in your friends list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveFriend(friendship.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove Friend
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}