'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { stockService } from './StockService';
import type { Product, StockMovement } from '@/types';

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  status: 'out_of_stock' | 'low_stock' | 'normal';
}

export interface UseStockModuleReturn {
  // State
  stocks: Record<string, number>;
  movements: StockMovement[];
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  alerts: StockAlert[];
  loading: boolean;
  
  // Actions
  checkStock: (productId: string, requiredQuantity: number) => Promise<boolean>;
  loadStock: (productId: string) => Promise<void>;
  loadMultipleStocks: (productIds: string[]) => Promise<void>;
  updateStock: (productId: string, newStock: number, reason: string) => Promise<void>;
  increaseStock: (productId: string, quantity: number, reason: string) => Promise<void>;
  decreaseStock: (productId: string, quantity: number, orderId: string) => Promise<void>;
  writeOffStock: (productId: string, quantity: number, reason: string) => Promise<void>;
  returnStock: (productId: string, quantity: number, orderId: string) => Promise<void>;
  loadMovements: (productId: string) => Promise<void>;
  loadAlerts: () => Promise<void>;
  
  // Computed
  getStockStatus: (productId: string) => 'out_of_stock' | 'low_stock' | 'normal';
  getStockLevel: (productId: string) => number;
  canFulfillOrder: (items: Array<{ productId: string; quantity: number }>) => boolean;
}

