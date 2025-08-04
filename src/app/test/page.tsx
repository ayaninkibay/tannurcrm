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

// Define the type for a single order
interface Order {
  date: string;
  product: string;
  profit: number;
  cost: number;
  category: string;
}

// Define the type for monthly data statistics
interface MonthlyStats {
  profit: number;
  cost: number;
  orders: number;
}

// Define the type for product statistics
interface ProductStats {
  name: string;
  profit: number;
  cost: number;
  orders: number;
  category: string;
}

const SalesDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Your hardcoded data
  const orders: Order[] = [
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

  // Memoized calculation for overall statistics based on selected month
  const stats = useMemo(() => {
    const filteredOrders = selectedMonth === 'all' 
      ? orders 
      : orders.filter(order => {
          const month = order.date.split('.')[1];
          return month === selectedMonth;
        });

    const totalProfit = filteredOrders.reduce((sum, order) => sum + order.profit, 0);
    const totalCost = filteredOrders.reduce((sum, order) => sum + order.cost, 0);
    const totalRevenue = totalProfit + totalCost;
    const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const profitableProducts = filteredOrders.filter(order => order.profit > 0).length;
    const unprofitableProducts = filteredOrders.filter(order => order.profit < 0).length;

    return {
      totalProfit,
      totalCost,
      totalRevenue,
      roi,
      profitableProducts,
      unprofitableProducts,
      totalProducts: filteredOrders.length
    };
  }, [selectedMonth, orders]);

  // Memoized data for monthly statistics
  const monthlyData = useMemo(() => {
    const months: { [key: string]: MonthlyStats } = {};
    orders.forEach(order => {
      const month = order.date.split('.')[1];
      const monthName = {
        '04': 'Апрель',
        '05': 'Май',
        '06': 'Июнь',
        '07': 'Июль'
      }[month] || month;

      if (!months[monthName]) {
        months[monthName] = { profit: 0, cost: 0, orders: 0 };
      }
      months[monthName].profit += order.profit;
      months[monthName].cost += order.cost;
      months[monthName].orders += 1;
    });
    return months;
  }, [orders]);

  // Memoized data for top products, filtered and sorted
  const topProducts = useMemo(() => {
    const productStats: { [key: string]: ProductStats } = {};
    const filteredOrders = selectedMonth === 'all' 
      ? orders 
      : orders.filter(order => {
          const month = order.date.split('.')[1];
          return month === selectedMonth;
        });

    filteredOrders.forEach(order => {
      if (!productStats[order.product]) {
        productStats[order.product] = {
          name: order.product,
          profit: 0,
          cost: 0,
          orders: 0,
          category: order.category
        };
      }
      productStats[order.product].profit += order.profit;
      productStats[order.product].cost += order.cost;
      productStats[order.product].orders += 1;
    });

    return Object.values(productStats)
      .filter((product: ProductStats) => searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a: ProductStats, b: ProductStats) => b.profit - a.profit);
  }, [selectedMonth, searchTerm, orders]);

  // Utility function to format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
  };

  // Recharts data for the Contract Type pie chart
  const pieChartData = [
    { name: 'Milestone', value: 140, color: '#34D399' },
    { name: 'Bonuses', value: 48, color: '#60A5FA' },
    { name: 'Hourly', value: 16, color: '#F87171' },
  ];
  const totalContracts = pieChartData.reduce((sum, entry) => sum + entry.value, 0);

  // Recharts data for the Activity bar chart
  const activityData = [
    { name: 'Mon', hours: 20 },
    { name: 'Tue', hours: 30 },
    { name: 'Wed', hours: 25 },
    { name: 'Thu', hours: 40 },
    { name: 'Fri', hours: 35 },
    { name: 'Sat', hours: 80 },
    { name: 'Sun', hours: 60 },
  ];

  // Recharts data for the Total Spent line chart
  const spentData = [
    { name: 'Mon', spent: 60 },
    { name: 'Tue', spent: 45 },
    { name: 'Wed', spent: 35 },
    { name: 'Thu', spent: 50 },
    { name: 'Fri', spent: 25 },
    { name: 'Sat', spent: 40 },
    { name: 'Sun', spent: 30 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased text-gray-900 font-inter">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Logo and Navigation */}
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Λ</span>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium transition-all hover:bg-gray-800">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                <CreditCard className="w-4 h-4" />
                Payments
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                <BarChart3 className="w-4 h-4" />
                Reports
              </button>
            </nav>
          </div>

          {/* Right side: User Actions */}
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
        {/* Sidebar */}
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

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Home className="w-4 h-4" />
            <span>Home Page</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Dashboard</span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-light text-gray-900">Sales Dashboard</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5" />
              </button>
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:ring-2 focus:ring-gray-900 transition-colors">
                <option>20-27 Jan 2025</option>
              </select>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-all">
                <Plus className="w-4 h-4" />
                Add Widget
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Create a Report
              </button>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pro Version Card */}
            <div className="bg-white rounded-2xl p-6 relative overflow-hidden shadow-xl col-span-1 lg:col-span-2">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pro Version</h3>
              
              {/* 3D Crystal Placeholder */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 rounded-xl transform rotate-45 opacity-80 shadow-2xl"></div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-300 via-purple-400 to-pink-300 rounded-xl shadow-lg"></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Advantages</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">15 Days</span>
                </div>
                <p className="text-xs text-gray-600 mb-4">Your earnings with the pro version</p>
                
                {/* Mini Chart Placeholder */}
                <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg mb-4"></div>
                
                <button className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium shadow-md hover:bg-gray-800 transition-all">
                  Learn more
                </button>
              </div>
              
              <p className="text-xs text-gray-500">Join the elite of the crypto world with <strong>Pro Version</strong></p>
            </div>

            {/* Activity Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Activity</h3>
                <div className="flex items-center gap-2 text-gray-400">
                  <BarChart3 className="w-4 h-4" />
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-1">Worked this week</p>
                <p className="text-2xl font-light text-gray-900">186<span className="text-sm text-gray-500">h</span></p>
              </div>

              {/* Bar Chart using Recharts */}
              <ResponsiveContainer width="100%" height={128}>
                <BarChart data={activityData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                  <Bar dataKey="hours" fill="#e5e7eb" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="hours" fill="#fbbf24" radius={[10, 10, 0, 0]} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </BarChart>
              </ResponsiveContainer>
              
            </div>

            {/* Virtual Cards */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Virtual cards</h3>
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-600 mb-1">Total Balance</p>
                <p className="text-2xl font-light text-gray-900">$6,010<span className="text-lg text-gray-400">.29</span></p>
                <p className="text-xs text-green-600">↗ $205.00</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dollar</span>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tether</span>
                  <span className="text-sm font-medium">28%</span>
                </div>
              </div>

              {/* VISA Card - Redesigned */}
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

            {/* Total Spent */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Total Spent</h3>
                <div className="flex items-center gap-2 text-gray-400">
                  <BarChart3 className="w-4 h-4" />
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-600 mb-1">Spent this week</p>
                <p className="text-2xl font-light text-gray-900">$820<span className="text-lg text-gray-400">.65</span></p>
                <p className="text-xs text-green-600">↗ $605.00</p>
              </div>

              {/* Line Chart with dots */}
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
                  <div>Wallets</div>
                </div>
                <div>
                  <div className="text-gray-900 font-medium">26</div>
                  <div>Assets</div>
                </div>
              </div>
            </div>

            {/* Contract Type */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Contract Type</h3>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>

              <div className="mb-6">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">Learn more →</button>
              </div>

              {/* Donut Chart using Recharts */}
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
                    <div className="text-lg font-medium text-gray-900">{((pieChartData[0].value / totalContracts) * 100).toFixed(0)}%</div>
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

            {/* Sales Data (Monthly Statistics) */}
            <div className="bg-white rounded-2xl p-6 shadow-xl col-span-1 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Месячная статистика</h3>
              <div className="space-y-4">
                {Object.entries(monthlyData).map(([month, data]) => (
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

          {/* Products Table */}
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h3 className="text-lg font-medium text-gray-900">Топ товары</h3>
              <div className="flex flex-wrap items-center gap-4">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-gray-900 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {topProducts.slice(0, 10).map((product, index) => (
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
