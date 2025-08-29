'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import ProductInfoBlock from '@/components/product/ProductInfoBlock';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { Database } from '@/types/supabase';
import { Package } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

// Определяем тип для продукта
type ProductRow = Database['public']['Tables']['products']['Row'];

function ProductViewContent() {
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams?.get('id') || null;
  
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      router.push('/dealer/shop');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchProduct = async () => {
    const id = productId;
    if (!id) {
      router.push('/dealer/shop');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single<ProductRow>();

      if (error) throw error;
      
      if (data) {
        setProduct(data);
      } else {
        throw new Error(t('Товар не найден'));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(t('Ошибка загрузки товара'));
      setTimeout(() => {
        router.push('/dealer/shop');
      }, 2000);
    } finally {
      setLoading(false);
    }
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
            onClick={() => router.push('/dealer/shop')}
            className="px-6 py-3 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C56D5C] transition-colors"
          >
            {t('Вернуться в магазин')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 md:p-4 bg-[#F6F6F6] min-h-screen">
      <MoreHeaderDE 
        title={
          <span className="flex items-center">
            <span className="text-gray-400">{t('Магазин')}</span>
            <span className="mx-1 text-[#111]">/</span>
            <span className="text-[#111]">{product.name || t('Карточка товара')}</span>
          </span>
        }
        showBackButton={true}
      />
      
      <div className="w-full h-px bg-gray-200" />

      <div className="p-3 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <ProductInfoBlock product={product} />
        </div>
      </div>
    </div>
  );
}

// Оборачиваем в Suspense для правильной работы с useSearchParams
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
