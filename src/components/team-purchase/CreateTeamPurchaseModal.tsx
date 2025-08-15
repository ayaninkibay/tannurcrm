'use client';

import React, { useState } from 'react';
import { 
  X, Plus, Minus, Calendar, Users, 
  Package, Target, AlertCircle 
} from 'lucide-react';
import type { CreateTeamPurchaseInput } from '@/lib/team-purchase/TeamPurchaseService';

interface CreateTeamPurchaseModalProps {
  onClose: () => void;
  onCreate: (input: CreateTeamPurchaseInput) => void;
}

export default function CreateTeamPurchaseModal({
  onClose,
  onCreate
}: CreateTeamPurchaseModalProps) {
  const [formData, setFormData] = useState<CreateTeamPurchaseInput>({
    title: '',
    targetAmount: 0,
    minAmount: 5000,
    deadline: '',
    participants: [],
    products: []
  });

  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Добавление участника
  const addParticipant = () => {
    if (!newParticipantEmail) {
      setErrors({ ...errors, participant: 'Введите email участника' });
      return;
    }

    // Временно используем email как user_id (в реальности нужно искать по email)
    const newParticipant = {
      user_id: newParticipantEmail, // В реальности здесь должен быть UUID
      amount: formData.minAmount
    };

    setFormData({
      ...formData,
      participants: [...formData.participants, newParticipant]
    });
    setNewParticipantEmail('');
    setErrors({ ...errors, participant: '' });
  };

  // Удаление участника
  const removeParticipant = (index: number) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((_, i) => i !== index)
    });
  };

  // Обновление вклада участника
  const updateParticipantAmount = (index: number, amount: number) => {
    const updated = [...formData.participants];
    updated[index].amount = Math.max(formData.minAmount, amount);
    setFormData({ ...formData, participants: updated });
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Введите название закупки';
    }
    if (formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Укажите целевую сумму';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Укажите дедлайн';
    }
    if (formData.participants.length === 0) {
      newErrors.participants = 'Добавьте хотя бы одного участника';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = () => {
    if (validateForm()) {
      onCreate(formData);
    }
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;

  // Расчет общей суммы вкладов
  const totalContributions = formData.participants.reduce(
    (sum, p) => sum + p.amount, 
    formData.targetAmount * 0.3 // Вклад организатора
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#111]">
              Создать командную закупку
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Основная информация */}
          <div>
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#D77E6C]" />
              Основная информация
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название закупки
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Закупка печей Tannur для команды"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] ${
                    errors.title ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Целевая сумма
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      targetAmount: parseInt(e.target.value) || 0 
                    })}
                    placeholder="500000"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] ${
                      errors.targetAmount ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.targetAmount && (
                    <p className="text-red-500 text-xs mt-1">{errors.targetAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Мин. вклад
                  </label>
                  <input
                    type="number"
                    value={formData.minAmount || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      minAmount: parseInt(e.target.value) || 0 
                    })}
                    placeholder="5000"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дедлайн сбора
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] ${
                    errors.deadline ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.deadline && (
                  <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
                )}
              </div>
            </div>
          </div>

          {/* Участники */}
          <div>
            <h3 className="text-lg font-semibold text-[#111] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D77E6C]" />
              Участники
            </h3>

            <div className="space-y-4">
              {/* Добавление участника */}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newParticipantEmail}
                  onChange={(e) => setNewParticipantEmail(e.target.value)}
                  placeholder="Email участника"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                />
                <button
                  onClick={addParticipant}
                  className="px-4 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </button>
              </div>

              {errors.participant && (
                <p className="text-red-500 text-xs">{errors.participant}</p>
              )}
              {errors.participants && (
                <p className="text-red-500 text-xs">{errors.participants}</p>
              )}

              {/* Список участников */}
              <div className="space-y-2">
                {/* Организатор */}
                <div className="p-3 bg-[#D77E6C]/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#D77E6C] text-white rounded-full flex items-center justify-center text-sm font-medium">
                        ВЫ
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111]">Организатор</p>
                        <p className="text-xs text-gray-500">Ваш вклад</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-[#D77E6C]">
                      {formatPrice(formData.targetAmount * 0.3)}
                    </p>
                  </div>
                </div>

                {/* Участники */}
                {formData.participants.map((participant, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#111]">
                            {participant.user_id}
                          </p>
                          <p className="text-xs text-gray-500">Участник</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateParticipantAmount(index, participant.amount - 1000)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium w-20 text-center">
                            {formatPrice(participant.amount)}
                          </span>
                          <button
                            onClick={() => updateParticipantAmount(index, participant.amount + 1000)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeParticipant(index)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Итоговая информация */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Общая сумма вкладов:</span>
              <span className="text-lg font-semibold text-[#111]">
                {formatPrice(totalContributions)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Целевая сумма:</span>
              <span className="text-lg font-semibold text-[#D77E6C]">
                {formatPrice(formData.targetAmount)}
              </span>
            </div>
            {totalContributions < formData.targetAmount && (
              <div className="mt-2 p-2 bg-yellow-50 rounded flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  Недостаточно вкладов. Нужно еще {formatPrice(formData.targetAmount - totalContributions)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Действия */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-[#D77E6C] text-white rounded-lg font-medium hover:bg-[#C56D5C] transition-colors"
            >
              Создать закупку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}