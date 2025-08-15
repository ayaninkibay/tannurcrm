'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  TrendingUp,
  Clock,
  Target,
  Plus,
  Minus,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Gift,
  Trophy,
  ShoppingCart,
  MoreVertical,
  Calendar,
  X,
  Share2,
  Copy,
  Crown,
  Star
} from 'lucide-react';

// Имитация компонента MoreHeaderAD
const MoreHeaderAD = ({ title }) => (
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
  </div>
);

// Типы для командных покупок
interface Participant {
  id: string;
  name: string;
  avatar: string;
  contribution: number;
  target: number;
  isOrganizer?: boolean;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface TeamPurchase {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed';
  organizer: {
    name: string;
    avatar: string;
    role: string;
  };
  participants: Participant[];
  targetAmount: number;
  currentAmount: number;
  minAmount: number;
  deadline?: string;
  completedDate?: string;
  discount: number;
  savedAmount?: number;
  products: Product[];
  benefits: string[];
}

export default function TeamPurchasePage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');
  const [selectedPurchase, setSelectedPurchase] = useState<TeamPurchase | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [myContribution, setMyContribution] = useState<Record<string, number>>({});

  // Временные данные командных покупок
  const [teamPurchases, setTeamPurchases] = useState<TeamPurchase[]>([
    {
      id: '1',
      title: 'Оптовая закупка косметики Tannur',
      status: 'active',
      organizer: {
        name: 'Алмаш Бердыев',
        avatar: '👤',
        role: 'Организатор'
      },
      participants: [
        { id: '1', name: 'Алмаш Бердыев', avatar: '👤', contribution: 125000, target: 150000, isOrganizer: true },
        { id: '2', name: 'Айгерим Касымова', avatar: '👩', contribution: 85000, target: 100000 },
        { id: '3', name: 'Нурлан Сериков', avatar: '👨', contribution: 45000, target: 50000 },
        { id: '4', name: 'Динара Омарова', avatar: '👩‍💼', contribution: 0, target: 75000 },
      ],
      targetAmount: 500000,
      currentAmount: 255000,
      minAmount: 300000,
      deadline: '2025-08-25',
      discount: 25,
      products: [
        { id: '1', name: 'Ф-А Шоколады Tannur', quantity: 50, price: 18000, total: 900000 },
        { id: '2', name: 'Обваливающая маска', quantity: 30, price: 28000, total: 840000 },
        { id: '3', name: 'Набор кремов', quantity: 20, price: 38000, total: 760000 },
      ],
      benefits: [
        'Скидка 25% на весь заказ',
        'Бесплатная доставка',
        'Приоритетное обслуживание',
        'Бонусные товары при заказе от 500,000 ₸'
      ]
    },
    {
      id: '2',
      title: 'Закупка новой коллекции',
      status: 'pending',
      organizer: {
        name: 'Марат Алиев',
        avatar: '🧑',
        role: 'Организатор'
      },
      participants: [
        { id: '1', name: 'Марат Алиев', avatar: '🧑', contribution: 0, target: 200000, isOrganizer: true },
        { id: '2', name: 'Сауле Ахметова', avatar: '👩‍🦰', contribution: 0, target: 150000 },
      ],
      targetAmount: 750000,
      currentAmount: 0,
      minAmount: 500000,
      deadline: '2025-08-30',
      discount: 30,
      products: [],
      benefits: [
        'Скидка 30% на весь заказ',
        'Эксклюзивный доступ к новой коллекции',
        'Персональный менеджер'
      ]
    },
    {
      id: '3',
      title: 'Успешная закупка - Июль 2025',
      status: 'completed',
      organizer: {
        name: 'Асель Токтарова',
        avatar: '👩‍💻',
        role: 'Организатор'
      },
      participants: [
        { id: '1', name: 'Асель Токтарова', avatar: '👩‍💻', contribution: 180000, target: 180000, isOrganizer: true },
        { id: '2', name: 'Ерлан Мусин', avatar: '👨‍💼', contribution: 120000, target: 120000 },
        { id: '3', name: 'Гульнара Садыкова', avatar: '👩‍🏫', contribution: 95000, target: 95000 },
        { id: '4', name: 'Тимур Жанибеков', avatar: '👨‍🎓', contribution: 105000, target: 105000 },
      ],
      targetAmount: 500000,
      currentAmount: 500000,
      minAmount: 400000,
      completedDate: '2025-07-15',
      discount: 28,
      savedAmount: 140000,
      products: [],
      benefits: []
    }
  ]);

  // Фильтрация покупок по статусу
  const filteredPurchases = teamPurchases.filter(p => {
    if (activeTab === 'active') return p.status === 'active';
    if (activeTab === 'pending') return p.status === 'pending';
    if (activeTab === 'completed') return p.status === 'completed';
    return true;
  });

