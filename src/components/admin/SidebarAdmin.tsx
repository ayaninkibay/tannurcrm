'use client';

import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FastLink } from '@/components/FastLink';
import { useTranslate } from '@/hooks/useTranslate';
import { 
  LayoutDashboard, 
  Users2, 
  ShoppingBag, 
  GraduationCap, 
  Wallet, 
  Package,
  LucideIcon 
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { hasPageAccess } from '@/lib/permissions';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  permissions: string[];
}

const adminNavItems: NavItem[] = [
  { 
    href: '/admin/dashboard', 
    icon: LayoutDashboard, 
    label: 'Дэшборд',
    permissions: ['all', 'warehouse', 'orders', 'finance']
  },
  { 
    href: '/admin/teamcontent', 
    icon: Users2, 
    label: 'Команда',
    permissions: ['all']
  },
  { 
    href: '/admin/store', 
    icon: ShoppingBag, 
    label: 'Tannutstore',
    permissions: ['all', 'orders']
  },
  { 
    href: '/admin/tnba', 
    icon: GraduationCap, 
    label: 'Академия',
    permissions: ['all']
  },
  { 
    href: '/admin/finance', 
    icon: Wallet, 
    label: 'Финансы',
    permissions: ['all', 'finance']
  },
  { 
    href: '/admin/warehouse', 
    icon: Package, 
    label: 'Склад',
    permissions: ['all', 'warehouse']
  }
];

export default function DashboardSidebarAdmin() {
  const { t } = useTranslate();
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeTop, setActiveTop] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  // Фильтруем навигацию по правам пользователя
  const visibleNavItems = adminNavItems.filter(item => {
    if (!profile?.permissions) return false;
    
    // Если у пользователя есть хотя бы одно из требуемых разрешений
    return item.permissions.some(permission => 
      profile.permissions?.includes(permission)
    );
  });

  useLayoutEffect(() => {
    const updateActiveTop = () => {
      if (pathname === null) {
        setActiveTop(null);
        return;
      }
      const activeItemIndex = visibleNavItems.findIndex(item => pathname.startsWith(item.href));
      const activeEl = itemRefs.current[activeItemIndex];
      const containerEl = containerRef.current;

      if (activeEl && containerEl) {
        const offset = activeEl.getBoundingClientRect().top - containerEl.getBoundingClientRect().top;
        setActiveTop(offset);
      } else {
        setActiveTop(null);
      }
    };

    updateActiveTop();
    window.addEventListener('resize', updateActiveTop);
    return () => window.removeEventListener('resize', updateActiveTop);
  }, [pathname, visibleNavItems]);

  useEffect(() => {
    setLoadingIndex(null);
  }, [pathname]);

  const goToHome = () => {
    if (pathname !== null && pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <aside
      className="
        hidden
        lg:flex
        fixed left-0 top-0
        h-screen w-22
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
          w-[40px] h-[40px]
          rounded-xl flex items-center justify-center transition-all
          ${pathname === '/' ? 'bg-[#D77E6C]' : 'hover:bg-black/10'}
        `}
        title={t('Главная')}
      >
        <div className="text-3xl font-bold">T</div>
      </button>

      {/* Навигация */}
      <div
        ref={containerRef}
        className="relative flex-grow flex flex-col justify-center items-center gap-8 mt-2 w-full"
      >
        {activeTop !== null && (
          <motion.div
            layout
            layoutId="admin-active-indicator"
            className="
              absolute
              w-[45px] h-[45px]
              bg-[#D77E6C] rounded-xl left-1/2 -translate-x-1/2 z-0
            "
            style={{ top: activeTop }}
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}

        {visibleNavItems.map((item, idx) => {
          const isActive = pathname !== null && pathname.startsWith(item.href);
          const isCurrentlyLoading = loadingIndex === idx;
          const Icon = item.icon;

          return (
            <FastLink
              href={item.href}
              key={item.href}
              prefetch={false}
              onLoadingChange={(loading) => {
                if (loading) setLoadingIndex(idx);
                else setLoadingIndex(null);
              }}
              className="relative z-10"
              prefetchDelay={150}
            >
              <div
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className="
                  w-[45px] h-[45px]
                  rounded-xl flex items-center justify-center
                  transition-all hover:bg-[#00000011]
                "
                title={t(item.label)}
              >
                {isCurrentlyLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full" />
                ) : (
                  <Icon
                    size={24}
                    className={
                      isActive
                        ? 'text-white'
                        : 'text-gray-500'
                    }
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