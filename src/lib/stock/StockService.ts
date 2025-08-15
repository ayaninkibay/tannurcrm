import { supabase } from '@/lib/supabase/client';
import type { StockMovement, Product } from '@/types';

class StockService {
  /**
   * Проверить наличие товара на складе
   */
  async checkStock(productId: string, requiredQuantity: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();
    
    if (error || !data) return false;
    return data.stock >= requiredQuantity;
  }

  /**
   * Получить остаток товара
   */
  async getStock(productId: string): Promise<number> {
    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();
    
    if (error || !data) throw new Error('Товар не найден');
    return data.stock || 0;
  }

  /**
   * Получить остатки нескольких товаров
   */
  async getMultipleStocks(productIds: string[]): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('products')
      .select('id, stock')
      .in('id', productIds);
    
    if (error) throw new Error(error.message);
    
    const stocks: Record<string, number> = {};
    data?.forEach(item => {
      stocks[item.id] = item.stock || 0;
    });
    
    return stocks;
  }

  /**
   * Уменьшить остаток при продаже
   */
  async decreaseStock(
    productId: string, 
    quantity: number, 
    orderId: string,
    userId: string
  ): Promise<void> {
    // Получаем текущий остаток
    const currentStock = await this.getStock(productId);
    
    if (currentStock < quantity) {
      throw new Error('Недостаточно товара на складе');
    }
    
    const newStock = currentStock - quantity;
    
    // Создаем движение склада
    await this.createStockMovement({
      product_id: productId,
      change: -quantity,
      reason: 'Продажа',
      source: 'order',
      order_id: orderId,
      created_by: userId,
      previous_stock: currentStock,
      new_stock: newStock
    });
    
    // Обновляем остаток в products
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (error) throw new Error(error.message);
  }

  /**
   * Увеличить остаток при поступлении
   */
  async increaseStock(
    productId: string, 
    quantity: number, 
    reason: string,
    userId: string
  ): Promise<void> {
    const currentStock = await this.getStock(productId);
    const newStock = currentStock + quantity;
    
    // Создаем движение склада
    await this.createStockMovement({
      product_id: productId,
      change: quantity,
      reason: reason,
      source: 'purchase',
      created_by: userId,
      previous_stock: currentStock,
      new_stock: newStock
    });
    
    // Обновляем остаток
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (error) throw new Error(error.message);
  }

  /**
   * Установить точный остаток (инвентаризация)
   */
  async setStock(
    productId: string, 
    newStock: number, 
    reason: string,
    userId: string
  ): Promise<void> {
    const currentStock = await this.getStock(productId);
    const change = newStock - currentStock;
    
    if (change === 0) return;
    
    // Создаем движение склада
    await this.createStockMovement({
      product_id: productId,
      change: change,
      reason: reason,
      source: 'adjustment',
      created_by: userId,
      previous_stock: currentStock,
      new_stock: newStock,
      notes: `Корректировка остатка: ${currentStock} → ${newStock}`
    });
    
    // Обновляем остаток
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (error) throw new Error(error.message);
  }

  /**
   * Перемещение товара между складами (если есть несколько складов)
   */
  async transferStock(
    productId: string,
    quantity: number,
    fromLocation: string,
    toLocation: string,
    userId: string
  ): Promise<void> {
    // Уменьшаем на складе-источнике
    await this.createStockMovement({
      product_id: productId,
      change: -quantity,
      reason: `Перемещение в ${toLocation}`,
      source: 'transfer',
      created_by: userId,
      notes: `Перемещение: ${fromLocation} → ${toLocation}`
    });
    
    // Увеличиваем на складе-получателе
    await this.createStockMovement({
      product_id: productId,
      change: quantity,
      reason: `Перемещение из ${fromLocation}`,
      source: 'transfer',
      created_by: userId,
      notes: `Перемещение: ${fromLocation} → ${toLocation}`
    });
  }

  /**
   * Списание товара
   */
  async writeOffStock(
    productId: string,
    quantity: number,
    reason: string,
    userId: string
  ): Promise<void> {
    const currentStock = await this.getStock(productId);
    
    if (currentStock < quantity) {
      throw new Error('Недостаточно товара для списания');
    }
    
    const newStock = currentStock - quantity;
    
    await this.createStockMovement({
      product_id: productId,
      change: -quantity,
      reason: reason,
      source: 'write_off',
      created_by: userId,
      previous_stock: currentStock,
      new_stock: newStock
    });
    
    // Обновляем остаток
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (error) throw new Error(error.message);
  }

  /**
   * Возврат товара
   */
  async returnStock(
    productId: string,
    quantity: number,
    orderId: string,
    userId: string
  ): Promise<void> {
    const currentStock = await this.getStock(productId);
    const newStock = currentStock + quantity;
    
    await this.createStockMovement({
      product_id: productId,
      change: quantity,
      reason: 'Возврат товара',
      source: 'return',
      order_id: orderId,
      created_by: userId,
      previous_stock: currentStock,
      new_stock: newStock
    });
    
    // Обновляем остаток
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    if (error) throw new Error(error.message);
  }

  /**
   * Создать запись движения склада
   */
  private async createStockMovement(movement: Partial<StockMovement>): Promise<void> {
    const { error } = await supabase
      .from('stock_movements')
      .insert({
        product_id: movement.product_id,
        change: movement.change,
        reason: movement.reason,
        source: movement.source,
        order_id: movement.order_id,
        created_by: movement.created_by,
        previous_stock: movement.previous_stock,
        new_stock: movement.new_stock,
        notes: movement.notes
      });
    
    if (error) throw new Error(error.message);
  }

  /**
   * Получить историю движений товара
   */
  async getStockMovements(
    productId: string,
    limit: number = 50
  ): Promise<StockMovement[]> {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Получить движения за период
   */
  async getStockMovementsByPeriod(
    startDate: string,
    endDate: string,
    productId?: string
  ): Promise<StockMovement[]> {
    let query = supabase
      .from('stock_movements')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Получить товары с низким остатком
   */
  async getLowStockProducts(threshold: number = 5): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('stock', threshold)
      .gt('stock', 0)
      .eq('is_active', true)
      .order('stock', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Получить товары без остатка
   */
  async getOutOfStockProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('stock', 0)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Массовое обновление остатков (например, после инвентаризации)
   */
  async bulkUpdateStock(
    updates: Array<{ productId: string; newStock: number }>,
    reason: string,
    userId: string
  ): Promise<void> {
    for (const update of updates) {
      await this.setStock(update.productId, update.newStock, reason, userId);
    }
  }
}

export const stockService = new StockService();