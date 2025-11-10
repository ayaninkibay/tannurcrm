'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { useUser } from '@/context/UserContext';
import { 
  withdrawalService, 
  Transaction, 
  TransactionHistory, 
  WithdrawalRequest,
  Balance 
} from '@/lib/transactions/withdrawalService';

const WithdrawPage = () => {
  const router = useRouter();
  const { profile, loading: userLoading } = useUser();
  
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'withdrawals' | 'pending'>('all');
  const [comment, setComment] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Данные карты для вывода
  const [withdrawDetails, setWithdrawDetails] = useState({
    bank: '',
    cardNumber: '',
    cardHolder: '',
    phone: ''
  });
  
  // Данные из БД
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [availableTransactions, setAvailableTransactions] = useState<Transaction[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [myWithdrawals, setMyWithdrawals] = useState<WithdrawalRequest[]>([]);

  const loadAllData = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const [balanceData, transactions, history, withdrawals] = await Promise.all([
        withdrawalService.getUserBalance(profile.id),
        withdrawalService.getAvailableTransactions(profile.id),
        withdrawalService.getTransactionHistory(profile.id, 100),
        withdrawalService.getMyWithdrawals(profile.id)
      ]);

      setBalance(balanceData);
      setAvailableTransactions(transactions);
      setTransactionHistory(history);
      setMyWithdrawals(withdrawals);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      loadAllData();
      setWithdrawDetails(prev => ({
        ...prev,
        cardHolder: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      }));
    }
  }, [profile, loadAllData]);

  const selectedAmount = availableTransactions
    .filter(t => selectedTransactions.has(t.transaction_id))
    .reduce((sum, t) => sum + t.amount, 0);

  const handleTransactionToggle = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleWithdraw = async () => {
    if (!profile?.id || selectedAmount < 20000) return;
    
    if (!withdrawDetails.bank || !withdrawDetails.cardNumber) {
      alert('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      const result = await withdrawalService.createWithdrawalRequest(
        profile.id,
        Array.from(selectedTransactions),
        'bank_transfer',
        {
          bank: withdrawDetails.bank,
          cardNumber: withdrawDetails.cardNumber,
          cardHolder: withdrawDetails.cardHolder,
          phone: withdrawDetails.phone
        },
        comment
      );

      if (result.success) {
        setShowSuccessModal(true);
        
        // Сброс формы
        setSelectedTransactions(new Set());
        setComment('');
        setWithdrawDetails(prev => ({
          ...prev,
          bank: '',
          cardNumber: '',
          phone: ''
        }));
        
        // Обновление данных
        loadAllData();
        
        // Автоматическая переадресация через 3 секунды
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push('/dealer/dashboard');
        }, 3000);
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    if (activeFilter === 'income') {
      return transactionHistory.filter(t => t.operation === 'credit' && !t.is_withdrawn);
    }
    if (activeFilter === 'withdrawals') {
      return transactionHistory.filter(t => t.operation === 'debit' || t.is_withdrawn);
    }
    if (activeFilter === 'pending') {
      return [];
    }
    return transactionHistory;
  };

  const pendingWithdrawals = myWithdrawals.filter(
    w => w.status === 'pending' || w.status === 'processing' || w.status === 'approved'
  );

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      'order_bonus': (
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      ),
      'team_purchase_bonus': (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      ),
      'referral_subscription': (
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      )
    };
    
    return icons[type] || (
      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  if (userLoading || loading) {
    return (
      <div className="p-2 md:p-6">
        <MoreHeaderDE title="Вывод средств" showBackButton={true} />
        <div className="flex justify-center items-center h-96">
          <div className="w-10 h-10 border-3 border-[#D77E6C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderDE title="Вывод средств" showBackButton={true} />

      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Левая часть - Основной контент */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Карта баланса */}
            <div className="bg-gradient-to-br from-[#D77E6C] via-[#E09080] to-[#D77E6C] rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-white/70 text-sm mb-1">Доступный баланс</p>
                  <div className="text-5xl font-light tracking-tight">
                    {formatAmount(balance?.available_balance || 0)}
                    <span className="text-2xl ml-2 opacity-80">₸</span>
                  </div>
                </div>
                <button 
                  onClick={loadAllData}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div>
                  <p className="text-xs text-white/60">Текущий</p>
                  <p className="text-lg font-medium">{formatAmount(balance?.current_balance || 0)} ₸</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">В обработке</p>
                  <p className="text-lg font-medium">{formatAmount(balance?.frozen_balance || 0)} ₸</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Выведено всего</p>
                  <p className="text-lg font-medium">{formatAmount(balance?.total_withdrawn || 0)} ₸</p>
                </div>
              </div>
            </div>

            {/* Форма вывода с градиентной рамкой */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D77E6C] to-[#E09080] rounded-2xl"></div>
              <div className="relative bg-white rounded-2xl p-4 sm:p-6 m-[2px]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#D77E6C] to-[#E09080] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-medium">Реквизиты для вывода</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Укажите данные вашей карты или счета</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium truncate">Банк</label>
                    <div className="relative">
                      <select
                        value={withdrawDetails.bank}
                        onChange={(e) => setWithdrawDetails({...withdrawDetails, bank: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border-2 border-gray-200 rounded-xl focus:border-[#D77E6C] focus:outline-none transition-colors appearance-none bg-white text-sm sm:text-base"
                      >
                        <option value="">Выберите банк</option>
                        <option value="Kaspi Bank">🏦 Kaspi Bank</option>
                        <option value="Halyk Bank">🏦 Halyk Bank</option>
                        <option value="Jusan Bank">🏦 Jusan Bank</option>
                        <option value="ForteBank">🏦 ForteBank</option>
                        <option value="Bank CenterCredit">🏦 Bank CenterCredit</option>
                        <option value="Eurasian Bank">🏦 Eurasian Bank</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium truncate">
                      <span className="hidden sm:inline">💳 </span>
                      Номер карты/счета
                    </label>
                    <input
                      type="text"
                      value={withdrawDetails.cardNumber}
                      onChange={(e) => setWithdrawDetails({...withdrawDetails, cardNumber: e.target.value})}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-[#D77E6C] focus:outline-none transition-colors text-sm sm:text-base"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium truncate">
                      <span className="hidden sm:inline">👤 </span>ФИО получателя
                    </label>
                    <input
                      type="text"
                      value={withdrawDetails.cardHolder}
                      onChange={(e) => setWithdrawDetails({...withdrawDetails, cardHolder: e.target.value})}
                      placeholder="Иванов Иван Иванович"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-[#D77E6C] focus:outline-none transition-colors text-sm sm:text-base"
                    />
                  </div>

                  {withdrawDetails.bank === 'Kaspi Bank' && (
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium truncate">
                        <span className="hidden sm:inline">📞 </span>Номер телефона (для уведомлений)
                      </label>
                      <input
                        type="text"
                        value={withdrawDetails.phone}
                        onChange={(e) => setWithdrawDetails({...withdrawDetails, phone: e.target.value})}
                        placeholder="+7 701 000 0000"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-[#D77E6C] focus:outline-none transition-colors text-sm sm:text-base"
                      />
                    </div>
                  )}
                </div>

                {/* Блок комментария */}
                <div className="mt-4">
                  <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium truncate">
                    <span className="hidden sm:inline">💬 </span>Комментарий к выводу
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Укажите назначение платежа или дополнительную информацию..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-[#D77E6C] focus:outline-none transition-colors resize-none text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Доступные транзакции с улучшенным дизайном */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#D77E6C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#D77E6C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-medium">Выберите транзакции</h3>
                    <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Отметьте операции для вывода</p>
                  </div>
                </div>
                {selectedTransactions.size > 0 && (
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-500">Выбрано: {selectedTransactions.size}</p>
                    <p className="text-lg sm:text-xl font-semibold text-[#D77E6C]">{formatAmount(selectedAmount)} ₸</p>
                  </div>
                )}
              </div>

              {availableTransactions.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Нет доступных транзакций</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Средства появятся после подтверждения заказов</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                    {availableTransactions.map(transaction => (
                      <label 
                        key={transaction.transaction_id}
                        className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                          selectedTransactions.has(transaction.transaction_id)
                            ? 'bg-gradient-to-r from-[#D77E6C]/5 to-[#E09080]/5 border-[#D77E6C]'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={selectedTransactions.has(transaction.transaction_id)}
                          onChange={() => handleTransactionToggle(transaction.transaction_id)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#D77E6C] rounded focus:ring-[#D77E6C] flex-shrink-0"
                        />
                        <div className="hidden sm:block flex-shrink-0">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{transaction.source_name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {formatDate(transaction.created_at)}
                            <span className="hidden sm:inline"> • {transaction.notes || 'Без описания'}</span>
                          </p>
                        </div>
                        <span className="text-sm sm:text-lg font-semibold text-green-600 group-hover:scale-105 sm:group-hover:scale-110 transition-transform flex-shrink-0">
                          +{formatAmount(transaction.amount)} ₸
                        </span>
                      </label>
                    ))}
                  </div>

                  {selectedAmount > 0 && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      {selectedAmount < 20000 && (
                        <div className="flex items-start sm:items-center gap-2 text-orange-600 mb-3 sm:mb-4">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-xs sm:text-sm">
                            Минимальная сумма: 20,000 ₸<br className="sm:hidden"/> 
                            <span className="hidden sm:inline"> • </span>
                            Добавьте еще {formatAmount(20000 - selectedAmount)} ₸
                          </p>
                        </div>
                      )}
                      <button 
                        onClick={handleWithdraw}
                        disabled={selectedAmount < 20000 || !withdrawDetails.bank || !withdrawDetails.cardNumber || loading}
                        className={`w-full py-3 sm:py-4 rounded-xl font-medium transition-all text-sm sm:text-base ${
                          selectedAmount >= 20000 && withdrawDetails.bank && withdrawDetails.cardNumber
                            ? 'bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white hover:shadow-lg transform hover:scale-[1.01] sm:hover:scale-[1.02]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Обработка...
                          </span>
                        ) : selectedAmount < 20000 ? 
                          `Минимум 20,000 ₸` :
                          !withdrawDetails.bank || !withdrawDetails.cardNumber ? 
                          'Заполните реквизиты' :
                          `Вывести ${formatAmount(selectedAmount)} ₸`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Правая часть - История */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Активные заявки */}
            {pendingWithdrawals.length > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-orange-900">Активные заявки</h3>
                </div>
                <div className="space-y-3">
                  {pendingWithdrawals.map((withdrawal, idx) => (
                    <div key={`active-withdrawal-${withdrawal.id}-${idx}`} className="bg-white rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Заявка #{withdrawal.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">{formatDate(withdrawal.requested_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-orange-600">{formatAmount(withdrawal.amount)} ₸</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            withdrawal.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            withdrawal.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {withdrawal.status === 'pending' ? 'Ожидает' :
                             withdrawal.status === 'processing' ? 'В обработке' :
                             withdrawal.status === 'approved' ? 'Одобрено' :
                             withdrawal.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* История операций */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium mb-4">История операций</h3>

              {/* Фильтры */}
              <div className="flex gap-2 mb-6">
                {[
                  { key: 'all', label: 'Все' },
                  { key: 'income', label: 'Поступления' },
                  { key: 'withdrawals', label: 'Выводы' },
                  { key: 'pending', label: 'В обработке' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as any)}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                      activeFilter === filter.key
                        ? 'bg-[#D77E6C] text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activeFilter === 'pending' ? (
                  pendingWithdrawals.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Нет активных заявок</p>
                  ) : (
                    pendingWithdrawals.map(w => (
                      <div key={`pending-${w.id}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Заявка на вывод</p>
                            <p className="text-xs text-gray-500">{formatDate(w.requested_at)}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-orange-600">-{formatAmount(w.amount)} ₸</p>
                      </div>
                    ))
                  )
                ) : (
                  getFilteredTransactions().slice(0, 15).map((item, index) => (
                    <div key={`history-${item.transaction_id}-${index}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.operation === 'credit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            item.operation === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d={item.operation === 'credit' 
                                ? "M7 11l5-5m0 0l5 5m-5-5v12" 
                                : "M17 13l-5 5m0 0l-5-5m5 5V6"} 
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.source_name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(item.created_at)}
                            {item.is_withdrawn && ' • Выведено'}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${
                        item.operation === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.operation === 'credit' ? '+' : '-'}{formatAmount(item.amount)} ₸
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl transform scale-100 animate-[scaleIn_0.3s_ease-out]">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-[bounceIn_0.5s_ease-out]">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-green-400 rounded-full mx-auto animate-ping opacity-25"></div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Заявка успешно создана!
              </h3>
              <p className="text-gray-600 mb-6">
                Ваша заявка на вывод средств принята в обработку. Средства поступят на указанный счет в течение 1-3 рабочих дней.
              </p>
              
              {/* Amount */}
              <div className="bg-gradient-to-r from-[#D77E6C]/10 to-[#E09080]/10 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Сумма к выводу</p>
                <p className="text-3xl font-bold text-[#D77E6C]">
                  {formatAmount(selectedAmount)} ₸
                </p>
              </div>

              {/* Redirect Info */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Переадресация через 3 секунды...</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/dealer/dashboard');
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Перейти в дашборд
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    loadAllData();
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Остаться на странице
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default WithdrawPage;