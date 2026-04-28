/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['motion', 'framer-motion', 'lucide-react'],
};

module.exports = nextConfig;
