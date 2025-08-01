// src/components/header/MoreHeader.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import hamburgerAnimation from '@/lotties/Menu.json';
import { useUser } from '@/context/UserContext'



interface MoreHeaderProps {
  title: string;
}

export default function MoreHeader({ title }: MoreHeaderProps) {
  const { profile, loading } = useUser(); // ✅

  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState<string>('Загрузка...');
  const [avatarUrl, setAvatarUrl] = useState<string>('/img/avatar-default.png');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showInqoInfo, setShowInqoInfo] = useState<boolean>(false);

useEffect(() => {
  if (!loading && profile) {
    setName(`${profile.first_name} ${profile.last_name}`);
    setAvatarUrl(profile.avatar_url || '/img/avatar-default.png');
  }
}, [profile, loading]);

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
    <div className="w-full border-b border-black/20 relative">
      <div className="h-[72px] flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <h1 className="text-xl md:text-3xl font-semibold text-[#111] leading-tight truncate max-w-[180px] md:max-w-full">
            {title}
          </h1>
          <p className="text-sm hidden md:block md:text-sm text-gray-400 leading-tight truncate max-w-[200px] md:max-w-full">
            Tannur Cosmetics © 2025. All Rights Reserved.
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={handleNotifications}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white flex items-center justify-center"
          >
            <Image
              src="/icons/notification_red.svg"
              alt="Уведомления"
              width={24}
              height={24}
            />
          </button>

          <button
            onClick={handleProfile}
            className="flex items-center bg-white rounded-full py-1 pl-1 pr-1 md:pr-3 gap-1 md:gap-2"
          >
            <Image
              src={avatarUrl}
              alt="avatar"
              width={28}
              height={28}
              className="rounded-full"
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
            />
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center lg:hidden"
          >
            <Lottie
            animationData={hamburgerAnimation}
            loop={true}
            autoplay={true}
            className="w-10 h-10"
          />

          </button>

          <button
            onClick={handleSignOut}
            className="w-5 h-5 md:w-6 md:h-6 hidden lg:flex items-center justify-center"
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
            >
              <div className="w-full">
                <div className="w-full flex justify-between items-center mb-4">
                  <Image src="/icons/company/tannur_black.svg" alt="Логотип" width={70} height={24} />
                  <button onClick={() => setMenuOpen(false)} className="text-3xl">×</button>
                </div>
                <div className="w-full h-px bg-gray-300 mt-5 mb-10" />

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

                <div className="w-full h-px bg-gray-300 mt-10 mb-10 my-3" />

                <p className="text-[#D77E6C] text-sm px-4 font-semibold uppercase">Прочее</p>
                <div className="flex flex-col gap-2 mt-2">
                  <button className="flex items-center gap-3 px-4 py-2 rounded-xl w-full text-left text-black font-medium hover:bg-[#F4ECEB]">
                    <Image src="/icons/buttom/settingsblack.svg" alt="Язык" width={20} height={20} />
                    Русский
                  </button>
                  <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2 font-medium rounded-xl w-full text-left text-black hover:bg-[#F4ECEB]">
                    <Image src="/icons/buttom/signout_black.svg" alt="Выйти" width={20} height={20} />
                    Выйти
                  </button>
                </div>
              </div>

              <div className="w-full text-[12px] text-gray-400 text-start mt-auto px-4">
                Tannur Cosmetics (C) 2025.<br />
                Created by <span className="text-red-400 cursor-pointer" onClick={() => setShowInqoInfo(true)}>Inqo Technologies</span>.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInqoInfo && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center backdrop-blur-sm bg-black/40 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInqoInfo(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center text-black shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
                <div className="p-4 rounded-2xl text-center max-w-xs w-full">
                  <Image src="/icons/inqo.svg" alt="Inqo Logo" width={48} height={48} className="mx-auto mb-4" />
                  <h2 className="text-md font-semibold mb-2">
                    Tannur CRM был разработан в<br />Inqo Technologies
                  </h2>
                  <p className="text-sm text-gray-500">www.inqo.tech</p>
                </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}