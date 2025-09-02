'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@tecno-gamerz/ui/card';
import { Button } from '@tecno-gamerz/ui/button';
import { Badge } from '@tecno-gamerz/ui/badge';
import { paymentService } from '@/lib/services/payment-service';

interface PaymentDetails {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, any>;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No payment session found');
      setLoading(false);
      return;
    }

    // In a real implementation, you'd fetch payment details from your backend
    // For now, we'll simulate success
    const timer = setTimeout(() => {
      setPayment({
        id: 'mock-payment-id',
        type: 'TOURNAMENT_FEE',
        amount: 2000,
        currency: 'USD',
        status: 'SUCCEEDED',
        metadata: {
          tournamentTitle: 'Championship Tournament',
        },
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'TOURNAMENT_FEE':
        return 'Tournament Entry Fee';
      case 'SUBSCRIPTION':
        return 'Subscription';
      case 'PURCHASE':
        return 'Product Purchase';
      default:
        return 'Payment';
    }
  };

  const getRedirectUrl = (type: string, metadata?: Record<string, any>) => {
    switch (type) {
      case 'TOURNAMENT_FEE':
        return '/tournaments';
      case 'SUBSCRIPTION':
        return '/dashboard';
      case 'PURCHASE':
        return '/shop';
      default:
        return '/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Processing Payment</h2>
            <p className="text-gray-600 text-center">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Payment Error</h2>
            <p className="text-gray-600 text-center mb-4">
              {error || 'Unable to verify payment status'}
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Type:</span>
              <Badge variant="secondary">{getPaymentTypeLabel(payment.type)}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount:</span>
              <span className="font-semibold text-lg">
                {formatAmount(payment.amount, payment.currency)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Badge variant="default" className="bg-green-600">
                {payment.status}
              </Badge>
            </div>
            
            {payment.metadata?.tournamentTitle && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Tournament:</span>
                <span className="text-sm">{payment.metadata.tournamentTitle}</span>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={() => router.push(getRedirectUrl(payment.type, payment.metadata))}
              className="w-full"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}