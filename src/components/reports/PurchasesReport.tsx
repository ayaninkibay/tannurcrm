"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, Download, CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { useTranslate } from "@/hooks/useTranslate";
import { useReportModule } from "@/lib/reports/ReportModule";
import { useUser } from "@/context/UserContext";
import type { OrderReport } from "@/lib/reports/ReportService";

export type Period = "all" | "last6" | "thisYear" | "prevYear";

interface PurchasesReportProps {
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

const periodOptions = [
  { value: "all", label: "За всё время" },
  { value: "last6", label: "6 месяцев" },
  { value: "thisYear", label: "Текущий год" },
  { value: "prevYear", label: "Прошлый год" },
];

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

export default function PurchasesReport({
  period = "all",
  onPeriodChange = () => {},
}: PurchasesReportProps) {
  const { t } = useTranslate();
  const { profile } = useUser();
  const reportModule = useReportModule();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(period);

  // Загружаем данные при монтировании
  useEffect(() => {
    if (profile?.id) {
      reportModule.loadOrdersReport(profile.id);
    }
  }, [profile?.id]);

  const handlePeriodChange = (newPeriod: Period) => {
    setSelectedPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  // Фильтруем данные по периоду
  const filteredData = reportModule.getFilteredData(reportModule.orders);

  // Расчет общей суммы
  const totalAmount = filteredData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalItems = filteredData.reduce(
    (sum, order) => sum + order.items.reduce((s, item) => s + (item.quantity || 0), 0), 
    0
  );

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

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">{t("Общая сумма")}</p>
            <p className="text-lg md:text-xl font-bold text-[#D77E6C]">
              {totalAmount.toLocaleString("ru-KZ")}₸
            </p>
            <p className="text-xs text-gray-500 mt-1">{totalItems} товаров</p>
          </div>
          <button 
            onClick={reportModule.exportOrders}
            className="flex items-center justify-center gap-2 bg-[#D77E6C] hover:bg-[#C66B5A] text-white px-4 py-3 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">{t("Скачать")}</span>
          </button>
        </div>
      </div>

      {/* Переключатель периода */}
      <div className="overflow-x-auto mb-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit min-w-full sm:min-w-0">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value as Period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedPeriod === option.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Загрузка */}
      {reportModule.loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D77E6C]"></div>
        </div>
      )}

      {/* Нет данных */}
      {!reportModule.loading && filteredData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t("Нет данных для отображения")}</p>
        </div>
      )}

      {/* Мобильная версия - карточки */}
      {!reportModule.loading && filteredData.length > 0 && (
        <div className="md:hidden">
          {filteredData.map((order) => (
            <MobilePurchaseCard key={order.id} order={order} t={t} />
          ))}
        </div>
      )}

      {/* Десктопная версия - таблица */}
      {!reportModule.loading && filteredData.length > 0 && (
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
                {filteredData.map((order) => {
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
      {!reportModule.loading && filteredData.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p className="text-center sm:text-left">
            {t("Показано {n} записей").replace("{n}", String(filteredData.length))}
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">←</button>
            <button className="px-3 py-1.5 rounded-lg bg-[#D77E6C] text-white">1</button>
            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">2</button>
            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">3</button>
            <button className="px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">→</button>
          </div>
        </div>
      )}
    </div>
  );
}