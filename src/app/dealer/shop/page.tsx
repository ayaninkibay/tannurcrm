'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
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

  static get(): { products: ProductRow[], bigProducts: ProductRow[], timestamp: number } | null {
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

  static set(products: ProductRow[], bigProducts: ProductRow[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        products,
        bigProducts,
        timestamp: Date.now()
      }))
    } catch {}
  }
}

export default function ShopPage() {
  const { t } = useTranslate()
  const [showClientPrices, setShowClientPrices] = useState(false)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [bigProducts, setBigProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const fetchFromDatabase = useCallback(async () => {
    // Загружаем ВСЕ флагманские товары для большой карточки
    const { data: bigProductsData, error: bigError } = await supabase
      .from('products')
      .select('*')
      .eq('flagman', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!bigError && bigProductsData) {
      setBigProducts(bigProductsData)
    }

    // Загружаем остальные товары (исключая флагманские)
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('flagman', false)
      .limit(12)
      .order('created_at', { ascending: false })

    if (!productsError && productsData) {
      setProducts(productsData)
      ProductCache.set(productsData, bigProductsData || [])
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)

      // Проверяем кеш
      const cached = ProductCache.get()
      if (cached) {
        setProducts(cached.products)
        setBigProducts(cached.bigProducts)
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
  }, [fetchFromDatabase, t])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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
    <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-6 min-h-screen">
      <MoreHeaderDE title={t('Магазин Tannur')} />

      {/* Фирменный баннер - КОМПАКТНЫЙ на мобиле */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#D77E6C] via-[#E09080] to-[#D77E6C] rounded-xl lg:rounded-2xl shadow-lg">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute -top-16 -right-16 sm:-top-20 sm:-right-20 w-32 h-32 sm:w-40 sm:h-40 lg:w-60 lg:h-60 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 sm:-bottom-10 sm:-left-10 w-32 h-32 sm:w-40 sm:h-40 lg:w-60 lg:h-60 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-200 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-white/90 truncate">{t('Эксклюзивные цены')}</span>
              </div>
              <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-white truncate">
                {t('Дилерский каталог')}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 flex-shrink-0">
              <div className="text-center">
                <p className="text-base sm:text-lg lg:text-2xl font-bold text-white">{products.length + bigProducts.length}</p>
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-white/70 whitespace-nowrap">{t('товаров')}</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-white/20"></div>
              <div className="text-center">
                <p className="text-base sm:text-lg lg:text-2xl font-bold text-white">24/7</p>
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-white/70 whitespace-nowrap">{t('онлайн')}</p>
              </div>
            </div>
          </div>

          {/* Быстрые действия - КОМПАКТНЫЕ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 lg:gap-3">
            <a 
              href="/dealer/shop/cart"
              className="group bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg lg:rounded-xl p-2 sm:p-3 lg:p-4 transition-all flex items-center gap-2 sm:gap-3 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-[#D77E6C] to-[#E09080] rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-900 truncate">{t('Корзина')}</p>
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-600 truncate">{t('Оформить заказ')}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </a>

            <a 
              href="/dealer/shop/orders"
              className="group bg-white/95 hover:bg-white backdrop-blur-sm rounded-lg lg:rounded-xl p-2 sm:p-3 lg:p-4 transition-all flex items-center gap-2 sm:gap-3 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="p-1.5 sm:p-2 lg:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-gray-900 truncate">{t('Заказы')}</p>
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-600 truncate">{t('История покупок')}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </a>
          </div>
        </div>
      </section>

      {/* Управление - КОМПАКТНОЕ */}
      <section>
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm">
          <div className="p-2 sm:p-3 lg:p-4">
            {/* Верхняя панель управления */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-0">
              {/* Кнопка фильтра для мобильных */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs font-medium">{t('Фильтры')}</span>
                {selectedCategory !== 'all' && (
                  <span className="w-2 h-2 bg-[#D77E6C] rounded-full"></span>
                )}
              </button>

              {/* Категории - видны только на десктопе */}
              <div className="hidden sm:flex flex-1 min-w-0 overflow-x-auto hide-scrollbar">
                <div className="flex gap-1.5 sm:gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat || 'all')}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-[#D77E6C] text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? t('Все') : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Переключатели - КОМПАКТНЫЕ */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto sm:ml-0">
                {/* Вид отображения */}
                <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 sm:p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    title={t('Сетка')}
                  >
                    <Grid3x3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 sm:p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    title={t('Список')}
                  >
                    <List className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                  </button>
                </div>

                {/* Переключатель цен */}
                <button
                  onClick={() => setShowClientPrices(!showClientPrices)}
                  className={`flex items-center gap-1 sm:gap-1.5 lg:gap-2 px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs lg:text-sm font-medium transition-all ${
                    showClientPrices 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {showClientPrices ? (
                    <>
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{t('Клиентские')}</span>
                      <span className="sm:hidden">{t('Клиент.')}</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{t('Дилерские')}</span>
                      <span className="sm:hidden">{t('Дилер.')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Выдвижная панель категорий для мобильных */}
            {filterOpen && (
              <div className="sm:hidden mt-2 pt-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat || 'all')
                        setFilterOpen(false)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-[#D77E6C] text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? t('Все') : cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Флагманские товары - 1 КОЛОНКА НА МОБИЛЕ */}
      {bigProducts.length > 0 && (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 border border-amber-100">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <div className="p-1 sm:p-1.5 lg:p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex-shrink-0">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
            </div>
            <h2 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 truncate flex-1">{t('Флагманские продукты')}</h2>
            <div className="px-1.5 sm:px-2 lg:px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] sm:text-[10px] lg:text-xs font-bold rounded-full flex-shrink-0">
              {t('ФЛАГМАН')}
            </div>
          </div>
          
          {/* 1 КОЛОНКА НА МОБИЛЕ */}
          <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bigProducts.map((product) => (
              <DealerBigProductCard
                key={product.id}
                product={product}
                showClientPrice={showClientPrices}
                className="shadow-lg hover:shadow-xl transition-shadow"
              />
            ))}
          </div>
        </section>
      )}

      {/* Основной каталог - 2 КОЛОНКИ НА МОБИЛЕ */}
      <section>
        {/* Сетка или список товаров */}
        {viewMode === 'grid' ? (
          // СЕТКА - 2 КОЛОНКИ НА МОБИЛЕ
          <div className="grid gap-1.5 sm:gap-2 lg:gap-3 xl:gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
          // СПИСОК - компактный на мобиле
          <div className="flex flex-col gap-1.5 sm:gap-2 lg:gap-3">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="group bg-white rounded-lg lg:rounded-xl p-2 sm:p-3 lg:p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-2 sm:gap-3 lg:gap-4"
              >
                {/* Изображение - КОМПАКТНОЕ */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name || ''}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Информация - КОМПАКТНАЯ */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-gray-900 mb-0.5 line-clamp-1 group-hover:text-[#D77E6C] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 line-clamp-1 hidden sm:block">
                    {product.description || t('Нет описания')}
                  </p>
                  {product.category && (
                    <span className="inline-block mt-0.5 sm:mt-1 px-1 sm:px-1.5 lg:px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] lg:text-xs rounded">
                      {product.category}
                    </span>
                  )}
                </div>

                {/* Цены и кнопка - КОМПАКТНЫЕ */}
                <div className="flex flex-col items-end gap-1 sm:gap-1.5 lg:gap-2 flex-shrink-0">
                  {/* Цены */}
                  <div className="flex flex-col items-end">
                    {showClientPrices && product.price && (
                      <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500">
                        <span className="line-through">{product.price} ₸</span>
                      </div>
                    )}
                    <div className="text-sm sm:text-base lg:text-xl font-bold text-[#D77E6C] whitespace-nowrap">
                      {showClientPrices ? product.price : product.price_dealer} ₸
                    </div>
                    {product.stock !== null && product.stock !== undefined && (
                      <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500 hidden sm:block">
                        {t('В наличии')}: {product.stock}
                      </div>
                    )}
                  </div>

                  {/* Кнопка действия */}
                  <button 
                    className="flex-shrink-0 p-1.5 sm:p-2 lg:p-3 bg-gradient-to-br from-[#D77E6C] to-[#E09080] text-white rounded-lg hover:shadow-lg transition-all group-hover:scale-110"
                    onClick={() => {
                      toast.success(t('Товар добавлен в корзину'))
                    }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Пустое состояние */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-6 sm:py-8 lg:py-12 bg-white rounded-xl">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-2 sm:mb-3 lg:mb-4" />
            <p className="text-xs sm:text-sm lg:text-base text-gray-500 mb-1.5 sm:mb-2">{t('Нет товаров в этой категории')}</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[#D77E6C] hover:underline text-[10px] sm:text-xs lg:text-sm font-medium"
            >
              {t('Показать все товары')}
            </button>
          </div>
        )}
      </section>

      {/* Кнопка "Загрузить еще" - КОМПАКТНАЯ */}
      {filteredProducts.length >= 12 && (
        <section className="flex justify-center py-2 sm:py-3 lg:py-4">
          <button 
            onClick={fetchProducts}
            className="group px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 bg-gradient-to-r from-[#D77E6C] to-[#E09080] text-white text-[10px] sm:text-xs lg:text-sm font-medium rounded-lg sm:rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t('Загрузить еще товары')}</span>
            <span className="sm:hidden">{t('Еще')}</span>
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 group-hover:translate-y-[-2px] transition-transform flex-shrink-0" />
          </button>
        </section>
      )}
    </div>
  )
}