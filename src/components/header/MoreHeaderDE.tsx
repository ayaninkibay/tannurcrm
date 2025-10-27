// src/components/header/MoreHeaderDE.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useTranslate, type Lang } from '@/hooks/useTranslate';
import { ArrowLeft, ChevronDown, X, ShoppingCart, Home, Users, TrendingUp, Store, Package, GraduationCap, User, Menu, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface MoreHeaderDEProps {
  title: string | React.ReactNode;
  showBackButton?: boolean;
}

type LanguageOption = {
  code: Lang;
  name: string;
  flagSvg: string;
  short: string;
  className?: string;
};

const languages: LanguageOption[] = [
  { code: 'ru', name: 'Русский', flagSvg: '/icons/ru.svg', short: 'RU', className: 'rounded-full' },
  { code: 'cn', name: 'China',   flagSvg: '/icons/ch.svg', short: 'CN' },
  { code: 'kz', name: 'Қазақша', flagSvg: '/icons/kz.svg', short: 'KZ' },
];

export default function MoreHeader({ title, showBackButton = false }: MoreHeaderDEProps) {
  const { profile, loading, logout } = useUser();
  const { t, language, changeLanguage } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState<string>('Загрузка...');
  const [avatarUrl, setAvatarUrl] = useState<string>('/img/avatar-default.png');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false);
  const [showInqoInfo, setShowInqoInfo] = useState<boolean>(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isNavigatingToProfile, setIsNavigatingToProfile] = useState<boolean>(false);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    if (!loading && profile) {
      setName(`${profile.first_name} ${profile.last_name}`);
      setAvatarUrl(profile.avatar_url || '/img/avatar-default.png');
      loadCartCount();
    }
  }, [profile, loading]);

  // Загрузка количества товаров в корзине
