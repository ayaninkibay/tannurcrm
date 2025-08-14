'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  User, 
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Filter,
  RefreshCw,
  Download,
  CalendarDays,
  X
} from 'lucide-react';

export default function StockMovementsPage() {
  const router = useRouter();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    incoming: 0,
    outgoing: 0
  });

  useEffect(() => {
    // Устанавливаем даты по умолчанию (последние 30 дней)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchMovements();
    }
  }, [dateFrom, dateTo]);

  // Загрузка движений из базы данных
  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          products (
            id,
            name,
            image_url
          ),
          users (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // Применяем фильтр по датам
      if (dateFrom) {
        query = query.gte('created_at', `${dateFrom}T00:00:00`);
      }
      if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59`);
      }

      const { data, error } = await query.limit(200);

      if (error) throw error;

      if (data) {
        setMovements(data);
        
        // Подсчитываем статистику
        const totalMovements = data.length;
        const incomingSum = data
          .filter(m => m.change > 0)
          .reduce((acc, m) => acc + m.change, 0);
        const outgoingSum = Math.abs(
          data
            .filter(m => m.change < 0)
            .reduce((acc, m) => acc + m.change, 0)
        );
        
        setStats({
          total: totalMovements,
          incoming: incomingSum,
          outgoing: outgoingSum
        });
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Ошибка загрузки истории движений');
    } finally {
      setLoading(false);
    }
  };

  // Быстрые фильтры по датам
  const setQuickDateFilter = (type) => {
    const today = new Date();
    let from = new Date();
    
    switch(type) {
      case 'today':
        from = new Date(today);
        break;
      case 'week':
        from = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        from = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case 'year':
        from = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000));
        break;
    }
    
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  // Фильтрация движений
  const filteredMovements = movements.filter(movement => {
    const productName = movement.products?.name || '';
    const matchesSearch = 
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'incoming' && movement.change > 0) ||
      (filter === 'outgoing' && movement.change < 0);
    
    return matchesSearch && matchesFilter;
  });

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Форматирование короткой даты для мобильных
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Получение имени пользователя
  const getUserName = (movement) => {
    if (movement.users) {
      const { first_name, last_name, email } = movement.users;
      if (first_name || last_name) {
        return `${first_name || ''} ${last_name || ''}`.trim();
      }
      return email;
    }
    return 'Система';
  };

  // Получение инициалов пользователя
  const getUserInitials = (movement) => {
    const name = getUserName(movement);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Получение цвета для источника
  const getSourceStyle = (source) => {
    const styles = {
      'direct_update': 'bg-gray-100 text-gray-700',
      'sale': 'bg-[#D77E6C]/10 text-[#D77E6C]',
      'purchase': 'bg-green-100 text-green-700',
      'return': 'bg-orange-100 text-orange-700',
      'adjustment': 'bg-blue-100 text-blue-700',
      'write_off': 'bg-red-100 text-red-700'
    };
    return styles[source] || 'bg-gray-100 text-gray-700';
  };

  // Получение текста для источника
  const getSourceText = (source) => {
    const texts = {
      'direct_update': 'Ручное',
      'sale': 'Продажа',
      'purchase': 'Поступление',
      'return': 'Возврат',
      'adjustment': 'Корректировка',
      'write_off': 'Списание'
    };
    return texts[source] || source;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <MoreHeaderAD title="История движений товаров" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderAD 
        title={
          <span className="flex items-center">
            <span className="text-gray-400">Склад</span>
            <span className="mx-1 text-[#111]">/</span>
            <span className="text-[#111]">История движений</span>
          </span>
        }
          showBackButton={true}
      />
      
      <div className="p-0 mt-10">
        {/* Статистика - адаптивная */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between md:justify-start md:gap-3 mb-2 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-gray-100 rounded-lg">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Всего операций</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-[#111]">{stats.total}</span>
              <span className="text-xs md:text-sm text-gray-500">записей</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between md:justify-start md:gap-3 mb-2 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-[#D77E6C]/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#D77E6C]" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Поступило</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-[#D77E6C]">+{stats.incoming}</span>
              <span className="text-xs md:text-sm text-gray-500">единиц</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between md:justify-start md:gap-3 mb-2 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-gray-100 rounded-lg">
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </div>
                <span className="text-xs md:text-sm text-gray-500">Списано</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-gray-700">-{stats.outgoing}</span>
              <span className="text-xs md:text-sm text-gray-500">единиц</span>
            </div>
          </div>
        </div>

        {/* Фильтры - адаптивные */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
          {/* Мобильная кнопка фильтров */}
          <div className="md:hidden mb-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Фильтры и поиск</span>
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-90' : ''}`} />
            </button>
          </div>

          <div className={`space-y-3 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по товару или причине..."
                className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:border-[#D77E6C] transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Выбор дат */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs md:text-sm text-gray-600 mb-1">От</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#D77E6C]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm text-gray-600 mb-1">До</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#D77E6C]"
                />
              </div>
            </div>

            {/* Быстрые фильтры по датам */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setQuickDateFilter('today')}
                className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Сегодня
              </button>
              <button
                onClick={() => setQuickDateFilter('week')}
                className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Неделя
              </button>
              <button
                onClick={() => setQuickDateFilter('month')}
                className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Месяц
              </button>
              <button
                onClick={() => setQuickDateFilter('year')}
                className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Год
              </button>
            </div>
            
            {/* Фильтры по типу */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-[#D77E6C] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setFilter('incoming')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  filter === 'incoming' 
                    ? 'bg-[#D77E6C] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Поступления
              </button>
              <button
                onClick={() => setFilter('outgoing')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  filter === 'outgoing' 
                    ? 'bg-[#D77E6C] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Списания
              </button>
              
              <button
                onClick={fetchMovements}
                className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Обновить"
              >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Таблица для десктопа / Карточки для мобильных */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Десктоп таблица */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Товар</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Дата</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-700">Изменение</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Остаток</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Причина</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Тип</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Ответственный</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[#111] truncate">
                            {movement.products?.name || 'Товар удален'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {movement.product_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(movement.created_at)}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium ${
                        movement.change > 0 
                          ? 'text-[#D77E6C] bg-[#D77E6C]/10' 
                          : 'text-gray-700 bg-gray-100'
                      }`}>
                        {movement.change > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>{movement.change > 0 ? '+' : ''}{movement.change}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-500">
                          {movement.previous_stock || 0} → {movement.new_stock || 0}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{movement.reason}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        getSourceStyle(movement.source)
                      }`}>
                        {getSourceText(movement.source)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">
                          {getUserName(movement)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => router.push(`/admin/warehouse/product_view?id=${movement.product_id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Открыть товар"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Мобильные карточки */}
          <div className="lg:hidden">
            {filteredMovements.map((movement) => (
              <div key={movement.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                {/* Заголовок карточки */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[#111] text-sm truncate">
                        {movement.products?.name || 'Товар удален'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <CalendarDays className="w-3 h-3" />
                        <span>{formatShortDate(movement.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    movement.change > 0 
                      ? 'text-[#D77E6C] bg-[#D77E6C]/10' 
                      : 'text-gray-700 bg-gray-100'
                  }`}>
                    {movement.change > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{movement.change > 0 ? '+' : ''}{movement.change}</span>
                  </div>
                </div>

                {/* Детали */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Остаток:</span>
                    <span className="text-gray-700 font-medium">
                      {movement.previous_stock || 0} → {movement.new_stock || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Причина:</span>
                    <span className="text-gray-700">{movement.reason}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Тип:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      getSourceStyle(movement.source)
                    }`}>
                      {getSourceText(movement.source)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Ответственный:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-[10px] text-gray-600">
                          {getUserInitials(movement)}
                        </span>
                      </div>
                      <span className="text-gray-700 truncate max-w-[120px]">
                        {getUserName(movement)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Кнопка действия */}
                <button 
                  onClick={() => router.push(`/admin/warehouse/product_view?id=${movement.product_id}`)}
                  className="mt-3 w-full py-2 text-xs text-[#D77E6C] bg-[#D77E6C]/10 rounded-lg hover:bg-[#D77E6C]/20 transition-colors"
                >
                  Открыть товар
                </button>
              </div>
            ))}
          </div>
          
          {filteredMovements.length === 0 && (
            <div className="p-8 md:p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Нет данных для отображения</p>
              <p className="text-sm text-gray-400 mt-2">Попробуйте изменить фильтры или период</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}