// src/lib/cart/CartModule.tsx

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { cartService, type DeliveryMethod } from './CartService';
import type { Cart, CartItemView } from '@/types';

// ==========================================
// ТИПЫ
// ==========================================

export interface UseCartModuleReturn {
  // State
  cart: Cart | null;
  cartItems: CartItemView[];
  selectedItems: Set<string>;
  loading: boolean;
  loadingStates: {
    addingItem: boolean;
    updatingItem: Map<string, boolean>;
    removingItem: Map<string, boolean>;
  };
  
  // Actions
  loadUserCart: (userId: string) => Promise<void>;
  addItem: (userId: string, productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  toggleItemSelection: (itemId: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  updateDeliveryMethod: (method: DeliveryMethod) => Promise<void>;
  updateDeliveryAddress: (address: string) => Promise<void>;
  validateCart: () => Promise<{ valid: boolean; errors: string[]; warnings: string[] }>;
  clearCart: () => Promise<void>;
  
  // Computed
  calculateTotals: () => {
    subtotal: number;
    deliveryFee: number;
    total: number;
    itemsCount: number;
  };
  getDeliveryMethod: () => DeliveryMethod;
  getDeliveryCost: () => number;
}

// ==========================================
// HOOK
// ==========================================

export const useCartModule = (): UseCartModuleReturn => {
  // State
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItemView[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  
  // Loading states для каждого действия
  const [loadingStates, setLoadingStates] = useState({
    addingItem: false,
    updatingItem: new Map<string, boolean>(),
    removingItem: new Map<string, boolean>()
  });

  // ==========================================
  // ЗАГРУЗКА КОРЗИНЫ
  // ==========================================
  
  const loadUserCart = useCallback(async (userId: string) => {
    if (!userId) {
      console.error('❌ User ID is required');
      return;
    }

    setLoading(true);
    try {
      console.log('🛒 Loading cart for user:', userId);
      
      // Получаем или создаем корзину
      const cartId = await cartService.getOrCreateCart(userId);
      
      // Загружаем корзину с товарами
      const { cart: loadedCart, items } = await cartService.loadCart(cartId);
      
      setCart(loadedCart);
      setCartItems(items);
      
      // Восстанавливаем выбор из localStorage
      const savedSelection = localStorage.getItem(`cart_selection_${cartId}`);
      if (savedSelection) {
        try {
          const saved = JSON.parse(savedSelection);
          // Проверяем что сохраненные товары все еще в корзине и доступны
          const validIds = saved.filter((id: string) => {
            const item = items.find(i => i.id === id);
            return item && item.stock > 0;
          });
          setSelectedItems(new Set(validIds));
        } catch (error) {
          console.error('❌ Error parsing saved selection:', error);
          // При ошибке выбираем все доступные товары
          const availableItems = items.filter(item => item.stock > 0).map(item => item.id);
          setSelectedItems(new Set(availableItems));
        }
      } else {
        // По умолчанию выбираем все доступные товары
        const availableItems = items.filter(item => item.stock > 0).map(item => item.id);
        setSelectedItems(new Set(availableItems));
      }
      
      console.log('✅ Cart loaded:', { 
        cartId, 
        itemsCount: items.length,
        deliveryMethod: loadedCart.delivery_method || 'pickup',
        deliveryCost: loadedCart.delivery_cost || 0
      });
      
    } catch (error: any) {
      console.error('❌ Error loading cart:', error);
      toast.error(error.message || 'Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // ДОБАВЛЕНИЕ ТОВАРА
  // ==========================================
  
  const addItem = useCallback(async (
    userId: string,
    productId: string,
    quantity: number
  ) => {
    if (!userId || !productId) {
      toast.error('Некорректные данные');
      return;
    }

    setLoadingStates(prev => ({ ...prev, addingItem: true }));
    
    try {
      console.log('➕ Adding item to cart:', { productId, quantity });
      
      const result = await cartService.addItemToCart(userId, productId, quantity);
      
      if (!result.success) {
        toast.error(result.error || 'Не удалось добавить товар');
        return;
      }
      
      // Перезагружаем корзину для получения актуальных данных
      await loadUserCart(userId);
      
      toast.success(result.message || 'Товар добавлен в корзину');
      
    } catch (error: any) {
      console.error('❌ Error adding item:', error);
      toast.error(error.message || 'Ошибка добавления товара');
    } finally {
      setLoadingStates(prev => ({ ...prev, addingItem: false }));
    }
  }, [loadUserCart]);

  // ==========================================
  // ОБНОВЛЕНИЕ КОЛИЧЕСТВА
  // ==========================================
  
 // ОБНОВЛЕНИЕ КОЛИЧЕСТВА
const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
  const item = cartItems.find(i => i.id === itemId);
  if (!item) return;

  // Проверка границ
  if (newQuantity < 1) newQuantity = 1;
  if (newQuantity > item.stock) newQuantity = item.stock;
  
  // Если количество не изменилось - ничего не делаем
  if (newQuantity === item.quantity) return;

  // Оптимистичное обновление UI
  const previousQuantity = item.quantity;
  setCartItems(prev => prev.map(i => 
    i.id === itemId ? { ...i, quantity: newQuantity } : i
  ));

  // Устанавливаем loading state для этого товара
  setLoadingStates(prev => ({
    ...prev,
    updatingItem: new Map(prev.updatingItem).set(itemId, true)
  }));

  try {
    console.log('🔄 Updating quantity:', { itemId, newQuantity });
    
    const result = await cartService.updateItemQuantity(itemId, newQuantity);
    
    if (!result.success) {
      // Откатываем изменения
      setCartItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, quantity: previousQuantity } : i
      ));
      toast.error(result.error || 'Не удалось обновить количество');
      return;
    }
    
    // ✅ ПЕРЕЗАГРУЖАЕМ КОРЗИНУ ЧТОБЫ ПОЛУЧИТЬ ПОДАРКИ
    if (cart?.user_id) {
      await loadUserCart(cart.user_id);
    }
    
  } catch (error: any) {
    // Откатываем изменения при ошибке
    setCartItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, quantity: previousQuantity } : i
    ));
    console.error('❌ Error updating quantity:', error);
    toast.error(error.message || 'Ошибка обновления количества');
  } finally {
    // Убираем loading state
    setLoadingStates(prev => {
      const newMap = new Map(prev.updatingItem);
      newMap.delete(itemId);
      return { ...prev, updatingItem: newMap };
    });
  }
}, [cartItems, cart, loadUserCart]);

  // ==========================================
  // УДАЛЕНИЕ ТОВАРА
  // ==========================================
  
 // УДАЛЕНИЕ ТОВАРА
