// src/lib/cart/CartModule.tsx

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { cartService } from './CartService'; // УБЕДИТЕСЬ, ЧТО ПУТЬ ПРАВИЛЬНЫЙ
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
      
      // По умолчанию выбираем доступные товары
      const availableItems = new Set<string>(
        items.filter(item => item.stock > 0).map(item => item.id)
      );
      setSelectedItems(availableItems);
      
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
    if (!cart) {
      toast.error('Корзина не загружена');
      return;
    }

    if (!cartService) {
      toast.error('Cart service is not initialized');
      return;
    }

    try {
      // Проверяем, есть ли уже этот товар в корзине
      const existingItem = cartItems.find(item => item.product_id === productId);
      
      if (existingItem) {
        // Если товар уже есть, увеличиваем количество
        await cartService.updateItemQuantity(
          existingItem.id, 
          existingItem.quantity + quantity
        );
        
        // Обновляем локальное состояние
        setCartItems(prev => prev.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
        
        toast.success('Количество товара обновлено');
      } else {
        // Добавляем новый товар
        await cartService.addNewItem(cart.id, productId, quantity);
        
        // Перезагружаем корзину для получения нового товара
        const { cart: updatedCart, items } = await cartService.loadCart(cart.id);
        setCart(updatedCart);
        setCartItems(items);
        
        toast.success('Товар добавлен в корзину');
      }
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      throw new Error(error.message || 'Ошибка добавления товара');
    }
  }, [cart, cartItems]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

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
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Ошибка обновления количества');
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
        return newSet;
      });
      toast.success('Товар удален из корзины');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Ошибка удаления товара');
    }
  }, []);

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
      return newSet;
    });
  }, [cartItems]);

  const toggleSelectAll = useCallback(() => {
    const availableItems = cartItems.filter(item => item.stock > 0);
    if (selectedItems.size === availableItems.length && selectedItems.size > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(availableItems.map(item => item.id)));
    }
  }, [cartItems, selectedItems]);

  const updateDeliveryMethod = useCallback(async (method: 'pickup' | 'delivery') => {
    if (!cart || !cartService) return;
    
    setDeliveryMethod(method);
    try {
      await cartService.updateDeliveryMethod(cart.id, method);
    } catch (error) {
      console.error('Error updating delivery method:', error);
    }
  }, [cart]);

  const clearCart = useCallback(async () => {
    if (!cart || !cartService || selectedItems.size === 0) return;
    
    try {
      await cartService.clearSelectedItems(Array.from(selectedItems));
      const remainingItems = cartItems.filter(item => !selectedItems.has(item.id));
      setCartItems(remainingItems);
      setSelectedItems(new Set());
      
      if (remainingItems.length === 0) {
        await cartService.markAsOrdered(cart.id);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Ошибка очистки корзины');
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