const loadCartCount = async () => {
  if (!profile?.id) return;
  
  try {
    // Получаем последнюю корзину (БЕЗ .single())
    const { data: carts } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!carts || carts.length === 0) {
      setCartCount(0);
      return;
    }

    const cart = carts[0]; // Берем первую (последнюю по дате)

    // Считаем товары в корзине
    const { data: items } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('cart_id', cart.id);

    const total = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    setCartCount(total);
  } catch (error) {
    console.error('Error loading cart:', error);
    setCartCount(0);
  }
};

  // Перезагружаем при смене страницы
  useEffect(() => {
    if (profile?.id) loadCartCount();
  }, [pathname, profile?.id]);

  const handleProfile = () => {
    setIsNavigatingToProfile(true);
    router.push('/dealer/profile');
  };

  const handleSignOut = async () => {
    try {
      setMenuOpen(false);
      await logout();
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };

  const handleBack = () => {
    if (pathname === null) {
      router.back();
      return;
    }
    if (pathname.includes('/shop/')) {
      router.push('/dealer/shop');
    } else if (pathname.includes('/myteam/')) {
      router.push('/dealer/myteam');
    } else if (pathname.includes('/stats/')) {
      router.push('/dealer/stats');
    } else if (pathname.includes('/education/')) {
      router.push('/dealer/education');
    } else {
      router.back();
    }
  };

  const menuItems = [
    { label: t('Главная')    || 'Главная',    href: '/dealer/dashboard', icon: Home },
    { label: t('Моя команда')    || 'Моя команда',    href: '/dealer/myteam',    icon: Users },
    { label: t('Мои финансы')    || 'Мои финансы',    href: '/dealer/stats',     icon: TrendingUp },
    { label: t('Магазин')   || 'Магазин',   href: '/dealer/shop',      icon: Store },
    { label: t('Академия')      || 'Академия',      href: '/dealer/education', icon: GraduationCap },
    { type: 'divider' as const },
    { label: t('Корзина')        || 'Корзина',        href: '/dealer/shop/cart',      icon: ShoppingCart, showBadge: true },
    { label: t('Мои покупки')    || 'Мои покупки',    href: '/dealer/shop/orders',    icon: Package },
    { type: 'divider' as const },
    { label: t('Мой профиль')    || 'Мой профиль',    href: '/dealer/profile',        icon: User, showAvatar: true },
  ];

  const handleLanguageChange = (langCode: Lang) => {
    changeLanguage(langCode);
    setLanguageMenuOpen(false);
  };

  return (
    <div className="w-full -mt-5 border-b border-gray-200 relative">
      <div className="h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors group"
              title={t('Назад')}
              aria-label={t('Назад')}
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-[#D77E6C] transition-colors" />
            </button>
          )}

          <div className="flex flex-col justify-center">
            <h1 className="text-xl md:text-3xl font-semibold text-[#111] leading-tight truncate max-w-[180px] md:max-w-full">
              {title}
            </h1>
            <p className="text-sm hidden md:block md:text-sm text-gray-400 leading-tight truncate max-w-[200px] md:max-w-full">
              {t('Tannur Cosmetics © 2025. All Rights Reserved.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Иконка корзины с счетчиком - только для десктопа */}
          <button
            onClick={() => router.push('/dealer/shop/cart')}
            className="hidden lg:flex relative items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors group"
            title={t('Корзина')}
            aria-label={t('Корзина')}
          >
            <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-[#D77E6C] transition-colors" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[#D77E6C] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            )}
          </button>

          <button
            onClick={handleProfile}
            className="flex items-center bg-white rounded-full py-1 pl-1 pr-3 gap-2 hover:shadow-md transition-shadow relative"
            disabled={isNavigatingToProfile}
          >
            <Image
              src={avatarUrl}
              alt={t('Аватар')}
              width={32}
              height={32}
              className="rounded-full object-cover"
              unoptimized
            />
            <div className="hidden md:flex items-center gap-2">
              <span className="text-base font-medium text-gray-900 leading-tight truncate max-w-[120px]">
                {name}
              </span>
              
              {/* Лоадер рядом с именем */}
              <AnimatePresence>
                {isNavigatingToProfile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="flex items-center"
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-[#D77E6C]/30 border-t-[#D77E6C] rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>

          {/* Language Switcher - Desktop */}
          <div className="hidden lg:flex relative">
            <button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="flex items-center bg-white rounded-full py-1 px-3 gap-2 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-sm">
                <Image
                  src={currentLanguage.flagSvg}
                  alt={currentLanguage.name}
                  width={20}
                  height={20}
                  className={currentLanguage.className}
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{currentLanguage.short}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Language Dropdown */}
            <AnimatePresence>
              {languageMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                        language === lang.code
                          ? 'bg-[#D77E6C]/10 text-[#D77E6C]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-sm">
                        <Image
                          src={lang.flagSvg}
                          alt={lang.name}
                          width={20}
                          height={20}
                          className={lang.className}
                          unoptimized
                        />
                      </div>
                      <span className="font-medium">{lang.short}</span>
                      <span className="text-xs opacity-70 ml-auto">{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Menu Button - Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label={t('Меню')}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-[#FBF7F4] shadow-2xl z-50 flex flex-col lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Image
                    src={avatarUrl}
                    alt={t('Аватар')}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">{t('Добро пожаловать!')}</span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors"
                  aria-label={t('Закрыть')}
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex flex-col gap-2 p-4 flex-1">
                {menuItems.map((item, index) => {
                  if (item.type === 'divider') {
                    return <div key={`divider-${index}`} className="w-full h-px bg-gray-300 my-2" />;
                  }

                  const isActive = pathname === item.href;
                  const IconComponent = item.icon;

                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMenuOpen(false);
                      }}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-[#D77E6C] to-[#E89380] text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-[#F4ECEB]'
                      }`}
                    >
                      {item.showAvatar ? (
                        <Image
                          src={avatarUrl}
                          alt={item.label}
                          width={20}
                          height={20}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      )}
                      <span className="font-medium">{item.label}</span>
                      {item.showBadge && cartCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-[#D77E6C] text-white text-xs font-bold rounded-full">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="w-full h-px bg-gray-300 mt-10 mb-10 my-3" />

                <p className="text-[#D77E6C] text-sm px-4 font-semibold uppercase">
                  {t('Прочее') || 'Прочее'}
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  {/* Переход на главную */}
                  <button
                    onClick={() => {
                      router.push('/');
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 font-medium rounded-xl w-full text-left text-black hover:bg-[#F4ECEB] transition-colors"
                  >
                    <Globe className="w-5 h-5 text-gray-600" />
                    <span>{t('Главная страница') || 'Главная страница'}</span>
                  </button>

                  {/* Переключатель языка в мобильном меню */}
                  <button
                    onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2 font-medium rounded-xl w-full text-left text-black hover:bg-[#F4ECEB] transition-colors"
                  >
                    <Image src="/icons/buttom/settingsblack.svg" alt={t('Язык')} width={20} height={20} unoptimized />
                    <span>{t('Язык') || 'Язык'}</span>
                    <span className="text-xs text-gray-500">({currentLanguage.short})</span>
                    <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Выпадающий список языков */}
                  <AnimatePresence>
                    {languageMenuOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-1 px-4 py-2 bg-white/50 rounded-lg mx-4">
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                handleLanguageChange(lang.code);
                                setLanguageMenuOpen(false);
                              }}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                                language === lang.code
                                  ? 'bg-[#D77E6C] text-white'
                                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <div className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-sm flex-shrink-0">
                                <Image
                                  src={lang.flagSvg}
                                  alt={lang.name}
                                  width={20}
                                  height={20}
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <span className="font-medium">{lang.short}</span>
                              <span className="text-xs opacity-70">{lang.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 font-medium rounded-xl w-full text-left text-black hover:bg-[#F4ECEB]"
                  >
                    <Image src="/icons/buttom/signout_black.svg" alt={t('Выйти')} width={20} height={20} unoptimized />
                    {t('Выйти') || 'Выйти'}
                  </button>
                </div>
              </div>

              <div className="w-full text-[12px] text-gray-400 text-start mt-auto px-4">
                {t('Tannur Cosmetics (C) 2025.')}<br />
                {t('Создано в')} <span 
                  className="text-[#D77E6C] cursor-pointer hover:underline font-medium transition-all" 
                  onClick={() => setShowInqoInfo(true)}
                >
                  Inqo Technologies
                </span>.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Модальное окно Inqo */}
      <AnimatePresence>
        {showInqoInfo && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-md bg-black/50 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInqoInfo(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full relative"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowInqoInfo(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#D77E6C] to-[#C46A5A] rounded-2xl flex items-center justify-center shadow-lg">
                  <Image 
                    src="/icons/inqo.svg" 
                    alt="Inqo Logo" 
                    width={48} 
                    height={48}
                    unoptimized 
                  />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-gray-900 mb-2"
              >
                {t('Разработано в')}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold bg-gradient-to-r from-[#D77E6C] to-[#C46A5A] bg-clip-text text-transparent mb-4"
              >
                Inqo Technologies
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 mb-6"
              >
                {t('Платформа Tannur CRM создана с любовью и вниманием к деталям')}
              </motion.p>

              <motion.a
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                href="https://www.inqo.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D77E6C] to-[#C46A5A] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                {t('Посетить сайт')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.a>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-gray-400 mt-6"
              >
                www.inqo.tech
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}