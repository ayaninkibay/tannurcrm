/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'nrxtrcugavrxpejbjiaq.supabase.co',  // Исправленный домен
      'localhost',  // Для локальной разработки
    ],
  },
};

export default nextConfig;