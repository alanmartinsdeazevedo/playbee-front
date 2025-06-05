import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const withPWAConfig = withPWA({
  dest: 'public',
  register: true
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default withPWAConfig(nextConfig);