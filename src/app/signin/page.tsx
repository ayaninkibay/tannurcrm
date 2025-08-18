'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { 
  Eye, EyeOff, LogIn, Mail, Lock,
  ArrowRight, CheckCircle, Sparkles, Heart
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Создание частиц для анимации
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    // Валидация
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      setIsLoading(false);
      return;
    }
    
    // Вход через Supabase
    const { error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else {
      // Успешный вход - переход на главную страницу
      router.push('/');
    }
  };

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && !isLoading) {
      await handleLogin();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Плавающие частицы */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-gradient-to-r from-[#D77E6C] to-[#E89185] rounded-full opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Анимированный фон */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[#D77E6C]/15 via-[#E89185]/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.8,
            y: mousePosition.y * 0.8,
            rotate: 360,
          }}
          transition={{ 
            x: { type: "spring", stiffness: 30 },
            y: { type: "spring", stiffness: 30 },
            rotate: { duration: 50, repeat: Infinity, ease: "linear" }
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-rose-200/20 via-orange-100/15 to-transparent rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 0.6,
            y: -mousePosition.y * 0.6,
            rotate: -360,
          }}
          transition={{ 
            x: { type: "spring", stiffness: 30 },
            y: { type: "spring", stiffness: 30 },
            rotate: { duration: 40, repeat: Infinity, ease: "linear" }
          }}
        />
        
        {/* Дополнительные декоративные элементы */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#D77E6C] rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-3/4 right-1/3 w-1 h-1 bg-[#E89185] rounded-full"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Основной контент */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="w-full"
        >
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/30 relative overflow-hidden">
            
            {/* Декоративный градиент внутри карточки */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D77E6C] via-[#E89185] to-[#D77E6C]" />
            
            {/* Логотип и заголовок */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D77E6C]/20 to-[#E89185]/20 rounded-2xl blur-lg" />
                <img 
                  src="/icons/company/tannur_black.svg" 
                  alt="Tannur Logo" 
                  className="w-full h-full object-contain relative z-10"
                />
                
                {/* Декоративные элементы вокруг логотипа */}
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-[#D77E6C]" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -left-1 w-3 h-3"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5] 
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-3 h-3 text-rose-400 fill-current" />
                </motion.div>
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-[#D77E6C] via-[#E89185] to-[#D77E6C] bg-clip-text text-transparent mb-2 bg-size-200 animate-pulse"
              >
                Добро пожаловать
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 font-medium"
              >
                Войдите в Tannur CRM для продолжения ✨
              </motion.p>
            </div>

            {/* Форма */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email адрес
                </label>
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#D77E6C]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/30 focus:border-[#D77E6C] transition-all duration-300 placeholder-gray-400"
                    placeholder="example@tannur.com"
                  />
                </motion.div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Пароль
                </label>
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#D77E6C]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-12 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/30 focus:border-[#D77E6C] transition-all duration-300 placeholder-gray-400"
                    placeholder="Введите ваш пароль"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#D77E6C] transition-colors p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </motion.button>
                </motion.div>
              </div>

              {/* Ошибка */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium backdrop-blur-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Опции */}
              <div className="flex items-center justify-between text-sm">
                <motion.label 
                  className="flex items-center gap-2 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <input type="checkbox" className="w-4 h-4 text-[#D77E6C] border-gray-300 rounded focus:ring-[#D77E6C] transition-all" />
                  <span className="text-gray-600 font-medium">Запомнить меня</span>
                </motion.label>
                <motion.a 
                  href="#" 
                  className="text-[#D77E6C] hover:text-[#C56D5C] font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Забыли пароль?
                </motion.a>
              </div>

              {/* Кнопка входа */}
              <motion.button
                onClick={handleLogin}
                disabled={isLoading}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative bg-gradient-to-r from-[#D77E6C] to-[#E89185] text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group overflow-hidden"
              >
                {/* Анимированный фон кнопки */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#E89185] to-[#D77E6C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Блики на кнопке */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-[shimmer_1.5s_ease-in-out]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
                
                <div className="relative z-10 flex items-center gap-3">
                  {isLoading ? (
                    <motion.div 
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Войти в систему
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>

            {/* Безопасность */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 pt-6 border-t border-gray-200/50"
            >
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </motion.div>
                <span className="font-medium">Защищено 256-битным SSL шифрованием</span>
              </div>
            </motion.div>
          </div>

          {/* Футер */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center py-6 mt-6"
          >
            <p className="text-xs text-gray-400 font-medium">
              © 2025 Tannur Cosmetics. Все права защищены.
            </p>
          </motion.footer>
        </motion.div>
      </main>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .bg-size-200 { background-size: 200% 200%; }
      `}</style>
    </div>
  );
}