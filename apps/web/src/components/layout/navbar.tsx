'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    username?: string;
    role: string;
  } | null;
  onSignOut?: () => void;
}

export function Navbar({ user, onSignOut }: NavbarProps) {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    }
  };

  const navigateToFriends = () => {
    router.push('/friends');
  };

  return (
    <>
      <nav className="border-b border-gaming-neon/20 bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/dashboard"
                className="text-xl font-bold bg-gradient-to-r from-gaming-neon to-gaming-electric bg-clip-text text-transparent"
              >
                Tecno Gamerz Hub
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              {user && (
                <>
                  {/* Navigation Links */}
                  <div className="hidden md:flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/tournaments')}
                    >
                      Tournaments
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/leaderboard')}
                    >
                      Leaderboard
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/videos')}
                    >
                      Videos
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navigateToFriends}
                    >
                      Friends
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/profile/${user.id}`)}
                    >
                      Profile
                    </Button>
                  </div>

                  {/* Social Features */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setChatOpen(!chatOpen)}
                      className="relative"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                    <NotificationBell />
                  </div>

                  {/* User Info */}
                  <div className="flex items-center space-x-3 ml-4">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      Welcome, {user.name || user.username || 'Gamer'}!
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="border-gaming-neon/50 hover:bg-gaming-neon/10"
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              )}

              {!user && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/register')}
                    className="border-gaming-neon/50 hover:bg-gaming-neon/10"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Sidebar */}
      <ChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}