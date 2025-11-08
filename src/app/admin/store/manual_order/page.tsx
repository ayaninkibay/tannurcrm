'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  searchUsers,
  getAllProducts,
  createManualOrder,
  ManualOrderItem,
} from '@/lib/manualOrder/manualOrderService';
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase/client';
import { Search, X, Trash2, Calendar, User, Package, Save, Check, AlertCircle, MapPin, Image as ImageIcon, Gift } from 'lucide-react';

type UserType = Database['public']['Tables']['users']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface OrderItem extends ManualOrderItem {
  id: string;
  product?: Product;
  is_gift?: boolean;
  promotion_id?: string;
}

interface GiftPromotion {
  id: string;
  name: string;
  min_purchase_amount: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  products: {
    product_id: string;
    quantity: number;
    product?: Product;
  }[];
}

export default function CreateManualOrderPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUser();

  // User search
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Gift Promotions
  const [giftPromotions, setGiftPromotions] = useState<GiftPromotion[]>([]);
  const [appliedPromotions, setAppliedPromotions] = useState<string[]>([]);

  // Order data
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<string>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load all products and gift promotions on mount
  useEffect(() => {
    loadProducts();
    loadGiftPromotions();
  }, []);

  // Check gift promotions whenever order items change
  useEffect(() => {
    checkAndApplyGiftPromotions();
  }, [orderItems, giftPromotions]);

  // Search users with debounce
  useEffect(() => {
    if (userSearchQuery.length < 2) {
      setUserSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      const { data, error } = await searchUsers(userSearchQuery);
      setIsSearchingUsers(false);

      if (!error && data) {
        setUserSearchResults(data);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  async function loadProducts() {
    setLoadingProducts(true);
    const { data, error } = await getAllProducts();
    if (!error && data) {
      setProducts(data);
    }
    setLoadingProducts(false);
  }

  async function loadGiftPromotions() {
    try {
      const now = new Date().toISOString();
      
      // Load active gift promotions with products
      const { data: promotions, error } = await supabase
        .from('gift_promotions')
        .select(`
          id,
          name,
          min_purchase_amount,
          is_active,
          start_date,
          end_date
        `)
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      if (error) throw error;

      if (promotions && promotions.length > 0) {
        // Load products for each promotion
        const promotionsWithProducts = await Promise.all(
          promotions.map(async (promo) => {
            const { data: promoProducts } = await supabase
              .from('gift_promotion_products')
              .select('product_id, quantity')
              .eq('promotion_id', promo.id);

            if (promoProducts && promoProducts.length > 0) {
              // Load product details
              const productIds = promoProducts.map(p => p.product_id);
              const { data: productDetails } = await supabase
                .from('products')
                .select('*')
                .in('id', productIds);

              return {
                ...promo,
                products: promoProducts.map(pp => ({
                  ...pp,
                  product: productDetails?.find(p => p.id === pp.product_id)
                }))
              };
            }

            return {
              ...promo,
              products: []
            };
          })
        );

        setGiftPromotions(promotionsWithProducts.filter(p => p.products.length > 0));
      }
    } catch (error) {
      console.error('Error loading gift promotions:', error);
    }
  }

  function checkAndApplyGiftPromotions() {
    // Calculate total for non-gift items only
    const regularItemsTotal = orderItems
      .filter(item => !item.is_gift)
      .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    // Find applicable promotions
    const applicablePromotions = giftPromotions
      .filter(promo => regularItemsTotal >= promo.min_purchase_amount)
      .sort((a, b) => b.min_purchase_amount - a.min_purchase_amount); // Highest threshold first

    // Remove gift items from promotions that are no longer applicable
    const newAppliedPromotions: string[] = [];
    const itemsToKeep = orderItems.filter(item => {
      if (!item.is_gift) return true;
      
      const promoStillApplies = applicablePromotions.some(p => p.id === item.promotion_id);
      if (promoStillApplies && item.promotion_id) {
        newAppliedPromotions.push(item.promotion_id);
      }
      return promoStillApplies;
    });

    // Add new gift items for newly applicable promotions
    const newItems = [...itemsToKeep];
    
    applicablePromotions.forEach(promo => {
      if (!newAppliedPromotions.includes(promo.id)) {
        // Add gift items from this promotion
        promo.products.forEach(giftProduct => {
          if (giftProduct.product) {
            newItems.push({
              id: `gift-${promo.id}-${giftProduct.product_id}-${Math.random().toString(36).substr(2, 9)}`,
              product_id: giftProduct.product_id,
              quantity: giftProduct.quantity,
              price: 0, // Gift items are free
              product: giftProduct.product,
              is_gift: true,
              promotion_id: promo.id
            });
          }
        });
        newAppliedPromotions.push(promo.id);
      }
    });

    // Update state if changed
    if (JSON.stringify(newItems) !== JSON.stringify(orderItems)) {
      setOrderItems(newItems);
      setAppliedPromotions(newAppliedPromotions);
    }
  }

  // Show loading while profile is loading
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    );
  }

  // Check if user has admin/financier role (for UI warning only)
  const hasAccess = profile?.role === 'admin' || profile?.role === 'financier';

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // Filter products by category only (no search)
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesCategory;
  });

  // Select user
  function handleSelectUser(user: UserType) {
    setSelectedUser(user);
    setUserSearchQuery('');
    setUserSearchResults([]);
  }

  // Add/update product quantity
  function handleToggleProduct(product: Product) {
    const existingItem = orderItems.find((item) => item.product_id === product.id && !item.is_gift);

    if (existingItem) {
      // Remove if quantity is 1
      if (existingItem.quantity === 1) {
        setOrderItems(orderItems.filter((item) => !(item.product_id === product.id && !item.is_gift)));
      }
    } else {
      // Add new item with quantity 1
      setOrderItems([
        ...orderItems,
        {
          id: Math.random().toString(36).substr(2, 9),
          product_id: product.id,
          quantity: 1,
          price: product.price_dealer || product.price || 0,
          product,
          is_gift: false,
        },
      ]);
    }
  }

  // Update item quantity
  function handleUpdateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }

  // Update item price
  function handleUpdatePrice(itemId: string, price: number) {
    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, price } : item
      )
    );
  }

  // Remove item
  function handleRemoveItem(itemId: string) {
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
  }

  // Calculate total (excluding gifts)
  function calculateTotal() {
    return orderItems
      .filter(item => !item.is_gift)
      .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  }

  // Check if product is selected
  function isProductSelected(productId: string) {
    return orderItems.some((item) => item.product_id === productId && !item.is_gift);
  }

  // Get product quantity
  function getProductQuantity(productId: string) {
    const item = orderItems.find((item) => item.product_id === productId && !item.is_gift);
    return item?.quantity || 0;
  }

  // Get gift promotion name by id
  function getPromotionName(promotionId?: string) {
    if (!promotionId) return '';
    const promo = giftPromotions.find(p => p.id === promotionId);
    return promo?.name || '';
  }

  // Submit order
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!selectedUser) {
      setError('Выберите пользователя');
      return;
    }

    const regularItems = orderItems.filter(item => !item.is_gift);
    if (regularItems.length === 0) {
      setError('Добавьте хотя бы один товар');
      return;
    }

    if (!orderDate) {
      setError('Укажите дату заказа');
      return;
    }

    setIsSubmitting(true);

    try {
      // Set delivery address to "Самовывоз" if pickup selected
      const finalDeliveryAddress = deliveryMethod === 'pickup' ? 'Самовывоз' : deliveryAddress;

      // Prepare items with gift flags
      const itemsToSubmit = orderItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        is_gift: item.is_gift || false,
        promotion_id: item.promotion_id || null
      }));

      const result = await createManualOrder({
        user_id: selectedUser.id,
        order_date: new Date(orderDate).toISOString(),
        items: itemsToSubmit,
        delivery_address: finalDeliveryAddress || undefined,
        delivery_method: deliveryMethod,
        notes: notes || undefined,
        status: 'delivered',
        payment_status: 'paid',
      });

      if (result.success) {
        const giftCount = orderItems.filter(i => i.is_gift).length;
        const giftMessage = giftCount > 0 ? ` (включая ${giftCount} подарочных позиций)` : '';
        
        setSuccess(
          `Заказ ${result.order_number} успешно создан${giftMessage}! Сумма: ${result.total_amount?.toLocaleString()} ₸`
        );
        
        // Reset form completely
        setSelectedUser(null);
        setOrderItems([]);
        setDeliveryAddress('');
        setDeliveryMethod('pickup');
        setNotes('');
        setOrderDate(new Date().toISOString().slice(0, 16));
        setAppliedPromotions([]);
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(result.error || 'Ошибка при создании заказа');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  }

  const regularItems = orderItems.filter(item => !item.is_gift);
  const giftItems = orderItems.filter(item => item.is_gift);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <MoreHeaderAD title="Создание заказа" showBackButton={true}/>

      <div className="mx-auto mt-8">
        {/* Access Warning */}
        {!hasAccess && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-yellow-800 text-sm">
                <strong>Внимание:</strong> У вас роль "{profile?.role}". Эта страница предназначена для администраторов. 
                Создание заказа может быть отклонено системой.
              </p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Gift Promotion Alert */}
        {appliedPromotions.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl flex items-start gap-3">
            <Gift className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-purple-900 text-sm font-medium mb-1">🎁 Применены акции с подарками!</p>
              <ul className="text-purple-800 text-xs space-y-0.5">
                {appliedPromotions.map(promoId => {
                  const promo = giftPromotions.find(p => p.id === promoId);
                  return promo ? (
                    <li key={promoId}>• {promo.name} - {promo.products.length} подарок(ов)</li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#D77E6C] rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Выбор пользователя</h2>
            </div>

            {selectedUser ? (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {selectedUser.email} • {selectedUser.phone}
                  </div>
                  <div className="inline-block mt-1 px-2 py-0.5 bg-white/80 text-xs font-medium text-gray-700 rounded">
                    {selectedUser.role}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Поиск по email, телефону или имени..."
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent transition-all"
                />
                <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />

                {isSearchingUsers && (
                  <div className="absolute right-12 top-3.5 text-sm text-gray-500">
                    Поиск...
                  </div>
                )}

                {userSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {userSearchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.email} • {user.phone}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#D77E6C] rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Дата заказа</h2>
            </div>
            <input
              type="datetime-local"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Products Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#D77E6C] rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Выбор товаров</h2>
              {regularItems.length > 0 && (
                <span className="ml-auto px-3 py-1 bg-[#D77E6C] text-white text-sm font-medium rounded-full">
                  {regularItems.length}
                </span>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-[#D77E6C] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'Все' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid - Compact Square Cards */}
            {loadingProducts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D77E6C] border-t-transparent mx-auto"></div>
                <p className="text-gray-500 text-sm mt-4">Загрузка товаров...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {filteredProducts.map((product) => {
                  const isSelected = isProductSelected(product.id);
                  const quantity = getProductQuantity(product.id);

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleToggleProduct(product)}
                      className={`p-1.5 rounded-lg border transition-all relative ${
                        isSelected
                          ? 'border-[#D77E6C] bg-orange-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {/* Product Image */}
                      <div className="aspect-square rounded-md bg-gray-100 mb-1.5 overflow-hidden relative">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#D77E6C] rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-medium text-gray-900 text-[10px] leading-tight line-clamp-2 mb-1 min-h-[24px]">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="text-xs font-bold text-[#D77E6C] mb-0.5">
                        {(product.price_dealer || product.price || 0).toLocaleString()}
                      </div>

                      {/* Quantity or Stock */}
                      {isSelected && quantity > 0 ? (
                        <div className="text-[10px] text-white bg-[#D77E6C] rounded px-1.5 py-0.5 font-bold text-center">
                          x{quantity}
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-500 text-center">
                          {product.stock || 0} шт
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Items Table */}
          {orderItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Выбранные товары</h3>
              
              {/* Regular Items */}
              {regularItems.length > 0 && (
                <>
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Основные товары</h4>
                  </div>
                  
                  {/* Mobile View */}
                  <div className="space-y-3 sm:hidden mb-6">
                    {regularItems.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex gap-3 flex-1 min-w-0">
                            {/* Image */}
                            <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                              {item.product?.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name || ''}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                {item.product?.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                На складе: {item.product?.stock}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Кол-во</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Цена</label>
                            <input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleUpdatePrice(item.id, parseFloat(e.target.value))}
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Сумма</label>
                            <div className="px-2 py-1.5 text-sm font-semibold text-gray-900 bg-gray-100 rounded-lg text-center">
                              {((item.price || 0) * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto mb-6">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Товар
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Кол-во
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Цена
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Сумма
                          </th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {regularItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                  {item.product?.image_url ? (
                                    <img
                                      src={item.product.image_url}
                                      alt={item.product.name || ''}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{item.product?.name}</div>
                                  <div className="text-sm text-gray-500">
                                    На складе: {item.product?.stock}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(item.id, parseInt(e.target.value))
                                }
                                className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={(e) =>
                                  handleUpdatePrice(item.id, parseFloat(e.target.value))
                                }
                                className="w-28 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent"
                              />
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {((item.price || 0) * item.quantity).toLocaleString()} ₸
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Gift Items */}
              {giftItems.length > 0 && (
                <>
                  <div className="mb-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      <h4 className="text-sm font-semibold text-purple-700">Подарочные товары (автоматически добавлены)</h4>
                    </div>
                  </div>
                  
                  {/* Mobile View for Gifts */}
                  <div className="space-y-3 sm:hidden mb-6">
                    {giftItems.map((item) => (
                      <div key={item.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 border-2 border-purple-200">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name || ''}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Gift className="w-6 h-6 text-purple-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-purple-900 text-sm mb-1 flex items-center gap-1">
                              <Gift className="w-3.5 h-3.5" />
                              {item.product?.name}
                            </h4>
                            <p className="text-xs text-purple-700 mb-1">
                              {getPromotionName(item.promotion_id)}
                            </p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-purple-600">Количество: {item.quantity}</span>
                              <span className="font-bold text-green-600">ПОДАРОК</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table for Gifts */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-purple-50 border-b border-purple-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-purple-700">
                            Товар
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-purple-700">
                            Акция
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-purple-700">
                            Кол-во
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-purple-700">
                            Стоимость
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-100">
                        {giftItems.map((item) => (
                          <tr key={item.id} className="bg-gradient-to-r from-purple-50 to-pink-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border-2 border-purple-200">
                                  {item.product?.image_url ? (
                                    <img
                                      src={item.product.image_url}
                                      alt={item.product.name || ''}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Gift className="w-5 h-5 text-purple-400" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-purple-900 flex items-center gap-1">
                                    <Gift className="w-4 h-4" />
                                    {item.product?.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-purple-700">
                              {getPromotionName(item.promotion_id)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-lg text-sm font-medium">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-green-600">
                              ПОДАРОК
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-lg sm:text-xl font-bold">
                  <span className="text-gray-900">Итого к оплате:</span>
                  <span className="text-[#D77E6C]">{calculateTotal().toLocaleString()} ₸</span>
                </div>
                {giftItems.length > 0 && (
                  <p className="text-sm text-purple-600 mt-2 flex items-center gap-1">
                    <Gift className="w-4 h-4" />
                    + {giftItems.reduce((sum, item) => sum + item.quantity, 0)} подарочных товара(ов)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Delivery Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#D77E6C] rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Доставка</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Способ доставки
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { value: 'pickup', label: 'Самовывоз' },
                    { value: 'delivery', label: 'Доставка' },
                    { value: 'courier', label: 'Курьер' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setDeliveryMethod(method.value)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        deliveryMethod === method.value
                          ? 'bg-[#D77E6C] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {deliveryMethod !== 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес доставки
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Укажите адрес доставки..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Примечания (опционально)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация о заказе..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !selectedUser || regularItems.length === 0}
              className="flex-1 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] hover:from-[#C66B5A] hover:to-[#B55A4A] text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Создание...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Создать заказ
                  {giftItems.length > 0 && <span className="text-xs opacity-90">(+{giftItems.length} 🎁)</span>}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="sm:w-auto px-6 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}