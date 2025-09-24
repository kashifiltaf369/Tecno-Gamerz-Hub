'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@tecno-gamerz/ui/card';
import { Button } from '@tecno-gamerz/ui/button';
import { Badge } from '@tecno-gamerz/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { PaymentButton } from './PaymentButton';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for casual gamers',
    price: 999, // $9.99 in cents
    currency: 'USD',
    billing: 'monthly',
    icon: <Star className="h-6 w-6" />,
    features: [
      'Join unlimited free tournaments',
      'Basic leaderboard access',
      'Community features',
      'Basic profile customization',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For competitive gamers',
    price: 1999, // $19.99 in cents
    currency: 'USD',
    billing: 'monthly',
    icon: <Zap className="h-6 w-6" />,
    popular: true,
    features: [
      'Everything in Basic',
      'Priority tournament registration',
      'Advanced statistics',
      'Custom badges',
      'Early access to new features',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Ultimate gaming experience',
    price: 2999, // $29.99 in cents
    currency: 'USD',
    billing: 'monthly',
    icon: <Crown className="h-6 w-6" />,
    features: [
      'Everything in Pro',
      'VIP tournament access',
      'Personal gaming coach',
      'Exclusive premium tournaments',
      'Custom profile themes',
      'Priority customer support',
    ],
  },
];

interface SubscriptionPlansProps {
  currentPlan?: string;
}

export function SubscriptionPlans({ currentPlan }: SubscriptionPlansProps) {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const createPaymentData = (plan: SubscriptionPlan) => ({
    type: 'SUBSCRIPTION' as const,
    amount: plan.price,
    currency: plan.currency,
    subscriptionPlan: plan.id.toUpperCase(),
    metadata: {
      planName: plan.name,
      billing: plan.billing,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Gaming Plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upgrade your gaming experience with exclusive features, tournaments, and rewards.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${
              plan.popular 
                ? 'border-2 border-purple-500 shadow-lg scale-105' 
                : 'border shadow-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                plan.popular ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {plan.icon}
              </div>
              
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <p className="text-gray-600 text-sm">{plan.description}</p>
              
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="text-gray-500">/{plan.billing}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              {currentPlan === plan.id.toUpperCase() ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <PaymentButton
                  paymentData={createPaymentData(plan)}
                  variant={plan.popular ? 'default' : 'outline'}
                  className="w-full"
                >
                  {currentPlan ? 'Switch Plan' : 'Get Started'}
                </PaymentButton>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>All plans include a 7-day free trial. Cancel anytime.</p>
        <p>Payments are processed securely by Stripe.</p>
      </div>
    </div>
  );
}

export default SubscriptionPlans;