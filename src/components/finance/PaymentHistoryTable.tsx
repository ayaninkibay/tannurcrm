'use client';
import React from 'react';
import { CreditCard, User, Users, ChevronDown } from 'lucide-react';

interface Payment {
  id: number;
  name: string;
  amount: number;
  date: string;
  transactionId: string;
  type: string;
  status: string;
}

interface Props {
  payments: Payment[];
  typeFilter: string;
  periodFilter: string;
  onTypeChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
}

const PaymentHistoryTable: React.FC<Props> = ({
  payments,
  typeFilter,
  periodFilter,
  onTypeChange,
  onPeriodChange,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'оплачен':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'блок':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'отклонен банком':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'за подписку':
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'л. товарооборот':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'к. товарооборот':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const typeOptions = ['Все типы', 'Личный товарооборот', 'Командный товарооборот', 'За подписку'];
  const periodOptions = ['Все периоды', 'Сегодня', 'Вчера', 'За неделю', 'За месяц', 'За год'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">История выплат</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Тип фильтра */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => onTypeChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Период фильтра */}
            <div className="relative">
              <select
                value={periodFilter}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              >
                {periodOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {payment.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{payment.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {payment.amount.toLocaleString()} ₸
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    {payment.transactionId}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(payment.type)}
                    <span className="text-sm text-gray-600">{payment.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;
