// components/dealer/TurnoverChartWithData.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { TurnoverChart } from '@/components/TurnoverChart';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';
import { Loader2, AlertCircle } from 'lucide-react';
import type { MonthValue } from '@/components/TurnoverChart';

export function PersonalTurnoverChartWithData() {
  const { profile } = useUser();
  const [data, setData] = useState<MonthValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('PersonalTurnoverChartWithData useEffect triggered');
    console.log('Profile:', profile);
    
    if (!profile?.id) {
      console.log('No profile ID, stopping');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Starting fetch for user:', profile.id);
        
        // Загружаем заказы напрямую из БД
        const { data: orders, error: dbError } = await supabase
          .from('orders')
          .select('id, created_at, total_amount, payment_status, user_id')
          .eq('user_id', profile.id)
          .eq('payment_status', 'paid')
          .order('created_at', { ascending: true });

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }

        console.log('Database response:', { orders, dbError });
        console.log('Orders count:', orders?.length || 0);
        console.log('Orders data:', JSON.stringify(orders, null, 2));

        if (!orders || orders.length === 0) {
          console.log('No orders found, setting empty data');
          setData([]);
          setLoading(false);
          return;
        }

        // Группируем по месяцам
        const monthlyData: { [key: string]: number } = {};
        
        orders.forEach((order, index) => {
          const date = new Date(order.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          const amount = order.total_amount || 0;
          
          console.log(`Order ${index}:`, {
            id: order.id,
            created_at: order.created_at,
            date: date.toISOString(),
            monthKey: monthKey,
            total_amount: order.total_amount,
            amount: amount
          });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey] += amount;
        });

        console.log('Monthly grouped data:', monthlyData);

        // Преобразуем в массив для графика
        const chartData: MonthValue[] = Object.entries(monthlyData)
          .map(([monthKey, value]) => {
            const [year, month] = monthKey.split('-');
            return {
              date: new Date(parseInt(year), parseInt(month) - 1, 1),
              value: value
            };
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        console.log('Final chart data:', chartData);
        console.log('Setting data with', chartData.length, 'points');
        setData(chartData);
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

  // Добавляем отладочную информацию
  console.log('=== PersonalTurnoverChartWithData Render ===');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Data:', data);
  console.log('Data length:', data.length);
  if (data.length > 0) {
    console.log('First data item:', data[0]);
    console.log('Data types:', {
      date: typeof data[0].date,
      value: typeof data[0].value,
      isDate: data[0].date instanceof Date
    });
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl p-6 h-[500px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D77E6C] mx-auto mb-2" />
          <p className="text-gray-500">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl p-6 h-[500px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-700 font-medium mb-1">Ошибка загрузки данных</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // ВАЖНО: Проверяем, что данные загружены перед рендером
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl p-6 h-[500px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-700 font-medium mb-1">Нет данных</p>
          <p className="text-gray-500 text-sm">У вас пока нет оплаченных заказов</p>
        </div>
      </div>
    );
  }

  console.log('Rendering TurnoverChart with data:', data);

  return (
    <TurnoverChart
      title="Личный товарооборот"
      subtitle="История ваших личных покупок"
      data={data}
      colorBar="#FFE5E1"
      colorLine="#D77E6C"
      lineOffset={0}
      showPeriodSelector={true}
      showStats={true}
    />
  );
}