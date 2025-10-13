'use client'

import { useState, useEffect } from 'react'
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import DealerProductCard from '@/components/product/DealerProductCard'
import DealerBigProductCard from '@/components/product/DealerBigProductCard'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Database } from '@/types/supabase'
import { useTranslate } from '@/hooks/useTranslate'
import { 
  Package, 
  Sparkles, 
  Tag, 
  TrendingUp, 
  Eye, 
  EyeOff,
  ShoppingBag,
  Star,
  Zap,
  Filter,
  Grid3x3,
  List,
  ArrowRight,
  Clock
} from 'lucide-react'

type ProductRow = Database['public']['Tables']['products']['Row']

// Простой кеш для продуктов
class ProductCache {
  private static CACHE_KEY = 'shop_products_cache'
  private static TTL = 5 * 60 * 1000 // 5 минут

  static get(): { products: ProductRow[], bigProduct: ProductRow | null, timestamp: number } | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return null
      
      const data = JSON.parse(cached)
      if (Date.now() - data.timestamp > this.TTL) {
        localStorage.removeItem(this.CACHE_KEY)
        return null
      }
      
      return data
    } catch {
      return null
    }
  }

  static set(products: ProductRow[], bigProduct: ProductRow | null): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        products,
        bigProduct,
        timestamp: Date.now()
      }))
    } catch {}
  }
}

