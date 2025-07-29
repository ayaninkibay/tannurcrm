'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'           // ← забыл импортировать
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)  // ← забыл объявить
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    console.log('[LoginPage] attempt signInWithPassword', { email })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('[LoginPage] result', { data, error })

    if (error) {
      setError(error.message)
    } else {
      console.log('[LoginPage] login OK, redirecting to /dealer/shop')
      router.push('/dealer/shop')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-[#F4F4F4] px-4 py-6">
      {/* Верхняя панель с логотипом */}
      <div className="w-full flex justify-center mb-4">
        <Image
          src="/icons/company/tannur_black.svg"
          alt="Tannur Logo"
          width={100}
          height={40}
        />
      </div>

      {/* Контейнер формы */}
      <div className="flex flex-col md:flex-row bg-white rounded-3xl w-full max-w-5xl shadow-lg overflow-hidden">
        {/* Левый графический блок */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-1">
          <div className="relative rounded-3xl border-[10px] border-white overflow-hidden">
            <Image
              src="/img/LoginGraphic.png"
              alt="Preview"
              width={500}
              height={500}
              className="rounded-3xl object-cover"
            />
          </div>
        </div>

        {/* Правая часть — сама форма */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12">
          <h2 className="text-3xl font-bold text-black mb-8">
            Добро пожаловать в Tannur CRM
          </h2>

          {/* Email */}
          <label htmlFor="email" className="block text-sm font-medium text-[#111] mb-1">
            Введите e-mail
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-3 rounded-md bg-[#F3F3F3] mb-4 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Пароль */}
          <label htmlFor="password" className="block text-sm font-medium text-[#111] mb-1">
            Введите пароль
          </label>
          <div className="relative mb-4">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 pr-10 rounded-md bg-[#F3F3F3] focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[50%] transform -translate-y-1/2"
            >
              <Image
                src={showPassword ? '/icons/buttom/OffEye.svg' : '/icons/buttom/ShowEye.svg'}
                alt={showPassword ? 'Скрыть' : 'Показать'}
                width={16}
                height={16}
              />
            </button>
          </div>

          {/* Ошибка */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Кнопка входа */}
          <button
            onClick={handleLogin}
            className="bg-[#DC7C67] hover:bg-[#c86d5c] text-white w-full py-3 rounded-md font-medium text-sm mb-4 flex justify-center items-center gap-2"
          >
            <Image src="/icons/buttom/signin.svg" alt="Войти" width={16} height={16} />
            Войти
          </button>

          <p className="text-center text-sm text-[#111]">
            Нет аккаунта?{' '}
            <span className="text-[#DC7C67] cursor-pointer hover:underline">
              Зарегистрироваться
            </span>
          </p>
        </div>
      </div>

      {/* Подвал */}
      <div className="text-xs text-gray-500 text-center pt-6">
        TOO Tannur Cosmetics © 2025. All Rights Reserved.
      </div>
    </div>
  )
}
