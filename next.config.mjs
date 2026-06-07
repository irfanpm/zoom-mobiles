// Initialize OpenNext dev-time bindings when running `next dev`
// so that env vars and bindings behave the same locally as on Cloudflare.
if (process.env.NODE_ENV === 'development') {
  try {
    const { initOpenNextCloudflareForDev } = await import(
      '@opennextjs/cloudflare'
    );
    await initOpenNextCloudflareForDev();
  } catch {
    // package not installed yet — silently skip
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Workers handles `next/image` via OpenNext — these
    // remote-pattern rules still apply.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
