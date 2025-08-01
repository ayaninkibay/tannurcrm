'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const celebrityNavItems = [
  {
    href: '/celebrity/dashboard',
    icon: '/icons/sidebar/homewhite.svg',
    iconGray: '/icons/sidebar/homegray.svg',
    label: 'Главная',
  },
  {
    href: '/celebrity/store',
    icon: '/icons/sidebar/storewhite.svg',
    iconGray: '/icons/sidebar/storegray.svg',
    label: 'Магазин',
  },
  {
    href: '/celebrity/mypage',
    icon: '/icons/sidebar/mypagewhite.svg',
    iconGray: '/icons/sidebar/mypagegray.svg',
    label: 'Моя страница',
  },
];

export default function SidebarCelebrity() {
 const pathname = usePathname() ?? '';
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeTop, setActiveTop] = useState(0);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    const updateActiveTop = () => {
      const idx = celebrityNavItems.findIndex(item => item.href === pathname);
      const activeEl = itemRefs.current[idx];
      const containerEl = containerRef.current;
      if (activeEl && containerEl) {
        const offset = activeEl.getBoundingClientRect().top - containerEl.getBoundingClientRect().top;
        setActiveTop(offset);
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
    e.preventDefault();
    if (pathname !== href) {
      setLoadingIndex(idx);
      router.push(href);
    }
  };

  const goToDashboard = () => {
    if (pathname !== '/celebrity/dashboard') {
      router.push('/celebrity/dashboard');
    }
  };

  return (
    <aside
      className="
        hidden lg:flex fixed left-0 top-0
        h-screen w-36 bg-[#f6f6f6] z-10
        flex-col items-center pt-12 pb-6 border-r border-gray-300
      "
    >
      {/* Логотип: ведет на Dashboard */}
      <button
        onClick={goToDashboard}
        className={`
          mb-6 mt-4 w-[60px] h-[60px] xl:w-[50px] xl:h-[50px]
          rounded-xl flex items-center justify-center transition-all
          ${pathname.startsWith('/celebrity') ? 'bg-[#D77E6C]' : 'hover:bg-black/10'}
        `}
        title="Dashboard Селебрити"
      >
        <Image
          src="/icons/company/tannur_black.svg"
          alt="Tannur"
          width={70}
          height={70}
        />
      </button>

      {/* Навигация */}
      <div
        ref={containerRef}
        className="relative flex-grow flex flex-col justify-center items-center gap-8 mt-2 w-full"
      >
        {/* Индикатор активного пункта */}
        <motion.div
          layout
          layoutId="celebrity-active-indicator"
          className="
            absolute
            w-[60px] h-[60px] xl:w-[50px] xl:h-[50px]
            bg-[#D77E6C] rounded-xl left-1/2 -translate-x-1/2 z-0
          "
          style={{ top: activeTop }}
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />

        {celebrityNavItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={item.href}
              prefetch={false}
              onClick={(e) => handleClick(e, idx, item.href)}
              className="relative z-10"
            >
              <div
                ref={(el) => { itemRefs.current[idx] = el }}
                className="
                  w-[60px] h-[60px] xl:w-[50px] xl:h-[50px]
                  rounded-xl flex items-center justify-center
                  transition-all hover:bg-[#00000011]
                "
                title={item.label}
              >
                {loadingIndex === idx ? (
                  <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full" />
                ) : (
                  <Image
                    src={isActive ? item.iconGray : item.icon}
                    alt={item.label}
                    width={24}
                    height={24}
                    style={{
                      filter: isActive
                        ? 'brightness(0) invert(1)'
                        : 'grayscale(100%) brightness(0.5)',
                    }}
                  />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
