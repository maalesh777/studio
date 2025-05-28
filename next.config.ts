
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enforce TypeScript error checking during build
  },
  eslint: {
    ignoreDuringBuilds: false, // Enforce ESLint error checking during build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com', // Added Unsplash
        port: '',
        pathname: '/**',
      },
      // Removed placehold.co pattern
    ],
  },
};

export default nextConfig;
