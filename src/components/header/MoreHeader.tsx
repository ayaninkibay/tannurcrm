// src/components/header/MoreHeader.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'

interface MoreHeaderProps {
  title: string
}

export default function MoreHeader({ title }: MoreHeaderProps) {
  const router = useRouter()
  const [name, setName] = useState<string>('Загрузка...')
  const [avatarUrl, setAvatarUrl] = useState<string>('/img/avatar-default.png')

  useEffect(() => {
    async function loadProfile() {
      // 1) получаем текущего пользователя
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser()

      if (getUserError || !user) {
        setName('Гость')
        return
      }

      // 2) подгружаем профиль из таблицы "users"
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (profile && !profileError) {
        setName(`${profile.first_name} ${profile.last_name}`)
        setAvatarUrl(profile.avatar_url || '/img/avatar-default.png')
      } else {
        // fallback на e-mail
        setName(user.email ?? 'Пользователь')
      }
    }

    loadProfile()
  }, [])

  const handleProfile = () => router.push('/myprofile')
  const handleNotifications = () => router.push('/notifications')
  const handleSignOut = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/signin')
  }

  return (
    <div className="w-full border-b border-black/20 mb-10">
      <div className="h-[72px] flex items-center justify-between">
        {/* Название страницы */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-semibold text-[#111] leading-tight">{title}</h1>
          <p className="text-sm text-gray-400 leading-tight">
            Tannur Cosmetics © 2025. All Rights Reserved.
          </p>
        </div>

        {/* Кнопки уведомлений, профиль, выход */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleNotifications}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
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
            className="flex items-center bg-white rounded-full py-1 pl-1 pr-3 gap-2"
          >
            <Image
              src={avatarUrl}
              alt="avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm text-[#111] font-medium whitespace-nowrap">
              {name}
            </span>
            <Image
              src="/icons/buttom/DoubleIconArrowBlack.svg"
              alt="arrow"
              width={20}
              height={20}
            />
          </button>

          <button
            onClick={handleSignOut}
            className="w-6 h-6 flex items-center justify-center"
          >
            <Image
              src="/icons/buttom/IconSignOut.svg"
              alt="Выйти"
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
