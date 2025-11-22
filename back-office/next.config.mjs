import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': path.resolve('./components'),
      '@/lib': path.resolve('./lib'),
      '@/services': path.resolve('./services'),
      '@/app': path.resolve('./app'),
      '@/hooks': path.resolve('./hooks'),
      '@/types': path.resolve('./types'),
    };
    return config;
  },
};

export default nextConfig;
