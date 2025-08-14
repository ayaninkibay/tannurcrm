'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import ActionButton from '@/components/ui/ActionButton';
import ProductCardWare from '@/components/ui/ProductCardWare';
import ProductInfoBlock from '@/components/product/ProductInfoBlock';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  Edit, 
  Trash2, 
  History, 
  FileText, 
  Plus, 
  Minus, 
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function ProductView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockModalType, setStockModalType] = useState('add');
  const [stockAmount, setStockAmount] = useState('');

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchUserRole();
    } else {
      router.push('/admin/warehouse');
    }
  }, [productId]);

  // Получаем данные товара
  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Ошибка загрузки товара');
      router.push('/admin/warehouse');
    } finally {
      setLoading(false);
    }
  };

  // Получаем роль пользователя
  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data) setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  // Функция для удаления товара
  const handleDeleteProduct = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast.success('Товар успешно удален');
      router.push('/admin/warehouse');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ошибка при удалении товара');
    }
  };

  // Открытие модального окна для изменения остатков
  const openStockModal = (type) => {
    setStockModalType(type);
    setStockAmount('');
    setShowStockModal(true);
  };

  // Подтверждение изменения остатков
  const confirmStockUpdate = async () => {
    const amount = parseInt(stockAmount);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error('Введите корректное количество');
      return;
    }
    
    try {
      const newStock = stockModalType === 'add' 
        ? (product.stock || 0) + amount
        : Math.max(0, (product.stock || 0) - amount);
      
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;
      
      toast.success(`Остаток успешно ${stockModalType === 'add' ? 'пополнен' : 'уменьшен'}`);
      setShowStockModal(false);
      fetchProduct();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Ошибка при обновлении остатков');
    }
  };

  // Форматирование цены
  const formatPrice = (price) => {
    if (!price) return '0 ₸';
    return `${price.toLocaleString('ru-RU')} ₸`;
  };

  // Получение URL изображения
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/icons/Photo_icon_1.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <div className="text-center bg-white p-8 rounded-2xl border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
          <button 
            onClick={() => router.push('/admin/warehouse')}
            className="px-6 py-3 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors"
          >
            Вернуться к списку товаров
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col bg-[#F6F6F6] min-h-screen">
        <MoreHeaderAD
          title={
            <span>
              <span className="text-gray-400">Tannur</span>
              <span className="mx-1 text-[#111]">/</span>
              <span className="text-[#111]">{product.name || 'Карточка товара'}</span>
            </span>
          }
        />
        
        <div className="w-full h-px bg-gray-200" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:p-6 lg:p-8">
          
          {/* Левая и центральная часть */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <ProductInfoBlock product={product} />

            {/* Информация снизу */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#111]">Информация</h2>

              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center text-sm font-semibold text-gray-500 border-b border-gray-200 pb-2 px-4 gap-6">
                <span className="text-left">Наименование</span>
                <span className="text-center">Цена в Магазине</span>
                <span className="text-center">Дилерская цена</span>
                <span className="text-center">Количество в Складе</span>
                <span className="text-center">Инфо</span>
              </div>

              <ProductCardWare
                image={getImageUrl(product.image_url)}
                title={product.name}
                priceOld={formatPrice(product.price)}
                priceNew={formatPrice(product.price_dealer)}
                count={product.stock || 0}
                className="bg-white pointer-events-none"
                showArrow={false}
              />

              {/* Кнопки управления остатками */}
              {userRole && ['admin', 'dealer'].includes(userRole) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openStockModal('add')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Пополнить остаток</span>
                  </button>
                  <button
                    onClick={() => openStockModal('subtract')}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <TrendingDown className="w-5 h-5" />
                    <span>Уменьшить остаток</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка — управление */}
          {userRole && ['admin', 'dealer'].includes(userRole) && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
                <h2 className="text-xl font-bold text-[#111]">Управление товаром</h2>
                <p className="text-sm text-gray-500">
                  Любые изменения товара требуют подтверждения управляющего складом, а так же сохраняются в истории.
                </p>
                
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#111]">Данные</p>
                  <button
                    onClick={() => router.push(`/admin/warehouse/product_edit?id=${productId}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-[#D77E6C]" />
                    <span className="text-sm">Изменить данные товара</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#111]">История</p>
                  <button
                    onClick={() => router.push(`/admin/warehouse/product_report?id=${productId}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#D77E6C]" />
                    <span className="text-sm">Составить отчет по товару</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/warehouse/stock')}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <History className="w-4 h-4 text-[#D77E6C]" />
                    <span className="text-sm">История движения на складе</span>
                  </button>
                </div>
                
                {userRole === 'admin' && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[#111]">Удаление</p>
                    <button
                      onClick={handleDeleteProduct}
                      className="w-full flex items-center gap-3 px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Удалить товар</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для изменения остатков */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#111]">
                {stockModalType === 'add' ? 'Пополнение остатка' : 'Списание товара'}
              </h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Товар</p>
                <p className="font-semibold text-[#111]">{product.name}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Текущий остаток: <span className="font-semibold text-[#D77E6C]">{product.stock || 0} шт.</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество для {stockModalType === 'add' ? 'пополнения' : 'списания'}
                </label>
                <input
                  type="number"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(e.target.value)}
                  placeholder="Введите количество"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-[#D77E6C] focus:outline-none transition-colors"
                  min="1"
                />
              </div>

              {stockAmount && !isNaN(parseInt(stockAmount)) && parseInt(stockAmount) > 0 && (
                <div className="p-3 bg-[#D77E6C]/10 rounded-lg">
                  <p className="text-sm text-[#111]">
                    Новый остаток: {' '}
                    <span className="font-semibold">
                      {stockModalType === 'add' 
                        ? (product.stock || 0) + parseInt(stockAmount)
                        : Math.max(0, (product.stock || 0) - parseInt(stockAmount))
                      } шт.
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmStockUpdate}
                disabled={!stockAmount || isNaN(parseInt(stockAmount)) || parseInt(stockAmount) <= 0}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                  stockAmount && !isNaN(parseInt(stockAmount)) && parseInt(stockAmount) > 0
                    ? 'bg-[#D77E6C] text-white hover:bg-[#C56D5C]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}