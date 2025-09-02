'use client';

import { useState } from 'react';
import { Button } from '@tecno-gamerz/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { paymentService, type CreateCheckoutSessionData } from '@/lib/services/payment-service';
import { toast } from '@tecno-gamerz/ui/use-toast';

interface PaymentButtonProps {
  paymentData: CreateCheckoutSessionData;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export function PaymentButton({
  paymentData,
  children,
  className,
  variant = 'default',
  disabled = false,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    try {
      const session = await paymentService.createCheckoutSession(paymentData);
      await paymentService.redirectToCheckout(session.sessionId);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to start payment process',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      variant={variant}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {children || (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </>
          )}
        </>
      )}
    </Button>
  );
}

export default PaymentButton;