// src/components/warehouse/ReportModal.tsx

'use client';

import React, { useState } from 'react';
import { X, FileText, Loader2, Download, Calendar, CheckSquare } from 'lucide-react';
import { ReportService, ReportFilters } from '@/lib/admin_orders/ReportService';
import { generateWarehousePDF } from '@/lib/admin_orders/pdfGenerator';
import { OrderStatus } from '@/lib/admin_orders/OrderService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, t }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Дата "сегодня" по умолчанию
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([
    'packed',
    'ready_for_pickup',
    'shipped',
    'delivered'
  ]);

  const reportService = new ReportService();

  const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'transferred_to_warehouse', label: t('Передан в склад'), color: 'bg-purple-100 text-purple-700' },
    { value: 'packed', label: t('Упакован'), color: 'bg-teal-100 text-teal-700' },
    { value: 'ready_for_pickup', label: t('Готов к выдаче'), color: 'bg-indigo-100 text-indigo-700' },
    { value: 'shipped', label: t('Отправлен'), color: 'bg-cyan-100 text-cyan-700' },
    { value: 'delivered', label: t('Доставлен'), color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: t('Отменен'), color: 'bg-red-100 text-red-700' },
    { value: 'returned', label: t('Возврат'), color: 'bg-orange-100 text-orange-700' }
  ];

  const toggleStatus = (status: OrderStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleGenerateReport = async () => {
    if (selectedStatuses.length === 0) {
      setError(t('Выберите хотя бы один статус'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Формируем фильтры
      const filters: ReportFilters = {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString(),
        statuses: selectedStatuses,
        includeItems: true
      };

      console.log('🔄 Generating report with filters:', filters);

      // Получаем данные для отчета
      const result = await reportService.getOrdersForReport(filters);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Ошибка генерации отчета');
      }

      console.log('✅ Report data loaded:', result.data.summary);

      // Генерируем PDF
      await generateWarehousePDF(result.data, 'ru');

      // Закрываем модалку после успешной генерации
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (err) {
      console.error('❌ Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Ошибка генерации отчета');
    } finally {
      setLoading(false);
    }
  };

  const setQuickDate = (type: 'today' | 'yesterday' | 'week' | 'month') => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (type) {
      case 'today':
        setStartDate(now.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        setStartDate(yesterday.toISOString().split('T')[0]);
        setEndDate(yesterday.toISOString().split('T')[0]);
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        setStartDate(weekAgo.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        setStartDate(monthAgo.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('Создать отчет')}</h2>
              <p className="text-sm text-gray-500">{t('Складской отчет за период')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Быстрый выбор периода */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t('Быстрый выбор')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'today' as const, label: t('Сегодня') },
                { type: 'yesterday' as const, label: t('Вчера') },
                { type: 'week' as const, label: t('Неделя') },
                { type: 'month' as const, label: t('Месяц') }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => setQuickDate(type)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор периода */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('Дата начала')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('Дата окончания')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={todayStr}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Выбор статусов */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <CheckSquare className="w-4 h-4 inline mr-1" />
              {t('Статусы заказов')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {statusOptions.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => toggleStatus(value)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    selectedStatuses.includes(value)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedStatuses.includes(value)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedStatuses.includes(value) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${color}`}>
                      {label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Информация */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              💡 {t('В отчет войдут все заказы с выбранными статусами за указанный период')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            {t('Отмена')}
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={loading || selectedStatuses.length === 0}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('Создание...')}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {t('Скачать PDF')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
