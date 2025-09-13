'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestDebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем ВСЕ записи из team_purchase_orders
      const { data: allOrders } = await supabase
        .from('team_purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Группируем по team_purchase_id
      const byPurchase: Record<string, any> = {};
      
      allOrders?.forEach(order => {
        const purchaseId = order.team_purchase_id;
        
        if (!byPurchase[purchaseId]) {
          byPurchase[purchaseId] = {
            orders: [],
            totalSum: 0,
            byUser: {},
            byMember: {}
          };
        }
        
        byPurchase[purchaseId].orders.push(order);
        byPurchase[purchaseId].totalSum += order.order_amount || 0;
        
        // Группируем по user_id
        if (!byPurchase[purchaseId].byUser[order.user_id]) {
          byPurchase[purchaseId].byUser[order.user_id] = {
            orders: [],
            sum: 0
          };
        }
        byPurchase[purchaseId].byUser[order.user_id].orders.push(order);
        byPurchase[purchaseId].byUser[order.user_id].sum += order.order_amount || 0;
        
        // Группируем по member_id
        if (!byPurchase[purchaseId].byMember[order.member_id]) {
          byPurchase[purchaseId].byMember[order.member_id] = {
            orders: [],
            sum: 0
          };
        }
        byPurchase[purchaseId].byMember[order.member_id].orders.push(order);
        byPurchase[purchaseId].byMember[order.member_id].sum += order.order_amount || 0;
      });
      
      // Загружаем данные из team_purchases для сравнения
      const { data: purchases } = await supabase
        .from('team_purchases')
        .select('id, title, collected_amount, paid_amount');
      
      // Добавляем информацию о закупках
      Object.keys(byPurchase).forEach(purchaseId => {
        const purchase = purchases?.find(p => p.id === purchaseId);
        byPurchase[purchaseId].purchaseInfo = purchase;
        byPurchase[purchaseId].hasError = purchase?.collected_amount !== byPurchase[purchaseId].totalSum;
      });
      
      setData(byPurchase);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ВСЕ данные из team_purchase_orders</h1>
        
        {Object.entries(data || {}).map(([purchaseId, purchaseData]: [string, any]) => (
          <div key={purchaseId} className={`mb-8 border-2 rounded-lg p-4 ${
            purchaseData.hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
          }`}>
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                {purchaseData.purchaseInfo?.title || 'Закупка без названия'}
              </h2>
              <div className="text-sm text-gray-600">team_purchase_id: {purchaseId}</div>
            </div>
            
            {/* Сравнение сумм */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded">
                <div className="text-sm">Всего заказов в team_purchase_orders:</div>
                <div className="text-2xl font-bold">{purchaseData.orders.length}</div>
              </div>
              <div className="p-3 bg-green-100 rounded">
                <div className="text-sm">Реальная сумма (team_purchase_orders):</div>
                <div className="text-2xl font-bold">{purchaseData.totalSum.toLocaleString('ru-RU')} ₸</div>
              </div>
              <div className={`p-3 rounded ${purchaseData.hasError ? 'bg-red-100' : 'bg-gray-100'}`}>
                <div className="text-sm">В team_purchases (collected_amount):</div>
                <div className="text-2xl font-bold">
                  {purchaseData.purchaseInfo?.collected_amount?.toLocaleString('ru-RU') || 0} ₸
                </div>
              </div>
            </div>
            
            {purchaseData.hasError && (
              <div className="p-3 bg-red-200 rounded mb-4">
                <strong>⚠️ ОШИБКА!</strong> Разница: {
                  Math.abs(purchaseData.purchaseInfo?.collected_amount - purchaseData.totalSum).toLocaleString('ru-RU')
                } ₸
              </div>
            )}
            
            {/* Группировка по USER_ID */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">По user_id:</h3>
              <div className="space-y-2">
                {Object.entries(purchaseData.byUser).map(([userId, userData]: [string, any]) => (
                  <div key={userId} className="p-2 bg-gray-100 rounded flex justify-between">
                    <div>
                      <span className="font-mono text-sm">user_id: {userId}</span>
                      <span className="ml-2 text-sm">({userData.orders.length} заказов)</span>
                    </div>
                    <span className="font-bold">{userData.sum.toLocaleString('ru-RU')} ₸</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Группировка по MEMBER_ID */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">По member_id:</h3>
              <div className="space-y-2">
                {Object.entries(purchaseData.byMember).map(([memberId, memberData]: [string, any]) => (
                  <div key={memberId} className="p-2 bg-gray-100 rounded flex justify-between">
                    <div>
                      <span className="font-mono text-sm">member_id: {memberId.slice(0, 20)}...</span>
                      <span className="ml-2 text-sm">({memberData.orders.length} заказов)</span>
                    </div>
                    <span className="font-bold">{memberData.sum.toLocaleString('ru-RU')} ₸</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Все заказы детально */}
            <details>
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                Показать все {purchaseData.orders.length} заказов детально
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 text-left">order_id</th>
                      <th className="p-2 text-left">member_id</th>
                      <th className="p-2 text-left">user_id</th>
                      <th className="p-2 text-right">Сумма</th>
                      <th className="p-2 text-left">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseData.orders.map((order: any) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-2 font-mono text-xs">{order.order_id.slice(0, 15)}...</td>
                        <td className="p-2 font-mono text-xs">{order.member_id.slice(0, 15)}...</td>
                        <td className="p-2 font-mono text-xs">{order.user_id.slice(0, 15)}...</td>
                        <td className="p-2 text-right font-bold">{order.order_amount.toLocaleString('ru-RU')} ₸</td>
                        <td className="p-2 text-xs">{new Date(order.created_at).toLocaleString('ru-RU')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}