export default function ShopPage() {
  const { t } = useTranslate()
  const [showClientPrices, setShowClientPrices] = useState(false)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [bigProduct, setBigProduct] = useState<ProductRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Проверяем кеш
      const cached = ProductCache.get()
      if (cached) {
        setProducts(cached.products)
        setBigProduct(cached.bigProduct)
        setLoading(false)
        
        // Обновляем в фоне
        fetchFromDatabase()
        return
      }
      
      await fetchFromDatabase()
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error(t('Ошибка загрузки товаров'))
    } finally {
      setLoading(false)
    }
  }

  const fetchFromDatabase = async () => {
    // Загружаем флагманский товар для большой карточки
    const { data: bigProductData, error: bigError } = await supabase
      .from('products')
      .select('*')
      .eq('flagman', true)
      .eq('is_active', true)
      .limit(1)
      .single<ProductRow>()

    if (!bigError && bigProductData) {
      setBigProduct(bigProductData)
    }

    // Загружаем остальные товары (исключая флагманский)
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('flagman', false)
      .limit(12)
      .order('created_at', { ascending: false })

    if (!productsError && productsData) {
      setProducts(productsData)
      ProductCache.set(productsData, bigProductData || null)
    }
  }

  // Фильтрация по категории
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  // Уникальные категории
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D77E6C] border-t-transparent"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-[#D77E6C] animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4 p-2 md:p-6 min-h-screen">
      <MoreHeaderDE title={t('Магазин Tannur')} />

      {/* Фирменный баннер */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#D77E6C] via-[#E09080] to-[#D77E6C] rounded-xl md:rounded-2xl shadow-lg">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 md:w-60 md:h-60 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 md:w-60 md:h-60 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-4 md:p-6">
          <div className="flex items-center justify-between gap-4 mb-3 md:mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-200" />
                <span className="text-xs md:text-sm font-semibold text-white/90">{t('Эксклюзивные цены')}</span>
              </div>
              <h2 className="text-lg md:text-2xl font-bold text-white mb-1">
                {t('Дилерский каталог')}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-center">
                <p className="text-lg md:text-2xl font-bold text-white">{products.length}</p>
                <p className="text-[10px] md:text-xs text-white/70">{t('товаров')}</p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <p className="text-lg md:text-2xl font-bold text-white">24/7</p>
                <p className="text-[10px] md:text-xs text-white/70">{t('онлайн')}</p>
              </div>
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
            <a 
              href="/dealer/shop/cart"
              className="group bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 transition-all flex items-center gap-3 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="p-2 md:p-2.5 bg-gradient-to-br from-[#D77E6C] to-[#E09080] rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm md:text-base text-gray-900 mb-0.5">{t('Корзина')}</h3>
                <p className="text-[10px] md:text-xs text-gray-600 truncate">{t('Оформить заказ')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#D77E6C] group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </a>

            <a 
              href="/dealer/shop/orders"
              className="group bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 transition-all flex items-center gap-3 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="p-2 md:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm md:text-base text-gray-900 mb-0.5">{t('Заказы')}</h3>
                <p className="text-[10px] md:text-xs text-gray-600 truncate">{t('История покупок')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </a>
          </div>
        </div>
      </section>

      {/* Панель управления */}
      <section className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Категории - скроллящиеся на мобилке */}
          <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max md:flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#D77E6C] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? t('Все товары') : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Контролы */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Счетчик товаров */}
              <div className="text-xs md:text-sm text-gray-500">
                {filteredProducts.length} / {products.length}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Переключатель вида */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  title={t('Сетка')}
                >
                  <Grid3x3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  title={t('Список')}
                >
                  <List className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>

              {/* Переключатель цен */}
              <button
                onClick={() => setShowClientPrices(!showClientPrices)}
                className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  showClientPrices 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {showClientPrices ? (
                  <>
                    <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{t('Клиентские')}</span>
                    <span className="sm:hidden">{t('Клиент.')}</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{t('Дилерские')}</span>
                    <span className="sm:hidden">{t('Дилер.')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Флагманский товар */}
      {bigProduct && (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 md:p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <h2 className="text-sm md:text-base font-semibold text-gray-900">{t('Флагманский продукт')}</h2>
            <div className="ml-auto px-2 md:px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] md:text-xs font-bold rounded-full">
              {t('ФЛАГМАН')}
            </div>
          </div>
          
          <div className="max-w-md">
            <DealerBigProductCard
              product={bigProduct}
              showClientPrice={showClientPrices}
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </div>
        </section>
      )}

      {/* Основной каталог */}
      <section>
        {/* Сетка или список товаров */}
        {viewMode === 'grid' ? (
          // СЕТКА - адаптивная
          <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="transform hover:scale-105 transition-transform duration-200"
              >
                <DealerProductCard
                  product={product}
                  showClientPrice={showClientPrices}
                  className="h-full shadow-sm hover:shadow-lg transition-shadow"
                />
              </div>
            ))}
          </div>
        ) : (
          // СПИСОК - адаптивный
          <div className="flex flex-col gap-2 md:gap-3">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="group bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-3 md:gap-4"
              >
                {/* Изображение */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name || ''} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 md:w-8 md:h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-0.5 md:mb-1 line-clamp-1 group-hover:text-[#D77E6C] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 line-clamp-1 hidden sm:block">
                    {product.description || t('Нет описания')}
                  </p>
                  {product.category && (
                    <span className="inline-block mt-1 px-1.5 md:px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] md:text-xs rounded">
                      {product.category}
                    </span>
                  )}
                </div>

                {/* Цены и кнопка */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 md:gap-3">
                  {/* Цены */}
                  <div className="flex flex-col items-end">
                    {showClientPrices && product.price && (
                      <div className="text-[10px] md:text-xs text-gray-500">
                        <span className="line-through">{product.price} ₸</span>
                      </div>
                    )}
                    <div className="text-base md:text-xl font-bold text-[#D77E6C] whitespace-nowrap">
                      {showClientPrices ? product.price : product.price_dealer} ₸
                    </div>
                    {product.stock !== null && product.stock !== undefined && (
                      <div className="text-[10px] md:text-xs text-gray-500 hidden sm:block">
                        {t('В наличии')}: {product.stock}
                      </div>
                    )}
                  </div>

                  {/* Кнопка действия */}
                  <button 
                    className="flex-shrink-0 p-2 md:p-3 bg-gradient-to-br from-[#D77E6C] to-[#E09080] text-white rounded-lg hover:shadow-lg transition-all group-hover:scale-110"
                    onClick={() => {
                      toast.success(t('Товар добавлен в корзину'))
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Пустое состояние */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 md:py-12 bg-white rounded-xl">
            <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3 md:mb-4" />
            <p className="text-sm md:text-base text-gray-500 mb-2">{t('Нет товаров в этой категории')}</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[#D77E6C] hover:underline text-xs md:text-sm font-medium"
            >
              {t('Показать все товары')}
            </button>
          </div>
        )}
      </section>

      {/* Кнопка "Загрузить еще" */}
      {filteredProducts.length >= 12 && (
        <section className="flex justify-center py-3 md:py-4">
          <button 
            onClick={fetchProducts}
            className="group px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white text-xs md:text-sm font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Package className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{t('Загрузить еще товары')}</span>
            <span className="sm:hidden">{t('Еще')}</span>
            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-y-[-2px] transition-transform" />
          </button>
        </section>
      )}
    </div>
  )
}