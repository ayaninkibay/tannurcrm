// src/lib/cart/CartModule.tsx

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { cartService } from './CartService';
import type { Cart, CartItemView } from '@/types';

export interface UseCartModuleReturn {
  // State
  cart: Cart | null;
  cartItems: CartItemView[];
  selectedItems: Set<string>;
  loading: boolean;
  
  // Actions
  loadUserCart: (userId: string) => Promise<void>;
  addItem: (productId: string, quantity: number, price: number, priceDealer: number) => Promise<void>;
  updateQuantity: (itemId: string, change: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  toggleItemSelection: (itemId: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  updateDeliveryMethod: (method: 'pickup' | 'delivery') => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Computed
  calculateTotals: () => {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    savings: number;
  };
}

export const useCartModule = (): UseCartModuleReturn => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItemView[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');

  const loadUserCart = useCallback(async (userId: string) => {
    if (!userId) {
      console.error('User ID is required');
      return;
    }

    setLoading(true);
    try {
      // Проверяем, что cartService существует
      if (!cartService) {
        throw new Error('Cart service is not initialized');
      }

      const cartId = await cartService.getOrCreateCart(userId);
      const { cart: loadedCart, items } = await cartService.loadCart(cartId);
      
      setCart(loadedCart);
      setCartItems(items);
      setDeliveryMethod(loadedCart.delivery_method || 'pickup');
      
      // Восстанавливаем выбранные товары из localStorage
      const savedSelection = localStorage.getItem(`cart_selection_${cartId}`);
      if (savedSelection) {
        try {
          const saved = JSON.parse(savedSelection);
          // Проверяем что сохраненные товары все еще в корзине и доступны
          const validIds = new Set(saved.filter((id: string) => {
            const item = items.find(i => i.id === id);
            return item && item.stock > 0;
          }));
          setSelectedItems(validIds);
        } catch {
          // Если ошибка парсинга, выбираем все доступные
          const availableItems = new Set<string>(
            items.filter(item => item.stock > 0).map(item => item.id)
          );
          setSelectedItems(availableItems);
        }
      } else {
        // По умолчанию выбираем все доступные товары
        const availableItems = new Set<string>(
          items.filter(item => item.stock > 0).map(item => item.id)
        );
        setSelectedItems(availableItems);
      }
      
      if (loadedCart.promo_discount) {
        setPromoDiscount(loadedCart.promo_discount);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (
    productId: string, 
    quantity: number, 
    price: number, 
    priceDealer: number
  ) => {
    // Если корзина еще не загружена и не в процессе загрузки
    if (!cart && !loading) {
      toast.error('Корзина не загружена');
      return;
    }

    if (!cartService) {
      toast.error('Cart service is not initialized');
      return;
    }

    try {
      // Используем функцию БД add_to_cart через сервис
      // Она автоматически создаст корзину если нужно
      const userId = cart?.user_id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Используем новый метод который использует функцию БД
      const result = await cartService.addItemToCart(userId, productId, quantity);
      
      // Перезагружаем корзину для получения актуальных данных
      await loadUserCart(userId);
      
      if (result && result.message) {
        toast.success(result.message);
      } else {
        toast.success('Товар добавлен в корзину');
      }
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      const errorMessage = error.message || 'Ошибка добавления товара';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [cart, loading, loadUserCart]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    if (cart?.id) {
      localStorage.removeItem(`cart_selection_${cart.id}`);
    }
  }, [cart]);

  const updateQuantity = useCallback(async (itemId: string, change: number) => {
    if (!cartService) return;

    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(1, Math.min(item.quantity + change, item.stock));
    if (newQuantity === item.quantity) return;

    try {
      await cartService.updateItemQuantity(itemId, newQuantity);
      setCartItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      ));
      toast.success('Количество обновлено');
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error(error.message || 'Ошибка обновления количества');
    }
  }, [cartItems]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!cartService) return;

    try {
      await cartService.removeItem(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
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
      toast.success('Товар удален из корзины');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Ошибка удаления товара');
    }
  }, [cart]);

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
      setSelectedItems(new Set());
      if (cart?.id) {
        localStorage.removeItem(`cart_selection_${cart.id}`);
      }
    } else {
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

  const updateDeliveryMethod = useCallback(async (method: 'pickup' | 'delivery') => {
    if (!cart || !cartService) return;
    
    setDeliveryMethod(method);
    try {
      await cartService.updateDeliveryMethod(cart.id, method);
      // Обновляем локальное состояние корзины
      setCart(prev => prev ? { ...prev, delivery_method: method } : null);
    } catch (error) {
      console.error('Error updating delivery method:', error);
      toast.error('Ошибка обновления способа доставки');
    }
  }, [cart]);

  const clearCart = useCallback(async () => {
    if (!cart || !cartService || selectedItems.size === 0) return;
    
    try {
      await cartService.clearSelectedItems(Array.from(selectedItems));
      const remainingItems = cartItems.filter(item => !selectedItems.has(item.id));
      setCartItems(remainingItems);
      setSelectedItems(new Set());
      
      // Очищаем localStorage
      if (cart.id) {
        localStorage.removeItem(`cart_selection_${cart.id}`);
      }
      
      if (remainingItems.length === 0) {
        await cartService.markAsOrdered(cart.id);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Ошибка очистки корзины');
      throw error;
    }
  }, [cart, cartItems, selectedItems]);

  const calculateTotals = useCallback(() => {
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price_dealer * item.quantity), 0);
    const discount = Math.round(subtotal * (promoDiscount / 100));
    const deliveryFee = deliveryMethod === 'delivery' && subtotal < 50000 ? 5000 : 0;
    const total = subtotal - discount + deliveryFee;
    const savings = selectedCartItems.reduce((sum, item) => 
      sum + ((item.price - item.price_dealer) * item.quantity), 0
    ) + discount;

    return { subtotal, discount, deliveryFee, total, savings };
  }, [cartItems, selectedItems, promoDiscount, deliveryMethod]);

  return {
    cart,
    cartItems,
    selectedItems,
    loading,
    
    loadUserCart,
    addItem,
    updateQuantity,
    removeItem,
    toggleItemSelection,
    toggleSelectAll,
    clearSelection,
    updateDeliveryMethod,
    clearCart,
    
    calculateTotals
  };
};