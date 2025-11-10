"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, CalendarDays, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";
import { useReportModule } from "@/lib/reports/ReportModule";
import { useUser } from "@/context/UserContext";
import type { OrderReport } from "@/lib/reports/ReportService";

interface PurchasesReportProps {}

// Мобильная карточка покупки
const MobilePurchaseCard = ({ order, t }: { order: OrderReport; t: (k: string) => string }) => {
  const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-sm">Заказ #{order.order_number || order.id.slice(0, 8)}</p>
          <p className="text-xs text-gray-500">{totalItems} товаров</p>
        </div>
        {order.payment_status === "paid" ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-xs font-medium text-green-700">{t("Оплачен")}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="w-3 h-3 text-yellow-500">⏳</div>
            <span className="text-xs font-medium text-yellow-700">{t("Ожидание")}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{t("Дата")}</span>
          <span>{new Date(order.created_at).toLocaleDateString('ru-KZ')}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{t("Статус")}</span>
          <span className="capitalize">{t(order.order_status || 'new')}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-gray-500">{t("Сумма")}</span>
          <span className="font-semibold text-base">
            {order.total_amount?.toLocaleString('ru-KZ')}₸
          </span>
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
    const pages: number[] = [];
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

export default function PurchasesReport({}: PurchasesReportProps) {
  const { t } = useTranslate();
  const { profile } = useUser();
  const reportModule = useReportModule();
  
  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Загружаем данные при монтировании
  useEffect(() => {
    if (profile?.id) {
      reportModule.loadOrdersReport(profile.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Получаем все заказы
  const allOrders = reportModule.orders;

  // Расчет общей суммы ВСЕХ заказов
  const totalAmount = allOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalItems = allOrders.reduce(
    (sum, order) => sum + order.items.reduce((s, item) => s + (item.quantity || 0), 0), 
    0
  );

  // Пагинация
  const totalPages = Math.ceil(allOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = allOrders.slice(startIndex, endIndex);

  // Сброс на первую страницу при изменении данных
  useEffect(() => {
    setCurrentPage(1);
  }, [allOrders.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Прокрутка наверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Добавляем отладочную информацию
  // Закомментировано для продакшена
  // useEffect(() => {
  //   console.log('Orders data:', allOrders);
  //   console.log('Current orders:', currentOrders);
  //   console.log('Total pages:', totalPages);
  //   console.log('Current page:', currentPage);
  // }, [allOrders, currentOrders, totalPages, currentPage]);

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-[#D77E6C]" />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-gray-900">
              {t("Отчет по покупкам")}
            </h3>
          </div>
          <p className="text-gray-600 text-sm">{t("История ваших заказов")}</p>
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">{t("Общая сумма")}</p>
          <p className="text-lg md:text-xl font-bold text-[#D77E6C]">
            {totalAmount.toLocaleString("ru-KZ")}₸
          </p>
          <p className="text-xs text-gray-500 mt-1">{totalItems} товаров</p>
        </div>
      </div>

      {/* Отображение ошибки */}
      {reportModule.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">Ошибка загрузки данных</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{reportModule.error}</p>
          <button 
            onClick={() => profile?.id && reportModule.loadOrdersReport(profile.id)}
            className="mt-3 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-colors"
          >
            Повторить попытку
          </button>
        </div>
      )}

      {/* Загрузка */}
      {reportModule.loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D77E6C]"></div>
        </div>
      )}

      {/* Нет данных */}
      {!reportModule.loading && !reportModule.error && allOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-2">{t("Нет заказов")}</p>
          <p className="text-gray-400 text-sm">{t("У вас пока нет оформленных заказов")}</p>
        </div>
      )}

      {/* Информация о пагинации */}
      {!reportModule.loading && !reportModule.error && allOrders.length > 0 && (
        <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
          <p>
            {t("Показано")} {startIndex + 1}-{Math.min(endIndex, allOrders.length)} из {allOrders.length} заказов
          </p>
          <p>
            {t("Страница")} {currentPage} из {totalPages}
          </p>
        </div>
      )}

      {/* Мобильная версия - карточки */}
      {!reportModule.loading && !reportModule.error && currentOrders.length > 0 && (
        <div className="md:hidden">
          {currentOrders.map((order) => (
            <MobilePurchaseCard key={order.id} order={order} t={t} />
          ))}
        </div>
      )}

      {/* Десктопная версия - таблица */}
      {!reportModule.loading && !reportModule.error && currentOrders.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-xl bg-white border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">
                    {t("Заказ")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("Товары")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {t("Дата")}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("Статус заказа")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("Сумма")}
                  </th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700 text-sm">
                    {t("Оплата")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => {
                  const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                  return (
                    <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            #{order.order_number || order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString('ru-KZ', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{totalItems} товаров</p>
                          {order.items.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-xs text-gray-500">
                              {item.product?.name || 'Товар'} x{item.quantity}
                            </p>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-gray-400">
                              +{order.items.length - 2} еще
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('ru-KZ')}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {t(order.order_status || 'new')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">
                          {order.total_amount?.toLocaleString('ru-KZ')}₸
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          {order.payment_status === "paid" ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              <span className="text-sm font-medium text-green-700">{t("Оплачен")}</span>
                            </div>
                          ) : order.payment_status === "cancelled" ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span className="text-sm font-medium text-red-700">{t("Отменен")}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="w-3 h-3 text-yellow-500">⏳</div>
                              <span className="text-sm font-medium text-yellow-700">{t("Ожидание")}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Пагинация */}
      {!reportModule.loading && !reportModule.error && allOrders.length > 0 && (
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
}