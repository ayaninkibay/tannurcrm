'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import SponsorCard from '@/components/blocks/SponsorCard';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';

export default function CreateDealer() {
  const router = useRouter();
  const { profile } = useUser();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    iin: '',
    region: '',
    instagram: '',
    profession: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) return 'Введите имя';
    if (!formData.last_name.trim()) return 'Введите фамилию';
    if (!formData.email.trim()) return 'Введите email';
    if (!formData.phone.trim()) return 'Введите телефон';
    if (!formData.iin.trim()) return 'Введите ИИН';
    if (formData.iin.length !== 12) return 'ИИН должен содержать 12 цифр';
    if (!/^\d+$/.test(formData.iin)) return 'ИИН должен содержать только цифры';
    if (!formData.region.trim()) return 'Выберите регион';
    if (!formData.profession.trim()) return 'Введите профессию';
    if (!formData.password) return 'Введите пароль';
    if (formData.password.length < 6) return 'Пароль должен быть минимум 6 символов';
    if (formData.password !== formData.confirmPassword) return 'Пароли не совпадают';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!profile) {
      setError('Не удалось определить текущего пользователя');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Получаем текущую сессию
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.access_token) {
        throw new Error('Нет активной сессии');
      }

      console.log('Sending data to Edge Function:', {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        iin: formData.iin,
        region: formData.region,
        instagram: formData.instagram,
        profession: formData.profession,
        parent_id: profile.id
      });

      // Вызываем Edge Function с полными данными формы
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-dealer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          iin: formData.iin,
          region: formData.region,
          instagram: formData.instagram,
          profession: formData.profession,
          parent_id: profile.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge Function error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }

      const result = await response.json();
      console.log('Edge Function result:', result);

      if (!result.user_id) {
        throw new Error(result.error || 'Не удалось создать пользователя');
      }

      const newDealerId = result.user_id;
      console.log('Dealer created with ID:', newDealerId);

      // Данные уже заполнены в Edge Function, поэтому редиректим сразу
      router.push(`/dealer/dealer_payment?dealer_id=${newDealerId}&sponsor_id=${profile.id}`);

    } catch (err) {
      console.error('Error creating dealer:', err);
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col p-2 md:p-6 bg-[#F6F6F6] min-h-screen">
      <MoreHeaderDE title="Создание дилера" />

      <div className="mt-4 mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all hover:shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Назад</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="col-span-1 lg:col-span-5 bg-white rounded-2xl p-6 text-gray-700">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Image src="/icons/IconAppsOrange.svg" width={20} height={20} alt="icon" />
            Регистрация дилера
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Имя */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Имя *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="Введите имя"
              />
            </div>

            {/* Фамилия */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Фамилия *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="Введите фамилию"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="example@email.com"
              />
            </div>

            {/* Телефон */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Телефон *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="+7 (777) 123-45-67"
              />
            </div>

            {/* ИИН */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">ИИН *</label>
              <input
                type="text"
                value={formData.iin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  handleInputChange('iin', value);
                }}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="123456789012"
                maxLength={12}
              />
              <span className="text-xs text-gray-400">
                {formData.iin.length}/12 цифр
              </span>
            </div>

            {/* Регион */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Регион *</label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
              >
                <option value="">Выберите регион</option>
                <option value="Алматы">Алматы</option>
                <option value="Астана">Астана</option>
                <option value="Шымкент">Шымкент</option>
                <option value="Актобе">Актобе</option>
                <option value="Караганда">Караганда</option>
                <option value="Тараз">Тараз</option>
                <option value="Павлодар">Павлодар</option>
                <option value="Усть-Каменогорск">Усть-Каменогорск</option>
                <option value="Семей">Семей</option>
                <option value="Атырау">Атырау</option>
                <option value="Костанай">Костанай</option>
                <option value="Кызылорда">Кызылорда</option>
                <option value="Актау">Актау</option>
                <option value="Петропавловск">Петропавловск</option>
                <option value="Другой">Другой</option>
              </select>
            </div>

            {/* Профессия */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Профессия *</label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="Ваша профессия"
              />
            </div>

            {/* Instagram */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Instagram</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="@username или ссылка"
              />
            </div>

            {/* Пароль */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm text-gray-600">Пароль *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                className="absolute right-3 top-11"
                onClick={() => setShowPassword(prev => !prev)}
              >
                <Image
                  src={showPassword ? '/icons/OffEye.svg' : '/icons/OnEye.svg'}
                  alt="toggle"
                  width={20}
                  height={20}
                  className="opacity-60"
                />
              </button>
            </div>

            {/* Повтор пароля */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm text-gray-600">Повторите пароль *</label>
              <input
                type={showRepeatPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="Повторите пароль"
              />
              <button
                type="button"
                className="absolute right-3 top-11"
                onClick={() => setShowRepeatPassword(prev => !prev)}
              >
                <Image
                  src={showRepeatPassword ? '/icons/OffEye.svg' : '/icons/OnEye.svg'}
                  alt="toggle"
                  width={20}
                  height={20}
                  className="opacity-60"
                />
              </button>
            </div>

            {/* Кнопка создания */}
            <div className="sm:col-span-2 mt-4">
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-[#D77E6C] hover:bg-[#C66B5A] disabled:bg-gray-400 text-white py-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Создание дилера...
                  </>
                ) : (
                  'Создать дилера'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Правая панель */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-2">
            <div className="mt-3">
              <SponsorCard variant="gray"/>
            </div>
          </div>

          <div className="bg-white h-full w-full rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Инструкция по созданию дилера
            </h3>
            <div className="text-xs text-gray-500 leading-relaxed space-y-3 max-h-[300px] overflow-auto">
              <div className="space-y-2">
                <p className="font-medium text-gray-700">1. Заполните все обязательные поля (*)</p>
                <p>2. После создания профиля будет создана заявка на подписку 50,000₸</p>
                <p>3. Заявка будет отправлена финансисту для одобрения</p>
                <p>4. После одобрения дилер получит доступ к системе</p>
                <p className="text-orange-600 font-medium">⚡ Подписка единоразовая и действует навсегда</p>
                
                <div className="border-t pt-3 mt-4">
                  <p className="font-medium text-gray-700 mb-2">Обязательные поля:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Имя и Фамилия</li>
                    <li>• Email и Телефон</li>
                    <li>• ИИН (12 цифр)</li>
                    <li>• Регион</li>
                    <li>• Профессия</li>
                    <li>• Пароль (мин. 6 символов)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}