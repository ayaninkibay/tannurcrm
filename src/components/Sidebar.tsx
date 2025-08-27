// src/components/Sidebar.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ
'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FastLink } from '@/components/FastLink';

const navItems = [
  {
    href: '/dealer/dashboard',
    icon: '/icons/Icon home white.png',
    iconGray: '/icons/Icon home gray.png',
    label: 'Дэшборд',
  },
  {
    href: '/dealer/myteam',
    icon: '/icons/Icon share white.png',
    iconGray: '/icons/Icon share gray.png',
    label: 'Моя команда',
  },
  {
    href: '/dealer/shop',
    icon: '/icons/Icon shop white.png',
    iconGray: '/icons/Icon shop gray.png',
    label: 'Магазин',
  },
  {
    href: '/dealer/education',
    icon: '/icons/Icon course white.png',
    iconGray: '/icons/Icon course gray.png',
    label: 'Академия Tannur',
  },
  {
    href: '/dealer/stats',
    icon: '/icons/IconStatsOpacity.svg',
    iconGray: '/icons/IconStatsGray.svg',
    label: 'Ваши финансы',
  },
  {
    href: '/dealer/documents',
    icon: '/icons/Icon docs white.png',
    iconGray: '/icons/Icon docs gray.png',
    label: 'Ваши файлы',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeTop, setActiveTop] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const goToHome = () => {
    if (pathname !== '/') {
      router.push('/');
    }
  };

  useLayoutEffect(() => {
    const updateActiveTop = () => {
      if (pathname === null) {
        setActiveTop(null);
        return;
      }

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

  useEffect(() => {
    setLoadingIndex(null);
  }, [pathname]);

  const handleClick = (e: React.MouseEvent, idx: number, href: string) => {
    // Убираем preventDefault и router.push - теперь это делает FastLink
    // Оставляем только логику для совместимости (если нужна)
  };

  return (
    <aside
      className="
        hidden
        lg:flex
        fixed left-0 top-0
        h-screen w-22
        bg-[#e08672] z-10
        flex-col items-center pt-12 pb-6
      "
    >
      {/* Логотип */}
      <button
        onClick={goToHome}
        className={`
          mb-6 mt-4
          w-[50px] h-[50px]
          rounded-xl flex items-center justify-center transition-all
          ${pathname === '/' ? 'bg-[#d9d9d9]' : 'hover:bg-white/20'}
        `}
        title="Главная"
      >
        <Image
          src="/icons/company/tannur_white.svg"
          alt="Логотип"
          width={70}
          height={70}
        />
      </button>

      {/* Навигация */}
      <div
        ref={containerRef}
        className="relative flex-grow flex flex-col justify-center items-center gap-8 mt-2 w-full"
      >
        {activeTop !== null && ( 
          <motion.div
            layout
            layoutId="active-indicator"
            className="
              absolute
              w-[50px] h-[50px]
              bg-white rounded-xl left-1/2 -translate-x-1/2 z-0
            "
            style={{ top: activeTop }}
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}

        {navItems.map((item, idx) => {
          const isActive = pathname !== null && pathname.startsWith(item.href); 
          const isCurrentlyLoading = loadingIndex === idx;
          
          return (
            <FastLink
              href={item.href}
              key={item.href}
              prefetch={false}
              onLoadingChange={(loading) => {
                if (loading) {
                  setLoadingIndex(idx)
                } else {
                  setLoadingIndex(null)
                }
              }}
              className="relative z-10"
              prefetchDelay={150}
            >
              <div
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className="
                  w-[50px] h-[50px]
                  rounded-xl flex items-center justify-center
                  transition-all hover:bg-[#ffffff33]
                "
                title={item.label}
              >
                {isCurrentlyLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Image
                    src={isActive ? item.iconGray : item.icon} 
                    alt={item.label}
                    width={22}
                    height={22}
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