'use client';
import React, { useState } from 'react';
import {
  Check, X, Eye, ChevronDown, Calendar, Wallet, TrendingUp, Clock,
  CreditCard, Users, DollarSign, User, AlertCircle, CheckCircle, XCircle,
  ArrowUpRight
} from 'lucide-react';
import MoreHeader from '@/components/header/MoreHeader';

const TotalAmountCard = ({ amount = 152500000 }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('За все время');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const periodOptions = [
    'За все время',
    'За год',
    'Кастомный период'
  ];

  const handlePeriodChange = (e) => {
    const value = e.target.value;
    setSelectedPeriod(value);
    if (value === 'Кастомный период') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
    }
  };


  return (
    <div className="relative">
      {/* Градиентный фон с blur эффектом */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-orange-50 to-amber-50 rounded-3xl blur-xl opacity-40"></div>
      
      {/* Основная карточка */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow">
        {/* Заголовок с dropdown */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center" style={{background: 'linear-gradient(135deg, #D77E6C 0%, #E8967A 100%)'}}>
              {/* Wallet icon component */}
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Общая сумма</h2>
              <p className="text-sm text-gray-500">Ваш текущий баланс</p>
            </div>
          </div>
          
          {/* Стильный dropdown */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="appearance-none bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-gray-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent cursor-pointer"
            >
              {periodOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {/* ChevronDown icon component */}
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Кастомный выбор дат - Conditionally rendered */}
        {showCustomPicker && (
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50">
            <div className="flex items-center gap-2 mb-3">
              {/* Calendar icon component */}
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Выберите период</span>
            </div>
            <div className="flex space-x-3">
              <input 
                type="date" 
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
                placeholder="Начальная дата"
              />
              <input 
                type="date" 
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
                placeholder="Конечная дата"
              />
            </div>
          </div>
        )}

        {/* Основная сумма с анимацией */}
        <div className="text-center mb-8">
          <div className="text-5xl font-black bg-gradient-to-r from-gray-900 via-red-700 to-orange-600 bg-clip-text text-transparent mb-2">
            {amount.toLocaleString()} ₸
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center px-3 py-1 bg-emerald-100 rounded-full">
              {/* ArrowUpRight icon component */}
              <ArrowUpRight className="h-3 w-3 text-emerald-600 mr-1" />
              <span className="text-xs font-semibold text-emerald-600">+12.5%</span>
            </div>
            <span className="text-sm text-gray-500">по сравнению с прошлым периодом</span>
          </div>
        </div>
        
        {/* Статистика - REMOVED the iteration over 'stats' as 'stats' array is removed */}
        {/* If you intend to have other statistics here, you'll need to reintroduce them with different data/structure. */}

        {/* Декоративные элементы */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-red-200 to-orange-200 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full opacity-20 blur-xl"></div>
      </div>
    </div>
  );
};


// Компонент таблицы транзакций на одобрение
const PendingTransactionsTable = ({ transactions, onApprove, onReject, onView, currentDate }) => {


  const getTypeIcon = (type) => {
    switch (type) {
      case 'л. товарооборот': return <User className="h-4 w-4 text-blue-600" />;
      case 'к. товарооборот': return <Users className="h-4 w-4 text-purple-600" />;
      case 'за подписку': return <CreditCard className="h-4 w-4 text-green-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Транзакции на одобрение</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{currentDate}</span>
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
    </div>
  );
};

// Компонент истории выплат
const PaymentHistoryTable = ({ payments, typeFilter, periodFilter, onTypeChange, onPeriodChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'оплачен': return 'bg-green-50 text-green-700 border border-green-200';
      case 'блок': return 'bg-red-50 text-red-700 border border-red-200';
      case 'отклонен банком': return 'bg-orange-50 text-orange-700 border border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'за подписку': return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'л. товарооборот': return <User className="h-4 w-4 text-blue-600" />;
      case 'к. товарооборот': return <Users className="h-4 w-4 text-purple-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const typeOptions = [
    'Все типы',
    'Личный товарооборот',
    'Командный товарооборот', 
    'За подписку'
  ];

  const periodOptions = [
    'Все периоды',
    'Сегодня',
    'Вчера',
    'За неделю',
    'За месяц',
    'За год'
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">История выплат</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Фильтр по типу */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => onTypeChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              >
                {typeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Фильтр по периоду */}
            <div className="relative">
              <select
                value={periodFilter}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              >
                {periodOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {payment.date}
                </td>
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

// Основной компонент страницы
const FinanceTransactionsPage = () => {
  const [typeFilter, setTypeFilter] = useState('Все типы');
  const [periodFilter, setPeriodFilter] = useState('Все периоды');

  // Текущая дата
  const currentDate = new Date().toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long' 
  });

  // Моковые данные для транзакций на одобрение
  const pendingTransactions = [
    {
      id: 1,
      name: 'Тәмірлан Смак',
      amount: 84370,
      date: '22-08-2025',
      transactionId: 'KZ848970',
      type: 'л. товарооборот',
      status: 'одобрить'
    },
    {
      id: 2,
      name: 'Айгерім Нұрболатқызы',
      amount: 156420,
      date: '22-08-2025', 
      transactionId: 'KZ849125',
      type: 'к. товарооборот',
      status: 'одобрить'
    },
    {
      id: 3,
      name: 'Ерлан Серікбайұлы',
      amount: 67890,
      date: '22-08-2025',
      transactionId: 'KZ849247',
      type: 'за подписку',
      status: 'отклонить'
    }
  ];

  // Моковые данные для истории выплат
  const paymentHistory = [
    {
      id: 1,
      name: 'Әли Нысанбай',
      amount: 213000,
      date: '22-08-2025',
      transactionId: 'KZ848970',
      type: 'за подписку',
      status: 'блок'
    },
    {
      id: 2,
      name: 'Тәмірлан Смак',
      amount: 584370,
      date: '22-08-2025',
      transactionId: 'KZ848970',
      type: 'л. товарооборот',
      status: 'оплачен'
    },
    {
      id: 3,
      name: 'Тәмірлан Смак',
      amount: 84370,
      date: '22-08-2025',
      transactionId: 'KZ848970',
      type: 'к. товарооборот',
      status: 'оплачен'
    },
    {
      id: 4,
      name: 'Динара Қалиева',
      amount: 127650,
      date: '21-08-2025',
      transactionId: 'KZ848751',
      type: 'за подписку',
      status: 'отклонен банком'
    }
  ];

  // Обработчики для транзакций на одобрение
  const handleApprove = (id) => {
    console.log(`Одобрить транзакцию ${id}`);
    // Здесь будет логика одобрения
  };

  const handleReject = (id) => {
    console.log(`Отклонить транзакцию ${id}`);
    // Здесь будет логика отклонения
  };

  const handleView = (id) => {
    console.log(`Просмотр транзакции ${id}`);
    // Здесь будет логика просмотра деталей
  };

  return (
    <div className="w-full h-full p-2 md:p-6">
      <MoreHeader title="Финансовый отдел Tannur" />
      
      <div className="space-y-8 mt-6">
        {/* Верхняя секция */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Общая сумма */}
          <div className="lg:col-span-1">
            <TotalAmountCard amount={84213000} />
          </div>

          {/* Транзакции на одобрение */}
          <div className="lg:col-span-3">
            <PendingTransactionsTable
              transactions={pendingTransactions}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
              currentDate={currentDate}
            />
          </div>
        </div>

        {/* История выплат */}
        <PaymentHistoryTable
          payments={paymentHistory}
          typeFilter={typeFilter}
          periodFilter={periodFilter}
          onTypeChange={setTypeFilter}
          onPeriodChange={setPeriodFilter}
        />
      </div>
    </div>
  );
};

export default FinanceTransactionsPage;