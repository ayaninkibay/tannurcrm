// src/app/admin/gift-promotions/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, Calendar, DollarSign, Package, X, Search } from 'lucide-react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import {
  getAllPromotions,
  deletePromotion,
  togglePromotionStatus,
  createPromotion,
  updatePromotion,
  addGiftProducts,
  type GiftPromotionWithProducts,
} from '@/lib/gift_promotions/giftPromotions';
import { createClient } from '@/lib/supabase/client';

export default function GiftPromotionsPage() {
  const [promotions, setPromotions] = useState<GiftPromotionWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<GiftPromotionWithProducts | null>(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  async function loadPromotions() {
    try {
      setLoading(true);
      const data = await getAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Ошибка загрузки акций:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить эту акцию?')) return;
    
    try {
      await deletePromotion(id);
      await loadPromotions();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить акцию');
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    try {
      await togglePromotionStatus(id, !currentStatus);
      await loadPromotions();
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      alert('Не удалось изменить статус');
    }
  }

  function getPromotionStatus(promo: GiftPromotionWithProducts) {
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);

    if (!promo.is_active) return { text: 'Неактивна', color: 'bg-gray-500' };
    if (now < start) return { text: 'Запланирована', color: 'bg-blue-500' };
    if (now > end) return { text: 'Завершена', color: 'bg-gray-500' };
    return { text: 'Активна', color: 'bg-green-500' };
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <MoreHeaderAD title="Акции с подарками" showBackButton={true} />
        <div className="mx-auto">
          <div className="text-center py-12">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MoreHeaderAD title="Акции с подарками" showBackButton={true} />
      
      <div className="mt-8 mx-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Gift className="w-8 h-8 text-[#DC7C67]" />
              Создание акций
            </h1>
            <p className="text-gray-600 mt-2">
              Управление акциями "Подарок за покупку"
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#DC7C67] text-white rounded-xl hover:bg-[#c96b57] transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Создать акцию
          </button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Всего акций</div>
            <div className="text-3xl font-bold text-gray-900">{promotions.length}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Активных</div>
            <div className="text-3xl font-bold text-green-600">
              {promotions.filter(p => {
                const now = new Date();
                const start = new Date(p.start_date);
                const end = new Date(p.end_date);
                return p.is_active && now >= start && now <= end;
              }).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Запланированных</div>
            <div className="text-3xl font-bold text-blue-600">
              {promotions.filter(p => {
                const now = new Date();
                const start = new Date(p.start_date);
                return p.is_active && now < start;
              }).length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-gray-600 text-sm mb-1">Завершенных</div>
            <div className="text-3xl font-bold text-gray-600">
              {promotions.filter(p => {
                const now = new Date();
                const end = new Date(p.end_date);
                return now > end;
              }).length}
            </div>
          </div>
        </div>

        {/* Список акций */}
        <div className="space-y-4">
          {promotions.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Нет акций
              </h3>
              <p className="text-gray-600 mb-6">
                Создайте первую акцию с подарками
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#DC7C67] text-white rounded-xl hover:bg-[#c96b57] transition-colors"
              >
                Создать акцию
              </button>
            </div>
          ) : (
            promotions.map((promo) => {
              const status = getPromotionStatus(promo);
              return (
                <div
                  key={promo.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {promo.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </div>
                      {promo.description && (
                        <p className="text-gray-600 mb-3">{promo.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPromotion(promo)}
                        className="p-2 text-gray-600 hover:text-[#DC7C67] transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-5 h-5 text-[#DC7C67]" />
                      <span>
                        От <strong>{promo.min_purchase_amount.toLocaleString('ru-KZ')} ₸</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5 text-[#DC7C67]" />
                      <span>
                        {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-5 h-5 text-[#DC7C67]" />
                      <span>
                        Подарков: <strong>{promo.gift_promotion_products.length}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Товары-подарки */}
                  {promo.gift_promotion_products.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Товары-подарки:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {promo.gift_promotion_products.map((gp) => (
                          <div
                            key={gp.id}
                            className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
                          >
                            {gp.products.image_url && (
                              <img
                                src={gp.products.image_url}
                                alt={gp.products.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {gp.products.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                Кол-во: {gp.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Переключатель активности */}
                  <div className="border-t pt-4 mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Статус активности
                    </span>
                    <button
                      onClick={() => handleToggleStatus(promo.id, promo.is_active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        promo.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          promo.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Модалка создания/редактирования */}
      {(showCreateModal || editingPromotion) && (
        <PromotionModal
          promotion={editingPromotion}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPromotion(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingPromotion(null);
            loadPromotions();
          }}
        />
      )}
    </div>
  );
}

// Модальное окно создания/редактирования акции
function PromotionModal({ 
  promotion, 
  onClose, 
  onSave 
}: { 
  promotion: GiftPromotionWithProducts | null; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'products'>(promotion ? 'info' : 'info');
  const [promotionId, setPromotionId] = useState<string | null>(promotion?.id || null);
  
  // Форма акции
  const [name, setName] = useState(promotion?.name || '');
  const [description, setDescription] = useState(promotion?.description || '');
  const [startDate, setStartDate] = useState(
    promotion?.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    promotion?.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : ''
  );
  const [minAmount, setMinAmount] = useState(promotion?.min_purchase_amount || 0);
  const [priority, setPriority] = useState(promotion?.priority || 0);
  
  // Товары
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{product_id: string; quantity: number}[]>(
    promotion?.gift_promotion_products.map(gp => ({
      product_id: gp.product_id,
      quantity: gp.quantity
    })) || []
  );

  useEffect(() => {
    if (step === 'products') {
      loadProducts();
    }
  }, [step]);

  async function loadProducts() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image_url, price_dealer')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  }

  async function handleSaveInfo() {
    if (!name || !startDate || !endDate || minAmount <= 0) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      
      if (promotion) {
        // Обновление существующей акции
        await updatePromotion(promotion.id, {
          name,
          description,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          min_purchase_amount: minAmount,
          priority,
        });
        setPromotionId(promotion.id);
        setStep('products');
      } else {
        // Создание новой акции
        const newPromotion = await createPromotion({
          name,
          description,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          min_purchase_amount: minAmount,
          priority,
          is_active: true,
        });
        setPromotionId(newPromotion.id);
        setStep('products');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Не удалось сохранить акцию');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProducts() {
    if (!promotionId) return;
    
    if (selectedProducts.length === 0) {
      alert('Добавьте хотя бы один товар-подарок');
      return;
    }

    try {
      setLoading(true);
      await addGiftProducts(promotionId, selectedProducts);
      onSave();
    } catch (error) {
      console.error('Ошибка сохранения товаров:', error);
      alert('Не удалось сохранить товары');
    } finally {
      setLoading(false);
    }
  }

  function toggleProduct(productId: string) {
    const exists = selectedProducts.find(p => p.product_id === productId);
    if (exists) {
      setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, { product_id: productId, quantity: 1 }]);
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    setSelectedProducts(
      selectedProducts.map(p => 
        p.product_id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {promotion ? 'Редактировать акцию' : 'Создать акцию'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Шаги */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-[#DC7C67]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 'info' ? 'bg-[#DC7C67] text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-medium">Информация</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step === 'products' ? 'text-[#DC7C67]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 'products' ? 'bg-[#DC7C67] text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-medium">Подарки</span>
            </div>
          </div>
        </div>

        {/* Шаг 1: Информация */}
        {step === 'info' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название акции *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Набор помады в подарок"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание акции"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата начала *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата окончания *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Минимальная сумма покупки (₸) *
                </label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  placeholder="40000"
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Приоритет (если несколько акций)
                </label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Чем больше число, тем выше приоритет
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveInfo}
                disabled={loading}
                className="px-6 py-2 bg-[#DC7C67] text-white rounded-lg hover:bg-[#c96b57] transition-colors disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Далее'}
              </button>
            </div>
          </div>
        )}

        {/* Шаг 2: Выбор товаров */}
        {step === 'products' && (
          <div className="space-y-6">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск товаров..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC7C67] focus:border-transparent"
              />
            </div>

            {/* Выбранные товары */}
            {selectedProducts.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Выбрано товаров: {selectedProducts.length}
                </h3>
                <div className="space-y-2">
                  {selectedProducts.map((sp) => {
                    const product = products.find(p => p.id === sp.product_id);
                    if (!product) return null;
                    return (
                      <div key={sp.product_id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded" />
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={sp.quantity}
                            onChange={(e) => updateQuantity(sp.product_id, Number(e.target.value))}
                            min="1"
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => toggleProduct(sp.product_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Список товаров */}
            <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Товары не найдены
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.some(p => p.product_id === product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-green-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-5 h-5 text-[#DC7C67] rounded"
                        />
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            {product.price_dealer?.toLocaleString('ru-KZ')} ₸
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('info')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleSaveProducts}
                disabled={loading || selectedProducts.length === 0}
                className="px-6 py-2 bg-[#DC7C67] text-white rounded-lg hover:bg-[#c96b57] transition-colors disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}