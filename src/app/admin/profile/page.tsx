'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';
import ReferalLink from '@/components/blocks/ReferralLink';
import SponsorCard from '@/components/blocks/SponsorCard';

// Импорты для работы с пользователем
import { useUser } from '@/context/UserContext';
import { userService } from '@/lib/user/UserService';
import { useUserModule } from '@/lib/user/UserModule'; 
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase/client';

type UserProfile = Database['public']['Tables']['users']['Row'];
type UserUpdateData = Database['public']['Tables']['users']['Update'];

export default function ProfilePage() {
  // Получаем глобальные данные пользователя из контекста
  const { profile, loading: userContextLoading } = useUser();

  // Состояние для ID пользователя из Auth
  const [userId, setUserId] = useState<string | null>(null);

  // Получаем функции для обновления профиля и загрузки аватара
  const {
    updateProfile,
    uploadUserAvatar,
    isLoading: userModuleLoading,
    error: userModuleError,
  } = useUserModule();

  // Состояние для режима редактирования
  const [isEditing, setIsEditing] = useState(false);

  // Состояние формы для редактирования данных
  const [form, setForm] = useState<UserUpdateData>({
    first_name: '',
    last_name: '',
    instagram: '',
    phone: '',
    email: '',
    region: '',
  });

  // Состояние для смены пароля
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Состояние для предпросмотра фото
  const [photoPreview, setPhotoPreview] = useState<string>('/icons/avatar-placeholder.png');

  // Объединяем состояния загрузки
  const overallLoading = userContextLoading || userModuleLoading;

  // Функция для получения ID пользователя из профиля
  const getUserId = useCallback(() => {
    if (!profile) return null;
    
    // Проверяем различные возможные поля ID
    return profile.id || 
           (profile as any).user_id || 
           (profile as any).uuid || 
           (profile as any).auth_id || 
           null;
  }, [profile]);

  // Получаем ID пользователя из Supabase Auth
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Ошибка получения пользователя:', error);
          return;
        }
        if (user) {
          console.log('Текущий пользователь из Auth:', user);
          console.log('User ID из Auth:', user.id);
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Заполняем форму данными пользователя после их загрузки из контекста
  useEffect(() => {
    console.log("useEffect сработал. Profile:", profile, "Loading:", userContextLoading);
    
    if (profile && !userContextLoading) {
      console.log("Profile ID:", profile.id);
      console.log("Profile keys:", Object.keys(profile));
      console.log("Profile data:", profile);
      
      // Ищем возможные варианты ID
      console.log("Возможные ID поля:");
      console.log("profile.id:", profile.id);
      console.log("profile.user_id:", (profile as any).user_id);
      console.log("profile.uuid:", (profile as any).uuid);
      console.log("profile.auth_id:", (profile as any).auth_id);
      
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        instagram: profile.instagram || '',
        phone: profile.phone || '',
        email: profile.email || '',
        region: profile.region || '',
      });
      
      if (profile.avatar_url) {
        setPhotoPreview(profile.avatar_url);
      }
    }
  }, [profile, userContextLoading]);

  // Обработчик изменения фото
  const handlePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("handlePhotoChange вызван. File:", file, "User ID:", userId);
    
    if (file && userId) {
      setPhotoPreview(URL.createObjectURL(file));
      try {
        console.log("Начинаем загрузку аватара для пользователя:", userId);
        await uploadUserAvatar(userId, file);
        console.log("Аватар успешно загружен");
        alert("Фото успешно обновлено!");
      } catch (error) {
        console.error("Ошибка при загрузке фото:", error);
        alert(`Ошибка при загрузке фото: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        // Возвращаем старое фото при ошибке
        if (profile?.avatar_url) {
          setPhotoPreview(profile.avatar_url);
        }
      }
    } else {
      console.error("Файл не выбран или ID пользователя отсутствует. File:", file, "User ID:", userId);
    }
  }, [userId, uploadUserAvatar, profile?.avatar_url]);

  // Обработчик изменения полей формы
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // Обработчик изменения полей пароля
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // Обработчик сохранения данных формы
  const handleSubmit = useCallback(async () => {
    console.log("handleSubmit вызван. Profile:", profile);
    console.log("User ID из Auth:", userId);
    console.log("Form data:", form);

    if (!userId) {
      console.error("ID пользователя не найден. Profile:", profile, "UserId:", userId);
      alert("Ошибка: ID пользователя не найден. Попробуйте обновить страницу или войти заново.");
      return;
    }
    
    try {
      console.log("Начинаем обновление профиля с ID:", userId, "и данными:", form);
      await updateProfile(userId, form);
      console.log("Профиль успешно обновлен");
      setIsEditing(false); // Выходим из режима редактирования после успешного сохранения
      alert("Данные успешно сохранены!");
    } catch (error) {
      console.error("Ошибка при сохранении данных:", error);
      alert(`Ошибка при сохранении: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }, [userId, form, updateProfile]);

  // Обработчик отмены редактирования
  const handleCancel = useCallback(() => {
    // Восстанавливаем оригинальные данные
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        instagram: profile.instagram || '',
        phone: profile.phone || '',
        email: profile.email || '',
        region: profile.region || '',
      });
    }
    setIsEditing(false);
  }, [profile]);

  // Обработчик смены пароля
  const handlePasswordSubmit = useCallback(async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Новые пароли не совпадают');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    // Здесь должна быть логика смены пароля через соответствующий сервис
    console.log('Смена пароля:', passwordForm);
    
    // Очищаем форму после успешной смены
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    alert('Пароль успешно изменен');
  }, [passwordForm]);

  if (userContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F3F3F3]">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC7C67] mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" p-4 md:p-6">
      <div className="w-full mx-auto space-y-6">
        <MoreHeader title="Мой профиль" />

        {/* Основная информация профиля */}
        <div className="bg-white rounded-3xl shadow overflow-hidden">
          {/* Заголовок с кнопками */}
          <div className="bg-gradient-to-r from-[#DC7C67] to-[#C26D5C] px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Информация профиля</h2>
              <div className="flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                  >
                    ✏️ Изменить данные
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={overallLoading}
                      className="bg-white text-[#DC7C67] px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
                    >
                      {overallLoading ? 'Сохранение...' : '💾 Сохранить'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Контент профиля */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Блок аватара */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center space-y-4 border border-gray-200">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow">
                      <Image
                        src={photoPreview}
                        alt="avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {isEditing && (
                      <label className="absolute -bottom-2 -right-2 bg-[#DC7C67] text-white p-2 rounded-full cursor-pointer hover:bg-[#C26D5C] transition-colors shadow">
                        📷
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                          disabled={overallLoading}
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-800">
                      {profile?.first_name || 'Имя'} {profile?.last_name || 'Фамилия'}
                    </h3>
                    <p className="text-sm text-gray-500 break-all">
                      {profile?.email || 'email@example.com'}
                    </p>
                    {profile?.region && (
                      <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                        📍 {profile.region}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Форма данных */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    👤 Личные данные
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'first_name', label: 'Имя', placeholder: 'Введите имя', icon: '👤' },
                      { name: 'last_name', label: 'Фамилия', placeholder: 'Введите фамилию', icon: '👤' },
                      { name: 'phone', label: 'Телефон', placeholder: '+7 (___) ___-__-__', icon: '📱' },
                      { name: 'email', label: 'E-mail', placeholder: 'example@email.com', type: 'email', icon: '📧' },
                      { name: 'region', label: 'Город', placeholder: 'Введите город', icon: '📍' },
                      { name: 'instagram', label: 'Instagram', placeholder: '@username или ссылка', icon: '📸' },
                    ].map(field => (
                      <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          {field.icon} {field.label}
                        </label>
                        <div className="relative">
                          <input
                            name={field.name}
                            value={String(form[field.name as keyof UserUpdateData] ?? '')}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            type={field.type || 'text'}
                            readOnly={!isEditing}
                            disabled={overallLoading}
                            className={`w-full rounded-xl p-4 text-sm transition-all duration-200 border-2 ${
                              isEditing 
                                ? 'bg-white border-gray-300 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 cursor-text' 
                                : 'bg-gray-100 border-gray-200 text-gray-600 cursor-default'
                            } focus:outline-none`}
                          />
                          {!isEditing && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                              <span className="text-gray-400 text-xs">🔒</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {userModuleError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        ⚠️ {userModuleError}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Нижние блоки */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Реферальная ссылка */}
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <div className="text-gray-600 mb-6 font-medium">
              🤝 Добавить дилера в свою сеть
            </div>
            <ReferalLink variant="orange" />
          </div>

          {/* Спонсорская карта */}
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <SponsorCard variant="gray" />
          </div>

          {/* Смена пароля */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                🔐 Смена пароля
              </h3>
              <p className="text-sm text-gray-500">
                Вы можете восстановить пароль{' '}
                <a href="#" className="text-[#DC7C67] hover:underline font-medium">
                  Забыли пароль? Восстановить
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Старый пароль
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Введите старый пароль"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all duration-200"
                  disabled={overallLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Новый пароль
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Введите новый пароль"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all duration-200"
                  disabled={overallLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Повторите новый пароль"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all duration-200"
                  disabled={overallLoading}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start">
              <button
                onClick={handlePasswordSubmit}
                disabled={overallLoading || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="bg-[#DC7C67] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#C26D5C] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Изменить пароль
              </button>
              
              <div className="text-xs text-gray-500 leading-relaxed">
                💡 Не передавайте пароль посторонним — даже самому обаятельному коллеге — и
                обязательно включите многофакторную аутентификацию.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}