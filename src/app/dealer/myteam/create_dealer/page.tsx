//src/app/dealer/myteam/create_dealer/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import SponsorCard from '@/components/blocks/SponsorCard';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import { referralService } from '@/lib/referral/referralService';

export default function CreateDealer() {
  const router = useRouter();
  const { profile } = useUser();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '+7 ',
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

  // Availability checks
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [iinChecking, setIinChecking] = useState(false);
  const [iinAvailable, setIinAvailable] = useState<boolean | null>(null);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);

  // Проверка доступности email
  useEffect(() => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setEmailChecking(true);
      const result = await referralService.checkEmailAvailability(formData.email);
      setEmailAvailable(result.available);
      setEmailChecking(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Проверка доступности IIN
  useEffect(() => {
    if (!formData.iin || formData.iin.length !== 12) {
      setIinAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIinChecking(true);
      const result = await referralService.checkIinAvailability(formData.iin);
      setIinAvailable(result.available);
      setIinChecking(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.iin]);

  // Проверка доступности телефона
  useEffect(() => {
    const phoneDigits = formData.phone.replace(/^\+7\s*/, '').replace(/\D/g, '');
    
    if (!formData.phone || phoneDigits.length !== 10) {
      setPhoneAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setPhoneChecking(true);
      const phoneForCheck = formData.phone.replace(/\D/g, '');
      const result = await referralService.checkPhoneAvailability(phoneForCheck);
      setPhoneAvailable(result.available);
      setPhoneChecking(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.phone]);

  const handleInputChange = (field: string, value: string) => {
    // Для телефона - форматирование с +7
    if (field === 'phone') {
      let cleaned = value.replace(/\D/g, '');
      if (cleaned.startsWith('8')) cleaned = '7' + cleaned.slice(1);
      if (!cleaned.startsWith('7')) cleaned = '7' + cleaned;
      cleaned = cleaned.slice(0, 11);
      
      let formatted = '+7';
      if (cleaned.length > 1) formatted += ' ' + cleaned.slice(1, 4);
      if (cleaned.length > 4) formatted += ' ' + cleaned.slice(4, 7);
      if (cleaned.length > 7) formatted += ' ' + cleaned.slice(7, 9);
      if (cleaned.length > 9) formatted += ' ' + cleaned.slice(9, 11);
      
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } 
    // Для ИИН - только цифры
    else if (field === 'iin') {
      const cleaned = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [field]: cleaned }));
    } 
    else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) return 'Введите имя';
    if (!formData.last_name.trim()) return 'Введите фамилию';
    if (!formData.email.trim()) return 'Введите email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Некорректный формат email';
    if (!emailAvailable) return 'Этот email уже зарегистрирован';
    
    const phoneDigits = formData.phone.replace(/^\+7\s*/, '').replace(/\D/g, '');
    if (!formData.phone.trim()) return 'Введите телефон';
    if (phoneDigits.length !== 10) return 'Введите 10 цифр номера';
    if (!phoneAvailable) return 'Этот телефон уже зарегистрирован';
    
    if (!formData.iin.trim()) return 'Введите ИИН';
    if (formData.iin.length !== 12) return 'ИИН должен содержать 12 цифр';
    if (!/^\d+$/.test(formData.iin)) return 'ИИН должен содержать только цифры';
    if (!iinAvailable) return 'Этот ИИН уже зарегистрирован';
    
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
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.access_token) {
        throw new Error('Нет активной сессии');
      }

      // Подготавливаем телефон для отправки (убираем + и пробелы)
      const phoneForDB = formData.phone.replace(/\D/g, '');

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
          phone: phoneForDB,
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

      router.push(`/dealer/myteam/create_dealer/dealer_payment?dealer_id=${newDealerId}&sponsor_id=${profile.id}`);

    } catch (err: any) {
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
      <MoreHeaderDE title="Создание дилера" showBackButton={true}/>

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
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm transition-all ${
                    emailAvailable === false ? 'ring-2 ring-red-300' :
                    emailAvailable === true ? 'ring-2 ring-green-300' :
                    'focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20'
                  }`}
                  placeholder="example@mail.com"
                />
                {emailChecking && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-gray-400" />
                )}
                {!emailChecking && emailAvailable === true && (
                  <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                )}
              </div>
              {emailAvailable === false && (
                <span className="text-xs text-red-600">Этот email уже зарегистрирован</span>
              )}
            </div>

            {/* Телефон */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Телефон *</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm transition-all ${
                    phoneAvailable === false ? 'ring-2 ring-red-300' :
                    phoneAvailable === true ? 'ring-2 ring-green-300' :
                    'focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20'
                  }`}
                  placeholder="+7 707 355 48 35"
                />
                {phoneChecking && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-gray-400" />
                )}
                {!phoneChecking && phoneAvailable === true && (
                  <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                )}
              </div>
              {phoneAvailable === false && (
                <span className="text-xs text-red-600">Этот телефон уже зарегистрирован</span>
              )}
            </div>

            {/* ИИН */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">ИИН *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.iin}
                  onChange={(e) => handleInputChange('iin', e.target.value)}
                  className={`w-full bg-[#F6F6F6] rounded-xl px-4 py-3 text-sm transition-all ${
                    iinAvailable === false ? 'ring-2 ring-red-300' :
                    iinAvailable === true ? 'ring-2 ring-green-300' :
                    'focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20'
                  }`}
                  placeholder="123456789012"
                  maxLength={12}
                />
                {iinChecking && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-gray-400" />
                )}
                {!iinChecking && iinAvailable === true && (
                  <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                )}
              </div>
              <span className="text-xs text-gray-400">
                {formData.iin.length}/12 цифр
              </span>
              {iinAvailable === false && (
                <span className="text-xs text-red-600">Этот ИИН уже зарегистрирован</span>
              )}
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
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="Минимум 6 символов"
              />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 transition"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Повтор пароля */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-sm text-gray-600">Повторите пароль *</label>
              <input
                type={showRepeatPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full bg-[#F6F6F6] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                placeholder="Повторите пароль"
              />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 transition"
                onClick={() => setShowRepeatPassword(prev => !prev)}
              >
                {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Кнопка создания */}
            <div className="sm:col-span-2 mt-4">
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !emailAvailable || !phoneAvailable || !iinAvailable}
                className="w-full bg-[#D77E6C] hover:bg-[#C66B5A] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
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
                    <li>• Email (проверяется на уникальность)</li>
                    <li>• Телефон (проверяется на уникальность)</li>
                    <li>• ИИН (12 цифр, проверяется на уникальность)</li>
                    <li>• Регион</li>
                    <li>• Профессия</li>
                    <li>• Пароль (мин. 6 символов)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-blue-800 font-medium text-xs">
                    💡 Все поля проверяются в реальном времени. Зеленая галочка ✓ означает, что данные доступны для регистрации.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}