// src/components/DashboardSidebarAdmin.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const adminNavItems = [
  { href: '/admin/dashboard',           icon: '/icons/sidebar/homewhite.svg',      iconGray: '/icons/sidebar/homegray.svg',      label: 'Админ Главная' },
  { href: '/admin/store',               icon: '/icons/sidebar/storewhite.svg',     iconGray: '/icons/sidebar/storegray.svg',     label: 'Магазин' },
  { href: '/admin/teamcontent',         icon: '/icons/sidebar/teamwhite.svg',      iconGray: '/icons/sidebar/teamgray.svg',      label: 'Команда' },
  { href: '/admin/settings',            icon: '/icons/sidebar/settingswhite.svg',  iconGray: '/icons/sidebar/settingsgray.svg',  label: 'Настройки' },
  { href: '/admin/educationcontent',    icon: '/icons/sidebar/statswhite.svg',     iconGray: '/icons/sidebar/statsgray.svg',     label: 'Ваши финансы' },
  { href: '/admin/warehouse',           icon: '/icons/sidebar/warehousewhite.svg', iconGray: '/icons/sidebar/warehousegray.svg', label: 'Склад' },
  { href: '/admin/documents',           icon: '/icons/sidebar/folderwhite.svg',    iconGray: '/icons/sidebar/foldergray.svg',    label: 'Документы' },
];

export default function DashboardSidebarAdmin() {
  const pathname = usePathname();
  const router   = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // подчёркиваем, что наш массив может содержать HTMLDivElement или null
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeTop, setActiveTop] = useState(0);

  useLayoutEffect(() => {
    function calculateActiveTop() {
      const idx = adminNavItems.findIndex(item => item.href === pathname);
      const activeEl = itemRefs.current[idx];
      const containerEl = containerRef.current;
      if (activeEl && containerEl) {
        const offset = activeEl.getBoundingClientRect().top - containerEl.getBoundingClientRect().top;
        setActiveTop(offset);
      }
    }
    calculateActiveTop();
    window.addEventListener('resize', calculateActiveTop);
    return () => window.removeEventListener('resize', calculateActiveTop);
  }, [pathname]);

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-36 bg-[#F6F6F6] border-r border-gray-300 z-10 flex-col items-center pt-14 pb-8">
      {/* Логотип */}
      <button
        onClick={() => router.push('/')}
        className={`mb-8 w-[70px] h-[70px] rounded-xl flex items-center justify-center transition-all ${
          pathname === '/' ? 'bg-[#D77E6C]' : 'hover:bg-gray-100'
        }`}
        title="Админ Главная"
      >
        <Image src="/icons/company/tannur_black.svg" alt="Логотип" width={70} height={70} />
      </button>

      {/* Навигация */}
      <div ref={containerRef} className="relative flex-grow flex flex-col justify-center items-center gap-6">
        {/* Фон активного пункта */}
        <motion.div
          layout
          layoutId="admin-active-indicator"
          className="absolute w-[60px] h-[60px] bg-[#D77E6C] rounded-xl left-1/2 -translate-x-1/2 z-0"
          style={{ top: activeTop }}
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />

        {adminNavItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href} className="relative z-10">
              <div
                ref={el => { itemRefs.current[i] = el; }}
                className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center transition-all ${
                  isActive ? '' : 'hover:bg-gray-100'
                }`}
                title={item.label}
              >
                <Image
                  src={isActive ? item.iconGray : item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  style={{
                    filter: isActive
                      ? 'brightness(0) invert(1)'
                      : 'grayscale(100%) brightness(0.5)'
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
