'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Trophy, Zap, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  image?: string;
  level: number;
  xp: number;
}

interface AddFriendProps {
  onFriendRequestSent: () => void;
}

export function AddFriend({ onFriendRequestSent }: AddFriendProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // Note: This endpoint would need to be implemented in the backend
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
      } else {
        toast({
          title: 'Search failed',
          description: 'Failed to search for users. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Search failed',
        description: 'An error occurred while searching. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    setSendingRequest(userId);
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (response.ok) {
        toast({
          title: 'Friend request sent',
          description: 'Your friend request has been sent successfully.',
        });
        onFriendRequestSent();
        // Remove user from search results
        setSearchResults(prev => prev.filter(user => user.id !== userId));
      } else {
        const error = await response.json();
        toast({
          title: 'Failed to send friend request',
          description: error.message || 'Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast({
        title: 'Failed to send friend request',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingRequest(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || searching}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Search Results</h3>
            <div className="space-y-3">
              {searchResults.map((user) => (
                <Card key={user.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.image || ''} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{user.name}</h4>
                            {user.username && (
                              <Badge variant="outline" className="text-xs">
                                @{user.username}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              Level {user.level}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {user.xp.toLocaleString()} XP
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSendFriendRequest(user.id)}
                          disabled={sendingRequest === user.id}
                          className="flex items-center gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          {sendingRequest === user.id ? 'Sending...' : 'Add Friend'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !searching && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try searching with a different name, username, or email address.
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Tips for finding friends:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Search by their full name or username</li>
            <li>• Try their email address if you know it</li>
            <li>• Make sure to check spelling carefully</li>
            <li>• You can only send friend requests to registered users</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}