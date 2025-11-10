/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // 🚀 Оптимизации для Vercel
  experimental: {
    // Ускоряет сборку используя worker threads
    webpackBuildWorker: true,
  },

  // 🎯 Оптимизация webpack
  webpack: (config, { isServer }) => {
    // Уменьшаем размер бандлов
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;