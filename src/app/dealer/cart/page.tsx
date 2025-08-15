'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  X, 
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  Tag,
  AlertCircle,
  CheckCircle,
  MoreVertical
} from 'lucide-react';

// Имитация компонента MoreHeaderAD
const MoreHeaderAD = ({ title }) => (
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
  </div>
);

// Тип для товара в корзине
interface CartItem {
  id: string;
  product_id: string;
  name: string;
  image: string;
  price: number;
  price_dealer: number;
  quantity: number;
  stock: number;
  category: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');

  // Загрузка временных данных
  useEffect(() => {
    const tempItems: CartItem[] = [
      {
        id: '1',
        product_id: 'prod_1',
        name: 'Ф-А Шоколады Tannur',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        price: 25000,
        price_dealer: 18000,
        quantity: 2,
        stock: 10,
        category: 'Косметика'
      },
      {
        id: '2',
        product_id: 'prod_2',
        name: 'Обваливающая маска Tannur',
        image: 'https://images.unsplash.com/photo-1596755389378-c31202fa3b90?w=200&h=200&fit=crop',
        price: 35000,
        price_dealer: 28000,
        quantity: 1,
        stock: 5,
        category: 'Уход за лицом'
      },
      {
        id: '3',
        product_id: 'prod_3',
        name: 'Гелевая маска Tannur',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop',
        price: 15000,
        price_dealer: 12000,
        quantity: 3,
        stock: 0,
        category: 'Уход за лицом'
      },
      {
        id: '4',
        product_id: 'prod_4',
        name: 'Набор из 6 кремов Tannur',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop',
        price: 45000,
        price_dealer: 38000,
        quantity: 1,
        stock: 15,
        category: 'Наборы'
      }
    ];
    
    setCartItems(tempItems);
    // По умолчанию выбираем все доступные товары
    const availableItems = new Set<string>(tempItems.filter(item => item.stock > 0).map(item => item.id));
    setSelectedItems(availableItems);
  }, []);

