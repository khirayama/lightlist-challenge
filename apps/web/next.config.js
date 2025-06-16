/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hobby-baseline/styles'],
  experimental: {
    turbo: {
      rules: {},
    },
  },
};

module.exports = nextConfig;