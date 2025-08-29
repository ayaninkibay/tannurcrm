// src/components/components_admins_dashboard/CreateTaskModal.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, CalendarDays, MessageSquare } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

export type TaskStatus = 'в процессе' | 'просрочено' | 'сделано';

export interface CreateTaskPayload {
  title: string;
  statusLabel: TaskStatus;
  dueDate?: string;   // ISO yyyy-mm-dd
  comment?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateTaskPayload) => void;
  target: 'short' | 'long'; // для подписи — куда создаём
}

const STATUS_OPTIONS: TaskStatus[] = ['в процессе', 'просрочено', 'сделано'];

export default function CreateTaskModal({ open, onClose, onSave, target }: Props) {
  const { t } = useTranslate();

  const [title, setTitle] = useState('');
  const [statusLabel, setStatusLabel] = useState<TaskStatus>('в процессе');
  const [dueDate, setDueDate] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const isValid = useMemo(() => title.trim().length > 2, [title]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      // сброс при закрытии
      setTitle('');
      setStatusLabel('в процессе');
      setDueDate('');
      setComment('');
      setTouched(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl p-5 md:p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-[#111]">{t('Создать задачу')}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('Список')}: {t(target === 'short' ? 'Краткосрочные цели' : 'Долгосрочные цели')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={t('Закрыть')}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('Заголовок *')}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={t('Например: Объявить акцию на Сентябрь')}
              className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] ${
                touched && !isValid ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {touched && !isValid && (
              <p className="mt-1 text-xs text-red-500">{t('Минимум 3 символа.')}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('Статус')}</label>
              <select
                value={statusLabel}
                onChange={(e) => setStatusLabel(e.target.value as TaskStatus)}
                className="w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{t(s)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('Дедлайн')}</label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200"
                />
                <CalendarDays className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('Комментарий')}</label>
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('Краткое описание задачи (необязательно)')}
                className="w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#D77E6C] border-gray-200 min-h-[88px]"
              />
              <MessageSquare className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {t('Отмена')}
          </button>
          <button
            onClick={() => {
              if (!isValid) {
                setTouched(true);
                return;
              }
              onSave({ title, statusLabel, dueDate, comment });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D77E6C] text-white hover:bg-[#c76e5d]"
          >
            {t('Сохранить')}
          </button>
        </div>
      </div>
    </div>
  );
}
