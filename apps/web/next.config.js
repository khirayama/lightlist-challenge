/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lightlist/styles'],
  experimental: {
    turbo: {
      rules: {},
    },
  },
};

module.exports = nextConfig;