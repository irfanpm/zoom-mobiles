'use client';

import dynamic from 'next/dynamic';

/**
 * Client-side wrapper that lazy-loads the FloatingEnquiryBar.
 * Lives in a 'use client' module so we can use `ssr: false`.
 * The root layout (Server Component) just imports & renders this.
 */
const FloatingEnquiryBar = dynamic(
  () => import('./FloatingEnquiryBar').then((m) => ({ default: m.FloatingEnquiryBar })),
  { ssr: false },
);

export default function LazyFloatingEnquiryBar() {
  return <FloatingEnquiryBar />;
}
