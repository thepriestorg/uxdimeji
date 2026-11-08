import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Landing-page screen recordings are uploaded through the admin panel.
    proxyClientMaxBodySize: '100mb',
    // Put the CSS in the HTML so first paint does not wait on separate stylesheet requests.
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'otdntxiowevvgxpojbtb.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'media.contra.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Enable modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for different view widths
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 90, 95, 100],
  },
  // The default Vercel address serves the whole site; send people and crawlers to the real domain.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "uxdimeji.vercel.app" }],
        destination: "https://uxdimeji.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
