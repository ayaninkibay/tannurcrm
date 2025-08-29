'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import ReferalLink from '@/components/blocks/ReferralLink';
import SponsorCard from '@/components/blocks/SponsorCard';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Calendar,
  Edit2,
  Camera,
  X,
  Shield,
  Key,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

// Импорты для работы с пользователем
import { useUser } from '@/context/UserContext';
import { useUserModule } from '@/lib/user/UserModule';
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase/client';
import { useTranslate } from '@/hooks/useTranslate';

type UserProfile = Database['public']['Tables']['users']['Row'];
type UserUpdateData = Database['public']['Tables']['users']['Update'];

// Модальное окно смены пароля
const PasswordModal = ({ isOpen, onClose }: any) => {
  const { t } = useTranslate();

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(t('Новые пароли не совпадают'));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError(t('Пароль должен содержать минимум 6 символов'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      alert(t('Пароль успешно изменен'));
      onClose();
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err?.message || t('Ошибка при смене пароля'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <h2 className="text-xl font-bold text-gray-900">{t('Изменить пароль')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
            aria-label={t('Отмена')}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Текущий пароль')}
              </label>
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all"
                placeholder={t('Введите текущий пароль')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Новый пароль')}
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all"
                placeholder={t('Минимум 6 символов')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Подтвердите новый пароль')}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all"
                placeholder={t('Повторите новый пароль')}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
            disabled={loading}
          >
            {t('Отмена')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
            disabled={loading || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          >
            {loading ? t('Сохранение...') : t('Изменить пароль')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Модальное окно редактирования
const EditProfileModal = ({ isOpen, onClose, onSave, form, setForm }: any) => {
  const { t } = useTranslate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <h2 className="text-xl font-bold text-gray-900">{t('Редактировать профиль')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
            aria-label={t('Отмена')}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Имя')}
              </label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all"
                placeholder={t('Введите имя')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Фамилия')}
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all"
                placeholder={t('Введите фамилию')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Телефон')}
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all"
                placeholder={t('+7 (___) ___-__-__')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('E-mail')}
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all"
                placeholder={t('example@email.com')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Город')}
              </label>
              <input
                name="region"
                value={form.region}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all"
                placeholder={t('Введите город')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Instagram')}
              </label>
              <input
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all"
                placeholder={t('@username')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
          >
            {t('Отмена')}
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            {t('Сохранить')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { t } = useTranslate();
  const { profile, loading: userContextLoading } = useUser();
  const [userId, setUserId] = useState<string | null>(null);

  const {
    updateProfile,
    uploadUserAvatar,
    isLoading: userModuleLoading
  } = useUserModule();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('/icons/avatar-placeholder.png');

  const [form, setForm] = useState<UserUpdateData>({
    first_name: '',
    last_name: '',
    instagram: '',
    phone: '',
    email: '',
    region: ''
  });

  const overallLoading = userContextLoading || userModuleLoading;

  // Получаем ID пользователя
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('getUser error:', error);
      }
    };
    getCurrentUser();
  }, []);

  // Заполняем форму данными
  useEffect(() => {
    if (profile && !userContextLoading) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        instagram: profile.instagram || '',
        phone: profile.phone || '',
        email: profile.email || '',
        region: profile.region || ''
      });

      if (profile.avatar_url) {
        setPhotoPreview(profile.avatar_url);
      }
    }
  }, [profile, userContextLoading]);

  // Обработчик изменения фото
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userId) {
      const prev = photoPreview;
      setPhotoPreview(URL.createObjectURL(file));
      try {
        await uploadUserAvatar(userId, file);
      } catch (error) {
        console.error('uploadUserAvatar error:', error);
        setPhotoPreview(prev);
      }
    }
  };

  // Обработчик сохранения профиля
  const handleSaveProfile = async () => {
    if (!userId) return;
    try {
      await updateProfile(userId, form);
      setIsEditModalOpen(false);
      alert(t('Данные успешно сохранены!'));
    } catch (error) {
      console.error('updateProfile error:', error);
      const message = error instanceof Error ? error.message : t('N/A');
      alert(t('Ошибка при сохранении: {message}').replace('{message}', message));
    }
  };

  // Обработчик отмены редактирования
  const handleCancelEdit = () => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        instagram: profile.instagram || '',
        phone: profile.phone || '',
        email: profile.email || '',
        region: profile.region || ''
      });
    }
    setIsEditModalOpen(false);
  };

  if (userContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F5F5F5]">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC7C67] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Загрузка профиля...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-2 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <MoreHeaderAD title={t('Мой профиль')} />

        {/* Основная карточка профиля */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Обложка с градиентом */}
          <div className="h-32 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"></div>
          </div>

          {/* Информация профиля */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 relative z-10">
              {/* Аватар */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white p-1 shadow-xl">
                  <Image
                    src={photoPreview}
                    alt="avatar"
                    width={128}
                    height={128}
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                  <div className="text-white text-center">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-xs">{t('Изменить')}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={overallLoading}
                  />
                </label>
              </div>

              {/* Имя и статус */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {(profile?.first_name || t('Имя'))} {(profile?.last_name || t('Фамилия'))}
                </h1>
                <p className="text-gray-500 mt-1">
                  {t('Роль:')} <span className="font-semibold">{t('Администратор')}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {t('Активен')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    {t('Admin')}
                  </span>
                </div>
              </div>

              {/* Кнопка редактирования */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                <Edit2 className="w-4 h-4" />
                {t('Редактировать')}
              </button>
            </div>

            {/* Контактная информация и безопасность */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#DC7C67]" />
                  {t('Контактная информация')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.email || t('Не указан')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.phone || t('Не указан')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.region || t('Не указан')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.instagram || t('Не указан')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {t('Регистрация: {date}').replace(
                        '{date}',
                        profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString()
                          : t('N/A')
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#DC7C67]" />
                  {t('Безопасность')}
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{t('Изменить пароль')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700">
                        {t('Используйте надежный пароль и не передавайте его третьим лицам')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительные блоки */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Реферальная ссылка */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('Добавить дилера в сеть')}
            </h3>
            <ReferalLink variant="orange" />
          </div>

          {/* Спонсор */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('Информация о спонсоре')}
            </h3>
            <SponsorCard variant="gray" />
          </div>
        </div>

        {/* Модальные окна */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={handleCancelEdit}
          onSave={handleSaveProfile}
          form={form}
          setForm={setForm}
        />

        <PasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      </div>
    </div>
  );
}
