// src/components/header/MoreHeader.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface MoreHeaderProps {
  title: string;
}

export default function MoreHeader({ title }: MoreHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState<string>('Загрузка...');
  const [avatarUrl, setAvatarUrl] = useState<string>('/img/avatar-default.png');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !user) {
        setName('Гость');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profile && !profileError) {
        setName(`${profile.first_name} ${profile.last_name}`);
        setAvatarUrl(profile.avatar_url || '/img/avatar-default.png');
      } else {
        setName(user.email ?? 'Пользователь');
      }
    }

    loadProfile();
  }, []);

  const handleProfile = () => router.push('/myprofile');
  const handleNotifications = () => router.push('/notifications');
  const handleSignOut = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/signin');
  };

  const menuItems = [
    { label: 'Tannur Главная', href: '/', icon: '/icons/company/tannurapp_1.svg' },
    { label: 'Мой дэшборд', href: '/dealer/dashboard', icon: '/icons/sidebar/homegray.svg', activeIcon: '/icons/sidebar/homewhite.svg' },
    { label: 'Моя команда', href: '/dealer/myteam', icon: '/icons/sidebar/teamgray.svg', activeIcon: '/icons/sidebar/teamwhite.svg' },
    { label: 'Мои финансы', href: '/dealer/stats', icon: '/icons/sidebar/statsgray.svg', activeIcon: '/icons/sidebar/statswhite.svg' },
    { label: 'Tannur Store', href: '/dealer/shop', icon: '/icons/sidebar/storegray.svg', activeIcon: '/icons/sidebar/storewhite.svg' },
    { label: 'Tannur BA', href: '/dealer/education', icon: '/icons/sidebar/tnbagray.svg', activeIcon: '/icons/sidebar/tnbawhite.svg' },
    { label: 'Файлы', href: '/dealer/documents', icon: '/icons/sidebar/foldergray.svg', activeIcon: '/icons/sidebar/folderwhite.svg' },
  ];

  return (
    <div className="w-full border-b border-black/20 mb-10 relative">
      <div className="h-[72px] flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <h1 className="text-xl md:text-3xl font-semibold text-[#111] leading-tight truncate max-w-[180px] md:max-w-full">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 leading-tight truncate max-w-[200px] md:max-w-full">
            Tannur Cosmetics © 2025. All Rights Reserved.
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={handleNotifications}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white flex items-center justify-center"
          >
            <Image
              src="/icons/buttom/IconBell.svg"
              alt="Уведомления"
              width={16}
              height={16}
            />
          </button>

          <button
            onClick={handleProfile}
            className="flex items-center bg-white rounded-full py-1 pl-1 pr-2 md:pr-3 gap-1 md:gap-2"
          >
            <Image
              src={avatarUrl}
              alt="avatar"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="hidden md:block text-sm text-[#111] font-medium truncate max-w-[200px]">
              {name}
            </span>
            <Image
              src="/icons/buttom/DoubleIconArrowBlack.svg"
              alt="arrow"
              width={16}
              height={16}
            />
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center md:hidden"
          >
            <Image
              src="/icons/hamburger.svg"
              alt="Меню"
              width={16}
              height={16}
            />
          </button>

          <button
            onClick={handleSignOut}
            className="w-5 h-5 md:w-6 md:h-6 hidden md:flex items-center justify-center"
          >
            <Image
              src="/icons/buttom/IconSignOut.svg"
              alt="Выйти"
              width={16}
              height={16}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Задний размыт-затемнённый фон */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Меню */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '60%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[120%] bg-gradient-to-b from-[#F4ECEB] to-white z-50 flex flex-col items-start p-6 space-y-4 md:hidden shadow-lg"
            >
              <div className="w-full flex justify-between items-center mb-4">
                <Image src="/icons/company/tannur_black.svg" alt="Логотип" width={120} height={24} />
                <button onClick={() => setMenuOpen(false)} className="text-3xl">×</button>
              </div>
              {menuItems.map(({ label, href, icon, activeIcon }) => {
                const isActive = pathname === href;
                return (
                  <button
                    key={href}
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(href);
                    }}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl w-full text-left transition-all ${
                      isActive ? 'bg-[#D77E6C] text-white' : 'text-black hover:bg-[#F4ECEB]'
                    }`}
                  >
                    <Image
                      src={isActive && activeIcon ? activeIcon : icon}
                      alt={label}
                      width={20}
                      height={20}
                    />
                    <span className="text-base font-medium">{label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