const removeItem = useCallback(async (itemId: string) => {
  // Устанавливаем loading state
  setLoadingStates(prev => ({
    ...prev,
    removingItem: new Map(prev.removingItem).set(itemId, true)
  }));

  try {
    console.log('🗑️ Removing item:', itemId);
    
    const result = await cartService.removeItem(itemId);
    
    if (!result.success) {
      toast.error(result.error || 'Не удалось удалить товар');
      return;
    }
    
    // ✅ ПЕРЕЗАГРУЖАЕМ КОРЗИНУ ЧТОБЫ ОБНОВИТЬ ПОДАРКИ
    if (cart?.user_id) {
      await loadUserCart(cart.user_id);
    } else {
      // Удаляем из локального state если нет cart
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      
      // Удаляем из выбранных
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        
        // Сохраняем в localStorage
        if (cart?.id) {
          localStorage.setItem(
            `cart_selection_${cart.id}`,
            JSON.stringify(Array.from(newSet))
          );
        }
        
        return newSet;
      });
    }
    
    toast.success('Товар удален из корзины');
    
  } catch (error: any) {
    console.error('❌ Error removing item:', error);
    toast.error(error.message || 'Ошибка удаления товара');
  } finally {
    // Убираем loading state
    setLoadingStates(prev => {
      const newMap = new Map(prev.removingItem);
      newMap.delete(itemId);
      return { ...prev, removingItem: newMap };
    });
  }
}, [cart, loadUserCart]);

  // ==========================================
  // ВЫБОР ТОВАРОВ
  // ==========================================
  
  const toggleItemSelection = useCallback((itemId: string) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item || item.stock === 0) return;
    
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      
      // Сохраняем в localStorage
      if (cart?.id) {
        localStorage.setItem(
          `cart_selection_${cart.id}`,
          JSON.stringify(Array.from(newSet))
        );
      }
      
      return newSet;
    });
  }, [cartItems, cart]);

  const toggleSelectAll = useCallback(() => {
    const availableItems = cartItems.filter(item => item.stock > 0);
    
    if (selectedItems.size === availableItems.length && selectedItems.size > 0) {
      // Снять выбор со всех
      setSelectedItems(new Set());
      if (cart?.id) {
        localStorage.removeItem(`cart_selection_${cart.id}`);
      }
    } else {
      // Выбрать все доступные
      const allIds = new Set(availableItems.map(item => item.id));
      setSelectedItems(allIds);
      if (cart?.id) {
        localStorage.setItem(
          `cart_selection_${cart.id}`,
          JSON.stringify(Array.from(allIds))
        );
      }
    }
  }, [cartItems, selectedItems, cart]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    if (cart?.id) {
      localStorage.removeItem(`cart_selection_${cart.id}`);
    }
  }, [cart]);

  // ==========================================
  // СПОСОБ И АДРЕС ДОСТАВКИ
  // ==========================================
  
  const updateDeliveryMethod = useCallback(async (method: DeliveryMethod) => {
    if (!cart) return;
    
    // ВАЖНО: Пока доступен только самовывоз
    if (method !== 'pickup') {
      console.warn('⚠️ Delivery method other than pickup is not available yet');
      method = 'pickup';
    }
    
    try {
      const result = await cartService.updateDeliveryMethod(cart.id, method);
      
      if (!result.success) {
        toast.error(result.error || 'Ошибка обновления способа доставки');
        return;
      }
      
      // Обновляем локальное состояние
      setCart(prev => prev ? { 
        ...prev, 
        delivery_method: result.data?.delivery_method || method,
        delivery_cost: result.data?.delivery_cost || 0
      } : null);
      
      console.log('✅ Delivery method updated:', method);
      
    } catch (error: any) {
      console.error('❌ Error updating delivery method:', error);
      toast.error(error.message || 'Ошибка обновления способа доставки');
    }
  }, [cart]);

  const updateDeliveryAddress = useCallback(async (address: string) => {
    if (!cart) return;
    
    try {
      const result = await cartService.updateDeliveryAddress(cart.id, address);
      
      if (!result.success) {
        toast.error(result.error || 'Ошибка обновления адреса');
        return;
      }
      
      // Обновляем локальное состояние
      setCart(prev => prev ? { ...prev, delivery_address: address } : null);
      
      console.log('✅ Delivery address updated:', address);
      
    } catch (error: any) {
      console.error('❌ Error updating delivery address:', error);
      toast.error(error.message || 'Ошибка обновления адреса');
    }
  }, [cart]);

  // ==========================================
  // ПОЛУЧИТЬ ТЕКУЩИЙ СПОСОБ ДОСТАВКИ И СТОИМОСТЬ
  // ==========================================
  
  const getDeliveryMethod = useCallback((): DeliveryMethod => {
    return (cart?.delivery_method as DeliveryMethod) || 'pickup';
  }, [cart]);

  const getDeliveryCost = useCallback((): number => {
    return cart?.delivery_cost || 0;
  }, [cart]);

  // ==========================================
  // ВАЛИДАЦИЯ КОРЗИНЫ
  // ==========================================
  
  const validateCart = useCallback(async () => {
    if (!cart) {
      return {
        valid: false,
        errors: ['Корзина не загружена'],
        warnings: []
      };
    }

    // Дополнительная валидация
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (selectedItems.size === 0) {
      errors.push('Выберите товары для заказа');
    }
    
    // Проверяем наличие товаров
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    selectedCartItems.forEach(item => {
      if (item.stock === 0) {
        errors.push(`Товар "${item.name}" отсутствует на складе`);
      } else if (item.quantity > item.stock) {
        errors.push(`Недостаточно товара "${item.name}". Доступно: ${item.stock}`);
      }
    });

    if (errors.length > 0) {
      return { valid: false, errors, warnings };
    }

    try {
      console.log('✓ Validating cart:', cart.id);
      
      const result = await cartService.validateCartForCheckout(cart.id);
      
      if (!result.success || !result.data) {
        return {
          valid: false,
          errors: [result.error || 'Ошибка валидации корзины'],
          warnings: []
        };
      }
      
      return result.data;
      
    } catch (error: any) {
      console.error('❌ Error validating cart:', error);
      return {
        valid: false,
        errors: [error.message || 'Ошибка валидации корзины'],
        warnings: []
      };
    }
  }, [cart, cartItems, selectedItems]);

  // ==========================================
  // ОЧИСТКА КОРЗИНЫ
  // ==========================================
  
  const clearCart = useCallback(async () => {
    if (!cart || selectedItems.size === 0) return;
    
    try {
      console.log('🧹 Clearing cart items:', selectedItems.size);
      
      const itemIdsArray = Array.from(selectedItems);
      const result = await cartService.clearSelectedItems(cart.id, itemIdsArray);
      
      if (!result.success) {
        toast.error(result.error || 'Ошибка очистки корзины');
        return;
      }
      
      // Удаляем из локального state
      const remainingItems = cartItems.filter(item => !selectedItems.has(item.id));
      setCartItems(remainingItems);
      setSelectedItems(new Set());
      
      // Очищаем localStorage
      if (cart.id) {
        localStorage.removeItem(`cart_selection_${cart.id}`);
      }
      
      console.log('✅ Cart cleared');
      
    } catch (error: any) {
      console.error('❌ Error clearing cart:', error);
      toast.error(error.message || 'Ошибка очистки корзины');
      throw error;
    }
  }, [cart, cartItems, selectedItems]);

  // ==========================================
  // РАСЧЕТ ИТОГОВ
  // ==========================================
  
  const calculateTotals = useCallback(() => {
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    
    const subtotal = selectedCartItems.reduce(
      (sum, item) => sum + (item.price_dealer * item.quantity),
      0
    );
    
    // Берем стоимость доставки из корзины
    const deliveryFee = cart?.delivery_cost || 0;
    
    const total = subtotal + deliveryFee;
    
    const itemsCount = selectedCartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return { subtotal, deliveryFee, total, itemsCount };
  }, [cartItems, selectedItems, cart]);

  // ==========================================
  // ВОЗВРАЩАЕМ API
  // ==========================================
  
  return {
    // State
    cart,
    cartItems,
    selectedItems,
    loading,
    loadingStates,
    
    // Actions
    loadUserCart,
    addItem,
    updateQuantity,
    removeItem,
    toggleItemSelection,
    toggleSelectAll,
    clearSelection,
    updateDeliveryMethod,
    updateDeliveryAddress,
    validateCart,
    clearCart,
    
    // Computed
    calculateTotals,
    getDeliveryMethod,
    getDeliveryCost
  };
};