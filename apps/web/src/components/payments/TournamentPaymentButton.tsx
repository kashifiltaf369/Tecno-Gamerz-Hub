'use client';

import { useState } from 'react';
import { Button } from '@tecno-gamerz/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@tecno-gamerz/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@tecno-gamerz/ui/card';
import { Badge } from '@tecno-gamerz/ui/badge';
import { CreditCard, Users, Calendar, Trophy, AlertCircle } from 'lucide-react';
import { PaymentButton } from './PaymentButton';

interface Tournament {
  id: string;
  title: string;
  entryFee: number;
  currency: string;
  maxParticipants?: number;
  participantCount?: number;
  startDate: string;
  game: string;
}

interface TournamentPaymentButtonProps {
  tournament: Tournament;
  isParticipant: boolean;
  className?: string;
}

export function TournamentPaymentButton({
  tournament,
  isParticipant,
  className,
}: TournamentPaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isParticipant) {
    return (
      <Button disabled variant="outline" className={className}>
        <Trophy className="mr-2 h-4 w-4" />
        Already Registered
      </Button>
    );
  }

  if (!tournament.entryFee || tournament.entryFee <= 0) {
    return null;
  }

  const isFull = tournament.maxParticipants && 
    tournament.participantCount && 
    tournament.participantCount >= tournament.maxParticipants;

  const hasStarted = new Date(tournament.startDate) <= new Date();

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100); // Convert cents to dollars
  };

  const paymentData = {
    type: 'TOURNAMENT_FEE' as const,
    amount: tournament.entryFee,
    currency: tournament.currency,
    tournamentId: tournament.id,
    metadata: {
      tournamentTitle: tournament.title,
      tournamentGame: tournament.game,
    },
    successUrl: `${window.location.origin}/tournaments/${tournament.id}?payment=success`,
    cancelUrl: `${window.location.origin}/tournaments/${tournament.id}?payment=canceled`,
  };

  if (isFull || hasStarted) {
    return (
      <Button disabled variant="outline" className={className}>
        {isFull ? 'Tournament Full' : 'Registration Closed'}
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <CreditCard className="mr-2 h-4 w-4" />
          Join Tournament - {formatPrice(tournament.entryFee, tournament.currency)}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Tournament</DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {tournament.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Entry Fee:</span>
              <Badge variant="secondary" className="text-lg">
                {formatPrice(tournament.entryFee, tournament.currency)}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {tournament.participantCount || 0}
                  {tournament.maxParticipants && ` / ${tournament.maxParticipants}`} participants
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Starts {new Date(tournament.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment is processed securely by Stripe. You'll be redirected to complete the payment.</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            
            <PaymentButton
              paymentData={paymentData}
              className="flex-1"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay & Join
            </PaymentButton>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export default TournamentPaymentButton;