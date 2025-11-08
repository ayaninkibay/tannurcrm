// src/app/admin/warehouse/product_view/page.tsx (обновлённый)
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { Database } from '@/types/supabase'
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
import { useTranslate } from '@/hooks/useTranslate';

type ProductRow = Database['public']['Tables']['products']['Row']

function ProductViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslate();
  const productId = searchParams?.get('id') || null;
  
  const [product, setProduct] = useState<ProductRow | null>(null)
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockModalType, setStockModalType] = useState<'add' | 'subtract'>('add')
  const [stockAmount, setStockAmount] = useState('');

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchUserRole();
    } else {
      router.push('/admin/warehouse');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Получаем данные товара
  const fetchProduct = async () => {
    const id = productId;
    if (!id) {
      router.push('/admin/warehouse');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ ЯВНО УКАЗЫВАЕМ ВСЕ ПОЛЯ ВКЛЮЧАЯ ARTICLE
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          article,
          category,
          compound,
          image_url,
          gallery,
          price,
          price_dealer,
          stock,
          is_active,
          flagman,
          video_instr,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .single<ProductRow>()

      if (error) throw error;
      
      // 🔍 DEBUG: Проверяем что получили
      console.group('📦 PRODUCT FETCHED');
      console.log('Product ID:', data?.id);
      console.log('Product Name:', data?.name);
      console.log('Product Article:', data?.article);
      console.log('Has Article:', !!data?.article);
      console.log('Full Product:', data);
      console.groupEnd();
      
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(t('Ошибка загрузки товара'));
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
        const { data } = await supabase
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
    if (!productId) return;
    if (!confirm(t('Вы уверены, что хотите удалить этот товар?'))) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast.success(t('Товар успешно удален'));
      router.push('/admin/warehouse');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('Ошибка при удалении товара'));
    }
  };

  // Функция для перехода на страницу редактирования
  const handleEditProduct = () => {
    if (!productId) return;
    router.push(`/admin/warehouse/warehouse_control/edit_product/${productId}`);
  };

  // Открытие модального окна для изменения остатков
  const openStockModal = (type: 'add' | 'subtract') => {
    setStockModalType(type);
    setStockAmount('');
    setShowStockModal(true);
  };

  // Подтверждение изменения остатков
  const confirmStockUpdate = async () => {
    if (!productId) return;
    
    const amount = parseInt(stockAmount);
    
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error(t('Введите корректное количество'));
      return;
    }
    
    try {
      const newStock = stockModalType === 'add' 
        ? (product?.stock || 0) + amount
        : Math.max(0, (product?.stock || 0) - amount);
      
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;
      
      toast.success(
        t('Остаток успешно {action}')
          .replace('{action}', t(stockModalType === 'add' ? 'пополнен' : 'уменьшен'))
      );
      setShowStockModal(false);
      fetchProduct();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error(t('Ошибка при обновлении остатков'));
    }
  };

  // Форматирование цены
  const formatPrice = (price: number | null) => {
    if (!price) return '0 ₸';
    return `${price.toLocaleString('ru-RU')} ₸`;
  };

  // Получение URL изображения
  const getImageUrl = (imageUrl: string | null) => {
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
          <h2 className="text-2xl font-bold mb-4">{t('Товар не найден')}</h2>
          <button 
            onClick={() => router.push('/admin/warehouse')}
            className="px-6 py-3 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors"
          >
            {t('Вернуться к списку товаров')}
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
              <span className="text-[#111]">{product.name || t('Карточка товара')}</span>
            </span>
          }
          showBackButton={true}
        />
        
        <div className="w-full h-px bg-gray-200" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:p-6 lg:p-8">
          
          {/* Левая и центральная часть */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <ProductInfoBlock product={product} />

            {/* Информация снизу */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#111]">{t('Информация')}</h2>

              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center text-sm font-semibold text-gray-500 border-b border-gray-200 pb-2 px-4 gap-6">
                <span className="text-left">{t('Наименование')}</span>
                <span className="text-center">{t('Цена в Магазине')}</span>
                <span className="text-center">{t('Дилерская цена')}</span>
                <span className="text-center">{t('Количество в Складе')}</span>
                <span className="text-center">{t('Инфо')}</span>
              </div>

              <ProductCardWare
                image={getImageUrl(product.image_url)}
                title={product.name ?? t('Без названия')}
                priceOld={formatPrice(product.price)}
                priceNew={formatPrice(product.price_dealer)}
                count={product.stock ?? 0}
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
                    <span>{t('Пополнить остаток')}</span>
                  </button>
                  <button
                    onClick={() => openStockModal('subtract')}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <TrendingDown className="w-5 h-5" />
                    <span>{t('Уменьшить остаток')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка — управление */}
          {userRole && ['admin', 'dealer'].includes(userRole) && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
                <h2 className="text-xl font-bold text-[#111]">{t('Управление товаром')}</h2>
                <p className="text-sm text-gray-500">
                  {t('Любые изменения товара требуют подтверждения управляющего складом, а так же сохраняются в истории.')}
                </p>
                
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#111]">{t('Данные')}</p>
                  <button
                    onClick={handleEditProduct}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <Edit className="w-4 h-4 text-[#D77E6C] group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{t('Изменить данные товара')}</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#111]">{t('История')}</p>
                  <button
                    onClick={() => router.push(`/admin/warehouse/product_report?id=${productId}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#D77E6C]" />
                    <span className="text-sm">{t('Составить отчет по товару')}</span>
                  </button>
                  <button
                    onClick={() => router.push('/admin/warehouse/stock')}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <History className="w-4 h-4 text-[#D77E6C]" />
                    <span className="text-sm">{t('История движения на складе')}</span>
                  </button>
                </div>
                
                {userRole === 'admin' && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[#111]">{t('Удаление')}</p>
                    <button
                      onClick={handleDeleteProduct}
                      className="w-full flex items-center gap-3 px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm">{t('Удалить товар')}</span>
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
                {stockModalType === 'add' ? t('Пополнение остатка') : t('Списание товара')}
              </h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">{t('Товар')}</p>
                <p className="font-semibold text-[#111]">{product?.name}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {t('Текущий остаток:')} <span className="font-semibold text-[#D77E6C]">{product?.stock || 0} {t('шт.')}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Количество для {action}').replace('{action}', t(stockModalType === 'add' ? 'пополнения' : 'списания'))}
                </label>
                <input
                  type="number"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(e.target.value)}
                  placeholder={t('Введите количество')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-[#D77E6C] focus:outline-none transition-colors"
                  min="1"
                />
              </div>

              {stockAmount && !isNaN(parseInt(stockAmount)) && parseInt(stockAmount) > 0 && (
                <div className="p-3 bg-[#D77E6C]/10 rounded-lg">
                  <p className="text-sm text-[#111]">
                    {t('Новый остаток:')}{' '}
                    <span className="font-semibold">
                      {stockModalType === 'add' 
                        ? (product?.stock || 0) + parseInt(stockAmount)
                        : Math.max(0, (product?.stock || 0) - parseInt(stockAmount))
                      } {t('шт.')}
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
                {t('Отмена')}
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
                {t('Подтвердить')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductView() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F6F6F6]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    }>
      <ProductViewContent />
    </Suspense>
  );
}