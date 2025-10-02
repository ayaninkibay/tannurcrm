// page.tsx (обновлённый)
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  ChevronRight, Sparkles, Users, TrendingUp, Award,
  User, Settings, BarChart3, Star, ArrowRight, Building2,
  FileText, Camera, Video, ImageIcon, ChevronDown, ChevronUp,
  Play, Download, FileCheck, LogOut, Shield, Zap, Target,
  LogIn, UserCheck, Briefcase, Crown, Loader2, Server,
  Database, Cpu, Lock, CheckCircle
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Image from 'next/image';
import { useTranslate } from '@/hooks/useTranslate';

export default function HomePage() {
  const { t } = useTranslate();
  const { profile, logout } = useUser();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const year = new Date().getFullYear();
  
  // Оптимизированное состояние мыши только для десктопа
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDocuments, setShowDocuments] = useState(false);
  const [showFactory, setShowFactory] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState('');
  const [loadingSteps, setLoadingSteps] = useState<Array<{text: string; icon: React.ReactNode; duration: number}>>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Мемоизированные варианты анимации
  const animationVariants = useMemo(() => {
    const baseVariants = {
      fadeIn: {
        initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: shouldReduceMotion ? 0.1 : 0.6 }
      },
      scaleIn: {
        initial: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: shouldReduceMotion ? 0.1 : 0.5 }
      }
    };

    // Для мобильных устройств упрощаем анимации
    if (isMobile || shouldReduceMotion) {
      return {
        ...baseVariants,
        backgroundMotion: {
          animate: {},
          transition: { duration: 0 }
        },
        buttonHover: {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: { duration: 0.1 }
        }
      };
    }

    return {
      ...baseVariants,
      backgroundMotion: {
        animate: {
          x: mousePosition.x * 0.5,
          y: mousePosition.y * 0.5,
        },
        transition: { type: "spring", stiffness: 30, damping: 20 }
      },
      buttonHover: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: { duration: 0.2 }
      }
    };
  }, [mousePosition, isMobile, shouldReduceMotion]);

  // Конфигурация шагов загрузки для разных разделов
  const getLoadingSteps = useCallback((target: 'profile' | 'admin' | 'dealer' | 'celebrity') => {
    if (target === 'profile') {
      return [
        { text: t('Загрузка профиля'), icon: <User className="w-4 h-4" />, duration: 200 },
        { text: t('Готово!'), icon: <CheckCircle className="w-4 h-4" />, duration: 100 }
      ];
    }

    const baseSteps = [
      { text: t('Проверка авторизации'), icon: <Lock className="w-4 h-4" />, duration: isMobile ? 200 : 400 },
      { text: t('Загрузка модулей'), icon: <Cpu className="w-4 h-4" />, duration: isMobile ? 300 : 600 },
      { text: t('Подключение к базе данных'), icon: <Database className="w-4 h-4" />, duration: isMobile ? 250 : 500 },
      { text: t('Синхронизация данных'), icon: <Server className="w-4 h-4" />, duration: isMobile ? 350 : 700 }
    ];

    const specificSteps: Record<string, Array<{text: string; icon: React.ReactNode; duration: number}>> = {
      admin: [
        { text: t('Загрузка админ-панели'), icon: <Shield className="w-4 h-4" />, duration: isMobile ? 250 : 500 },
        { text: t('Инициализация системы управления'), icon: <Settings className="w-4 h-4" />, duration: isMobile ? 300 : 600 },
        { text: t('Готово! Переход в панель администратора'), icon: <CheckCircle className="w-4 h-4" />, duration: isMobile ? 200 : 400 }
      ],
      dealer: [
        { text: t('Загрузка CRM дилеров'), icon: <Briefcase className="w-4 h-4" />, duration: isMobile ? 250 : 500 },
        { text: t('Подготовка аналитики продаж'), icon: <BarChart3 className="w-4 h-4" />, duration: isMobile ? 300 : 600 },
        { text: t('Готово! Открываем CRM дилера'), icon: <CheckCircle className="w-4 h-4" />, duration: isMobile ? 200 : 400 }
      ],
      celebrity: [
        { text: t('Загрузка CRM амбассадоров'), icon: <Star className="w-4 h-4" />, duration: isMobile ? 250 : 500 },
        { text: t('Подготовка личного кабинета'), icon: <Crown className="w-4 h-4" />, duration: isMobile ? 300 : 600 },
        { text: t('Готово! Открываем кабинет амбассадора'), icon: <CheckCircle className="w-4 h-4" />, duration: isMobile ? 200 : 400 }
      ]
    };

    return [...baseSteps, ...(specificSteps[target] || [])];
  }, [isMobile, t]);

  // Анимация шагов загрузки
  useEffect(() => {
    if (isNavigating && loadingSteps.length > 0) {
      router.push(navigationTarget);
      
      let stepIndex = 0;
      const runStep = () => {
        if (stepIndex < loadingSteps.length) {
          setCurrentStep(stepIndex);
          setTimeout(() => {
            stepIndex++;
            runStep();
          }, loadingSteps[stepIndex].duration);
        }
      };
      runStep();
    }
  }, [isNavigating, loadingSteps, navigationTarget, router]);

  // Сброс состояния загрузки при монтировании компонента
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setCurrentStep(0);
      setLoadingSteps([]);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Оптимизированный обработчик движения мыши только для десктопа
  useEffect(() => {
    if (isMobile || shouldReduceMotion) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth - 0.5) * 10,
          y: (e.clientY / window.innerHeight - 0.5) * 10
        });
      }, 16);
    };

    window.addEventListener('mousemove', handleMouseMove as any, { passive: true } as any);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any);
      clearTimeout(timeoutId);
    };
  }, [isMobile, shouldReduceMotion]);

  // Функция навигации с анимацией загрузки
  const navigateWithLoading = useCallback((path: string, type: 'profile' | 'admin' | 'dealer' | 'celebrity') => {
    setNavigationTarget(path);
    setLoadingSteps(getLoadingSteps(type));
    setIsNavigating(true);
    router.prefetch(path);
  }, [getLoadingSteps, router]);

  const getActionButtons = useMemo(() => {
    if (!profile) {
      return [{
        text: t('Войти в CRM'),
        subtext: t('Начните работу с системой'),
        action: () => router.push('/signin'),
        icon: <LogIn className="w-5 h-5" />,
        primary: true
      }];
    }

    switch (profile.role) {
      case 'admin':
        return [
          {
            text: t('Панель управления'),
            subtext: t('Полный контроль системы'),
            action: () => navigateWithLoading('/admin/dashboard', 'admin'),
            icon: <Shield className="w-5 h-5" />,
            primary: true
          },
          {
            text: t('CRM Дилеров'),
            action: () => navigateWithLoading('/dealer/dashboard', 'dealer'),
            icon: <BarChart3 className="w-5 h-5" />
          },
          {
            text: t('CRM Селебрити'),
            action: () => navigateWithLoading('/celebrity/dashboard', 'celebrity'),
            icon: <Star className="w-5 h-5" />
          }
        ];
      case 'dealer':
        return [{
          text: t('Войти в CRM'),
          subtext: t('Управление продажами'),
          action: () => navigateWithLoading('/dealer/dashboard', 'dealer'),
          icon: <BarChart3 className="w-5 h-5" />,
          primary: true
        }];
      case 'celebrity':
        return [{
          text: t('Войти в CRM'),
          subtext: t('Личный кабинет амбассадора'),
          action: () => navigateWithLoading('/celebrity/dashboard', 'celebrity'),
          icon: <Star className="w-5 h-5" />,
          primary: true
        }];
      default:
        return [{
          text: t('Войти в систему'),
          subtext: t('Начните работу с системой'),
          action: () => router.push('/signin'),
          icon: <User className="w-5 h-5" />,
          primary: true
        }];
    }
  }, [profile, navigateWithLoading, router, t]);

  const actionButtons = getActionButtons;

  const getRoleInfo = useCallback((role?: string) => {
    const roleMap: Record<string, {label: string; icon: React.ReactNode; color: string; description: string}> = {
      admin: {
        label: t('Администратор'),
        icon: <Shield className="w-4 h-4" />,
        color: 'from-purple-500 to-purple-700',
        description: t('Полный доступ к системе')
      },
      dealer: {
        label: t('Дилер'),
        icon: <Briefcase className="w-4 h-4" />,
        color: 'from-blue-500 to-blue-700',
        description: t('Партнёр по продажам')
      },
      celebrity: {
        label: t('Амбассадор'),
        icon: <Crown className="w-4 h-4" />,
        color: 'from-yellow-500 to-orange-600',
        description: t('Лицо бренда Tannur')
      }
    };
    
    return roleMap[role ?? ''] || {
      label: t('Пользователь'),
      icon: <User className="w-4 h-4" />,
      color: 'from-gray-500 to-gray-700',
      description: t('Базовый доступ')
    };
  }, [t]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      router.push('/signin');
    }
  }, [logout, router]);

  const handleProfileClick = useCallback(() => {
    const pathMap: Record<string, string> = {
      admin: '/admin/profile',
      dealer: '/dealer/profile',
      celebrity: '/celebrity/profile'
    };
    
    const path = pathMap[profile?.role ?? ''];
    if (path) {
      navigateWithLoading(path, 'profile');
    } else {
      router.push('/signin');
    }
  }, [profile?.role, navigateWithLoading, router]);

  return (
    <>
      {/* Оверлей загрузки */}
      <AnimatePresence mode="wait">
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
            style={{ pointerEvents: 'all' }}
          >
            <div className="max-w-md w-full mx-auto px-6">
              {/* Логотип */}
              <motion.div 
                {...animationVariants.scaleIn}
                className="flex justify-center mb-8"
              >
                <div className="w-[120px] h-[36px] relative">
                  <Image
                    src="/icons/company/tannur_black.svg"
                    alt="Tannur"
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>

              {/* Основной лоадер */}
              <div className="relative mb-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: isMobile ? 1.5 : 2, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="w-24 h-24 rounded-full border-4 border-[#D77E6C]/20"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ 
                        duration: isMobile ? 1 : 1.5, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="absolute inset-2 rounded-full border-4 border-transparent"
                      style={{
                        borderTopColor: '#D77E6C',
                        borderRightColor: '#E89185'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={isMobile ? {} : { scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Sparkles className="w-8 h-8 text-[#D77E6C]" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Шаги загрузки */}
              <div className="space-y-3">
                {loadingSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: index <= currentStep ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: index * (isMobile ? 0.05 : 0.1) }}
                    className={`flex items-center gap-3 ${
                      index === currentStep ? 'text-[#D77E6C]' : 
                      index < currentStep ? 'text-green-500' : 'text-gray-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center">
                      {index < currentStep ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : index === currentStep ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ 
                            duration: isMobile ? 0.8 : 1, 
                            repeat: Infinity, 
                            ease: "linear" 
                          }}
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className={`text-sm font-medium ${index === currentStep ? 'animate-pulse' : ''}`}>
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Прогресс бар */}
              <div className="mt-8 bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#D77E6C] to-[#E89185] rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>

              <motion.p
                {...animationVariants.fadeIn}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-gray-500 mt-4"
              >
                {t('Подготавливаем всё необходимое для вашей работы...')}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основной контент страницы */}
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white via-[#FFF9F7] to-white">
        {/* Упрощенный анимированный фон для мобильных */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#D77E6C]/10 to-transparent rounded-full blur-3xl"
            {...animationVariants.backgroundMotion}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#FFE8E4]/20 to-transparent rounded-full blur-3xl"
            animate={isMobile ? {} : {
              x: -mousePosition.x * 0.5,
              y: -mousePosition.y * 0.5,
            }}
            transition={isMobile ? { duration: 0 } : { type: "spring", stiffness: 30 }}
          />
        </div>

        {/* Хедер с логотипом */}
        <motion.header 
          {...animationVariants.fadeIn}
          className="relative z-10 px-6 py-6 md:px-12 md:py-8"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="w-[80px] h-[36px] sm:w-[120px] sm:h-[36px] relative">
              <Image
                src="/icons/company/tannur_black.svg"
                alt="Tannur"
                fill
                className="object-contain"
                priority 
              />
            </div>

            {profile && (
              <div className="flex items-center gap-2">
                <motion.button
                  {...animationVariants.scaleIn}
                  {...animationVariants.buttonHover}
                  onClick={handleProfileClick}
                  className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all overflow-hidden group"
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#D77E6C] to-[#E89185] flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </motion.button>

                <motion.button
                  {...animationVariants.scaleIn}
                  {...animationVariants.buttonHover}
                  transition={{ delay: 0.1 }}
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center group hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                </motion.button>
              </div>
            )}
          </div>
        </motion.header>

        {/* Основной контент */}
        <main className="relative z-10 px-6 md:px-12 py-12 md:py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Бейдж */}
            <motion.div 
              {...animationVariants.fadeIn}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-[#D77E6C]/5 border border-[#D77E6C]/20 px-4 py-2 rounded-full mb-6"
            >
              <div className="w-2 h-2 bg-[#D77E6C] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">{t('Лидер индустрии красоты с 2024 года')}</span>
            </motion.div>

            {/* Заголовок */}
            <motion.h1 
              {...animationVariants.fadeIn}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              <span className="text-gray-900">
                {t('Добро пожаловать в')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#D77E6C] to-[#C56D5C] bg-clip-text text-transparent">
                Tannur Business Academy
              </span>
            </motion.h1>

            {/* Описание */}
            <motion.p 
              {...animationVariants.fadeIn}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              {t('Управляйте бизнесом эффективно с современной CRM-системой')}
            </motion.p>

            {/* Профиль пользователя если авторизован */}
            {profile && (
              <motion.div 
                {...animationVariants.fadeIn}
                transition={{ delay: 0.35 }}
                className="flex flex-col md:flex-row items-center gap-6 bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-12 max-w-3xl mx-auto"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#D77E6C] to-[#E89185] flex items-center justify-center">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 bg-[#D77E6C]/10 text-[#D77E6C] px-3 py-1 rounded-lg text-xs font-medium">
                        {getRoleInfo(profile.role).icon}
                        {getRoleInfo(profile.role).label}
                      </span>
                    </div>
                    {profile.email && (
                      <p className="text-xs text-gray-500 mt-1">{profile.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="hidden md:block w-px h-16 bg-gray-200" />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#D77E6C]/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#D77E6C]" />
                    </div>
                    <p className="text-sm text-gray-700">{t('Автоматизированные процессы')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#D77E6C]/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-[#D77E6C]" />
                    </div>
                    <p className="text-sm text-gray-700">{t('Умная аналитика и отчётность')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#D77E6C]/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-[#D77E6C]" />
                    </div>
                    <p className="text-sm text-gray-700">{t('Прямые продажи внутри системы')}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Кнопки действий */}
            <motion.div 
              {...animationVariants.fadeIn}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
                {actionButtons.map((btn, idx) => (
                  btn.primary ? (
                    <motion.button
                      key={idx}
                      {...animationVariants.buttonHover}
                      onClick={btn.action}
                      disabled={isNavigating}
                      className="group relative bg-gradient-to-r from-[#D77E6C] to-[#E89185] text-white px-6 sm:px-8 md:px-12 py-4 md:py-5 rounded-2xl font-semibold text-base sm:text-lg md:text-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      <div className="flex items-center justify-center sm:justify-start gap-3">
                        {btn.icon}
                        <div className="text-center sm:text-left">
                          <div className="font-bold">{btn.text}</div>
                          {btn.subtext && <div className="text-xs opacity-90">{btn.subtext}</div>}
                        </div>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform hidden sm:block" />
                      </div>
                      
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D77E6C] to-[#E89185] opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />
                    </motion.button>
                  ) : (
                    <motion.button
                      key={idx}
                      {...animationVariants.buttonHover}
                      onClick={btn.action}
                      disabled={isNavigating}
                      className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl font-medium text-gray-700 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {btn.icon}
                      <span>{btn.text}</span>
                    </motion.button>
                  )
                ))}
              </div>
            </motion.div>

            {/* Дополнительные разделы */}
            <motion.div 
              {...animationVariants.fadeIn}
              transition={{ delay: 0.8 }}
              className="mt-16 space-y-4 max-w-3xl mx-auto"
            >
              {/* Завод */}
              <div>
                <motion.button
                  {...animationVariants.buttonHover}
                  onClick={() => setShowFactory(!showFactory)}
                  className="w-full flex items-center justify-between bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl hover:bg-white/80 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-[#D77E6C]" />
                    <span className="font-medium text-gray-700">{t('Виртуальная экскурсия по заводу')}</span>
                  </div>
                  {showFactory ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </motion.button>
                
                <AnimatePresence>
                  {showFactory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: isMobile ? 0.2 : 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                        <div className="relative h-64 rounded-xl overflow-hidden mb-4 group cursor-pointer">
                          <img 
                            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
                            alt="Завод Tannur"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-16 h-16 text-white" />
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{t('Современное производство')}</h4>
                        <p className="text-gray-600 text-sm mb-4">
                          {t('Наш завод оснащен новейшим оборудованием. Площадь производственных помещений составляет более 10,000 м².')}
                        </p>
                        
                        <motion.button 
                          {...animationVariants.buttonHover}
                          className="flex items-center gap-2 bg-[#D77E6C] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#C56D5C] transition"
                        >
                          <Video className="w-4 h-4" />
                          {t('Смотреть видео-тур')}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Документы */}
              <div>
                <motion.button
                  {...animationVariants.buttonHover}
                  onClick={() => setShowDocuments(!showDocuments)}
                  className="w-full flex items-center justify-between bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl hover:bg-white/80 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#D77E6C]" />
                    <span className="font-medium text-gray-700">{t('Документы и сертификаты')}</span>
                  </div>
                  {showDocuments ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </motion.button>
                
                <AnimatePresence>
                  {showDocuments && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: isMobile ? 0.2 : 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { title: t('ISO 9001:2015'), type: t('Сертификат') },
                            { title: t('Halal Certificate'), type: t('Сертификат') },
                            { title: t('Договор поставки'), type: t('Документ') },
                            { title: t('Маркетинг план'), type: t('PDF') },
                          ].map((doc, idx) => (
                            <motion.div 
                              key={idx} 
                              {...animationVariants.buttonHover}
                              className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl hover:shadow-lg transition-all cursor-pointer group"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <FileCheck className="w-5 h-5 text-[#D77E6C]" />
                                <Download className="w-4 h-4 text-gray-400 group-hover:text-[#D77E6C] transition" />
                              </div>
                              <h5 className="font-medium text-gray-900 text-sm">{doc.title}</h5>
                              <p className="text-xs text-gray-600">{doc.type}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Футер */}
        <motion.footer 
          {...animationVariants.fadeIn}
          transition={{ delay: 1 }}
          className="relative z-10 text-center py-6 mt-12 text-sm text-gray-500"
        >
          <p>{t('© {year} Tannur Cosmetics. Все права защищены.').replace('{year}', String(year))}</p>
        </motion.footer>
      </div>
    </>
  );
}
