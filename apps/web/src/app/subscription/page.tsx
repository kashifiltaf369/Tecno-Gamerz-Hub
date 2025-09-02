import { SubscriptionPlans } from '@/components/payments/SubscriptionPlans';

export default function SubscriptionPage() {
  // In a real implementation, you would fetch the current user's subscription
  // const { data: user } = useQuery(['currentUser'], fetchCurrentUser);
  // const currentPlan = user?.subscription?.plan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <SubscriptionPlans />
    </div>
  );
}