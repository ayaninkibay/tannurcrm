'use client';
import React from 'react';
import { Check, X, Eye, Calendar, CreditCard, Users, User } from 'lucide-react';

interface Transaction {
  id: number;
  name: string;
  amount: number;
  date: string;
  transactionId: string;
  type: string;
  status: string;
}

interface Props {
  transactions: Transaction[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onView: (id: number) => void;
  currentDate: string;
}

const PendingTransactionsTable: React.FC<Props> = ({
  transactions,
  onApprove,
  onReject,
  onView,
  currentDate,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'л. товарооборот':
        return <User className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />;
      case 'к. товарооборот':
        return <Users className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />;
      case 'за подписку':
        return <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-green-600" />;
      default:
        return <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 h-full flex flex-col">
      <div className="p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Транзакции на одобрение</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
            <span className="text-xs md:text-sm font-medium text-gray-700">{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {transaction.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{transaction.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {transaction.amount.toLocaleString()} ₸
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    {transaction.transactionId}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(transaction.type)}
                    <span className="text-sm text-gray-600">{transaction.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onApprove(transaction.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Одобрить"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onReject(transaction.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Отклонить"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onView(transaction.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Просмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden flex-1 overflow-auto divide-y divide-gray-100">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700">
                    {transaction.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{transaction.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {transaction.amount.toLocaleString()} ₸
                </p>
                <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded inline-block mt-1">
                  {transaction.transactionId}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {getTypeIcon(transaction.type)}
                <span className="text-xs text-gray-600">{transaction.type}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onApprove(transaction.id)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onReject(transaction.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onView(transaction.id)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingTransactionsTable;