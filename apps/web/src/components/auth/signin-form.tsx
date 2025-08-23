'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SignInForm as UISignInForm } from '@tecno-gamerz/ui';
import { useToast } from '@/hooks/use-toast';

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleProviderLogin = async (provider: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        setError('Failed to sign in. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: 'There was an error signing you in. Please try again.',
        });
      } else if (result?.url) {
        toast({
          variant: 'success',
          title: 'Welcome!',
          description: 'You have been signed in successfully.',
        });
        router.push(result.url);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (data: { email: string; password: string }) => {
    // TODO: Implement credentials login if needed
    toast({
      variant: 'destructive',
      title: 'Not Implemented',
      description: 'Password login is not available yet. Please use OAuth providers.',
    });
  };

  return (
    <UISignInForm
      onSubmit={handlePasswordLogin}
      onProviderLogin={handleProviderLogin}
      loading={loading}
      error={error}
      showPasswordLogin={false} // Disable for now
      providers={['google']} // Only Google for now
    />
  );
}