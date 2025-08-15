// src/lib/order/TeamPurchaseOrderService.ts

import { supabase } from '@/lib/supabase/client';
import { orderService } from './OrderService';

interface TeamPurchaseOrder {
  id: string;
  team_purchase_id: string;
  order_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

class TeamPurchaseOrderService {
  /**
   * Создать заказ для командной закупки
   */
  async createTeamPurchaseOrder(
    userId: string,
    teamPurchaseId: string,
    total: number,
    deliveryAddress: string,
    items: any[],
    notes?: string
  ): Promise<{ order: any; teamPurchaseOrder: TeamPurchaseOrder }> {
    try {
      // 1. Сначала создаем обычный заказ
      const order = await orderService.createOrder(
        userId,
        total,
        deliveryAddress,
        notes
      );

      // 2. Создаем позиции заказа
      await orderService.createOrderItems(order.id, items);

      // 3. Создаем связь с командной закупкой
      const { data: teamPurchaseOrder, error: teamOrderError } = await supabase
        .from('team_purchase_orders')
        .insert({
          team_purchase_id: teamPurchaseId,
          order_id: order.id,
          user_id: userId
        })
        .select()
        .single();

      if (teamOrderError) {
        console.error('Error creating team purchase order:', teamOrderError);
        // Если не удалось создать связь, откатываем заказ
        await this.rollbackOrder(order.id);
        throw new Error(teamOrderError.message);
      }

      // 4. Обновляем статус командной закупки, если нужно
      await this.updateTeamPurchaseProgress(teamPurchaseId);

      // 5. Запускаем расчет бонусов
      await orderService.calculateBonuses(order.id);

      return {
        order,
        teamPurchaseOrder
      };
    } catch (error) {
      console.error('Error in createTeamPurchaseOrder:', error);
      throw error;
    }
  }

  /**
   * Откатить создание заказа в случае ошибки
   */
  private async rollbackOrder(orderId: string): Promise<void> {
    try {
      // Удаляем позиции заказа
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      // Удаляем сам заказ
      await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
    } catch (error) {
      console.error('Error rolling back order:', error);
    }
  }

  /**
   * Обновить прогресс командной закупки
   */
  private async updateTeamPurchaseProgress(teamPurchaseId: string): Promise<void> {
    try {
      // Получаем информацию о командной закупке
      const { data: teamPurchase, error: fetchError } = await supabase
        .from('team_purchases')
        .select('*, team_purchase_orders(count)')
        .eq('id', teamPurchaseId)
        .single();

      if (fetchError) {
        console.error('Error fetching team purchase:', fetchError);
        return;
      }

      // Получаем общую сумму всех заказов в этой закупке
      const { data: orders, error: ordersError } = await supabase
        .from('team_purchase_orders')
        .select(`
          orders!inner(total_amount)
        `)
        .eq('team_purchase_id', teamPurchaseId);

      if (ordersError) {
        console.error('Error fetching team purchase orders:', ordersError);
        return;
      }

      const currentVolume = orders?.reduce((sum, item) => 
        sum + (item.orders?.total_amount || 0), 0
      ) || 0;

      // Обновляем текущий объем закупки
      const { error: updateError } = await supabase
        .from('team_purchases')
        .update({
          current_volume: currentVolume,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamPurchaseId);

      if (updateError) {
        console.error('Error updating team purchase progress:', updateError);
      }

      // Проверяем, достигнут ли минимальный объем
      if (teamPurchase && currentVolume >= teamPurchase.min_volume) {
        await this.markTeamPurchaseAsReady(teamPurchaseId);
      }
    } catch (error) {
      console.error('Error updating team purchase progress:', error);
    }
  }

  /**
   * Пометить командную закупку как готовую к выполнению
   */
  private async markTeamPurchaseAsReady(teamPurchaseId: string): Promise<void> {
    const { error } = await supabase
      .from('team_purchases')
      .update({
        status: 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', teamPurchaseId)
      .eq('status', 'active'); // Обновляем только если статус был active

    if (error) {
      console.error('Error marking team purchase as ready:', error);
    }
  }

  /**
   * Получить все заказы командной закупки
   */
  async getTeamPurchaseOrders(teamPurchaseId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('team_purchase_orders')
      .select(`
        *,
        orders!inner(
          *,
          order_items(
            *,
            products!order_items_product_id_fkey(*)
          )
        ),
        users!inner(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('team_purchase_id', teamPurchaseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team purchase orders:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Получить заказы пользователя в командных закупках
   */
  async getUserTeamPurchaseOrders(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('team_purchase_orders')
      .select(`
        *,
        team_purchases!inner(
          id,
          title,
          description,
          status,
          end_date,
          min_volume,
          current_volume
        ),
        orders!inner(
          *,
          order_items(
            *,
            products!order_items_product_id_fkey(*)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user team purchase orders:', error);
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Проверить, участвует ли пользователь в командной закупке
   */
  async isUserInTeamPurchase(userId: string, teamPurchaseId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('team_purchase_orders')
      .select('id')
      .eq('user_id', userId)
      .eq('team_purchase_id', teamPurchaseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user participation:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Отменить участие в командной закупке
   */
  async cancelTeamPurchaseOrder(orderId: string, userId: string): Promise<void> {
    // Получаем информацию о заказе в командной закупке
    const { data: teamOrder, error: fetchError } = await supabase
      .from('team_purchase_orders')
      .select('*, team_purchases!inner(*)')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching team purchase order:', fetchError);
      throw new Error('Заказ не найден');
    }

    // Проверяем, можно ли отменить заказ
    if (teamOrder.team_purchases.status !== 'active') {
      throw new Error('Нельзя отменить заказ в завершенной закупке');
    }

    // Отменяем обычный заказ
    await orderService.cancelOrder(orderId);

    // Удаляем связь с командной закупкой
    const { error: deleteError } = await supabase
      .from('team_purchase_orders')
      .delete()
      .eq('order_id', orderId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting team purchase order:', deleteError);
      throw new Error(deleteError.message);
    }

    // Обновляем прогресс командной закупки
    await this.updateTeamPurchaseProgress(teamOrder.team_purchase_id);
  }

  /**
   * Получить статистику командной закупки
   */
  async getTeamPurchaseStats(teamPurchaseId: string): Promise<{
    totalOrders: number;
    totalAmount: number;
    uniqueUsers: number;
    averageOrderAmount: number;
  }> {
    const { data: orders, error } = await supabase
      .from('team_purchase_orders')
      .select(`
        user_id,
        orders!inner(total_amount)
      `)
      .eq('team_purchase_id', teamPurchaseId);

    if (error) {
      console.error('Error fetching team purchase stats:', error);
      return {
        totalOrders: 0,
        totalAmount: 0,
        uniqueUsers: 0,
        averageOrderAmount: 0
      };
    }

    const totalOrders = orders?.length || 0;
    const totalAmount = orders?.reduce((sum, item) => 
      sum + (item.orders?.total_amount || 0), 0
    ) || 0;
    const uniqueUsers = new Set(orders?.map(o => o.user_id)).size;
    const averageOrderAmount = totalOrders > 0 ? totalAmount / totalOrders : 0;

    return {
      totalOrders,
      totalAmount,
      uniqueUsers,
      averageOrderAmount
    };
  }
}

export const teamPurchaseOrderService = new TeamPurchaseOrderService();