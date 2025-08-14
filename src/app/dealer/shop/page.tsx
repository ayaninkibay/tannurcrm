'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import PickupAddressBlock from '@/components/product/HidderElements/PickupAddressBlock'
import PickupDeliverBlock from '@/components/product/HidderElements/PickupDeliverBlock'
import SortProductBlock from '@/components/product/HidderElements/SortProductsBlock'
import DealerProductCard from '@/components/product/DealerProductCard'
import DealerBigProductCard from '@/components/product/DealerBigProductCard'
import Lottie from 'lottie-react';
import retailAnimation from '@/components/lotties/Retail.json'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Database } from '@/types/supabase'

// Определяем тип для продукта
type ProductRow = Database['public']['Tables']['products']['Row']

export default function ShopPage() {
  const [showClientPrices, setShowClientPrices] = useState(false)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [bigProduct, setBigProduct] = useState<ProductRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Загружаем специальный товар для большой карточки
      const { data: bigProductData, error: bigError } = await supabase
        .from('products')
        .select('*')
        .eq('id', '538dd152-4d6f-471e-8cf1-dcdf6ba564ec')
        .single<ProductRow>()

      if (bigError && bigError.code !== 'PGRST116') {
        console.error('Error fetching big product:', bigError)
      } else if (bigProductData) {
        setBigProduct(bigProductData)
      }

      // Загружаем остальные товары
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .neq('id', '538dd152-4d6f-471e-8cf1-dcdf6ba564ec') // Исключаем большой товар
        .eq('is_active', true)
        .limit(8)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError
      
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Ошибка загрузки товаров')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-2 md:p-6 bg-[#F5F5F5] min-h-screen">
      <MoreHeaderDE title="Магазин Tannur" />

      {/* Верхний блок: Дилерский магазин */}
      <section className="bg-white rounded-2xl w-full p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-[#EAEAEA] gap-6 items-stretch">
          <div className="flex rounded-2xl bg-[#fff7f7] items-center justify-center p-2 h-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-15 md:h-15">
                <Lottie animationData={retailAnimation} loop autoplay />
              </div>
              <h2 className="text-lg md:text-lg font-semibold text-[#1C1C1C]">Дилерский магазин</h2>
            </div>
          </div>

          <div className="flex items-center justify-center h-full">
            <PickupAddressBlock />
          </div>

          <div className="flex items-center justify-center h-full">
            <PickupDeliverBlock />
          </div>

          <div className="flex items-center justify-center h-full">
            <SortProductBlock />
          </div>
        </div>
      </section>

      {/* Основной контент */}
      <section className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="col-span-6 grid gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Большой товар */}
            {bigProduct && (
              <div className="col-span-2">
                <DealerBigProductCard
                  product={bigProduct}
                  showClientPrice={showClientPrices}
                  className="h-full w-full"
                />
              </div>
            )}

            {/* Остальные товары */}
            {products.map((product) => (
              <div key={product.id} className="col-span-1">
                <DealerProductCard
                  product={product}
                  showClientPrice={showClientPrices}
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}