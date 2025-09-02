'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@tecno-gamerz/ui/card';
import { Button } from '@tecno-gamerz/ui/button';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl text-yellow-800">Payment Cancelled</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Your payment was cancelled and no charges were made to your account.
            </p>
            <p className="text-sm text-gray-500">
              You can try again or return to continue browsing.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}