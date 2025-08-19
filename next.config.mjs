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
    domains: [
      'nrxtrcugavrxpejbjiaq.supabase.co',  // Supabase
      'localhost',                         // локальная разработка
    ],
  },
};

export default nextConfig;
