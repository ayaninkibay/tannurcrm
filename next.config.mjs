/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ⏸️ не валить билд из-за ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⏸️ не валить билд из-за ошибок TS
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nrxtrcugavrxpejbjiaq.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;