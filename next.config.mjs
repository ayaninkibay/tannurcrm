/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🚀 Оптимизация производительности
  compress: true, // Включить gzip сжатие
  
  // 📦 Оптимизация бандла
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      '@supabase/ssr',
    ],
  },
  
  // 🖼️ Оптимизация изображений
  images: {
    formats: ['image/avif', 'image/webp'],
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
  
  // 📊 Уменьшение размера генерируемых страниц
  poweredByHeader: false,
  
  // ⚡ Оптимизация для production
  swcMinify: true,
  
  // 🎯 Для Vercel специфично
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },
};

export default nextConfig;