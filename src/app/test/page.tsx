'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  Search,
  ShoppingCart,
  Target,
  Home,
  Settings,
  Bell,
  Mail,
  Plus,
  MoreHorizontal,
  Activity,
  CreditCard,
  Users
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

// Определяем тип для одного заказа
interface Заказ {
  date: string;
  product: string;
  profit: number;
  cost: number;
  category: string;
}

// Определяем тип для ежемесячной статистики
interface МесячнаяСтатистика {
  profit: number;
  cost: number;
  orders: number;
}

// Определяем тип для статистики по продуктам
interface СтатистикаПродукта {
  name: string;
  profit: number;
  cost: number;
  orders: number;
  category: string;
}

const SalesDashboard = () => {
  const [выбранныйМесяц, setВыбранныйМесяц] = useState<string>('all');
  const [поисковыйЗапрос, setПоисковыйЗапрос] = useState<string>('');

  // Ваши жестко закодированные данные
  const orders: Заказ[] = [
    {date: '10.04.2025', product: 'Цифровое пианино Lapiano', profit: 81820, cost: 133980, category: 'Музыкальные инструменты'},
    {date: '01.04.2025', product: 'Проектор Mini', profit: 16282, cost: 24388, category: 'Проекторы'},
    {date: '01.04.2025', product: 'Проектор Lumi 1000', profit: 50350, cost: 73320, category: 'Проекторы'},
    {date: '01.04.2025', product: 'Ирригатор', profit: 3697, cost: 7010, category: 'Здоровье'},
    {date: '01.04.2025', product: 'Очиститель TRC3000', profit: 12409, cost: 16276, category: 'Бытовая техника'},
    {date: '22.04.2025', product: 'Цифровое пианино Leni', profit: 61636, cost: 104240, category: 'Музыкальные инструменты'},
    {date: '23.04.2025', product: 'Цифровое пианино Leni', profit: 78653, cost: 103947, category: 'Музыкальные инструменты'},
    {date: '24.04.2025', product: 'Цифровое пианино Lapiano', profit: 81425, cost: 134375, category: 'Музыкальные инструменты'},
    {date: '24.04.2025', product: 'Цифровое пианино Daisy', profit: 125193, cost: 190208, category: 'Музыкальные инструменты'},
    {date: '02.05.2025', product: 'Цифровое пианино Lapiano', profit: 81425, cost: 134375, category: 'Музыкальные инструменты'},
    {date: '02.05.2025', product: 'Проектор Lumi 1000', profit: 43585, cost: 80085, category: 'Проекторы'},
    {date: '21.05.2025', product: 'Пылесос авто чип', profit: 6086, cost: 8854, category: 'Автотовары'},
    {date: '22.05.2025', product: 'Пылесос авто алюмин', profit: 11331, cost: 12739, category: 'Автотовары'},
    {date: '25.05.2025', product: 'Пылесос для клещей', profit: 36973, cost: 35403, category: 'Бытовая техника'},
    {date: '24.04.2025', product: 'Цифровое пианино Lapiano', profit: 80803, cost: 134582, category: 'Музыкальные инструменты'},
    {date: '01.04.2025', product: 'Очиститель TRC3000', profit: 14513, cost: 25742, category: 'Бытовая техника'},
    {date: '02.05.2025', product: 'Проектор Lumi 1000', profit: 86271, cost: 78069, category: 'Проекторы'},
    {date: '25.05.2025', product: 'Пылесос для клещей', profit: 47103, cost: 27597, category: 'Бытовая техника'},
    {date: '26.06.2025', product: 'Пылесос для клещей с паром', profit: 66437, cost: 38973, category: 'Бытовая техника'},
    {date: '26.06.2025', product: 'Проектор Lumi 1000', profit: 91440, cost: 72900, category: 'Проекторы'},
    {date: '06.07.2025', product: 'Офисное детское кресло', profit: -126000, cost: 126000, category: 'Мебель'},
    {date: '11.07.2025', product: 'Проектор Lumi 1000', profit: 88335, cost: 76005, category: 'Проекторы'},
    {date: '11.07.2025', product: 'Проектор Mini', profit: 19029, cost: 19982, category: 'Проекторы'},
    {date: '14.07.2025', product: 'Проектор Lumi 2400', profit: 108054, cost: 56286, category: 'Проекторы'},
    {date: '15.07.2025', product: 'Цифровое пианино Leni', profit: -66124, cost: 66124, category: 'Музыкальные инструменты'},
    {date: '23.07.2025', product: 'Экран 120', profit: -21255, cost: 21255, category: 'Проекторы'},
    {date: '23.07.2025', product: 'Экран 150', profit: -25615, cost: 25615, category: 'Проекторы'}
  ];

  // Вычисляем общую статистику на основе выбранного месяца
  const статистика = useMemo(() => {
    const отфильтрованныеЗаказы = выбранныйМесяц === 'all'
      ? orders
      : orders.filter(заказ => {
          const месяц = заказ.date.split('.')[1];
          return месяц === выбранныйМесяц;
        });

    const общаяПрибыль = отфильтрованныеЗаказы.reduce((sum, заказ) => sum + заказ.profit, 0);
    const общиеЗатраты = отфильтрованныеЗаказы.reduce((sum, заказ) => sum + заказ.cost, 0);
    const общийДоход = общаяПрибыль + общиеЗатраты;
    const рентабельностьИнвестиций = общиеЗатраты > 0 ? (общаяПрибыль / общиеЗатраты) * 100 : 0;
    const прибыльныеПродукты = отфильтрованныеЗаказы.filter(заказ => заказ.profit > 0).length;
    const убыточныеПродукты = отфильтрованныеЗаказы.filter(заказ => заказ.profit < 0).length;

    return {
      общаяПрибыль,
      общиеЗатраты,
      общийДоход,
      рентабельностьИнвестиций,
      прибыльныеПродукты,
      убыточныеПродукты,
      всегоПродуктов: отфильтрованныеЗаказы.length
    };
  }, [выбранныйМесяц, orders]);

  // Данные для ежемесячной статистики
  const ежемесячныеДанные = useMemo(() => {
    const months: { [key: string]: МесячнаяСтатистика } = {};
    orders.forEach(заказ => {
      const month = заказ.date.split('.')[1];
      const monthName = {
        '04': 'Апрель',
        '05': 'Май',
        '06': 'Июнь',
        '07': 'Июль'
      }[month] || month;

      if (!months[monthName]) {
        months[monthName] = { profit: 0, cost: 0, orders: 0 };
      }
      months[monthName].profit += заказ.profit;
      months[monthName].cost += заказ.cost;
      months[monthName].orders += 1;
    });
    return months;
  }, [orders]);

  // Данные для топовых продуктов, отфильтрованных и отсортированных
  const топПродукты = useMemo(() => {
    const статистикаПродуктов: { [key: string]: СтатистикаПродукта } = {};
    const отфильтрованныеЗаказы = выбранныйМесяц === 'all'
      ? orders
      : orders.filter(заказ => {
          const месяц = заказ.date.split('.')[1];
          return месяц === выбранныйМесяц;
        });

    отфильтрованныеЗаказы.forEach(заказ => {
      if (!статистикаПродуктов[заказ.product]) {
        статистикаПродуктов[заказ.product] = {
          name: заказ.product,
          profit: 0,
          cost: 0,
          orders: 0,
          category: заказ.category
        };
      }
      статистикаПродуктов[заказ.product].profit += заказ.profit;
      статистикаПродуктов[заказ.product].cost += заказ.cost;
      статистикаПродуктов[заказ.product].orders += 1;
    });

    return Object.values(статистикаПродуктов)
      .filter((product: СтатистикаПродукта) => поисковыйЗапрос === '' || product.name.toLowerCase().includes(поисковыйЗапрос.toLowerCase()))
      .sort((a: СтатистикаПродукта, b: СтатистикаПродукта) => b.profit - a.profit);
  }, [выбранныйМесяц, поисковыйЗапрос, orders]);

  // Вспомогательная функция для форматирования чисел
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
  };

  // Данные Recharts для круговой диаграммы "Тип контракта"
  const pieChartData = [
    { name: 'Этап', value: 140, color: '#34D399' },
    { name: 'Бонусы', value: 48, color: '#60A5FA' },
    { name: 'Почасовая', value: 16, color: '#F87171' },
  ];
  const всегоКонтрактов = pieChartData.reduce((sum, entry) => sum + entry.value, 0);

  // Данные Recharts для столбчатой диаграммы "Активность"
  const activityData = [
    { name: 'Пн', hours: 20 },
    { name: 'Вт', hours: 30 },
    { name: 'Ср', hours: 25 },
    { name: 'Чт', hours: 40 },
    { name: 'Пт', hours: 35 },
    { name: 'Сб', hours: 80 },
    { name: 'Вс', hours: 60 },
  ];

  // Данные Recharts для линейного графика "Общие затраты"
  const spentData = [
    { name: 'Пн', spent: 60 },
    { name: 'Вт', spent: 45 },
    { name: 'Ср', spent: 35 },
    { name: 'Чт', spent: 50 },
    { name: 'Пт', spent: 25 },
    { name: 'Сб', spent: 40 },
    { name: 'Вс', spent: 30 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased text-gray-900 font-inter">
      {/* Шапка */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть: Логотип и навигация */}
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Λ</span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium transition-all hover:bg-gray-800">
                <BarChart3 className="w-4 h-4" />
                Панель
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                <CreditCard className="w-4 h-4" />
                Платежи
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                <BarChart3 className="w-4 h-4" />
                Отчеты
              </button>
            </nav>
          </div>

          {/* Правая часть: Действия пользователя */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
              <button className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center transition-all hover:bg-gray-800">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <Mail className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Боковая панель */}
        <div className="hidden md:flex flex-col w-16 bg-white border-r border-gray-200 py-6 items-center gap-6 shadow-sm">
          <button className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center transition-all hover:bg-gray-800 shadow-md">
            <Home className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
            <Package className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
            <BarChart3 className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Основное содержимое */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* "Хлебные крошки" */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Home className="w-4 h-4" />
            <span>Главная</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Панель</span>
          </div>

          {/* Заголовок страницы */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-light text-gray-900">Панель продаж</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5" />
              </button>
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-gray-900 transition-colors">
                <option>20-27 Янв 2025</option>
              </select>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-all">
                <Plus className="w-4 h-4" />
                Добавить виджет
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Создать отчет
              </button>
            </div>
          </div>

          {/* Сетка панели */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Карточка "Pro Version" */}
            <div className="bg-white rounded-2xl p-6 relative overflow-hidden shadow-xl col-span-1 lg:col-span-2">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-medium text-gray-900 mb-4">Pro версия</h3>

              {/* Заполнитель 3D-кристалла */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 rounded-xl transform rotate-45 opacity-80 shadow-2xl"></div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-300 via-purple-400 to-pink-300 rounded-xl shadow-lg"></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Преимущества</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">15 Дней</span>
                </div>
                <p className="text-xs text-gray-600 mb-4">Ваш доход с Pro версией</p>

                {/* Заполнитель мини-графика */}
                <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg mb-4"></div>

                <button className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium shadow-md hover:bg-gray-800 transition-all">
                  Узнать больше
                </button>
              </div>

              <p className="text-xs text-gray-500">Присоединяйтесь к элите криптомира с <strong>Pro версией</strong></p>
            </div>

            {/* График активности */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Активность</h3>
                <div className="flex items-center gap-2 text-gray-400">
                  <BarChart3 className="w-4 h-4" />
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-1">Отработано на этой неделе</p>
                <p className="text-2xl font-light text-gray-900">186<span className="text-sm text-gray-500">ч</span></p>
              </div>

              {/* Столбчатая диаграмма с использованием Recharts */}
              <ResponsiveContainer width="100%" height={128}>
                <BarChart data={activityData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                  <Bar dataKey="hours" fill="#e5e7eb" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="hours" fill="#fbbf24" radius={[10, 10, 0, 0]} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </BarChart>
              </ResponsiveContainer>

            </div>

            {/* Виртуальные карты */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Виртуальные карты</h3>
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-600 mb-1">Общий баланс</p>
                <p className="text-2xl font-light text-gray-900">$6,010<span className="text-lg text-gray-400">.29</span></p>
                <p className="text-xs text-green-600">↗ $205.00</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Доллар</span>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Тетер</span>
                  <span className="text-sm font-medium">28%</span>
                </div>
              </div>

              {/* Карта VISA - переработанный дизайн */}
              <div className="bg-gradient-to-br from-green-300 to-green-500 rounded-xl p-6 relative shadow-md">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-white font-bold text-lg">VISA</div>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="text-white font-medium text-lg">$390.00</div>
                <div className="flex justify-between items-end mt-4 text-white">
                  <div className="text-xs opacity-80">•••• 6802</div>
                  <div className="text-xs opacity-80">09/28</div>
                </div>
              </div>
            </div>

            {/* Общие затраты */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Общие затраты</h3>
                <div className="flex items-center gap-2 text-gray-400">
                  <BarChart3 className="w-4 h-4" />
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-600 mb-1">Потрачено на этой неделе</p>
                <p className="text-2xl font-light text-gray-900">$820<span className="text-lg text-gray-400">.65</span></p>
                <p className="text-xs text-green-600">↗ $605.00</p>
              </div>

              {/* Линейный график с точками */}
              <ResponsiveContainer width="100%" height={96}>
                <LineChart data={spentData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                  <YAxis hide={true} domain={['dataMin', 'dataMax + 10']} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                  <Line
                    type="monotone"
                    dataKey="spent"
                    stroke="#6B7280"
                    strokeWidth={2}
                    dot={{ stroke: '#6B7280', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#FCD34D', fill: '#FCD34D' }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <div>
                  <div className="text-gray-900 font-medium">10</div>
                  <div>Кошельков</div>
                </div>
                <div>
                  <div className="text-gray-900 font-medium">26</div>
                  <div>Активов</div>
                </div>
              </div>
            </div>

            {/* Тип контракта */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Тип контракта</h3>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>

              <div className="mb-6">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">Узнать больше →</button>
              </div>

              {/* Кольцевая диаграмма с использованием Recharts */}
              <div className="flex items-center justify-center mb-6 relative">
                <ResponsiveContainer width="100%" height={128}>
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={5}
                      cornerRadius={5}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-900">{((pieChartData[0].value / всегоКонтрактов) * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-center">
                {pieChartData.map(item => (
                  <div key={item.name}>
                    <div className="text-lg font-medium text-gray-900">{item.value}</div>
                    <div className="text-xs text-gray-500">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Данные о продажах (Ежемесячная статистика) */}
            <div className="bg-white rounded-2xl p-6 shadow-xl col-span-1 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Месячная статистика</h3>
              <div className="space-y-4">
                {Object.entries(ежемесячныеДанные).map(([month, data]) => (
                  <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{month}</p>
                      <p className="text-xs text-gray-500">{data.orders} заказов</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.profit >= 0 ? '+' : ''}{formatNumber(data.profit)} ₸
                      </p>
                      <p className="text-xs text-gray-500">
                        ROI: {data.cost > 0 ? ((data.profit / data.cost) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {data.profit >= 0 ?
                        <TrendingUp className="w-4 h-4 text-green-600" /> :
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Таблица продуктов */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h3 className="text-lg font-medium text-gray-900">Топ товары</h3>
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={выбранныйМесяц}
                  onChange={(e) => setВыбранныйМесяц(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-gray-900 transition-colors"
                >
                  <option value="all">Все месяцы</option>
                  <option value="04">Апрель</option>
                  <option value="05">Май</option>
                  <option value="06">Июнь</option>
                  <option value="07">Июль</option>
                </select>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={поисковыйЗапрос}
                    onChange={(e) => setПоисковыйЗапрос(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-gray-900 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {топПродукты.slice(0, 10).map((product, index) => (
                <div key={product.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category} • {product.orders} заказов</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <div className="text-right">
                      <p className={`font-medium text-sm ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.profit >= 0 ? '+' : ''}{formatNumber(product.profit)} ₸
                      </p>
                      <p className="text-xs text-gray-500">
                        ROI: {product.cost > 0 ? ((product.profit / product.cost) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {product.profit >= 0 ?
                        <TrendingUp className="w-4 h-4 text-green-600" /> :
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
