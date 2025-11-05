'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useUserEdit } from '@/lib/useredit/usereditmodule';
import { UpdateUserPayload } from '@/lib/useredit/usereditservice';

const ROLES = [
  { value: 'dealer', label: 'Дилер' },
  { value: 'celebrity', label: 'Знаменитость' },
  { value: 'admin', label: 'Администратор' },
  { value: 'financier', label: 'Финансист' },
  { value: 'user', label: 'Пользователь' }
];

const STATUSES = [
  { value: 'active', label: 'Активный' },
  { value: 'inactive', label: 'Неактивный' },
  { value: 'blocked', label: 'Заблокирован' }
];

const REGIONS = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Актау',
  'Актобе',
  'Атырау',
  'Караганда',
  'Костанай',
  'Кызылорда',
  'Павлодар',
  'Петропавловск',
  'Талдыкорган',
  'Тараз',
  'Туркестан',
  'Уральск',
  'Усть-Каменогорск'
];

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const {
    user,
    balance,
    stats,
    parentInfo,
    loading,
    saving,
    error,
    successMessage,
    updateUser,
    clearError,
    clearSuccess,
    refreshAll,
    searchParent
  } = useUserEdit(userId);

  // Режим редактирования
  const [isEditing, setIsEditing] = useState(false);

  // Форма - ВАЖНО: инициализация с дефолтными значениями
  const [formData, setFormData] = useState<UpdateUserPayload>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    iin: null,
    region: '',
    profession: '',
    instagram: '',
    role: 'user',
    status: 'active',
    is_confirmed: false,
    parent_id: null,
    referral_code: '',
    temp_bonus_percent: null,
    temp_bonus_until: null
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Поиск спонсора
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [parentSearchResults, setParentSearchResults] = useState<Array<{ id: string; name: string; phone: string; role: string }>>([]);
  const [showParentSearch, setShowParentSearch] = useState(false);
  const [selectedParent, setSelectedParent] = useState<{ id: string; name: string; phone: string } | null>(null);

  // Пароль для смены роли
  const [rolePassword, setRolePassword] = useState('');
  const [showRolePasswordModal, setShowRolePasswordModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  // Заполнить форму при загрузке пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
        iin: user.iin ?? null,
        region: user.region ?? '',
        profession: user.profession ?? '',
        instagram: user.instagram ?? '',
        role: user.role ?? 'user',
        status: user.status ?? 'active',
        is_confirmed: user.is_confirmed ?? false,
        parent_id: user.parent_id ?? null,
        referral_code: user.referral_code ?? '',
        temp_bonus_percent: user.temp_bonus_percent ?? null,
        temp_bonus_until: user.temp_bonus_until ?? null
      });
      setSelectedParent(parentInfo ?? null);
    }
  }, [user, parentInfo]);

  const handleInputChange = (field: keyof UpdateUserPayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Обработка смены роли с паролем
  const handleRoleChange = (newRole: string) => {
    setPendingRole(newRole);
    setShowRolePasswordModal(true);
  };

  const confirmRoleChange = () => {
    if (rolePassword === '2202') {
      handleInputChange('role', pendingRole);
      setShowRolePasswordModal(false);
      setRolePassword('');
      setPendingRole(null);
    } else {
      alert('Неверный пароль!');
    }
  };

  const cancelRoleChange = () => {
    setShowRolePasswordModal(false);
    setRolePassword('');
    setPendingRole(null);
  };

  // Поиск спонсора
  const handleParentSearch = async (query: string) => {
    setParentSearchQuery(query);
    if (query.length >= 2) {
      const results = await searchParent(query);
      setParentSearchResults(results.filter(r => r.id !== userId));
    } else {
      setParentSearchResults([]);
    }
  };

  const handleSelectParent = (parent: { id: string; name: string; phone: string; role: string }) => {
    setSelectedParent({ id: parent.id, name: parent.name, phone: parent.phone });
    handleInputChange('parent_id', parent.id);
    setShowParentSearch(false);
    setParentSearchQuery('');
    setParentSearchResults([]);
  };

  const handleRemoveParent = () => {
    setSelectedParent(null);
    handleInputChange('parent_id', null);
  };

  const handleSave = async () => {
    const success = await updateUser(formData);
    if (success) {
      setHasChanges(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('У вас есть несохраненные изменения. Вы уверены, что хотите отменить?')) {
        if (user) {
          setFormData({
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            phone: user.phone ?? '',
            email: user.email ?? '',
            iin: user.iin ?? null,
            region: user.region ?? '',
            profession: user.profession ?? '',
            instagram: user.instagram ?? '',
            role: user.role ?? 'user',
            status: user.status ?? 'active',
            is_confirmed: user.is_confirmed ?? false,
            parent_id: user.parent_id ?? null,
            referral_code: user.referral_code ?? '',
            temp_bonus_percent: user.temp_bonus_percent ?? null,
            temp_bonus_until: user.temp_bonus_until ?? null
          });
          setSelectedParent(parentInfo ?? null);
          setHasChanges(false);
          setIsEditing(false);
        }
      }
    } else {
      setIsEditing(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[#DC7C67]/20 border-t-[#DC7C67] animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#DC7C67] to-[#E89580]"></div>
          </div>
          <p className="text-gray-600 font-medium">Загрузка данных пользователя...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Ошибка загрузки</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/admin/teamcontent')}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#DC7C67] to-[#E89580] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <MoreHeaderAD title={'Профиль пользователя'}
        showBackButton={true}
      />

      <div className="mx-auto mt-8">
        
        {/* Модальное окно для смены роли */}
        {showRolePasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Подтверждение смены роли</h3>
              <p className="text-sm text-gray-600 mb-4">
                Введите пароль для изменения роли пользователя
              </p>
              <input
                type="password"
                value={rolePassword}
                onChange={(e) => setRolePassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#DC7C67] focus:outline-none mb-4"
                onKeyPress={(e) => e.key === 'Enter' && confirmRoleChange()}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={confirmRoleChange}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#DC7C67] to-[#E89580] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Подтвердить
                </button>
                <button
                  onClick={cancelRoleChange}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* User Info Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-20 h-20 rounded-2xl ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#DC7C67] to-[#E89580] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">ID: {user?.id}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#DC7C67]/10 to-[#E89580]/10 text-xs font-bold text-[#DC7C67]">
                    {ROLES.find(r => r.value === user?.role)?.label || user?.role}
                  </span>
                  {user?.is_confirmed && (
                    <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 text-xs font-bold text-emerald-700">
                      ✓ Подтвержден
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {hasChanges && (
                <span className="px-4 py-2 rounded-xl bg-yellow-50 text-yellow-700 text-sm font-semibold">
                  Есть несохраненные изменения
                </span>
              )}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#DC7C67] to-[#E89580] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  ✏️ Редактировать
                </button>
              ) : null}
              <button
                onClick={refreshAll}
                className="p-3 rounded-xl bg-white border-2 border-gray-200 text-gray-600 hover:border-[#DC7C67] hover:text-[#DC7C67] transition-all"
                title="Обновить данные"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Уведомления */}
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-emerald-900 font-semibold">{successMessage}</span>
            </div>
            <button onClick={clearSuccess} className="text-emerald-600 hover:text-emerald-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-900 font-semibold">{error}</span>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Статистика */}
        {(balance || stats) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {balance && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Баланс</h3>
                    <p className="text-xs text-gray-500">Текущий счет</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Доступно:</span>
                    <span className="text-lg font-bold text-emerald-600">{balance.available_balance?.toLocaleString()} ₸</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Всего заработано:</span>
                    <span className="text-sm font-semibold text-gray-900">{balance.total_earned?.toLocaleString()} ₸</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Выведено:</span>
                    <span className="text-sm font-semibold text-gray-900">{balance.total_withdrawn?.toLocaleString()} ₸</span>
                  </div>
                </div>
              </div>
            )}

            {stats && (
              <>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Оборот</h3>
                      <p className="text-xs text-gray-500">Текущий месяц</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Личный:</span>
                      <span className="text-lg font-bold text-blue-600">{stats.personal_turnover.toLocaleString()} ₸</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Общий:</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.total_turnover.toLocaleString()} ₸</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Процент бонуса:</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.bonus_percent || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Команда</h3>
                      <p className="text-xs text-gray-500">Статистика</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Размер команды:</span>
                      <span className="text-lg font-bold text-purple-600">{stats.team_size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Заказов:</span>
                      <span className="text-sm font-semibold text-gray-900">{stats.orders_count}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Форма */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-[#DC7C67]/5 px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-900">
              {isEditing ? 'Редактирование данных' : 'Данные пользователя'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing ? 'Измените необходимые поля и нажмите "Сохранить"' : 'Просмотр информации о пользователе'}
            </p>
          </div>

          <div className="p-8">
            {/* Основная информация */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#DC7C67] to-[#E89580]"></div>
                Основная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Имя</label>
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isEditing 
                        ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                        : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    }`}
                    placeholder="Введите имя"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Фамилия</label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isEditing 
                        ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                        : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    }`}
                    placeholder="Введите фамилию"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Телефон</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isEditing 
                        ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                        : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    }`}
                    placeholder="+7 777 123 45 67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isEditing 
                        ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                        : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    }`}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ИИН</label>
                  <input
                    type="number"
                    value={formData.iin === null ? '' : formData.iin}
                    onChange={(e) => handleInputChange('iin', e.target.value ? parseInt(e.target.value) : null)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isEditing 
                        ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                        : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    }`}
                    placeholder="123456789012"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Регион</label>
                  {isEditing ? (
                    <select
                      value={formData.region || ''}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#DC7C67] focus:outline-none transition-all"
                    >
                      <option value="">Выберите регион</option>
                      {REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.region || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl cursor-not-allowed"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Профессия</label>
                  <input
                    type="text"
                    value={formData.profession || ''}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isEditing 
                        ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                        : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    }`}
                    placeholder="Дизайнер"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram</label>
                  <input
                    type="text"
                    value={formData.instagram || ''}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isEditing 
                        ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                        : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    }`}
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>

            {/* Системная информация */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                Системная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Роль</label>
                  {isEditing ? (
                    <select
                      value={formData.role || 'user'}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#DC7C67] focus:outline-none transition-all"
                    >
                      {ROLES.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={ROLES.find(r => r.value === (formData.role || user?.role))?.label || formData.role || user?.role || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl cursor-not-allowed"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Статус</label>
                  {isEditing ? (
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#DC7C67] focus:outline-none transition-all"
                    >
                      {STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={STATUSES.find(s => s.value === (formData.status || user?.status))?.label || formData.status || user?.status || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl cursor-not-allowed"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  {isEditing ? (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_confirmed || false}
                        onChange={(e) => handleInputChange('is_confirmed', e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#DC7C67] focus:ring-[#DC7C67]"
                      />
                      <span className="text-sm font-semibold text-gray-700">Подтвержденный аккаунт</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.is_confirmed ? 'bg-[#DC7C67] border-[#DC7C67]' : 'border-gray-300'
                      }`}>
                        {formData.is_confirmed && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Подтвержденный аккаунт</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Спонсор */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                Спонсор
              </h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  {selectedParent ? (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{selectedParent.name}</div>
                        <div className="text-sm text-gray-600">{selectedParent.phone}</div>
                      </div>
                      <button
                        onClick={handleRemoveParent}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                        title="Удалить спонсора"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowParentSearch(true)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl text-purple-700 font-semibold hover:from-purple-100 hover:to-pink-100 transition-all"
                    >
                      + Назначить спонсора
                    </button>
                  )}

                  {showParentSearch && (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={parentSearchQuery}
                          onChange={(e) => handleParentSearch(e.target.value)}
                          placeholder="Поиск по имени или телефону..."
                          className="w-full px-4 py-3 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#DC7C67] focus:outline-none"
                          autoFocus
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {parentSearchResults.length > 0 && (
                        <div className="max-h-60 overflow-y-auto space-y-2 bg-white border-2 border-gray-200 rounded-xl p-2">
                          {parentSearchResults.map(result => (
                            <button
                              key={result.id}
                              onClick={() => handleSelectParent(result)}
                              className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-all"
                            >
                              <div className="font-semibold text-gray-900">{result.name}</div>
                              <div className="text-sm text-gray-600">{result.phone} • {result.role}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setShowParentSearch(false);
                          setParentSearchQuery('');
                          setParentSearchResults([]);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-100 border-2 border-gray-200 rounded-xl">
                  {selectedParent ? (
                    <>
                      <div className="font-bold text-gray-900">{selectedParent.name}</div>
                      <div className="text-sm text-gray-600">{selectedParent.phone}</div>
                    </>
                  ) : (
                    <div className="text-gray-600">Нет спонсора</div>
                  )}
                </div>
              )}
            </div>

            {/* Реферальный код */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                Реферальный код
              </h3>
              <input
                type="text"
                value={formData.referral_code || ''}
                onChange={(e) => handleInputChange('referral_code', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border-2 rounded-xl font-mono transition-all ${
                  isEditing 
                    ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                    : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                }`}
                placeholder="Реферальный код"
              />
            </div>

            {/* Временные бонусы */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                Временные бонусы
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Процент бонуса (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.temp_bonus_percent === null ? '' : formData.temp_bonus_percent}
                    onChange={(e) => handleInputChange('temp_bonus_percent', e.target.value ? parseFloat(e.target.value) : null)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isEditing 
                        ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                        : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    }`}
                    placeholder="0-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Действует до</label>
                  <input
                    type="date"
                    value={formData.temp_bonus_until || ''}
                    onChange={(e) => handleInputChange('temp_bonus_until', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isEditing 
                        ? 'bg-gray-50 border-gray-200 focus:border-[#DC7C67] focus:outline-none' 
                        : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Read-only информация */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"></div>
                Системная информация (только чтение)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">ID пользователя</label>
                  <div className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 font-mono text-sm break-all">
                    {user?.id}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">Дата регистрации</label>
                  <div className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600">
                    {user?.created_at ? new Date(user.created_at).toLocaleString('ru-RU') : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            {isEditing && (
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#DC7C67] to-[#E89580] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Сохранение...
                    </span>
                  ) : (
                    '✓ Сохранить изменения'
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✕ Отмена
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}