  // Обновление вклада участника
  const updateContribution = (purchaseId: string, productId: string, change: number) => {
    setMyContribution(prev => {
      const key = `${purchaseId}-${productId}`;
      const current = prev[key] || 0;
      const newValue = Math.max(0, current + change);
      return { ...prev, [key]: newValue };
    });
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('ru-RU')} ₸`;
  };

  // Расчет прогресса
  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  // Расчет дней до дедлайна
  const daysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderAD title="Командные покупки" />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                <Users className="w-5 h-5 text-[#D77E6C]" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">3</div>
            <div className="text-sm text-gray-500">активных закупок</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">28%</div>
            <div className="text-sm text-gray-500">средняя скидка</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">12</div>
            <div className="text-sm text-gray-500">успешных закупок</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Gift className="w-5 h-5 text-yellow-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">{formatPrice(540000)}</div>
            <div className="text-sm text-gray-500">сэкономлено всего</div>
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'active'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Активные
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'pending'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Формируются
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'completed'
                  ? 'bg-[#D77E6C] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Завершенные
            </button>
          </div>
        </div>

        {/* Список командных покупок */}
        <div className="space-y-6">
          {filteredPurchases.map(purchase => (
            <div key={purchase.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Шапка */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Левая часть - информация */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[#111] mb-2">{purchase.title}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{purchase.organizer.avatar}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-700">{purchase.organizer.name}</p>
                              <p className="text-xs text-gray-500">{purchase.organizer.role}</p>
                            </div>
                          </div>
                          
                          {/* Статус */}
                          {purchase.status === 'active' && (
                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              Активна
                            </div>
                          )}
                          {purchase.status === 'pending' && (
                            <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                              Формируется
                            </div>
                          )}
                          {purchase.status === 'completed' && (
                            <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                              Завершена
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Прогресс */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Прогресс сбора</span>
                        <span className="text-sm font-medium text-[#111]">
                          {formatPrice(purchase.currentAmount)} / {formatPrice(purchase.targetAmount)}
                        </span>
                      </div>
                      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#D77E6C] to-[#E89380] rounded-full transition-all duration-500"
                          style={{ width: `${calculateProgress(purchase.currentAmount, purchase.targetAmount)}%` }}
                        />
                        {/* Минимальная сумма индикатор */}
                        <div 
                          className="absolute top-0 h-full w-0.5 bg-gray-400"
                          style={{ left: `${(purchase.minAmount / purchase.targetAmount) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          Минимум: {formatPrice(purchase.minAmount)}
                        </span>
                        <span className="text-xs font-medium text-[#D77E6C]">
                          {calculateProgress(purchase.currentAmount, purchase.targetAmount).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Информация в ряд */}
                    <div className="flex flex-wrap gap-6">
                      {purchase.status !== 'completed' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Осталось</p>
                              <p className="text-sm font-medium text-[#111]">
                                {daysUntilDeadline(purchase.deadline)} дней
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Скидка</p>
                              <p className="text-sm font-medium text-green-600">{purchase.discount}%</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Завершена</p>
                              <p className="text-sm font-medium text-[#111]">{purchase.completedDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Сэкономлено</p>
                              <p className="text-sm font-medium text-green-600">{formatPrice(purchase.savedAmount)}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Правая часть - участники и действия */}
                  <div className="lg:border-l lg:pl-6 border-gray-200">
                    {/* Участники */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Участники</span>
                        <span className="text-sm text-gray-500">
                          {purchase.participants.length} человек
                        </span>
                      </div>
                      <div className="flex -space-x-2 mb-4">
                        {purchase.participants.slice(0, 6).map((participant, idx) => (
                          <div
                            key={participant.id}
                            className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-lg relative"
                            title={participant.name}
                          >
                            {participant.isOrganizer && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Crown className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                            {participant.avatar}
                          </div>
                        ))}
                        {purchase.participants.length > 6 && (
                          <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-sm font-medium text-gray-600">
                            +{purchase.participants.length - 6}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Преимущества */}
                    {purchase.benefits.length > 0 && purchase.status !== 'completed' && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Преимущества:</p>
                        <div className="space-y-1">
                          {purchase.benefits.slice(0, 2).map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-600">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Действия */}
                    <div className="flex gap-3">
                      {purchase.status === 'active' && (
                        <>
                          <button
                            onClick={() => setSelectedPurchase(purchase)}
                            className="flex-1 py-2 bg-[#D77E6C] text-white rounded-lg font-medium hover:bg-[#C56D5C] transition-colors"
                          >
                            Участвовать
                          </button>
                          <button
                            onClick={() => setShowInviteModal(true)}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {purchase.status === 'pending' && (
                        <button className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          Ожидание начала
                        </button>
                      )}
                      {purchase.status === 'completed' && (
                        <button className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                          Посмотреть детали
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка создания новой закупки */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#111] mb-2">Хотите организовать командную закупку?</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Объедините усилия с другими дилерами для получения максимальной скидки
          </p>
          <button className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Создать командную закупку
          </button>
        </div>
      </div>

      {/* Модальное окно детальной информации */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#111]">{selectedPurchase.title}</h2>
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Участники */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#111] mb-4">Участники закупки</h3>
                <div className="space-y-3">
                  {selectedPurchase.participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span className="text-2xl">{participant.avatar}</span>
                          {participant.isOrganizer && (
                            <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#111]">{participant.name}</p>
                          <p className="text-sm text-gray-500">
                            {participant.isOrganizer ? 'Организатор' : 'Участник'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#111]">{formatPrice(participant.contribution)}</p>
                        <p className="text-sm text-gray-500">из {formatPrice(participant.target)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Товары */}
              {selectedPurchase.products.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#111] mb-4">Товары в закупке</h3>
                  <div className="space-y-3">
                    {selectedPurchase.products.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-[#111]">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.quantity} шт. × {formatPrice(product.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateContribution(selectedPurchase.id, product.id, -1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">
                            {myContribution[`${selectedPurchase.id}-${product.id}`] || 0}
                          </span>
                          <button
                            onClick={() => updateContribution(selectedPurchase.id, product.id, 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Преимущества */}
              <div>
                <h3 className="text-lg font-semibold text-[#111] mb-4">Преимущества участия</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedPurchase.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button className="flex-1 py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors">
                Подтвердить участие
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно приглашения */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111]">Пригласить участников</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка для приглашения</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://tannur.kz/team-purchase/invite/abc123"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  />
                  <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Пригласить по email</label>
                <input
                  type="email"
                  placeholder="dealer@example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
                />
              </div>

              <button className="w-full py-3 bg-[#D77E6C] text-white rounded-xl font-medium hover:bg-[#C56D5C] transition-colors flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Отправить приглашение
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}