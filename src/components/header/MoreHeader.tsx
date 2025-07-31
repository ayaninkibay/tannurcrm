// src/components/header/MoreHeader.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';

interface MoreHeaderProps {
  title: string;
}

export default function MoreHeader({ title }: MoreHeaderProps) {
  const router = useRouter();
  const [name, setName] = useState<string>('Загрузка...');
  const [avatarUrl, setAvatarUrl] = useState<string>('/img/avatar-default.png');

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

  return (
    <div className="w-full border-b border-black/20 mb-10">
      <div className="h-[72px] flex items-center justify-between">
        {/* Название страницы */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xl md:text-3xl font-semibold text-[#111] leading-tight truncate max-w-[180px] md:max-w-full">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 leading-tight truncate max-w-[200px] md:max-w-full">
            Tannur Cosmetics © 2025. All Rights Reserved.
          </p>
        </div>

        {/* Кнопки уведомлений, профиль, выход */}
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
            <span className="text-xs md:text-sm text-[#111] font-medium whitespace-nowrap truncate max-w-[100px] md:max-w-[200px]">
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
            onClick={handleSignOut}
            className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center"
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
    </div>
  );
}
