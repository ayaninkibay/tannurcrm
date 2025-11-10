'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Award,
  Users,
  Edit2,
  Camera,
  X,
  Check,
  Shield,
  Key,
  AlertCircle,
  Star,
  ChevronRight,
  Upload,
  Trash2,
  Briefcase,
  CreditCard,
  UserCog,
  Crown
} from 'lucide-react';

// Импорты для работы с пользователем
import { useUser } from '@/context/UserContext';
import { userService } from '@/lib/user/UserService';
import { useUserModule } from '@/lib/user/UserModule'; 
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase/client';

type UserProfile = Database['public']['Tables']['users']['Row'];

// Функция для получения читабельного названия роли
const getRoleDisplay = (role: string | null, permissions: string[] | null) => {
  if (permissions?.includes('all')) {
    return { label: 'Главный администратор', color: 'bg-purple-100 text-purple-700', icon: Crown };
  }
  
  switch (role) {
    case 'admin':
      return { label: 'Администратор', color: 'bg-blue-100 text-blue-700', icon: UserCog };
    case 'financier':
      return { label: 'Финансист', color: 'bg-green-100 text-green-700', icon: CreditCard };
    case 'dealer':
      return { label: 'Дилер', color: 'bg-orange-100 text-orange-700', icon: Star };
    case 'celebrity':
      return { label: 'Звезда', color: 'bg-pink-100 text-pink-700', icon: Award };
    default:
      return { label: 'Пользователь', color: 'bg-gray-100 text-gray-700', icon: User };
  }
};

// Функция для отображения permissions
const getPermissionsDisplay = (permissions: string[] | null) => {
  if (!permissions || permissions.length === 0) return null;
  
  const permissionMap: Record<string, string> = {
    'all': 'Полный доступ',
    'warehouse': 'Склад',
    'orders': 'Заказы',
    'finance': 'Финансы',
  };
  
  return permissions.map(p => permissionMap[p] || p).join(', ');
};

