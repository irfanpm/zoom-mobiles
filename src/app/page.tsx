import { Hero } from '@/components/home/Hero';
import { Stats } from '@/components/home/Stats';
import { Features } from '@/components/home/Features';
import { Categories } from '@/components/home/Categories';
import { Testimonials } from '@/components/home/Testimonials';
import { CTA } from '@/components/home/CTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Categories />
      <Testimonials />
      <CTA />
    </>
  );
}
