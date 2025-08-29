// src/app/admin/warehouse/create_gift/page.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useProductModule } from '@/lib/product/ProductModule';
import {
  Gift, User, ShieldCheck, Save, X, Plus, Trash2,
  ShoppingBag, DollarSign, Box, ClipboardList, Users as UsersIcon
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

type GiftItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

type GiftForm = {
  recipient: string;
  reason: string;
  responsible: string;
  comment?: string;
  items: GiftItem[];
};

const RESPONSIBLES = [
  'Склад — Администратор',
  'Склад — Менеджер',
  'Маркетинг — Ответственный',
  'Офис — Диспетчер'
];

export default function CreateGiftPage() {
  const { t } = useTranslate();
  const router = useRouter();

  const { products, listProducts, isLoading } = useProductModule();

  const [form, setForm] = useState<GiftForm>({
    recipient: '',
    reason: '',
    responsible: '',
    comment: '',
    items: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listProducts({ limit: 100, orderBy: 'created_at', order: 'desc' }).catch(() => {});
  }, [listProducts]);

  const isValid = useMemo(() => {
    return (
      form.recipient.trim().length > 1 &&
      form.reason.trim().length > 2 &&
      form.responsible.trim().length > 1 &&
      form.items.length > 0 &&
      form.items.every((i) => i.qty > 0 && i.productId)
    );
  }, [form]);

  const setField = <K extends keyof GiftForm>(key: K, value: GiftForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key as string]: '' }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', name: '', price: 0, qty: 1 }]
    }));
  };

  const removeItem = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const changeItem = (idx: number, patch: Partial<GiftItem>) => {
    setForm((prev) => {
      const next = [...prev.items];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, items: next };
    });
  };

  const handleProductChange = (idx: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    changeItem(idx, {
      productId,
      name: p?.name || '',
      price: (p?.price_dealer ?? p?.price ?? 0),
    });
  };

  const total = useMemo(
    () => form.items.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0),
    [form.items]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.recipient || form.recipient.trim().length < 2) nextErrors.recipient = 'Укажите, кому выдаём подарок';
    if (!form.reason || form.reason.trim().length < 3) nextErrors.reason = 'Опишите, за что и зачем';
    if (!form.responsible) nextErrors.responsible = 'Выберите ответственного';
    if (form.items.length === 0) nextErrors.items = 'Добавьте хотя бы одну позицию';
    if (form.items.some((i) => !i.productId || i.qty <= 0)) nextErrors.items = 'Проверьте позиции (товар и количество)';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSubmitting(true);
      // TODO: create gift request
      await new Promise((r) => setTimeout(r, 700));
      router.push('/admin/warehouse?tab=gifts');
    } catch (err) {
      console.error(err);
      alert(t('Не удалось сохранить. Попробуйте ещё раз.'));
    } finally {
      setSubmitting(false);
    }
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
            <span className="text-[#111]">{t('Добавить подарок')}</span>
          </span>
        }
      />

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="bg-white rounded-2xl p-4 md:p-6">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-[#D77E6C]" />
              <h2 className="text-xl font-bold text-gray-900">{t('Оформление выдачи подарка')}</h2>
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
                disabled={!isValid || submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D77E6C] text-white hover:bg-[#c76e5d] disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {submitting ? t('Сохранение…') : t('Сохранить')}
              </button>
            </div>
          </div>

          {/* Блоки формы */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Левая часть */}
            <div className="xl:col-span-2 space-y-6">
              {/* Кому и за что */}
              <div className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{t('Кому и за что')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('Кому выдаём *')}</label>
                    <input
                      className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] ${errors.recipient ? 'border-red-400' : 'border-gray-200'}`}
                      placeholder={t('Имя/ник, компания или профиль')}
                      value={form.recipient}
                      onChange={(e) => setField('recipient', e.target.value)}
                    />
                    {errors.recipient && <p className="mt-1 text-xs text-red-500">{t(errors.recipient)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('Ответственный (выпуск со склада) *')}</label>
                    <select
                      className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] ${errors.responsible ? 'border-red-400' : 'border-gray-200'}`}
                      value={form.responsible}
                      onChange={(e) => setField('responsible', e.target.value)}
                    >
                      <option value="">{t('Выберите')}</option>
                      {RESPONSIBLES.map((r) => (
                        <option key={r} value={t(r)}>{t(r)}</option>
                      ))}
                    </select>
                    {errors.responsible && <p className="mt-1 text-xs text-red-500">{t(errors.responsible)}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-600 mb-1">{t('За что и зачем дают подарок Tannur *')}</label>
                  <textarea
                    className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] min-h-[96px] ${errors.reason ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder={t('Например: активная поддержка бренда, Stories, рекламные ролики, коллаборация и т.д.')}
                    value={form.reason}
                    onChange={(e) => setField('reason', e.target.value)}
                  />
                  {errors.reason && <p className="mt-1 text-xs text-red-500">{t(errors.reason)}</p>}
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-600 mb-1">{t('Комментарии')}</label>
                  <textarea
                    className="w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200 min-h-[80px]"
                    placeholder={t('Любые уточнения к выдаче')}
                    value={form.comment || ''}
                    onChange={(e) => setField('comment', e.target.value)}
                  />
                </div>
              </div>

              {/* Список позиций */}
              <div className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{t('Позиции подарка')}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                    {t('Добавить позицию')}
                  </button>
                </div>

                {errors.items && <p className="mb-3 text-xs text-red-500">{t(errors.items)}</p>}

                <div className="space-y-3">
                  {form.items.length === 0 && (
                    <div className="text-sm text-gray-500">{t('Добавьте хотя бы одну позицию')}</div>
                  )}

                  {form.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50 rounded-xl p-3">
                      {/* Товар */}
                      <div className="md:col-span-6">
                        <label className="block text-xs text-gray-600 mb-1">{t('Товар')}</label>
                        <div className="relative">
                          <select
                            className="w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200"
                            value={it.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="">{isLoading ? t('Загрузка…') : t('Выберите товар')}</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Цена */}
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">{t('Цена (₸)')}</label>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{(it.price || 0).toLocaleString('ru-RU')}</span>
                        </div>
                      </div>

                      {/* Кол-во */}
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">{t('Кол-во')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            className="w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200"
                            value={it.qty}
                            onChange={(e) => changeItem(idx, { qty: Math.max(1, Number(e.target.value) || 1) })}
                          />
                          <Box className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                        </div>
                      </div>

                      {/* Сумма по позиции */}
                      <div className="md:col-span-1">
                        <label className="block text-xs text-gray-600 mb-1">{t('Сумма')}</label>
                        <div className="text-sm font-medium">
                          {((it.price || 0) * (it.qty || 0)).toLocaleString('ru-RU')} ₸
                        </div>
                      </div>

                      {/* Удалить */}
                      <div className="md:col-span-1 flex md:justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="inline-flex items-center justify-center w-full md:w-auto gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100"
                          title={t('Удалить')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Правая колонка — итог */}
            <div className="xl:col-span-1">
              <div className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <UsersIcon className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{t('Итоги')}</h3>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <span>{t('Позиций: {n}').replace('{n}', String(form.items.length))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">
                      {t('Итого: {sum} ₸').replace('{sum}', total.toLocaleString('ru-RU'))}
                    </span>
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    <span>
                      {t('Ответственный: {name}').replace('{name}', form.responsible || t('не выбран'))}
                    </span>
                  </div>
                  {form.comment && (
                    <div className="mt-2">
                      <span className="text-gray-500">{t('Комментарий:')}</span> {form.comment}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
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
                    disabled={!isValid || submitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D77E6C] text-white hover:bg-[#c76e5d] disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? t('Сохранение…') : t('Сохранить')}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </main>
  );
}