  // Обновление количества
  const updateQuantity = (itemId, change) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, Math.min(item.quantity + change, item.stock));
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Удаление товара
  const removeItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  // Переключение выбора товара
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Выбрать все/снять все
  const toggleSelectAll = () => {
    const availableItems = cartItems.filter(item => item.stock > 0);
    if (selectedItems.size === availableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(availableItems.map(item => item.id)));
    }
  };

  // Применение промокода
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'TANNUR20') {
      setPromoDiscount(20);
    } else if (promoCode.toUpperCase() === 'NEW10') {
      setPromoDiscount(10);
    } else {
      setPromoDiscount(0);
      alert('Недействительный промокод');
    }
  };

  // Расчеты
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price_dealer * item.quantity), 0);
  const discount = Math.round(subtotal * (promoDiscount / 100));
  const deliveryFee = deliveryMethod === 'delivery' && subtotal < 50000 ? 5000 : 0;
  const total = subtotal - discount + deliveryFee;
  const totalSavings = selectedCartItems.reduce((sum, item) => 
    sum + ((item.price - item.price_dealer) * item.quantity), 0
  ) + discount;

  // Форматирование цены
  const formatPrice = (price) => {
    return `${price.toLocaleString('ru-RU')} ₸`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F6F6]">
        <MoreHeaderAD title="Корзина покупок" />
        
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-white rounded-2xl border border-gray-200 p-12">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#111] mb-2 text-center">Корзина пуста</h2>
            <p className="text-gray-500 mb-8 text-center">Добавьте товары, чтобы начать покупки</p>
            <button className="px-8 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C56D5C] transition-colors font-medium">
              Перейти к покупкам
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderAD title="Корзина покупок" />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Статистика карточки */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">{cartItems.length}</div>
            <div className="text-sm text-gray-500">товаров в корзине</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[#D77E6C]" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#111]">{selectedItems.size}</div>
            <div className="text-sm text-gray-500">выбрано товаров</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">{formatPrice(totalSavings)}</div>
            <div className="text-sm text-gray-500">ваша экономия</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#D77E6C]/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-[#D77E6C]" />
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-[#D77E6C]">{formatPrice(total)}</div>
            <div className="text-sm text-gray-500">итого к оплате</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Левая часть - список товаров */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Выбрать все */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.size === cartItems.filter(item => item.stock > 0).length && selectedItems.size > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-[#D77E6C] rounded focus:ring-[#D77E6C]"
                />
                <span className="font-medium text-[#111]">Выбрать все доступные товары</span>
              </label>
              <span className="text-sm text-gray-500">
                {selectedItems.size} из {cartItems.length}
              </span>
            </div>

            {/* Товары в корзине */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#111] mb-4">Товары в корзине</h2>
              
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border ${item.stock === 0 ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex gap-4">
                      {/* Чекбокс */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          disabled={item.stock === 0}
                          className="w-5 h-5 text-[#D77E6C] rounded focus:ring-[#D77E6C] disabled:opacity-50"
                        />
                      </div>

                      {/* Изображение */}
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        {item.stock === 0 && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Нет в наличии</span>
                          </div>
                        )}
                      </div>

                      {/* Информация о товаре */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-[#111]">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-[#D77E6C]">
                                {formatPrice(item.price_dealer)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            {item.stock > 0 && item.stock <= 5 && (
                              <p className="text-xs text-orange-600 mt-1">
                                Осталось {item.stock} шт.
                              </p>
                            )}
                          </div>

                          {/* Количество */}
                          {item.stock > 0 ? (
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded transition-colors"
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-red-600 font-medium">Нет в наличии</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Способ доставки */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#111] mb-4">
                Способ получения
              </h3>
              
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                  deliveryMethod === 'pickup' 
                    ? 'bg-[#D77E6C]/5 border-2 border-[#D77E6C]' 
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryMethod === 'pickup'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="text-[#D77E6C] focus:ring-[#D77E6C]"
                    />
                    <div>
                      <p className="font-medium text-[#111]">Самовывоз</p>
                      <p className="text-sm text-gray-500">г. Алматы, ул. Абая 150</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">Бесплатно</span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                  deliveryMethod === 'delivery' 
                    ? 'bg-[#D77E6C]/5 border-2 border-[#D77E6C]' 
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="delivery"
                      checked={deliveryMethod === 'delivery'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="text-[#D77E6C] focus:ring-[#D77E6C]"
                    />
                    <div>
                      <p className="font-medium text-[#111]">Доставка курьером</p>
                      <p className="text-sm text-gray-500">1-2 рабочих дня</p>
                    </div>
                  </div>
                  <span className="font-medium">
                    {subtotal >= 50000 ? (
                      <span className="text-green-600">Бесплатно</span>
                    ) : (
                      <span className="text-[#111]">{formatPrice(5000)}</span>
                    )}
                  </span>
                </label>
              </div>

              {deliveryMethod === 'delivery' && subtotal < 50000 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Добавьте товары на <span className="font-semibold">{formatPrice(50000 - subtotal)}</span> для бесплатной доставки
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Правая часть - итоги */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-[#111] mb-4">Детали заказа</h3>

              {/* Промокод */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Промокод</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Введите код"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Применить
                  </button>
                </div>
                {promoDiscount > 0 && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Скидка {promoDiscount}% применена</span>
                  </div>
                )}
              </div>

              {/* Расчеты */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Товары ({selectedItems.size} шт.)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Скидка</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                {deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Доставка</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-[#111]">Итого</span>
                    <span className="text-2xl font-bold text-[#D77E6C]">{formatPrice(total)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-sm text-green-600 mt-1 text-right">
                      Экономия: {formatPrice(totalSavings)}
                    </p>
                  )}
                </div>
              </div>

              {/* Кнопка оформления */}
              <button 
                className="w-full py-3 bg-[#D77E6C] text-white rounded-xl font-semibold hover:bg-[#C56D5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={selectedItems.size === 0}
              >
                <CreditCard className="w-5 h-5" />
                Оформить заказ
              </button>

              {/* Информация */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#111]">Быстрая доставка</p>
                    <p className="text-xs text-gray-500">Доставим заказ в течение 1-2 дней</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#111]">Гарантия качества</p>
                    <p className="text-xs text-gray-500">100% оригинальная продукция</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#111]">Безопасная оплата</p>
                    <p className="text-xs text-gray-500">Защищенные платежи</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}