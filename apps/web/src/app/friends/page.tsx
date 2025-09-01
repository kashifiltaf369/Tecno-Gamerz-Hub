'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Bell, MessageCircle, X, Check } from 'lucide-react';
import { FriendsList } from '@/components/friends/friends-list';
import { FriendRequests } from '@/components/friends/friend-requests';
import { AddFriend } from '@/components/friends/add-friend';

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

interface FriendsData {
  friends: Friend[];
  total: number;
}

interface FriendRequestsData {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestsData>({
    incoming: [],
    outgoing: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.accessToken) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [session, status, router]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        const data: FriendsData = await response.json();
        setFriends(data.friends);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        const data: FriendRequestsData = await response.json();
        setFriendRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (friendshipId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const response = await fetch(`/api/friends/request/${friendshipId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh data
        await Promise.all([fetchFriends(), fetchFriendRequests()]);
      }
    } catch (error) {
      console.error('Failed to respond to friend request:', error);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        // Refresh friends list
        await fetchFriends();
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredFriends = friends.filter(friend =>
    friend.friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Friends</h1>
          <Badge variant="secondary">
            {friends.length} friends
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Requests ({friendRequests.incoming.length})
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Friends</CardTitle>
                  <div className="w-64">
                    <Input
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FriendsList
                  friends={filteredFriends}
                  onRemoveFriend={handleRemoveFriend}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <FriendRequests
              friendRequests={friendRequests}
              onRespondToRequest={handleRespondToRequest}
              onRemoveRequest={handleRemoveFriend}
            />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <AddFriend
              onFriendRequestSent={() => {
                fetchFriendRequests();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}