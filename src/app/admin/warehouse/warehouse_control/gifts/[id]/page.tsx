'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useGiftModule } from '@/lib/gift/useGiftModule';
import {
  Gift, User, Calendar, Package, DollarSign, 
  ArrowLeft, CheckCircle, XCircle, Clock,
  FileText, Box, Trash2, RotateCcw
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

const STATUS_CONFIG = {
  pending: {
    label: 'Ожидает выдачи',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  issued: {
    label: 'Выдан',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Отменен',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  }
};

export default function GiftViewPage() {
  const { t } = useTranslate();
  const router = useRouter();
  const params = useParams();
  
  // Безопасное извлечение giftId с проверкой на null
  const giftId = params?.id as string | undefined;

  const { currentGift, loadGiftById, updateGiftStatus, loading } = useGiftModule();

  useEffect(() => {
    if (giftId) {
      loadGiftById(giftId);
    }
  }, [giftId, loadGiftById]);

  // Проверка на отсутствие giftId
  if (!giftId) {
    return (
      <main className="p-2 md:p-4 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">{t('Неверный ID подарка')}</div>
            <button
              onClick={() => router.push('/admin/warehouse?tab=gifts')}
              className="mt-4 px-4 py-2 bg-[#D77E6C] text-white rounded-xl hover:bg-[#c76e5d]"
            >
              {t('Вернуться к списку')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading && !currentGift) {
    return (
      <main className="p-2 md:p-4 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('Загрузка...')}</div>
        </div>
      </main>
    );
  }

  if (!currentGift) {
    return (
      <main className="p-2 md:p-4 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">{t('Подарок не найден')}</div>
            <button
              onClick={() => router.push('/admin/warehouse?tab=gifts')}
              className="mt-4 px-4 py-2 bg-[#D77E6C] text-white rounded-xl hover:bg-[#c76e5d]"
            >
              {t('Вернуться к списку')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const status = STATUS_CONFIG[currentGift.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const handleStatusChange = async (newStatus: 'pending' | 'issued' | 'cancelled') => {
    if (!currentGift?.id) return;
    await updateGiftStatus(currentGift.id, newStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <span className="text-gray-400">{t('Подарки')}</span>
            <span className="mx-1 text-[#111]">/</span>
            <span className="text-[#111]">{currentGift.recipient_name}</span>
          </span>
        }
      />

      <div className="mt-4 space-y-6">
        {/* Кнопка назад */}
        <button
          onClick={() => router.push('/admin/warehouse?tab=gifts')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('Назад к списку подарков')}
        </button>

        {/* Основная информация */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Gift className="w-8 h-8 text-[#D77E6C]" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('Подарок для')} {currentGift.recipient_name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {t(status.label)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {t('Создан')} {formatDate(currentGift.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-2">
              {currentGift.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange('issued')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                    disabled={loading}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('Выдать')}
                  </button>
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                    disabled={loading}
                  >
                    <XCircle className="w-4 h-4" />
                    {t('Отменить')}
                  </button>
                </>
              )}
              
              {currentGift.status === 'cancelled' && (
                <button
                  onClick={() => handleStatusChange('pending')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700"
                  disabled={loading}
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('Восстановить')}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Информация о получателе */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{t('Получатель')}</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">{t('Имя/ник получателя')}</label>
                    <div className="font-medium">{currentGift.recipient_name}</div>
                  </div>

                  {currentGift.recipient_info && (
                    <div>
                      <label className="text-sm text-gray-600">{t('Дополнительная информация')}</label>
                      <div className="text-gray-900">{currentGift.recipient_info}</div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-600">{t('Ответственный за выдачу')}</label>
                    <div className="font-medium">{currentGift.responsible}</div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">{t('Причина подарка')}</label>
                    <div className="text-gray-900 bg-gray-50 rounded-lg p-3 mt-1">
                      {currentGift.reason}
                    </div>
                  </div>

                  {currentGift.comment && (
                    <div>
                      <label className="text-sm text-gray-600">{t('Комментарии')}</label>
                      <div className="text-gray-900 bg-gray-50 rounded-lg p-3 mt-1">
                        {currentGift.comment}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Позиции подарка */}
              <div className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{t('Позиции подарка')}</h3>
                </div>

                <div className="space-y-3">
                  {currentGift.gift_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      {item.product?.image_url && (
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name || ''}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.product?.name || t('Товар удален')}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} шт. × {item.price.toLocaleString('ru-RU')} ₸
                        </div>
                      </div>
                      <div className="font-semibold">
                        {item.total.toLocaleString('ru-RU')} ₸
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Сводка */}
            <div className="lg:col-span-1">
              <div className="border border-gray-100 rounded-xl p-4 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{t('Сводка')}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('Позиций')}</span>
                    <span className="font-medium">{currentGift.gift_items.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t('Общее количество')}</span>
                    <span className="font-medium">
                      {currentGift.gift_items.reduce((sum, item) => sum + item.quantity, 0)} шт.
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{t('Итого')}</span>
                      <span className="text-lg font-bold text-[#D77E6C]">
                        {currentGift.total_amount.toLocaleString('ru-RU')} ₸
                      </span>
                    </div>
                  </div>

                  {currentGift.issued_at && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-600 mb-1">{t('Дата выдачи')}</div>
                      <div className="font-medium">{formatDate(currentGift.issued_at)}</div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-1">{t('Дата создания')}</div>
                    <div className="font-medium">{formatDate(currentGift.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}