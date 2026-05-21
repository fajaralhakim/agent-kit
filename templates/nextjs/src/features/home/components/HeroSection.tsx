import { APP_NAME } from '@/lib/constants';

export function HeroSection() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
      <p className="max-w-md text-muted-foreground">
        Slim Next.js starter with feature-based architecture. Extend for marketing, SaaS,
        e-commerce, or admin apps.
      </p>
    </section>
  );
}
