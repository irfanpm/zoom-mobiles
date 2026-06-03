import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="container-fluid py-24 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-7xl font-extrabold gradient-text">404</div>
        <h1 className="mt-4 text-2xl font-bold text-dark-900">Page not found</h1>
        <p className="mt-2 text-dark-600">
          The page you&apos;re looking for moved, was renamed or doesn&apos;t exist.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" /> Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">
              Browse Inventory <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