export const useStockModule = (userId?: string): UseStockModuleReturn => {
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);

  // Проверка наличия товара
  const checkStock = useCallback(async (
    productId: string, 
    requiredQuantity: number
  ): Promise<boolean> => {
    try {
      const hasStock = await stockService.checkStock(productId, requiredQuantity);
      
      if (!hasStock) {
        toast.error('Недостаточно товара на складе');
      }
      
      return hasStock;
    } catch (error) {
      console.error('Error checking stock:', error);
      toast.error('Ошибка проверки остатков');
      return false;
    }
  }, []);

  // Загрузка остатка одного товара
  const loadStock = useCallback(async (productId: string) => {
    try {
      const stock = await stockService.getStock(productId);
      setStocks(prev => ({ ...prev, [productId]: stock }));
    } catch (error) {
      console.error('Error loading stock:', error);
      toast.error('Ошибка загрузки остатков');
    }
  }, []);

  // Загрузка остатков нескольких товаров
  const loadMultipleStocks = useCallback(async (productIds: string[]) => {
    setLoading(true);
    try {
      const stocksData = await stockService.getMultipleStocks(productIds);
      setStocks(stocksData);
    } catch (error) {
      console.error('Error loading stocks:', error);
      toast.error('Ошибка загрузки остатков');
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление остатка (инвентаризация)
  const updateStock = useCallback(async (
    productId: string, 
    newStock: number, 
    reason: string
  ) => {
    if (!userId) {
      toast.error('Необходима авторизация');
      return;
    }

    try {
      await stockService.setStock(productId, newStock, reason, userId);
      setStocks(prev => ({ ...prev, [productId]: newStock }));
      toast.success('Остаток обновлен');
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Ошибка обновления остатка');
    }
  }, [userId]);

  // Увеличение остатка
  const increaseStock = useCallback(async (
    productId: string, 
    quantity: number, 
    reason: string
  ) => {
    if (!userId) {
      toast.error('Необходима авторизация');
      return;
    }

    try {
      await stockService.increaseStock(productId, quantity, reason, userId);
      const newStock = (stocks[productId] || 0) + quantity;
      setStocks(prev => ({ ...prev, [productId]: newStock }));
      toast.success(`Остаток увеличен на ${quantity}`);
    } catch (error) {
      console.error('Error increasing stock:', error);
      toast.error('Ошибка увеличения остатка');
    }
  }, [userId, stocks]);

  // Уменьшение остатка при продаже
  const decreaseStock = useCallback(async (
    productId: string, 
    quantity: number, 
    orderId: string
  ) => {
    if (!userId) {
      toast.error('Необходима авторизация');
      return;
    }

    try {
      await stockService.decreaseStock(productId, quantity, orderId, userId);
      const newStock = Math.max(0, (stocks[productId] || 0) - quantity);
      setStocks(prev => ({ ...prev, [productId]: newStock }));
    } catch (error) {
      console.error('Error decreasing stock:', error);
      throw error;
    }
  }, [userId, stocks]);

  // Списание товара
  const writeOffStock = useCallback(async (
    productId: string, 
    quantity: number, 
    reason: string
  ) => {
    if (!userId) {
      toast.error('Необходима авторизация');
      return;
    }

    try {
      await stockService.writeOffStock(productId, quantity, reason, userId);
      const newStock = Math.max(0, (stocks[productId] || 0) - quantity);
      setStocks(prev => ({ ...prev, [productId]: newStock }));
      toast.success('Товар списан');
    } catch (error) {
      console.error('Error writing off stock:', error);
      toast.error('Ошибка списания товара');
    }
  }, [userId, stocks]);

  // Возврат товара
  const returnStock = useCallback(async (
    productId: string, 
    quantity: number, 
    orderId: string
  ) => {
    if (!userId) {
      toast.error('Необходима авторизация');
      return;
    }

    try {
      await stockService.returnStock(productId, quantity, orderId, userId);
      const newStock = (stocks[productId] || 0) + quantity;
      setStocks(prev => ({ ...prev, [productId]: newStock }));
      toast.success('Товар возвращен на склад');
    } catch (error) {
      console.error('Error returning stock:', error);
      toast.error('Ошибка возврата товара');
    }
  }, [userId, stocks]);

  // Загрузка истории движений
  const loadMovements = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const data = await stockService.getStockMovements(productId);
      setMovements(data);
    } catch (error) {
      console.error('Error loading movements:', error);
      toast.error('Ошибка загрузки истории');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка предупреждений об остатках
  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const [lowStock, outOfStock] = await Promise.all([
        stockService.getLowStockProducts(10),
        stockService.getOutOfStockProducts()
      ]);
      
      setLowStockProducts(lowStock);
      setOutOfStockProducts(outOfStock);
      
      // Формируем алерты
      const alertsList: StockAlert[] = [];
      
      outOfStock.forEach(product => {
        alertsList.push({
          productId: product.id,
          productName: product.name || 'Без названия',
          currentStock: 0,
          status: 'out_of_stock'
        });
      });
      
      lowStock.forEach(product => {
        alertsList.push({
          productId: product.id,
          productName: product.name || 'Без названия',
          currentStock: product.stock || 0,
          status: 'low_stock'
        });
      });
      
      setAlerts(alertsList);
      
      if (alertsList.length > 0) {
        toast.warning(`Внимание! ${alertsList.length} товаров требуют внимания`);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение статуса остатка
  const getStockStatus = useCallback((productId: string): 'out_of_stock' | 'low_stock' | 'normal' => {
    const stock = stocks[productId] || 0;
    
    if (stock === 0) return 'out_of_stock';
    if (stock <= 10) return 'low_stock';
    return 'normal';
  }, [stocks]);

  // Получение уровня остатка
  const getStockLevel = useCallback((productId: string): number => {
    return stocks[productId] || 0;
  }, [stocks]);

  // Проверка возможности выполнения заказа
  const canFulfillOrder = useCallback((
    items: Array<{ productId: string; quantity: number }>
  ): boolean => {
    for (const item of items) {
      const stock = stocks[item.productId] || 0;
      if (stock < item.quantity) {
        return false;
      }
    }
    return true;
  }, [stocks]);

  // Автозагрузка алертов при монтировании
  useEffect(() => {
    if (userId) {
      loadAlerts();
    }
  }, [userId, loadAlerts]);

  return {
    // State
    stocks,
    movements,
    lowStockProducts,
    outOfStockProducts,
    alerts,
    loading,
    
    // Actions
    checkStock,
    loadStock,
    loadMultipleStocks,
    updateStock,
    increaseStock,
    decreaseStock,
    writeOffStock,
    returnStock,
    loadMovements,
    loadAlerts,
    
    // Computed
    getStockStatus,
    getStockLevel,
    canFulfillOrder
  };
};

// Хук для отображения статуса остатка
export const useStockStatus = (productId: string) => {
  const [status, setStatus] = useState<'out_of_stock' | 'low_stock' | 'normal'>('normal');
  const [stock, setStock] = useState<number>(0);
  
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const currentStock = await stockService.getStock(productId);
        setStock(currentStock);
        
        if (currentStock === 0) {
          setStatus('out_of_stock');
        } else if (currentStock <= 10) {
          setStatus('low_stock');
        } else {
          setStatus('normal');
        }
      } catch (error) {
        console.error('Error loading stock status:', error);
      }
    };
    
    loadStatus();
  }, [productId]);
  
  return { status, stock };
};