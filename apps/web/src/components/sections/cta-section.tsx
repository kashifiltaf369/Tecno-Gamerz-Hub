import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@tecno-gamerz/ui';
import { Container } from '@/components/ui/container';

export function CTASection() {
  const t = useTranslations('HomePage');

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-gaming-purple/10 via-gaming-electric/10 to-gaming-neon/10" />
      <div className="absolute inset-0 bg-grid opacity-5" />
      
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to join the 
            <span className="gradient-gaming text-gradient"> gaming revolution</span>?
          </h2>
          
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Sign up today and become part of the most exciting gaming community. 
            Compete, create, and connect with gamers worldwide.
          </p>
          
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button 
              asChild 
              size="xl" 
              variant="gaming"
              className="font-semibold"
            >
              <Link href="/auth/signin">
                Start Your Journey
              </Link>
            </Button>
            
            <Button 
              asChild 
              size="xl" 
              variant="outline"
            >
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-gaming-neon" />
              Free to join
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-gaming-electric" />
              No ads
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-gaming-purple" />
              Secure platform
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}