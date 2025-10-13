// src/components/Sidebar.tsx
'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FastLink } from '@/components/FastLink';
import { useTranslate, type Lang } from '@/hooks/useTranslate';
import { ChevronDown } from 'lucide-react';

const navItems = [
  { href: '/dealer/dashboard', icon: '/icons/Icon home white.png',  iconGray: '/icons/Icon home gray.png',  label: 'Дэшбоpд' },
  { href: '/dealer/myteam',    icon: '/icons/Icon share white.png', iconGray: '/icons/Icon share gray.png', label: 'Моя комaнда' },
  { href: '/dealer/stats',     icon: '/icons/IconStatsOpacity.svg', iconGray: '/icons/IconStatsGray.svg',   label: 'Вaши финансы' },
  { href: '/dealer/shop',      icon: '/icons/Icon shop white.png',  iconGray: '/icons/Icon shop gray.png',  label: 'Магaзин' },
  { href: '/dealer/education', icon: '/icons/Icon course white.png',iconGray: '/icons/Icon course gray.png',label: 'Акaдемия Tannur' },
];

type LanguageOption = {
  code: Lang;
  name: string;
  flagSvg: string;
  short: string;
};

const languages: LanguageOption[] = [
  { code: 'ru', name: 'Русский', flagSvg: '/icons/ru.svg', short: 'RU' },
  { code: 'cn', name: 'China',   flagSvg: '/icons/ch.svg', short: 'CN' },
  { code: 'kz', name: 'Қазақша', flagSvg: '/icons/kz.svg', short: 'KZ' },
];

export default function Sidebar() {
  const { t, language, changeLanguage } = useTranslate();
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeTop, setActiveTop] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const goToHome = () => {
    if (pathname !== '/') router.push('/');
  };

  useLayoutEffect(() => {
    const updateActiveTop = () => {
      if (pathname === null) { setActiveTop(null); return; }
      const activeIndex = navItems.findIndex(item => pathname.startsWith(item.href));
      const activeEl = itemRefs.current[activeIndex];
      const containerEl = containerRef.current;
      if (activeEl && containerEl) {
        const containerTop = containerEl.getBoundingClientRect().top;
        const itemTop = activeEl.getBoundingClientRect().top;
        setActiveTop(itemTop - containerTop);
      } else {
        setActiveTop(null);
      }
    };
    updateActiveTop();
    window.addEventListener('resize', updateActiveTop);
    return () => window.removeEventListener('resize', updateActiveTop);
  }, [pathname]);

  useEffect(() => setLoadingIndex(null), [pathname]);

  const handleLanguageChange = (langCode: Lang) => {
    changeLanguage(langCode);
    setLanguageMenuOpen(false);
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-22 bg-[#e08672] z-10 flex-col items-center pt-12 pb-6">
      {/* Логотип */}
      <button
        onClick={goToHome}
        className={`mb-6 mt-4 w-[50px] h-[50px] rounded-xl flex items-center justify-center transition-all ${pathname === '/' ? 'bg-[#d9d9d9]' : 'hover:bg-white/20'}`}
        title={t('Главная')}
      >
        <Image src="/icons/company/tannur_white.svg" alt={t('Логотип')} width={70} height={70} unoptimized />
      </button>

      {/* Навигация */}
      <div ref={containerRef} className="relative flex-grow flex flex-col justify-center items-center gap-8 mt-2 w-full">
        {activeTop !== null && (
          <motion.div
            layout
            layoutId="active-indicator"
            className="absolute w-[50px] h-[50px] bg-white rounded-xl left-1/2 -translate-x-1/2 z-0"
            style={{ top: activeTop }}
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}

        {navItems.map((item, idx) => {
          const isActive = pathname !== null && pathname.startsWith(item.href);
          const isCurrentlyLoading = loadingIndex === idx;
          const src = isActive ? item.iconGray : broken[item.href] ? item.iconGray : item.icon;

          return (
            <FastLink
              href={item.href}
              key={item.href}
              prefetch={false}
              onLoadingChange={(loading) => setLoadingIndex(loading ? idx : null)}
              className="relative z-10"
              prefetchDelay={150}
            >
              <div
                ref={(el) => { itemRefs.current[idx] = el; }}
                className="w-[50px] h-[50px] rounded-xl flex items-center justify-center transition-all hover:bg-[#ffffff33]"
                title={t(item.label)}
              >
                {isCurrentlyLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Image
                    src={src}
                    alt={t(item.label)}
                    width={22}
                    height={22}
                    unoptimized
                    onError={() => setBroken(prev => ({ ...prev, [item.href]: true }))}
                  />
                )}
              </div>
            </FastLink>
          );
        })}
      </div>

      {/* Переключатель языка внизу сайдбара */}
      <div className="relative mt-auto mb-4">
        <button
          onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
          className="w-[50px] h-[50px] rounded-xl flex items-center justify-center hover:bg-white/20 transition-all relative"
          aria-haspopup="menu"
          aria-expanded={languageMenuOpen}
          title={t('Выбрать язык')}
        >
          <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-sm">
            <Image
              src={currentLanguage.flagSvg}
              alt={currentLanguage.name}
              width={24}
              height={24}
              className="object-cover"
              unoptimized
            />
          </div>
          <ChevronDown className="w-3 h-3 text-white absolute bottom-1 right-1" />
        </button>

        {/* Выпадающее меню языков */}
        <AnimatePresence>
          {languageMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-[5]"
                onClick={() => setLanguageMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute left-full bottom-0 ml-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[15] min-w-[160px]"
                role="menu"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      language === lang.code ? 'bg-[#e086721a] text-[#D77E6C]' : 'text-gray-700'
                    }`}
                    role="menuitem"
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
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{lang.short}</span>
                      <span className="text-xs text-gray-500">{lang.name}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}