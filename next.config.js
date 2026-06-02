/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double-renders
  images: {
    unoptimized: false, // Enable Next.js image optimization
    remotePatterns: [
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: '**.googleapis.com' },
    ],
  },
  transpilePackages: ['framer-motion', 'lucide-react'],
  productionBrowserSourceMaps: false, // Reduce bundle size
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
