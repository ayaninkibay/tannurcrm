"use client";

import React, { useEffect, useState } from "react";
import { Crown, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";
import { useReportModule } from "@/lib/reports/ReportModule";
import { useUser } from "@/context/UserContext";
import type { SubscriptionPaymentReport } from "@/lib/reports/ReportService";

interface Props {}

// Мобильная карточка подписки
const MobileSubscriptionCard: React.FC<{ sub: SubscriptionPaymentReport; index: number }> = ({ sub }) => {
  const { t } = useTranslate();
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium">
                {sub.parent_info?.first_name?.[0] || sub.parent_info?.email?.[0] || '?'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <p className="font-medium text-sm">
              {sub.parent_info?.first_name && sub.parent_info?.last_name 
                ? `${sub.parent_info.first_name} ${sub.parent_info.last_name}`
                : sub.parent_info?.email || 'Неизвестно'}
            </p>
            <p className="text-xs text-gray-500">{sub.method || 'Карта'}</p>
          </div>
        </div>
        {sub.status === "paid" ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-700">{t("Зачислен")}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-3 h-3 text-red-500" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.7 4.7a.75.75 0 0 1 1.06 0L8 6.94l2.24-2.24a.75.75 0 1 1 1.06 1.06L9.06 8l2.24 2.24a.75.75 0 1 1-1.06 1.06L8 9.06l-2.24 2.24a.75.75 0 0 1-1.06-1.06L6.94 8 4.7 5.76a.75.75 0 0 1 0-1.06z"/>
            </svg>
            <span className="text-xs font-medium text-red-700">{t("Отменен")}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{t("ID")}</span>
          <span className="font-mono">{sub.id.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{t("Дата")}</span>
          <span>{new Date(sub.paid_at).toLocaleDateString('ru-KZ')}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">{t("Сумма")}</span>
          <span className="font-semibold text-base">{sub.amount?.toLocaleString('ru-KZ')}₸</span>
        </div>
      </div>
    </div>
  );
};

// Компонент пагинации
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  t 
}: { 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  t: (k: string) => string;
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const showPages = 5; // Максимум страниц для показа
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    // Корректируем начальную страницу если мало страниц в конце
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Предыдущая страница */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Первая страница */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-2 text-gray-400">...</span>
          )}
        </>
      )}

      {/* Видимые страницы */}
      {visiblePages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            currentPage === page
              ? "bg-[#D77E6C] text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Последняя страница */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Следующая страница */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const SubscriptionsReport: React.FC<Props> = () => {
  const { t } = useTranslate();
  const { profile } = useUser();
  const reportModule = useReportModule();
  
  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Загружаем данные при монтировании
  useEffect(() => {
    if (profile?.id) {
      reportModule.loadSubscriptionPaymentsReport(profile.id);
    }
  }, [profile?.id]);

  // Получаем все подписки
  const allSubscriptions = reportModule.subscriptionPayments;

  // Расчет общей суммы ВСЕХ подписок
  const totalAmount = allSubscriptions
    .filter(sub => sub.status === "paid")
    .reduce((sum, sub) => sum + (sub.amount || 0), 0);

  // Пагинация
  const totalPages = Math.ceil(allSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubscriptions = allSubscriptions.slice(startIndex, endIndex);

  // Сброс на первую страницу при изменении данных
  useEffect(() => {
    setCurrentPage(1);
  }, [allSubscriptions.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Прокрутка наверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <Crown className="w-5 h-5 text-[#D77E6C]" />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-gray-900">
              {t("Отчет по подпискам")}
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            {t("Детальная информация о транзакциях")}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">{t("Общая сумма")}</p>
          <p className="text-lg md:text-xl font-bold text-[#D77E6C]">
            {totalAmount.toLocaleString('ru-KZ')}₸
          </p>
        </div>
      </div>

      {/* Загрузка */}
      {reportModule.loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D77E6C]"></div>
        </div>
      )}

      {/* Нет данных */}
      {!reportModule.loading && allSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <Crown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-2">{t("Нет подписок")}</p>
          <p className="text-gray-400 text-sm">{t("У вас пока нет подписочных платежей")}</p>
        </div>
      )}

      {/* Информация о пагинации */}
      {!reportModule.loading && allSubscriptions.length > 0 && (
        <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
          <p>
            {t("Показано")} {startIndex + 1}-{Math.min(endIndex, allSubscriptions.length)} из {allSubscriptions.length} подписок
          </p>
          <p>
            {t("Страница")} {currentPage} из {totalPages}
          </p>
        </div>
      )}

      {/* Мобильная версия - карточки */}
      {!reportModule.loading && currentSubscriptions.length > 0 && (
        <div className="md:hidden">
          {currentSubscriptions.map((sub, idx) => (
            <MobileSubscriptionCard key={sub.id} sub={sub} index={idx} />
          ))}
        </div>
      )}

      {/* Десктопная версия - таблица */}
      {!reportModule.loading && currentSubscriptions.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-xl bg-white border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">
                    {t("Спонсор")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("Метод")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t("Дата")}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("ID")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("Сумма")}
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700 text-sm">
                    {t("Статус")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentSubscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {sub.parent_info?.first_name?.[0] || sub.parent_info?.email?.[0] || '?'}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {sub.parent_info?.first_name && sub.parent_info?.last_name 
                              ? `${sub.parent_info.first_name} ${sub.parent_info.last_name}`
                              : sub.parent_info?.email || 'Неизвестно'}
                          </p>
                          <p className="text-xs text-gray-500">{t("Активный спонсор")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                        {t(sub.method || 'Карта')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(sub.paid_at).toLocaleDateString('ru-KZ')}
                    </td>
                    <td className="py-4 px-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">
                        {sub.id.slice(0, 8)}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">
                        {sub.amount?.toLocaleString('ru-KZ')}₸
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        {sub.status === "paid" ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-700">
                              {t("Зачислен")}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                            <svg className="w-3 h-3 text-red-500" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.7 4.7a.75.75 0 0 1 1.06 0L8 6.94l2.24-2.24a.75.75 0 1 1 1.06 1.06L9.06 8l2.24 2.24a.75.75 0 1 1-1.06 1.06L8 9.06l-2.24 2.24a.75.75 0 0 1-1.06-1.06L6.94 8 4.7 5.76a.75.75 0 0 1 0-1.06z"/>
                            </svg>
                            <span className="text-sm font-medium text-red-700">
                              {t("Отменен")}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Пагинация */}
      {!reportModule.loading && allSubscriptions.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            t={t}
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionsReport;