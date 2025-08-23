import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@tecno-gamerz/ui';
import { Container } from '@/components/ui/container';

const features = [
  {
    icon: '🏆',
    title: 'Tournaments',
    description: 'Compete in organized tournaments with prize pools and rankings.',
  },
  {
    icon: '🎥',
    title: 'Content Creation',
    description: 'Share your gaming highlights and build your audience.',
  },
  {
    icon: '🛍️',
    title: 'Gaming Store',
    description: 'Buy and sell gaming gear, merch, and digital items.',
  },
  {
    icon: '🎁',
    title: 'Giveaways',
    description: 'Participate in exciting giveaways and win amazing prizes.',
  },
  {
    icon: '💬',
    title: 'Community',
    description: 'Connect with fellow gamers and join the conversation.',
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Track your performance and progress over time.',
  },
];

export function FeaturesSection() {
  const t = useTranslations('HomePage');

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to level up
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From competitive tournaments to content creation, we've got all the tools
            you need to succeed in the gaming world.
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              variant="gaming"
              className="transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}