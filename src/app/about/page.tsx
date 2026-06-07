import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, Headphones, Award, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchSettings } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

const PILLARS = [
  { icon: ShieldCheck, title: 'Verified Wholesaler', text: '15+ years of trust in the wholesale electronics trade.' },
  { icon: Truck, title: 'Pan India Delivery', text: 'Same-day dispatch, next-day delivery to major cities.' },
  { icon: Headphones, title: 'Dedicated Support', text: 'Real humans on WhatsApp — Mon to Sat, 10 AM to 8 PM.' },
  { icon: Award, title: '200+ Brands', text: 'Original & compatible accessories for every modern smartphone.' },
  { icon: Users, title: '10,000+ Partners', text: 'India\'s largest network of retail mobile shop owners.' },
  { icon: Building2, title: 'Bulk Pricing', text: 'Box, inner & MOQ wholesale pricing — built for retailers.' },
];

export default async function AboutPage() {
  const settings = await fetchSettings();
  return (
    <>
      <section className="bg-gradient-to-b from-primary/5 to-white border-b border-dark-200/70">
        <div className="container-fluid py-16 lg:py-24">
          <div className="max-w-3xl">
            <span className="chip bg-primary/10 text-primary-700">About {settings.company_name}</span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-dark-900 text-balance">
              India&apos;s most trusted mobile accessories wholesale platform.
            </h1>
            <p className="mt-5 text-lg text-dark-600">
              We supply 10,000+ retail mobile shops across India with original and compatible
              accessories — from power banks and TWS to chargers and replacement batteries.
              Every product, every brand, every model — all under one roof.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg">
                <Link href="/products">
                  Browse Inventory <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/enquiry">Start an Enquiry</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-fluid">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-dark-200 bg-white p-6 card-hover"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-dark-900">{p.title}</h3>
                <p className="mt-1 text-sm text-dark-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
