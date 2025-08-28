// src/components/header/MoreHeaderDE.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import hamburgerAnimation from '@/components/lotties/Menu.json';
import { useUser } from '@/context/UserContext';
import { useTranslate } from '@/hooks/useTranslate'; // Добавляем импорт
import { ArrowLeft, ChevronDown } from 'lucide-react';

interface MoreHeaderDEProps {
  title: string | React.ReactNode;
  showBackButton?: boolean;
}

// Данные языков с флагами
const languages = [
  { code: 'ru', name: 'Русский', flagSvg: '/icons/ru.svg', short: 'RU', className: 'rounded-full' },
  { code: 'cn', name: 'China', flagSvg: '/icons/ch.svg', short: 'CN' },
  { code: 'kz', name: 'Қазақша', flagSvg: '/icons/kz.svg', short: 'KZ' },
];

export default function MoreHeader({ title, showBackButton = false }: MoreHeaderDEProps) {
  const { profile, loading, logout } = useUser();
  const { t, language, changeLanguage } = useTranslate(); // Добавляем хук перевода
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState<string>('Загрузка...');
  const [avatarUrl, setAvatarUrl] = useState<string>('/img/avatar-default.png');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false); // Новое состояние для меню языков
  const [showInqoInfo, setShowInqoInfo] = useState<boolean>(false);

  // Получаем текущий язык
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  useEffect(() => {
    if (!loading && profile) {
      setName(`${profile.first_name} ${profile.last_name}`);
      setAvatarUrl(profile.avatar_url || '/img/avatar-default.png');
    }
  }, [profile, loading]);

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
      console.warn("Pathname is null, cannot determine back path.");
      router.back();
      return;
    }

    const pathSegments = pathname.split('/').filter(Boolean);

    if (pathname.includes('/shop/')) {
      router.push('/dealer/shop');
    } else if (pathname.includes('/myteam/')) {
      router.push('/dealer/myteam');
    } else if (pathname.includes('/stats/')) {
      router.push('/dealer/stats');
    } else if (pathname.includes('/education/')) {
      router.push('/dealer/education');
    } else if (pathname.includes('/documents/')) {
      router.push('/dealer/documents');
    } else {
      router.back();
    }
  };

  // Обновленный список меню с переводами
  const menuItems = [
    { label: t('Tannur Главная') || 'Tannur Главная', href: '/', icon: '/icons/company/tannurapp_1.svg' },
    { label: t('Мой дэшборд') || 'Мой дэшборд', href: '/dealer/dashboard', icon: '/icons/sidebar/homegray.svg', activeIcon: '/icons/sidebar/homewhite.svg' },
    { label: t('Моя команда') || 'Моя команда', href: '/dealer/myteam', icon: '/icons/sidebar/teamgray.svg', activeIcon: '/icons/sidebar/teamwhite.svg' },
    { label: t('Мои финансы') || 'Мои финансы', href: '/dealer/stats', icon: '/icons/sidebar/statsgray.svg', activeIcon: '/icons/sidebar/statswhite.svg' },
    { label: t('Tannur Store') || 'Tannur Store', href: '/dealer/shop', icon: '/icons/sidebar/storegray.svg', activeIcon: '/icons/sidebar/storewhite.svg' },
    { label: t('Tannur BA') || 'Tannur BA', href: '/dealer/education', icon: '/icons/sidebar/tnbagray.svg', activeIcon: '/icons/sidebar/tnbawhite.svg' },
    { label: t('Файлы') || 'Файлы', href: '/dealer/documents', icon: '/icons/sidebar/foldergray.svg', activeIcon: '/icons/sidebar/folderwhite.svg' },
  ];

  // Функция смены языка
  const handleLanguageChange = (langCode: string) => {
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
              title="Назад"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-[#D77E6C] transition-colors" />
            </button>
          )}
          
          <div className="flex flex-col justify-center">
            <h1 className="text-xl md:text-3xl font-semibold text-[#111] leading-tight truncate max-w-[180px] md:max-w-full">
              {title}
            </h1>
            <p className="text-sm hidden md:block md:text-sm text-gray-400 leading-tight truncate max-w-[200px] md:max-w-full">
              Tannur Cosmetics © 2025. All Rights Reserved.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Переключатель языка */}
          <div className="relative">
            <button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="flex items-center gap-1 bg-white rounded-lg px-2 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Image
                src={currentLanguage.flagSvg}
                alt={currentLanguage.name}
                width={20}
                height={15}
                className="object-contain rounded-2xl"
              />
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {currentLanguage.short}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Выпадающее меню языков */}
            <AnimatePresence>
              {languageMenuOpen && (
                <>
                  {/* Невидимая подложка для закрытия меню */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLanguageMenuOpen(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <Image
                          src={lang.flagSvg}
                          alt={lang.name}
                          width={18}
                          height={13}
                          className="object-contain"
                        />
                        <span className="font-medium">{lang.short}</span>
                        <span className="hidden md:block text-xs text-gray-500">{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

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

                <p className="text-[#D77E6C] text-sm px-4 font-semibold uppercase">
                  {t('Прочее') || 'Прочее'}
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  {/* Переключатель языка в мобильном меню */}
                  <div className="px-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Image src="/icons/buttom/settingsblack.svg" alt="Язык" width={20} height={20} />
                      <span className="text-black font-medium">{t('Язык') || 'Язык'}</span>
                    </div>
                    <div className="flex gap-1 ml-7">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                            language === lang.code 
                              ? 'bg-[#D77E6C] text-white' 
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Image
                            src={lang.flagSvg}
                            alt={lang.name}
                            width={16}
                            height={12}
                            className="object-contain"
                          />
                          <span>{lang.short}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSignOut} 
                    className="flex items-center gap-3 px-4 py-2 font-medium rounded-xl w-full text-left text-black hover:bg-[#F4ECEB]"
                  >
                    <Image src="/icons/buttom/signout_black.svg" alt="Выйти" width={20} height={20} />
                    {t('Выйти') || 'Выйти'}
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