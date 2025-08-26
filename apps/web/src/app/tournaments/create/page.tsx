'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createBrowserApiClient } from '@tecno-gamerz/utils';
import type { PublicUser, CreateTournamentDto } from '@tecno-gamerz/types';
import { Calendar, ArrowLeft, Trophy, Crown } from 'lucide-react';

export default function CreateTournamentPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<CreateTournamentDto>({
    title: '',
    description: '',
    game: '',
    startDate: '',
    endDate: '',
  });

  const apiClient = createBrowserApiClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
          router.push('/login');
          return;
        }

        apiClient.setAccessToken(accessToken);
        const response = await apiClient.me();

        if (response.success && response.data) {
          setUser(response.data);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/login');
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      // Validate dates
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const now = new Date();

      if (start <= now) {
        setError('Tournament start date must be in the future');
        setIsSubmitting(false);
        return;
      }

      if (end <= start) {
        setError('Tournament end date must be after start date');
        setIsSubmitting(false);
        return;
      }

      apiClient.setAccessToken(accessToken);
      const response = await apiClient.createTournament(formData);

      if (response.success && response.data) {
        router.push(`/tournaments/${response.data.id}`);
      } else {
        setError('Failed to create tournament');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateTournamentDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate min date (tomorrow) for date inputs
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  // Generate min end date based on start date
  const getMinEndDate = () => {
    if (formData.startDate) {
      const start = new Date(formData.startDate);
      start.setHours(start.getHours() + 1); // Minimum 1 hour duration
      return start.toISOString().slice(0, 16);
    }
    return getMinDate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-neon"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/tournaments')}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tournaments
            </Button>
            
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trophy className="w-8 h-8 text-gaming-neon" />
              Create Tournament
            </h1>
            <p className="text-muted-foreground mt-2">
              Create an exciting tournament for the gaming community. 
              {user?.role === 'ADMIN' && (
                <span className="flex items-center mt-2 text-yellow-500">
                  <Crown className="w-4 h-4 mr-1" />
                  As an admin, your tournament will be marked as Tecno Gamerz Official!
                </span>
              )}
            </p>
          </div>

          {/* Form Card */}
          <Card className="bg-card/50 backdrop-blur border-gaming-neon/20">
            <CardHeader>
              <CardTitle>Tournament Details</CardTitle>
              <CardDescription>
                Fill in the information below to create your tournament
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Tournament Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Tournament Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Tecno Gamerz Championship 2024"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    minLength={3}
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose an exciting name for your tournament (3-100 characters)
                  </p>
                </div>

                {/* Game Selection */}
                <div className="space-y-2">
                  <Label htmlFor="game">Game *</Label>
                  <Select 
                    value={formData.game} 
                    onValueChange={(value) => handleInputChange('game', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Call of Duty: Warzone">Call of Duty: Warzone</SelectItem>
                      <SelectItem value="Call of Duty: Mobile">Call of Duty: Mobile</SelectItem>
                      <SelectItem value="Fortnite">Fortnite</SelectItem>
                      <SelectItem value="Valorant">Valorant</SelectItem>
                      <SelectItem value="PUBG">PUBG</SelectItem>
                      <SelectItem value="PUBG Mobile">PUBG Mobile</SelectItem>
                      <SelectItem value="Minecraft">Minecraft</SelectItem>
                      <SelectItem value="Apex Legends">Apex Legends</SelectItem>
                      <SelectItem value="CS:GO">CS:GO</SelectItem>
                      <SelectItem value="CS2">CS2</SelectItem>
                      <SelectItem value="Rocket League">Rocket League</SelectItem>
                      <SelectItem value="FIFA 24">FIFA 24</SelectItem>
                      <SelectItem value="Free Fire">Free Fire</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select the game for this tournament
                  </p>
                </div>

                {/* Custom Game Input */}
                {formData.game === 'Other' && (
                  <div className="space-y-2">
                    <Label htmlFor="customGame">Custom Game Name *</Label>
                    <Input
                      id="customGame"
                      placeholder="Enter the game name"
                      value=""
                      onChange={(e) => handleInputChange('game', e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your tournament, rules, prizes, and what makes it special..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Provide details about the tournament (10-1000 characters)
                  </p>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                      min={getMinDate()}
                    />
                    <p className="text-sm text-muted-foreground">
                      When does the tournament start?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                      min={getMinEndDate()}
                    />
                    <p className="text-sm text-muted-foreground">
                      When does the tournament end?
                    </p>
                  </div>
                </div>

                {/* Preview Info */}
                {user?.role === 'ADMIN' && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-500 font-medium mb-2">
                      <Crown className="w-5 h-5" />
                      Tecno Gamerz Official Tournament
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This tournament will be automatically marked as an official Tecno Gamerz tournament 
                      and will be featured prominently on the platform.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/tournaments')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gaming-neon hover:bg-gaming-neon/90"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Create Tournament
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}