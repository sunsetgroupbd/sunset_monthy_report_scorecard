/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const vpsBackend = process.env.VPS_BACKEND_URL || 'http://187.127.119.189:8002';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${vpsBackend.replace(/\/+$/, '')}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
