'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';
import ReferalLink from '@/components/blocks/ReferralLink'
import SponsorCard from '@/components/blocks/SponsorCard'

export default function ProfilePage() {
  const [photoPreview, setPhotoPreview] = useState<string>('/icons/avatar-placeholder.png');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    profession: '',
    instagram: '',
    phone: '',
    email: '',
    city: '',
    subscribers: '',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex flex-col bg-[#F3F3F3] p-2 md:p-6 space-y-6">
      <MoreHeader title="Мой профиль" />

      {/* Заголовки над блоками */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-500 ]">Мои данные</h3>
        <h3 className="text-lg font-medium text-gray-500 ">Изменить данные</h3>
      </div>

      {/* Верхние блоки: аватар (1/3) и форма (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Аватар (col-span-1) */}
 <div className="bg-white rounded-2xl p-6 flex flex-col items-center space-y-4">
          <h4 className="text-lg font-medium text-[#111]">Аян Инкибай</h4>
          <p className="text-sm text-gray-500">inkibay@mail.ru</p>
          <div className="relative w-40 h-40  lg:w-45 h-45 rounded-full overflow-hidden border-2 border-gray-200">
            <Image
              src={photoPreview}
              alt="avatar"
              fill
              className="object-cover"
            />
          </div>
          <label className="text-sm text-[#DC7C67] cursor-pointer">
            Сменить фото
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        </div>

        {/* Форма данных (col-span-2) */}
        <div className="bg-white rounded-2xl p-6 col-span-1 lg:col-span-3">
          <h4 className="text-lg font-medium text-[#111] mb-4">Мои данные</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'firstName', label: 'Имя', placeholder: 'Имя' },
              { name: 'lastName', label: 'Фамилия', placeholder: 'Фамилия' },
              { name: 'profession', label: 'Профессия', placeholder: 'Профессия' },
              { name: 'city', label: 'Город', placeholder: 'Город' },
              { name: 'instagram', label: 'Instagram', placeholder: 'Ссылка на профиль' },
              { name: 'subscribers', label: 'Кол-во подписчиков', placeholder: '0' },
              { name: 'phone', label: 'Телефон', placeholder: 'Номер телефона' },
              { name: 'email', label: 'E-mail', placeholder: 'Email' },
            ].map(field => (
              <div key={field.name} className="flex flex-col space-y-1">
                <label className="text-xs text-gray-500">{field.label}</label>
                <input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full bg-[#F3F3F3] rounded-xl p-3 text-sm focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Смена пароля: 4 колонки */}
<div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
  {/* 1-й блок всегда 1 из 5 */}
  <div className="col-span-1 bg-white p-4 rounded-2xl h-full w-full">
    <div className="text-gray-500 mb-8">Добавить дилера в свою сеть</div>
    <ReferalLink variant="orange" />
  </div>

  {/* 2-й блок тоже всегда 1 из 5 */}
  <div className="col-span-1 bg-white p-4 rounded-2xl h-full w-full">
    <SponsorCard variant="gray" />
  </div>

  {/* 3-й блок на мобильных — 1 из 1, на планшете+ — занимает 3 из 5 */}
  <div className="col-span-1 sm:col-span-3 bg-white p-6 rounded-2xl w-full">
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Левая часть */}
      <div className="w-full sm:w-1/3">
        <h3 className="text-lg font-medium text-[#111]">Сменить пароль</h3>
        <p className="text-xs text-gray-500 mt-1">
          Вы можете восстановить пароль{' '}
          <a href="#" className="text-[#DC7C67] underline">
            Забыли пароль? Восстановить
          </a>
        </p>
      </div>

      {/* Правая часть */}
      <div className="w-full sm:w-2/3 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-500">Введите старый пароль</label>
          <input
            type="password"
            placeholder="Введите старый пароль"
            className="w-full bg-[#F3F3F3] rounded-xl p-3 text-sm focus:outline-none"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-500">Введите новый пароль</label>
          <input
            type="password"
            placeholder="Введите новый пароль"
            className="w-full bg-[#F3F3F3] rounded-xl p-3 text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>

    <div className="mt-5 text-gray-500 text-sm">
      Не передавайте пароль посторонним — даже самому обаятельному коллеге — и
      обязательно включите многофакторную аутентификацию.
    </div>
  </div>
</div>


    </div>
  );
}
