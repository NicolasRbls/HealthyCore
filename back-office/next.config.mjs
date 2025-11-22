const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/services': path.resolve(__dirname, 'services'),
      '@/app': path.resolve(__dirname, 'app'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/types': path.resolve(__dirname, 'types'),
    };
    return config;
  },
};

module.exports = nextConfig;
