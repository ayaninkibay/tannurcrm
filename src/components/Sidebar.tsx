// src/components/Sidebar.tsx — фикс: unoptimized + fallback если иконка не загрузилась
'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FastLink } from '@/components/FastLink';
import { useTranslate } from '@/hooks/useTranslate';

const navItems = [
  { href: '/dealer/dashboard', icon: '/icons/Icon home white.png',  iconGray: '/icons/Icon home gray.png',  label: 'Дэшбоpд' },
  { href: '/dealer/myteam',    icon: '/icons/Icon share white.png', iconGray: '/icons/Icon share gray.png', label: 'Моя комaнда' },
  { href: '/dealer/shop',      icon: '/icons/Icon shop white.png',  iconGray: '/icons/Icon shop gray.png',  label: 'Магaзин' },
  { href: '/dealer/education', icon: '/icons/Icon course white.png',iconGray: '/icons/Icon course gray.png',label: 'Акaдемия Tannur' },
  { href: '/dealer/stats',     icon: '/icons/IconStatsOpacity.svg', iconGray: '/icons/IconStatsGray.svg',   label: 'Вaши финансы' },
  { href: '/dealer/documents', icon: '/icons/Icon docs white.png',  iconGray: '/icons/Icon docs gray.png',  label: 'Вaши файлы' },
];

export default function Sidebar() {
  const { t } = useTranslate();
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeTop, setActiveTop] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  // помечаем иконку как “сломалась”, чтобы показать запасную
  const [broken, setBroken] = useState<Record<string, boolean>>({});

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

          // если белая иконка не загрузилась, показываем серую как фолбэк
          const src = isActive
            ? item.iconGray
            : broken[item.href] ? item.iconGray : item.icon;

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
    </aside>
  );
}
