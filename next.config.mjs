/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 1. Prefer AVIF, fall back to WebP
    formats: ['image/avif', 'image/webp'],
    
    // 2. Allow external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;