// src/lib/product/ProductService.ts
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Имя таблицы и бакета
const PRODUCT_TABLE = 'products' as const          // поменяй, если у тебя 'product_table'
const BUCKET        = 'products' as const          // storage bucket

export type ProductRow    = Database['public']['Tables'][typeof PRODUCT_TABLE]['Row']
export type ProductInsert = Database['public']['Tables'][typeof PRODUCT_TABLE]['Insert']
export type ProductUpdate = Database['public']['Tables'][typeof PRODUCT_TABLE]['Update']

export interface ListProductsParams {
  search?: string
  categoryId?: string | null
  brandId?: string | null
  isActive?: boolean
  isFlagship?: boolean
  limit?: number
  offset?: number
  orderBy?: keyof ProductRow
  order?: 'asc' | 'desc'
}

// helpers
function buildFilePath(productId: string, fileName: string) {
  const ext = (fileName.split('.').pop() || 'bin').replace(/[^a-zA-Z0-9]/g, '')
  return `${productId}/${crypto.randomUUID()}.${ext}`
}
function getStorageKeyFromPublicUrl(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}

class ProductService {
  // ---------- READ ----------
  async fetchProductById(productId: string): Promise<ProductRow> {
    const { data, error } = await supabase
      .from(PRODUCT_TABLE)
      .select('*')
      .eq('id', productId)
      .single()
    if (error) throw new Error(error.message)
    return data as ProductRow
  }

  async listProducts(params: ListProductsParams = {}) {
    const {
      search,
      categoryId,
      brandId,
      isActive,
      isFlagship,
      limit = 20,
      offset = 0,
      orderBy = 'created_at',
      order = 'desc',
    } = params

    let query = supabase
      .from(PRODUCT_TABLE)
      .select('*', { count: 'exact' })
      .order(orderBy as string, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

    if (search && search.trim()) {
      query = query.ilike('name', `%${search}%`)
      // при желании: query = query.or(`sku.ilike.%${search}%,name.ilike.%${search}%`)
    }
    if (typeof isActive === 'boolean') query = query.eq('is_active', isActive)
    if (typeof isFlagship === 'boolean') query = query.eq('is_flagship', isFlagship)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (brandId) query = query.eq('brand_id', brandId)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)

    return {
      items: (data ?? []) as ProductRow[],
      total: count ?? 0,
      limit,
      offset,
    }
  }

  // ---------- WRITE ----------
  async createProduct(payload: ProductInsert): Promise<ProductRow> {
    const { data, error } = await supabase
      .from(PRODUCT_TABLE)
      .insert(payload)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data as ProductRow
  }

  async updateProduct(productId: string, patch: ProductUpdate): Promise<ProductRow> {
    const { data, error } = await supabase
      .from(PRODUCT_TABLE)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data as ProductRow
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from(PRODUCT_TABLE)
      .delete()
      .eq('id', productId)
    if (error) throw new Error(error.message)
  }

  async toggleActive(productId: string, value: boolean): Promise<ProductRow> {
    const { data, error } = await supabase
      .from(PRODUCT_TABLE)
      .update({ is_active: value, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data as ProductRow
  }

  async changeStock(productId: string, delta: number): Promise<ProductRow> {
    // простая версия; для атомарности лучше RPC
    const current = await this.fetchProductById(productId)
    const newStock = (current.stock ?? 0) + delta
    if (newStock < 0) throw new Error('Недостаточно товара на складе')

    const { data, error } = await supabase
      .from(PRODUCT_TABLE)
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data as ProductRow
  }

  // ---------- STORAGE (bucket: products) ----------
  /** Загрузка главного изображения: products/<productId>/<uuid>.<ext>, обновляет image_url */
  async uploadProductImage(productId: string, file: File): Promise<string> {
    const filePath = buildFilePath(productId, file.name)
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, { upsert: true })
    if (uploadError) throw new Error(uploadError.message)

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
    const publicUrl = pub.publicUrl

    await this.updateProduct(productId, { image_url: publicUrl })
    return publicUrl
  }

  /** Массовая загрузка галереи — возвращает массив public URL, с мерджем в gallery */
  async uploadProductImages(productId: string, files: File[]): Promise<string[]> {
    const uploadedUrls: string[] = []
    for (const file of files) {
      const filePath = buildFilePath(productId, file.name)
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, { upsert: true })
      if (uploadError) throw new Error(uploadError.message)
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
      uploadedUrls.push(pub.publicUrl)
    }

    const { data: current, error: gErr } = await supabase
      .from(PRODUCT_TABLE)
      .select('gallery')
      .eq('id', productId)
      .single()
    if (gErr) throw new Error(gErr.message)

    const nextGallery = Array.from(new Set([...(current?.gallery ?? []), ...uploadedUrls]))
    const { error: updErr } = await supabase
      .from(PRODUCT_TABLE)
      .update({ gallery: nextGallery, updated_at: new Date().toISOString() })
      .eq('id', productId)
    if (updErr) throw new Error(updErr.message)

    return uploadedUrls
  }

  /** Добавить один URL в gallery (когда URL уже получен) */
  async addGalleryImage(productId: string, imageUrl: string): Promise<ProductRow> {
    const product = await this.fetchProductById(productId)
    const nextGallery = Array.from(new Set([...(product.gallery ?? []), imageUrl]))
    const { data, error } = await supabase
      .from(PRODUCT_TABLE)
      .update({ gallery: nextGallery, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data as ProductRow
  }

  /** Удаление физического файла из Storage по его public URL */
  async removeStorageFileByPublicUrl(publicUrl: string): Promise<void> {
    const key = getStorageKeyFromPublicUrl(publicUrl)
    if (!key) throw new Error('Некорректный public URL для удаления')
    const { error } = await supabase.storage.from(BUCKET).remove([key])
    if (error) throw new Error(error.message)
  }

  /** Удаление изображения из gallery + удаление физического файла из Storage */
  async removeGalleryImage(productId: string, imageUrl: string): Promise<ProductRow> {
    await this.removeStorageFileByPublicUrl(imageUrl)

    const product = await this.fetchProductById(productId)
    const nextGallery = (product.gallery ?? []).filter((u) => u !== imageUrl)

    const { data, error } = await supabase
      .from(PRODUCT_TABLE)
      .update({ gallery: nextGallery, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return data as ProductRow
  }
}

export const productService = new ProductService()
