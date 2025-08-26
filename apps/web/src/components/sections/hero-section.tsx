import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@tecno-gamerz/ui';
import { Container } from '@/components/ui/container';

export function HeroSection() {
  const t = useTranslations('HomePage');

  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gaming-neon/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gaming-electric/20 blur-3xl" />
      
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-gaming-neon/20 bg-gaming-neon/10 px-4 py-2 text-sm font-medium text-gaming-neon">
            🎮 Welcome to the future of gaming
          </div>
          
          <h1 className="mb-6 bg-gradient-to-r from-gaming-neon via-gaming-electric to-gaming-purple bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            Tecno Gamerz Hub
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
            The ultimate gaming platform for tournaments, content creation, and community building. 
            Join thousands of gamers in the next level of competitive gaming.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button 
              asChild 
              size="lg" 
              variant="gaming"
              className="text-lg font-semibold"
            >
              <Link href="/register">
                Get Started
              </Link>
            </Button>
            
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="text-lg"
            >
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-gaming-neon">10K+</div>
              <div className="text-sm text-muted-foreground">Active Gamers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gaming-electric">500+</div>
              <div className="text-sm text-muted-foreground">Tournaments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gaming-purple">$100K+</div>
              <div className="text-sm text-muted-foreground">Prize Pool</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}