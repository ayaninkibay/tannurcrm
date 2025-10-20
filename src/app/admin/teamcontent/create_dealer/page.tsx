'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Search, X, CheckCircle2, Users } from 'lucide-react';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';

export default function AdminCreateDealer() {
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
  
  // Состояния для спонсора
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [sponsorSearchQuery, setSponsorSearchQuery] = useState('');
  const [sponsorSearchResults, setSponsorSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Состояния для созданного дилера
  const [isCreated, setIsCreated] = useState(false);
  const [createdDealerData, setCreatedDealerData] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Закрытие поиска при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Поиск спонсоров
  useEffect(() => {
    const searchSponsors = async () => {
      if (sponsorSearchQuery.trim().length < 2) {
        setSponsorSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Разбиваем запрос на слова для поиска по имени и фамилии
        const searchTerms = sponsorSearchQuery.trim().split(/\s+/);
        
        let query = supabase
          .from('users')
          .select('id, first_name, last_name, email, phone, role')
          .in('role', ['dealer', 'admin']);

        // Если есть несколько слов (возможно имя и фамилия)
        if (searchTerms.length >= 2) {
          const firstName = searchTerms[0];
          const lastName = searchTerms.slice(1).join(' ');
          
          query = query.or(
            `first_name.ilike.%${firstName}%,` +
            `last_name.ilike.%${lastName}%,` +
            `email.ilike.%${sponsorSearchQuery}%,` +
            `phone.ilike.%${sponsorSearchQuery}%,` +
            `and(first_name.ilike.%${firstName}%,last_name.ilike.%${lastName}%)`
          );
        } else {
          // Поиск по одному слову
          query = query.or(
            `first_name.ilike.%${sponsorSearchQuery}%,` +
            `last_name.ilike.%${sponsorSearchQuery}%,` +
            `email.ilike.%${sponsorSearchQuery}%,` +
            `phone.ilike.%${sponsorSearchQuery}%`
          );
        }

        const { data, error } = await query.limit(10);

        if (error) throw error;
        setSponsorSearchResults(data || []);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Error searching sponsors:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchSponsors, 300);
    return () => clearTimeout(debounce);
  }, [sponsorSearchQuery]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSelectSponsor = (sponsor) => {
    setSelectedSponsor(sponsor);
    setSponsorSearchQuery('');
    setShowSearchResults(false);
  };

  const handleRemoveSponsor = () => {
    setSelectedSponsor(null);
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
    if (!selectedSponsor) return 'Выберите спонсора';
    return null;
  };

  const fetchCreatedDealerData = async (dealerId) => {
    try {
      // Сначала получаем данные дилера
      const { data: dealerData, error: dealerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', dealerId)
        .single();

      if (dealerError) throw dealerError;

      // Затем отдельно получаем данные спонсора, если parent_id существует
      let parentData = null;
      if (dealerData.parent_id) {
        const { data: parent, error: parentError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone')
          .eq('id', dealerData.parent_id)
          .single();

        if (!parentError) {
          parentData = parent;
        }
      }

      return {
        ...dealerData,
        parent: parentData
      };
    } catch (err) {
      console.error('Error fetching dealer data:', err);
      return null;
    }
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
          parent_id: selectedSponsor.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }

      const result = await response.json();

      if (!result.user_id) {
        throw new Error(result.error || 'Не удалось создать пользователя');
      }

      const newDealerId = result.user_id;
      
      // Получаем данные созданного дилера
      const dealerData = await fetchCreatedDealerData(newDealerId);
      
      if (dealerData) {
        setCreatedDealerData(dealerData);
        setIsCreated(true);
      } else {
        throw new Error('Не удалось загрузить данные дилера');
      }

    } catch (err) {
      console.error('Error creating dealer:', err);
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setIsCreated(false);
    setCreatedDealerData(null);
    setFormData({
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
    setSelectedSponsor(null);
    setError('');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDealers = () => {
    router.push('/admin/dealers');
  };

  // Показываем данные созданного дилера
  if (isCreated && createdDealerData) {
    return (
      <div className="flex flex-col p-2 md:p-6 bg-[#F6F6F6] min-h-screen">
        <MoreHeaderDE title="Дилер успешно создан" />

        <div className="w-full mt-6">
          {/* Успешное сообщение */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-1">
                Дилер успешно создан!
              </h3>
              <p className="text-sm text-green-700">
                Профиль дилера активирован. Данные учетной записи отправлены на указанный email.
              </p>
            </div>
          </div>

          {/* Данные дилера */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D77E6C]" />
              Информация о дилере
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Личные данные */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 text-sm uppercase tracking-wide">
                  Личные данные
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">ФИО</label>
                    <p className="text-sm font-medium text-gray-800">
                      {createdDealerData.first_name} {createdDealerData.last_name}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <p className="text-sm text-gray-800">{createdDealerData.email}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Телефон</label>
                    <p className="text-sm text-gray-800">{createdDealerData.phone}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">ИИН</label>
                    <p className="text-sm text-gray-800">{createdDealerData.iin}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Регион</label>
                    <p className="text-sm text-gray-800">{createdDealerData.region}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Профессия</label>
                    <p className="text-sm text-gray-800">{createdDealerData.profession}</p>
                  </div>

                  {createdDealerData.instagram && (
                    <div>
                      <label className="text-xs text-gray-500">Instagram</label>
                      <p className="text-sm text-gray-800">{createdDealerData.instagram}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Информация о спонсоре и статус */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 text-sm uppercase tracking-wide">
                  Дополнительная информация
                </h3>
                
                <div className="space-y-3">
                  {createdDealerData.parent && (
                    <div className="bg-[#F6F6F6] rounded-xl p-4">
                      <label className="text-xs text-gray-500 mb-2 block">Спонсор</label>
                      <p className="text-sm font-medium text-gray-800">
                        {createdDealerData.parent.first_name} {createdDealerData.parent.last_name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {createdDealerData.parent.email}
                      </p>
                      <p className="text-xs text-gray-600">
                        {createdDealerData.parent.phone}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-500">Дата создания</label>
                    <p className="text-sm text-gray-800">
                      {new Date(createdDealerData.created_at).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Статус профиля</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        createdDealerData.is_confirmed 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {createdDealerData.is_confirmed ? 'Подтвержден' : 'Ожидает подтверждения'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Роль</label>
                    <p className="text-sm text-gray-800 capitalize">{createdDealerData.role}</p>
                  </div>

                  {createdDealerData.referral_code && (
                    <div>
                      <label className="text-xs text-gray-500">Реферальный код</label>
                      <p className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded inline-block">
                        {createdDealerData.referral_code}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
              <button
                onClick={handleCreateAnother}
                className="flex-1 bg-[#D77E6C] hover:bg-[#C66B5A] text-white py-3 rounded-xl transition-colors font-medium"
              >
                Создать еще одного дилера
              </button>
              <button
                onClick={handleGoToDealers}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-colors font-medium"
              >
                Перейти к списку дилеров
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Форма создания дилера
  return (
    <div className="flex flex-col p-2 md:p-6 bg-[#F6F6F6] min-h-screen">
      <MoreHeaderDE title="Создание дилера (Администратор)" />

      <div className="mt-4 mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all hover:shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Назад</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-6 text-gray-700">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Image src="/icons/IconAppsOrange.svg" width={20} height={20} alt="icon" />
            Регистрация дилера
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Поиск и выбор спонсора */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl p-4">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Спонсор (обязательно) *
              </label>
              
              {selectedSponsor ? (
                <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D77E6C] rounded-full flex items-center justify-center text-white font-medium">
                      {selectedSponsor.first_name?.[0]}{selectedSponsor.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {selectedSponsor.first_name} {selectedSponsor.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{selectedSponsor.email}</p>
                      <p className="text-xs text-gray-500">{selectedSponsor.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveSponsor}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="relative" ref={searchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={sponsorSearchQuery}
                      onChange={(e) => setSponsorSearchQuery(e.target.value)}
                      onFocus={() => sponsorSearchResults.length > 0 && setShowSearchResults(true)}
                      className="w-full bg-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D77E6C]/20 transition-all"
                      placeholder="Поиск по имени, email или телефону..."
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>

                  {/* Результаты поиска */}
                  {showSearchResults && sponsorSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-auto">
                      {sponsorSearchResults.map((sponsor) => (
                        <button
                          key={sponsor.id}
                          onClick={() => handleSelectSponsor(sponsor)}
                          className="w-full p-4 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#D77E6C] rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                              {sponsor.first_name?.[0]}{sponsor.last_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {sponsor.first_name} {sponsor.last_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{sponsor.email}</p>
                              <p className="text-xs text-gray-500">{sponsor.phone}</p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded capitalize">
                              {sponsor.role}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showSearchResults && sponsorSearchQuery.length >= 2 && sponsorSearchResults.length === 0 && !isSearching && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-sm text-gray-500">
                      Спонсоры не найдены
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Основные поля формы */}
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
            </div>

            {/* Кнопка создания */}
            <div className="mt-6">
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
      </div>
    </div>
  );
}