
'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Plus, DollarSign, Users, Gift, TrendingUp, Package, UserPlus, FileText, Calendar, Eye } from 'lucide-react';
import MoreHeader from '@/components/header/MoreHeader';

const FinanceDepartment = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Данные для графиков рекламных расходов
  const adExpenseData = [
    { month: 'Янв', expense: 15000, roi: 2.3 },
    { month: 'Фев', expense: 18000, roi: 2.1 },
    { month: 'Мар', expense: 22000, roi: 2.8 },
    { month: 'Апр', expense: 19000, roi: 3.2 },
    { month: 'Май', expense: 25000, roi: 2.9 },
    { month: 'Июн', expense: 28000, roi: 3.5 }
  ];

  // Данные зарплат по периодам
  const salaryData = [
    { id: 1, employee: 'Алмат Жанибеков', position: 'Менеджер', amount: 350000, period: 'Июнь 2025', status: 'Выплачено' },
    { id: 2, employee: 'Айгуль Сулейменова', position: 'Аналитик', amount: 280000, period: 'Июнь 2025', status: 'Выплачено' },
    { id: 3, employee: 'Данияр Каримов', position: 'Бухгалтер', amount: 320000, period: 'Июнь 2025', status: 'В обработке' }
  ];

  // Данные подарков
  const giftsData = [
    { id: 1, product: 'Смартфон Samsung Galaxy', quantity: 5, value: 750000, recipient: 'VIP клиенты', date: '2025-06-15' },
    { id: 2, product: 'Сертификат на 50,000₸', quantity: 10, value: 500000, recipient: 'Лучшие сотрудники', date: '2025-06-10' },
    { id: 3, product: 'Наушники AirPods', quantity: 8, value: 400000, recipient: 'Партнеры', date: '2025-06-08' }
  ];

  // Данные дистрибьютеров
  const distributorsData = [
    { id: 1, name: 'ТОО "Казахстан Трейд"', region: 'Алматы', products: 150, revenue: 2500000, status: 'Активный' },
    { id: 2, name: 'ИП Нурболатов А.К.', region: 'Астана', products: 89, revenue: 1800000, status: 'Активный' },
    { id: 3, name: 'ТОО "Степь Логистик"', region: 'Шымкент', products: 67, revenue: 1200000, status: 'На паузе' }
  ];

  const menuItems = [
    { id: 'overview', label: 'Обзор', icon: TrendingUp },
    { id: 'gifts', label: 'Подарки', icon: Gift },
    { id: 'advertising', label: 'Реклама', icon: DollarSign },
    { id: 'salaries', label: 'Зарплаты', icon: Users },
    { id: 'distributors', label: 'Дистрибьютеры', icon: Package },
    { id: 'transactions', label: 'Транзакции', icon: FileText }
  ];

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const ActionButton = ({ icon: Icon, label, color, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-105"
      style={{ borderLeftColor: color }}
    >
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <span className="font-medium text-gray-800">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <MoreHeader title="Финансовый отдел Tannur" />
      
      <div className="p-6">
        {/* Навигационное меню */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Обзор */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Статистические карточки */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={DollarSign}
                title="Общие расходы"
                value="12.8М ₸"
                change="+8.2%"
                color="#10B981"
              />
              <StatCard
                icon={Gift}
                title="Подарки"
                value="1.65М ₸"
                change="+12%"
                color="#F59E0B"
              />
              <StatCard
                icon={Users}
                title="Зарплатный фонд"
                value="8.9М ₸"
                change="+5.1%"
                color="#3B82F6"
              />
              <StatCard
                icon={Package}
                title="Дистрибьютеры"
                value="5.5М ₸"
                change="+15.3%"
                color="#8B5CF6"
              />
            </div>

            {/* Быстрые действия */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Быстрые действия</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActionButton
                  icon={Gift}
                  label="Добавить подарок"
                  color="#F59E0B"
                  onClick={() => setActiveTab('gifts')}
                />
                <ActionButton
                  icon={DollarSign}
                  label="Создать рекламный расход"
                  color="#EF4444"
                />
                <ActionButton
                  icon={Users}
                  label="Добавить зарплату"
                  color="#3B82F6"
                />
                <ActionButton
                  icon={UserPlus}
                  label="Новый дистрибьютер"
                  color="#8B5CF6"
                />
              </div>
            </div>
          </div>
        )}

        {/* Подарки */}
        {activeTab === 'gifts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Управление подарками</h2>
              <button className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all">
                <Plus className="h-4 w-4" />
                Добавить подарок
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Количество</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стоимость</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Получатель</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {giftsData.map((gift) => (
                      <tr key={gift.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {gift.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gift.quantity} шт.
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {gift.value.toLocaleString()} ₸
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {gift.recipient}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(gift.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Реклама */}
        {activeTab === 'advertising' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Рекламные расходы</h2>
              <button className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all">
                <Plus className="h-4 w-4" />
                Создать расход
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Расходы по месяцам</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={adExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} ₸`, 'Расходы']} />
                    <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">ROI по месяцам</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={adExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}x`, 'ROI']} />
                    <Line type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Зарплаты */}
        {activeTab === 'salaries' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Управление зарплатами</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
                  <Calendar className="h-4 w-4" />
                  По периодам
                </button>
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all">
                  <Plus className="h-4 w-4" />
                  Добавить зарплату
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сотрудник</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Должность</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Период</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salaryData.map((salary) => (
                      <tr key={salary.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {salary.employee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {salary.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {salary.amount.toLocaleString()} ₸
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {salary.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            salary.status === 'Выплачено' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {salary.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Дистрибьютеры */}
        {activeTab === 'distributors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Внешние дистрибьютеры</h2>
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all">
                <Plus className="h-4 w-4" />
                Добавить дистрибьютера
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Регион</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товары</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Выручка</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {distributorsData.map((distributor) => (
                      <tr key={distributor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {distributor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {distributor.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {distributor.products} шт.
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {distributor.revenue.toLocaleString()} ₸
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            distributor.status === 'Активный' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {distributor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Транзакции */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Финансовые транзакции пользователей</h2>
              <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all">
                <FileText className="h-4 w-4" />
                Экспорт отчета
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Данные транзакций загружаются</h3>
                <p className="text-gray-500">Здесь будет отображаться список всех финансовых транзакций пользователей</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceDepartment;