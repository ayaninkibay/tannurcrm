'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Minus, ShoppingCart, 
  Check, X, AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Product, TeamPurchaseCart } from '@/types';

interface TeamPurchaseProductSelectorProps {
  purchaseId: string;
  userId: string;
  contributionLimit: number;
  currentTotal: number;
  cart: TeamPurchaseCart[];
  onAddToCart: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (cartId: string, quantity: number) => void;
}

export default function TeamPurchaseProductSelector({
  purchaseId,
  userId,
  contributionLimit,
  currentTotal,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity
}: TeamPurchaseProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₸`;
  const remaining = contributionLimit - currentTotal;

  // Загрузка товаров
  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Здесь загрузка товаров из productService
      // const data = await productService.getProducts({ category: selectedCategory });
      // setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Проверка, есть ли товар в корзине
  const getCartItem = (productId: string) => {
    return cart.find(item => item.product_id === productId);
  };

  // Добавление товара
  const handleAddToCart = (product: Product) => {
    const cartItem = getCartItem(product.id);
    
    if (cartItem) {
      // Увеличиваем количество
      onUpdateQuantity(cartItem.id, cartItem.quantity + 1);
    } else {
      // Проверяем лимит
      const newTotal = currentTotal + (product.price_dealer || 0);
      if (newTotal > contributionLimit) {
        toast.error('Превышен лимит вклада');
        return;
      }
      
      onAddToCart(product.id, 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Заголовок с лимитом */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#111]">Выбор товаров</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Ваш лимит</p>
              <p className="text-lg font-bold text-[#111]">{formatPrice(contributionLimit)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">В корзине</p>
              <p className="text-lg font-bold text-[#D77E6C]">{formatPrice(currentTotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Осталось</p>
              <p className={`text-lg font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatPrice(remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Прогресс-бар лимита */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              currentTotal > contributionLimit 
                ? 'bg-red-500' 
                : 'bg-gradient-to-r from-[#D77E6C] to-[#E89380]'
            }`}
            style={{ width: `${Math.min(100, (currentTotal / contributionLimit) * 100)}%` }}
          />
        </div>

        {currentTotal > contributionLimit && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-600">
              Превышен лимит на {formatPrice(currentTotal - contributionLimit)}
            </p>
          </div>
        )}
      </div>

      {/* Поиск и фильтры */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск товаров..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C]"
          >
            <option value="all">Все категории</option>
            <option value="ovens">Печи</option>
            <option value="accessories">Аксессуары</option>
            <option value="spare_parts">Запчасти</option>
          </select>
        </div>
      </div>

      {/* Список товаров */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => {
            const cartItem = getCartItem(product.id);
            const isInCart = !!cartItem;
            
            return (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-[#111] mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-[#D77E6C]">
                      {formatPrice(product.price_dealer || 0)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.price || 0)}
                    </span>
                  </div>

                  {isInCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (cartItem.quantity === 1) {
                            onRemoveFromCart(product.id);
                          } else {
                            onUpdateQuantity(cartItem.id, cartItem.quantity - 1);
                          }
                        }}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-center font-medium">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity + 1)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        disabled={currentTotal + (product.price_dealer || 0) > contributionLimit}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveFromCart(product.id)}
                        className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={currentTotal + (product.price_dealer || 0) > contributionLimit}
                      className="w-full py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      В корзину
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Корзина участника */}
      {cart.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="font-semibold text-[#111] mb-4">Ваша корзина</h3>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product?.image_url || '/placeholder.png'}
                    alt={item.product?.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-[#111]">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-[#D77E6C]">
                    {formatPrice(item.total)}
                  </p>
                  <button
                    onClick={() => onRemoveFromCart(item.product_id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Итого */}
          <div className="mt-4 p-4 bg-[#D77E6C]/5 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#111]">Итого в корзине:</span>
              <span className="text-xl font-bold text-[#D77E6C]">{formatPrice(currentTotal)}</span>
            </div>
            {currentTotal > contributionLimit && (
              <p className="text-sm text-red-600 mt-2">
                Превышен лимит! Удалите товары на {formatPrice(currentTotal - contributionLimit)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}