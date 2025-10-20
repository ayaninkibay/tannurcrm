'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  Building2, User, Phone, Mail, MapPin, ShieldCheck, Save, X, Globe2, AlertCircle
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import { useDistributorModule } from '@/lib/distributor/useDistributorModule';
import { CreateDistributorData } from '@/lib/distributor/DistributorService';

type FormData = {
  orgName: string;
  contactName: string;
  lastName: string;
  phone: string;
  email?: string;
  region: string;
  address?: string;
  bin?: string;
  site?: string;
  note?: string;
  startBalance?: number;
  agreementAccepted: boolean;
};

const REGIONS = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Семей',
  'Усть-Каменогорск',
  'Уральск',
  'Костанай',
  'Актау',
  'Кызылорда',
  'Петропавловск'
];

export default function CreateDistributorPage() {
  const router = useRouter();
  const { t } = useTranslate();
  const { createDistributor, loading, error } = useDistributorModule();

  const [form, setForm] = useState<FormData>({
    orgName: '',
    contactName: '',
    lastName: '',
    phone: '',
    email: '',
    region: '',
    address: '',
    bin: '',
    site: '',
    note: '',
    startBalance: undefined,
    agreementAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isValid = useMemo(() => {
    return (
      form.orgName.trim().length > 1 &&
      form.contactName.trim().length > 1 &&
      form.lastName.trim().length > 1 &&
      form.phone.trim().length >= 6 &&
      form.region.trim().length > 0 &&
      form.agreementAccepted
    );
  }, [form]);

  const onChange = (key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.orgName || form.orgName.trim().length < 2) nextErrors.orgName = 'Укажите название организации/ИП';
    if (!form.contactName || form.contactName.trim().length < 2) nextErrors.contactName = 'Укажите имя контактного лица';
    if (!form.lastName || form.lastName.trim().length < 2) nextErrors.lastName = 'Укажите фамилию контактного лица';
    if (!form.phone || form.phone.trim().length < 6) nextErrors.phone = 'Укажите корректный номер телефона';
    if (!form.region) nextErrors.region = 'Выберите регион';
    if (!form.agreementAccepted) nextErrors.agreementAccepted = 'Необходимо согласие';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Подготавливаем данные для создания
    const distributorData: CreateDistributorData = {
      first_name: form.contactName.trim(),
      last_name: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email?.trim() || undefined,
      region: form.region,
      org_name: form.orgName.trim(),
      bin: form.bin?.trim() || undefined,
      address: form.address?.trim() || undefined,
      site: form.site?.trim() || undefined,
      notes: form.note?.trim() || undefined,
      start_balance: form.startBalance || 0
    };

    const result = await createDistributor(distributorData);
    
    if (result.success) {
      router.push('/admin/warehouse?tab=distributors');
    }
    // Ошибка будет показана через состояние error из хука
  };

  return (
    <main className="p-2 md:p-4 min-h-screen">
      <MoreHeaderAD
        title={
          <span>
            <span className="text-gray-400">{t('Tannur')}</span>
            <span className="mx-1 text-[#111]">/</span>
            <span className="text-gray-400">{t('Склад')}</span>
            <span className="mx-1 text-[#111]">/</span>
            <span className="text-[#111]">{t('Добавить дистрибьютора')}</span>
          </span>
        }
      />

      {/* Показываем ошибку если есть */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="bg-white rounded-2xl p-4 md:p-6">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-[#D77E6C]" />
              <h2 className="text-xl font-bold text-gray-900">{t('Данные дистрибьютора')}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                {t('Отмена')}
              </button>
              <button
                type="submit"
                disabled={!isValid || loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D77E6C] text-white hover:bg-[#c76e5d] disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {loading ? t('Сохранение…') : t('Сохранить')}
              </button>
            </div>
          </div>

          {/* Секции формы */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Левая колонка */}
            <div className="xl:col-span-2 space-y-6">
              {/* Основное */}
              <div className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-gray-900">{t('Основная информация')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">{t('Организация / ИП *')}</label>
                    <div className="relative">
                      <input
                        className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] ${errors.orgName ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder={t('ИП Манна Мир')}
                        value={form.orgName}
                        onChange={(e) => onChange('orgName', e.target.value)}
                      />
                      {errors.orgName && <p className="mt-1 text-xs text-red-500">{t(errors.orgName)}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('Имя контактного лица *')}</label>
                    <div className="relative">
                      <input
                        className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] ${errors.contactName ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder={t('Акмаржан')}
                        value={form.contactName}
                        onChange={(e) => onChange('contactName', e.target.value)}
                      />
                      {errors.contactName && <p className="mt-1 text-xs text-red-500">{t(errors.contactName)}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('Фамилия контактного лица *')}</label>
                    <div className="relative">
                      <input
                        className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] ${errors.lastName ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder={t('Лейс')}
                        value={form.lastName}
                        onChange={(e) => onChange('lastName', e.target.value)}
                      />
                      {errors.lastName && <p className="mt-1 text-xs text-red-500">{t(errors.lastName)}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('Телефон *')}</label>
                    <div className="relative">
                      <input
                        className={`w-full rounded-xl border px-3 py-2.5 pl-9 outline-none focus:ring-2 focus:ring-[#D77E6C] ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder={t('+7 777 123 45 67')}
                        value={form.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                      />
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{t(errors.phone)}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('E-mail')}</label>
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border px-3 py-2.5 pl-9 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200"
                        placeholder={t('name@domain.kz')}
                        value={form.email || ''}
                        onChange={(e) => onChange('email', e.target.value)}
                      />
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('Регион *')}</label>
                    <div className="relative">
                      <select
                        className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] ${errors.region ? 'border-red-400' : 'border-gray-200'}`}
                        value={form.region}
                        onChange={(e) => onChange('region', e.target.value)}
                      >
                        <option value="">{t('Выберите регион')}</option>
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>{t(r)}</option>
                        ))}
                      </select>
                      {errors.region && <p className="mt-1 text-xs text-red-500">{t(errors.region)}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('Адрес')}</label>
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border px-3 py-2.5 pl-9 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200"
                        placeholder={t('Алматы, Аксай 123')}
                        value={form.address || ''}
                        onChange={(e) => onChange('address', e.target.value)}
                      />
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('БИН / ИИН')}</label>
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200"
                        placeholder={t('123456789012')}
                        value={form.bin || ''}
                        onChange={(e) => onChange('bin', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('Сайт / Instagram')}</label>
                    <div className="relative">
                      <input
                        className="w-full rounded-xl border px-3 py-2.5 pl-9 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200"
                        placeholder={t('https://instagram.com/...')}
                        value={form.site || ''}
                        onChange={(e) => onChange('site', e.target.value)}
                      />
                      <Globe2 className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('Начальный баланс (₸)')}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200"
                      placeholder={t('0')}
                      value={form.startBalance ?? ''}
                      onChange={(e) => onChange('startBalance', e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-600 mb-1">{t('Комментарий')}</label>
                  <textarea
                    className="w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200 min-h-[96px]"
                    placeholder={t('Дополнительные сведения, условия сотрудничества и т.д.')}
                    value={form.note || ''}
                    onChange={(e) => onChange('note', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Правая колонка — подтверждение */}
            <div className="xl:col-span-1">
              <div className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{t('Подтверждение')}</h3>
                </div>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-gray-300"
                    checked={form.agreementAccepted}
                    onChange={(e) => onChange('agreementAccepted', e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">
                    {t('Подтверждаю корректность данных и согласен(на) с условиями сотрудничества.')}
                  </span>
                </label>
                {errors.agreementAccepted && (
                  <p className="mt-2 text-xs text-red-500">{t(errors.agreementAccepted)}</p>
                )}

                {/* Мини-превью */}
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {form.contactName || form.lastName 
                        ? `${form.contactName} ${form.lastName}`.trim() 
                        : t('Контакт не указан')}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {form.orgName || t('Организация не указана')}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {form.region
                      ? t('Регион: {region}').replace('{region}', form.region)
                      : t('Регион не выбран')}
                  </div>
                  {form.phone && (
                    <div className="mt-1 text-xs text-gray-500">
                      {t('Тел: {phone}').replace('{phone}', form.phone)}
                    </div>
                  )}
                  {form.email && (
                    <div className="mt-1 text-xs text-gray-500">
                      {t('Email: {email}').replace('{email}', form.email)}
                    </div>
                  )}
                  {form.address && (
                    <div className="mt-1 text-xs text-gray-500">
                      {t('Адрес: {address}').replace('{address}', form.address)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Нижняя панель действий */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              {t('Отмена')}
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D77E6C] text-white hover:bg-[#c76e5d] disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {loading ? t('Сохранение…') : t('Сохранить')}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}