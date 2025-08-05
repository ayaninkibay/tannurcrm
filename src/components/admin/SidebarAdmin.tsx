'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const adminNavItems = [
  { href: '/admin/dashboard',           icon: '/icons/sidebar/homewhite.svg',      iconGray: '/icons/sidebar/homegray.svg',      label: 'Дэшборд' },
  { href: '/admin/reports',               icon: '/icons/sidebar/reportgray.svg',     iconGray: '/icons/sidebar/reportwhite.svg',     label: 'Отчеты' },
  { href: '/admin/teamcontent',         icon: '/icons/sidebar/teamwhite.svg',      iconGray: '/icons/sidebar/teamgray.svg',      label: 'Команда' },
  { href: '/admin/tnba',            icon: '/icons/sidebar/tnbawhite.svg',  iconGray: '/icons/sidebar/tnbawhite.svg',  label: 'Настройки' },
  { href: '/admin/finance',    icon: '/icons/sidebar/statswhite.svg',     iconGray: '/icons/sidebar/statsgray.svg',     label: 'Ваши финансы' },
  { href: '/admin/warehouse',           icon: '/icons/sidebar/warehousewhite.svg', iconGray: '/icons/sidebar/warehousegray.svg', label: 'Склад' },
  { href: '/admin/documents',           icon: '/icons/sidebar/folderwhite.svg',    iconGray: '/icons/sidebar/foldergray.svg',    label: 'Документы' },
];

export default function DashboardSidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeTop, setActiveTop] = useState(0);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    const updateActiveTop = () => {
      const idx = adminNavItems.findIndex(item => item.href === pathname);
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

  const goToHome = () => {
    if (pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <aside
      className="
        hidden
        lg:flex
        fixed left-0 top-0
        h-screen w-30
        bg-[#f6f6f6] z-10
        flex-col items-center pt-12 pb-6
        border-r border-gray-300
      "
    >
      {/* Логотип */}
      <button
        onClick={goToHome}
        className={`
          mb-6 mt-4
          w-[60px] h-[60px]
          rounded-xl flex items-center justify-center transition-all
          ${pathname === '/' ? 'bg-[#D77E6C]' : 'hover:bg-black/10'}
        `}
        title="Главная"
      >
        <Image
          src="/icons/company/tannur_black.svg"
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
        <motion.div
          layout
          layoutId="admin-active-indicator"
          className="
            absolute
            w-[60px] h-[60px]
            bg-[#D77E6C] rounded-xl left-1/2 -translate-x-1/2 z-0
          "
          style={{ top: activeTop }}
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />

        {adminNavItems.map((item, idx) => {
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
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className="
                  w-[60px] h-[60px]
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
          );
        })}
      </div>
    </aside>
  );
}
