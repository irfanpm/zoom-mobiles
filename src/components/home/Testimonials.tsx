'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Rohit Sharma',
    role: 'Owner, Sharma Mobile Center',
    city: 'Delhi',
    quote:
      'Zoom Mobiles is the only wholesaler whose stock screen I actually trust. Out-of-stock is real, in-stock is real. Saves my time every single day.',
    rating: 5,
  },
  {
    name: 'Anita Patel',
    role: 'Director, Mobile Plus',
    city: 'Ahmedabad',
    quote:
      'WhatsApp ordering with proper item codes is a game changer. My orders are dispatched same-day, every time. No more phone-call confusion.',
    rating: 5,
  },
  {
    name: 'Mohammed Khan',
    role: 'Founder, Khan Communications',
    city: 'Hyderabad',
    quote:
      'Best wholesale prices on TWS and power banks. I run 3 shops and Zoom is my only supplier. Their batteries are factory grade.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="section bg-white">
      <div className="container-fluid">
        <div className="max-w-2xl mx-auto text-center">
          <span className="chip bg-accent/15 text-accent-700">Trusted by 10,000+ retailers</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-dark-900 text-balance">
            Real wholesalers. Real reviews.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative rounded-2xl border border-dark-200/70 bg-dark-50/60 p-6 card-hover"
            >
              <Quote className="absolute right-5 top-5 h-7 w-7 text-primary/15" />
              <div className="flex items-center gap-1 text-accent">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-accent" />
                ))}
              </div>
              <blockquote className="mt-4 text-dark-700 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold flex items-center justify-center">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-dark-900 text-sm">{t.name}</div>
                  <div className="text-xs text-dark-500">
                    {t.role} · {t.city}
                  </div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