// Модальное окно изменения аватара
const AvatarModal = ({ isOpen, onClose, currentAvatar, userId, onSuccess }: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentAvatar || '/icons/default-avatar.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { uploadUserAvatar } = useUserModule();
  const { refreshProfile } = useUser();

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreview(currentAvatar || '/icons/default-avatar.png');
      setError('');
    }
  }, [isOpen, currentAvatar]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер файла не должен превышать 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите изображение');
        return;
      }

      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !userId) return;
    
    setLoading(true);
    setError('');
    
    try {
      await uploadUserAvatar(userId, selectedFile);
      
      // Очищаем кэш и обновляем профиль
      localStorage.removeItem('tannur_user_profile');
      localStorage.removeItem('tannur_profile_last_update');
      await refreshProfile();
      
      onSuccess(preview);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке фото');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview('/icons/default-avatar.png');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white">
          <h2 className="text-xl font-bold">Изменить фото профиля</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                <Image src={preview} alt="avatar preview" width={128} height={128} className="w-full h-full object-cover" />
              </div>
              {selectedFile && (
                <button onClick={handleRemove} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg" title="Удалить">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <label className="mt-6 cursor-pointer">
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedFile ? 'Выбрать другое фото' : 'Выбрать фото'}
                </span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Рекомендуемый размер: 500x500px<br />
              Максимальный размер файла: 5MB
            </p>

            {error && (
              <div className="mt-4 w-full p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors" disabled={loading}>
            Отмена
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" disabled={!selectedFile || loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Сохранить фото
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Модальное окно смены пароля
const PasswordModal = ({ isOpen, onClose }: any) => {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      
      if (error) throw error;
      
      alert('Пароль успешно изменен');
      onClose();
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setError(error.message || 'Ошибка при смене пароля');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <h2 className="text-xl font-bold text-gray-900">Изменить пароль</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Текущий пароль</label>
              <input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="Введите текущий пароль" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
              <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="Минимум 6 символов" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Подтвердите новый пароль</label>
              <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="Повторите новый пароль" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors" disabled={loading}>
            Отмена
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50" disabled={loading || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}>
            {loading ? 'Сохранение...' : 'Изменить пароль'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Модальное окно редактирования
const EditProfileModal = ({ isOpen, onClose, profile, onSave }: any) => {
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    instagram: profile?.instagram || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    region: profile?.region || '',
    iin: profile?.iin || '',
    profession: profile?.profession || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white">
          <h2 className="text-xl font-bold">Редактировать профиль</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="Введите имя" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Фамилия</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="Введите фамилию" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ИИН</label>
              <input name="iin" type="number" value={form.iin} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="Введите ИИН (12 цифр)" maxLength={12} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Профессия</label>
              <input name="profession" value={form.profession} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="Ваша профессия" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="+7 (___) ___-__-__" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="example@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
              <input name="region" value={form.region} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="Введите город" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input name="instagram" value={form.instagram} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC7C67] focus:ring-2 focus:ring-[#DC7C67]/20 transition-all" placeholder="@username" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors">
            Отмена
          </button>
          <button onClick={() => onSave(form)} className="px-6 py-2.5 bg-gradient-to-r from-[#DC7C67] to-[#E89380] text-white rounded-xl font-medium hover:shadow-lg transition-all">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { profile, loading: userContextLoading, refreshProfile } = useUser(); // ✅ Добавили refreshProfile
  const [userId, setUserId] = useState<string | null>(null);
  const { updateProfile, isLoading: userModuleLoading, error: userModuleError } = useUserModule();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('/icons/default-avatar.png');
  
  const overallLoading = userContextLoading || userModuleLoading;

  const roleDisplay = getRoleDisplay(profile?.role ?? null, profile?.permissions ?? null);
  const RoleIcon = roleDisplay.icon;
  const permissionsText = getPermissionsDisplay(profile?.permissions ?? null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (profile?.avatar_url) {
      setPhotoPreview(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarSuccess = (newAvatarUrl: string) => {
    setPhotoPreview(newAvatarUrl);
  };

  const handleSaveProfile = async (formData: any) => {
    if (!userId) return;
    
    try {
      await updateProfile(userId, formData);
      
      // ✅ Очищаем кэш и обновляем профиль
      localStorage.removeItem('tannur_user_profile');
      localStorage.removeItem('tannur_profile_last_update');
      await refreshProfile();
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  if (userContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F5F5F5]">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC7C67] mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-2 md:p-6">
      <div className="space-y-6">
        <MoreHeaderAD title="Мой профиль" showBackButton={true}  />

        {/* Основная карточка профиля */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"></div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 relative z-10">
              {/* Аватар */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white p-1 shadow-xl">
                  <Image src={photoPreview} alt="avatar" width={128} height={128} className="w-full h-full rounded-xl object-cover" priority />
                </div>
                <button onClick={() => setIsAvatarModalOpen(true)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                  <div className="text-white text-center">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-xs">Изменить</span>
                  </div>
                </button>
              </div>

              {/* Имя и статус */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.first_name || 'Имя'} {profile?.last_name || 'Фамилия'}
                </h1>
                <p className="text-gray-500 mt-1">Реферальный код: <span className="font-mono font-semibold">{profile?.referral_code || 'ABC123'}</span></p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${profile?.is_confirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    <div className={`w-2 h-2 rounded-full ${profile?.is_confirmed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    {profile?.is_confirmed ? 'Активен' : 'Не подтвержден'}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${roleDisplay.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {roleDisplay.label}
                  </span>
                  {permissionsText && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      {permissionsText}
                    </span>
                  )}
                </div>
              </div>

              {/* Кнопка редактирования */}
              <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium">
                <Edit2 className="w-4 h-4" />
                Редактировать
              </button>
            </div>

            {/* Контактная информация */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#DC7C67]" />
                  Контактная информация
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.email || 'Не указан'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.phone || 'Не указан'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.region || 'Не указан'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.instagram || 'Не указан'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">ИИН: {profile?.iin || 'Не указан'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile?.profession || 'Не указана'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Регистрация: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#DC7C67]" />
                  Безопасность
                </h3>
                <div className="space-y-3">
                  <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Изменить пароль</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700">
                        Рекомендуем включить двухфакторную аутентификацию для защиты аккаунта
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
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#DC7C67]" />
              Пригласить в команду
            </h3>
            <ReferalLink />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#DC7C67]" />
              Ваш спонсор
            </h3>
            <SponsorCard />
          </div>
        </div>

        <AvatarModal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} currentAvatar={photoPreview} userId={userId} onSuccess={handleAvatarSuccess} />
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} profile={profile} onSave={handleSaveProfile} />
        <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      </div>
    </div>
  );
}