import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SignInForm } from '@/components/auth/signin-form';
import { Container } from '@/components/ui/container';

export default async function SignInPage() {
  const session = await auth();

  // Redirect if already signed in
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gaming-neon/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gaming-electric/20 blur-3xl" />
      
      <Container size="sm">
        <div className="relative">
          <SignInForm />
        </div>
      </Container>
    </div>
  );
}