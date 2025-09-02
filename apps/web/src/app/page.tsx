import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@tecno-gamerz/ui';
import { HeroSection } from '@/components/sections/hero-section';
import { FeaturedStreamsSection } from '@/components/sections/featured-streams-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { CTASection } from '@/components/sections/cta-section';
import { Loading } from '@/components/ui/loading';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Suspense fallback={<Loading />}>
        <HeroSection />
      </Suspense>
      
      <Suspense fallback={<Loading />}>
        <FeaturedStreamsSection />
      </Suspense>
      
      <Suspense fallback={<Loading />}>
        <FeaturesSection />
      </Suspense>
      
      <Suspense fallback={<Loading />}>
        <CTASection />
      </Suspense>
    </div>
  );
}