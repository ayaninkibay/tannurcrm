// src/lib/product/ProductModule.ts
'use client'

import { useCallback, useState } from 'react'
import { productService } from '@/lib/product/ProductService'
import type { Database } from '@/types/supabase'

type ProductRow    = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export interface UseProductModuleReturn {
  product: ProductRow | null
  products: ProductRow[]
  total: number
  isLoading: boolean
  error: string | null

  // CRUD
  fetchProduct: (productId: string) => Promise<void>
  listProducts: (params?: Parameters<typeof productService.listProducts>[0]) => Promise<void>
  createProduct: (payload: ProductInsert) => Promise<ProductRow>
  updateProduct: (productId: string, patch: ProductUpdate) => Promise<void>
  deleteProduct: (productId: string) => Promise<void>

  // Бизнес‑действия
  toggleActive: (productId: string, value: boolean) => Promise<void>
  changeStock: (productId: string, delta: number) => Promise<void>

  // Медиа
  uploadProductImage: (productId: string, file: File) => Promise<void>
  addGalleryImage: (productId: string, imageUrl: string) => Promise<void>
  removeGalleryImage: (productId: string, imageUrl: string) => Promise<void>
}

export const useProductModule = (): UseProductModuleReturn => {
  const [product, setProduct]   = useState<ProductRow | null>(null)
  const [products, setProducts] = useState<ProductRow[]>([])
  const [total, setTotal]       = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError]         = useState<string | null>(null)

  const wrap = async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (e: any) {
      const msg = e?.message ?? 'Произошла ошибка'
      console.error('useProductModule:', msg)
      setError(msg)
      throw e
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProduct = useCallback(async (productId: string) => {
    const data = await wrap(() => productService.fetchProductById(productId))
    setProduct(data)
  }, [])

  const listProducts = useCallback(async (params?: Parameters<typeof productService.listProducts>[0]) => {
    const { items, total } = await wrap(() => productService.listProducts(params))
    setProducts(items)
    setTotal(total)
  }, [])

  const createProduct = useCallback(async (payload: ProductInsert) => {
    const created = await wrap(() => productService.createProduct(payload))
    setProduct(created)
    // по ситуации: можно перелистать список или пушнуть
    return created
  }, [])

  const updateProduct = useCallback(async (productId: string, patch: ProductUpdate) => {
    const updated = await wrap(() => productService.updateProduct(productId, patch))
    setProduct(updated)
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)))
  }, [])

  const deleteProduct = useCallback(async (productId: string) => {
    await wrap(() => productService.deleteProduct(productId))
    setProduct((p) => (p?.id === productId ? null : p))
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }, [])

  const toggleActive = useCallback(async (productId: string, value: boolean) => {
    const updated = await wrap(() => productService.toggleActive(productId, value))
    setProduct((p) => (p?.id === productId ? updated : p))
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)))
  }, [])

  const changeStock = useCallback(async (productId: string, delta: number) => {
    const updated = await wrap(() => productService.changeStock(productId, delta))
    setProduct((p) => (p?.id === productId ? updated : p))
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)))
  }, [])

  const uploadProductImage = useCallback(async (productId: string, file: File) => {
    await wrap(() => productService.uploadProductImage(productId, file))
    // обновим состояние после загрузки
    const updated = await productService.fetchProductById(productId)
    setProduct(updated)
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)))
  }, [])

  const addGalleryImage = useCallback(async (productId: string, imageUrl: string) => {
    const updated = await wrap(() => productService.addGalleryImage(productId, imageUrl))
    setProduct((p) => (p?.id === productId ? updated : p))
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)))
  }, [])

  const removeGalleryImage = useCallback(async (productId: string, imageUrl: string) => {
    const updated = await wrap(() => productService.removeGalleryImage(productId, imageUrl))
    setProduct((p) => (p?.id === productId ? updated : p))
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)))
  }, [])

  return {
    product,
    products,
    total,
    isLoading,
    error,

    fetchProduct,
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,

    toggleActive,
    changeStock,

    uploadProductImage,
    addGalleryImage,
    removeGalleryImage,
  }
}
