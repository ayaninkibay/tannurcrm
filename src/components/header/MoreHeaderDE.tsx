// src/components/header/MoreHeaderDE.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import hamburgerAnimation from '@/components/lotties/Menu.json';
import { useUser } from '@/context/UserContext';
import { useTranslate, type Lang } from '@/hooks/useTranslate';
import { ArrowLeft, ChevronDown, X, ShoppingCart } from 'lucide-react';
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
      // Получаем корзину пользователя
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      if (!cart) {
        setCartCount(0);
        return;
      }

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

  const handleProfile = () => router.push('/dealer/profile');

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
    { label: t('Мой дэшборд')    || 'Мой дэшборд',    href: '/dealer/dashboard', icon: '/icons/Icon home gray.png',   activeIcon: '/icons/Icon home white.png' },
    { label: t('Моя команда')    || 'Моя команда',    href: '/dealer/myteam',    icon: '/icons/Icon share gray.png',  activeIcon: '/icons/Icon share white.png' },
    { label: t('Мои финансы')    || 'Мои финансы',    href: '/dealer/stats',     icon: '/icons/IconStatsGray.svg',    activeIcon: '/icons/IconStatsOpacity.svg' },
    { label: t('Tannur Store')   || 'Tannur Store',   href: '/dealer/shop',      icon: '/icons/Icon shop gray.png',   activeIcon: '/icons/Icon shop white.png' },
    { label: t('Корзина')        || 'Корзина',        href: '/dealer/shop/cart',      icon: '/icons/Icon shop gray.png',   activeIcon: '/icons/Icon shop white.png', showBadge: true },
    { label: t('Tannur BA')      || 'Tannur BA',      href: '/dealer/education', icon: '/icons/Icon course gray.png', activeIcon: '/icons/Icon course white.png' }
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
            className="flex items-center bg-white rounded-full py-1 pl-1 pr-1 md:pr-3 gap-1 md:gap-2"
          >
            <Image
              src={avatarUrl}
              alt={t('Аватар')}
              width={28}
              height={28}
              className="rounded-full"
              unoptimized
            />
            <span className="hidden lg:block text-sm text-[#111] font-medium truncate max-w-[200px]">
              {name}
            </span>
            <Image
              src="/icons/buttom/DoubleIconArrowBlack.svg"
              alt="arrow"
              width={16}
              height={16}
              className="hidden lg:block"
              unoptimized
            />
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center lg:hidden"
            aria-label="Open menu"
          >
            <Lottie
              animationData={hamburgerAnimation}
              loop
              autoplay
              className="w-10 h-10"
            />
          </button>

          <button
            onClick={handleSignOut}
            className="w-5 h-5 md:w-6 md:h-6 hidden lg:flex items-center justify-center"
            aria-label={t('Выйти')}
            title={t('Выйти')}
          >
            <Image
              src="/icons/buttom/IconSignOut.svg"
              alt={t('Выйти')}
              width={16}
              height={16}
              unoptimized
            />
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '60%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[160%] bg-gray-100 z-50 flex flex-col justify-between p-6 space-y-4 lg:hidden shadow-lg"
              role="dialog"
              aria-modal="true"
            >
              <div className="w-full">
                <div className="w-full flex justify-between items-center mb-4">
                  <Image src="/icons/company/tannur_black.svg" alt={t('Логотип')} width={70} height={24} unoptimized />
                  <button onClick={() => setMenuOpen(false)} className="text-3xl" aria-label="Close">×</button>
                </div>
                <div className="w-full h-px bg-gray-300 mt-5 mb-10" />

                {menuItems.map(({ label, href, icon, activeIcon, showBadge }) => {
                  const isActive = pathname === href;
                  return (
                    <button
                      key={href}
                      onClick={() => {
                        setMenuOpen(false);
                        router.push(href);
                      }}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl w-full text-left transition-all relative ${
                        isActive ? 'bg-[#D77E6C] text-white' : 'text-black hover:bg-[#F4ECEB]'
                      }`}
                    >
                      <Image
                        src={isActive && activeIcon ? activeIcon : icon}
                        alt={typeof label === 'string' ? label : ''}
                        width={20}
                        height={20}
                        unoptimized
                      />
                      <span className="text-base font-medium">{label}</span>
                      {showBadge && cartCount > 0 && (
                        <span className="ml-auto w-6 h-6 bg-[#D77E6C] text-white text-xs font-bold rounded-full flex items-center justify-center">
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