// page.tsx (обновлённый)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

export default function LoginPage() {
  const { t } = useTranslate();
  const router = useRouter();
  const { profile, loading: userLoading, refreshProfile } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const year = new Date().getFullYear();

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Отслеживание мыши только на десктопе
  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  useEffect(() => {
    if (!userLoading && profile) {
      router.push('/');
    }
  }, [profile, userLoading, router]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
      setError(t('Пожалуйста, заполните все поля'));
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      } else {
        await refreshProfile();
        router.push('/');
      }
    } catch (e) {
      console.error('Login error:', e);
      setError(t('Произошла ошибка при входе в систему'));
      setIsLoading(false);
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      await handleLogin();
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-orange-50">
        <div className="w-8 h-8 border-2 border-[#D77E6C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profile) return null;

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Фон с параллаксом только на десктопе */}
      {!isMobile ? (
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[#D77E6C]/10 to-[#E89185]/5 rounded-full blur-3xl"
            animate={{ x: mousePosition.x * 0.5, y: mousePosition.y * 0.5, rotate: 360 }}
            transition={{
              x: { type: 'spring', stiffness: 50, damping: 20 },
              y: { type: 'spring', stiffness: 50, damping: 20 },
              rotate: { duration: 60, repeat: Infinity, ease: 'linear' }
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-rose-200/10 to-orange-100/5 rounded-full blur-3xl"
            animate={{ x: -mousePosition.x * 0.3, y: -mousePosition.y * 0.3, rotate: -360 }}
            transition={{
              x: { type: 'spring', stiffness: 50, damping: 20 },
              y: { type: 'spring', stiffness: 50, damping: 20 },
              rotate: { duration: 80, repeat: Infinity, ease: 'linear' }
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[#D77E6C]/5 to-[#E89185]/3 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-rose-200/5 to-orange-100/3 rounded-full blur-3xl" />
        </div>
      )}

      {/* Основной контент */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 relative">
            {/* Простой декоративный элемент */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D77E6C] to-[#E89185]" />

            {/* Логотип */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-[#D77E6C]/10 to-[#E89185]/10 rounded-2xl">
                <img src="/icons/company/tannur_black.svg" alt="Tannur Logo" className="w-10 h-10 object-contain" />
              </div>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#E89185] bg-clip-text text-transparent mb-2">
                {t('Добро пожаловать')}
              </h1>

              <p className="text-gray-600 font-medium">
                {t('Войдите в Tannur CRM для продолжения')}
              </p>
            </div>

            {/* Форма */}
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('Email адрес')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D77E6C]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-4 bg-white/90 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/30 focus:border-[#D77E6C] transition-all duration-200 placeholder-gray-400"
                    placeholder={t('example@tannur.com')}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('Пароль')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D77E6C]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-12 py-4 bg-white/90 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/30 focus:border-[#D77E6C] transition-all duration-200 placeholder-gray-400"
                    placeholder={t('Введите ваш пароль')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D77E6C] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Ошибка */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Опции */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-[#D77E6C] border-gray-300 rounded focus:ring-[#D77E6C]" />
                  <span className="text-gray-600 font-medium">{t('Запомнить меня')}</span>
                </label>
                <a href="#" className="text-[#D77E6C] hover:text-[#C56D5C] font-semibold transition-colors">
                  {t('Забыли пароль?')}
                </a>
              </div>

              {/* Кнопка входа */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#D77E6C] to-[#E89185] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#E89185] to-[#D77E6C] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="relative z-10 flex items-center gap-3">
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      {t('Войти в систему')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Безопасность */}
            <div className="mt-8 pt-6 border-t border-gray-200/50">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">{t('Защищено SSL шифрованием')}</span>
              </div>
            </div>
          </div>

          {/* Футер */}
          <footer className="text-center py-6 mt-6">
            <p className="text-xs text-gray-400 font-medium">
              {t('© {year} Tannur Cosmetics. Все права защищены.').replace('{year}', String(year))}
            </p>
          </footer>
        </motion.div>
      </main>
    </div>
  );
}
