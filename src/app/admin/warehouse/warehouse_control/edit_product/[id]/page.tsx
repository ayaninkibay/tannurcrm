// src/app/admin/warehouse/warehouse_control/edit_product/[id]/page.tsx
'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, Trash2 } from 'lucide-react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useProductModule } from '@/lib/product/ProductModule';
import { productService } from '@/lib/product/ProductService';
import { useRouter, useParams } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { t } = useTranslate();
  const { updateProduct, isLoading, error } = useProductModule();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading state
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    price_dealer: '',
    video_instr: '',
    compound: '',
    category: '',
    flagman: false,
  });

  // Images state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Load product data
  const loadProductData = useCallback(async () => {
    try {
      setLoadingProduct(true);
      
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      if (!product) {
        toast.error(t('Товар не найден'));
        router.push('/admin/warehouse');
        return;
      }
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        price_dealer: product.price_dealer?.toString() || '',
        video_instr: product.video_instr || '',
        compound: product.compound || '',
        category: product.category || '',
        flagman: product.flagman || false,
      });

      const images: string[] = [];
      if (product.image_url) {
        setMainImage(product.image_url);
        images.push(product.image_url);
      }
      if (product.gallery && product.gallery.length > 0) {
        images.push(...product.gallery);
      }
      setExistingImages(images);
    } catch (err) {
      console.error('Error loading product:', err);
      toast.error(t('Ошибка при загрузке товара'));
      router.push('/admin/warehouse');
    } finally {
      setLoadingProduct(false);
    }
  }, [productId, t, router]);

  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === 'checkbox' ? (target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeNewImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const markImageForDeletion = (imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
    setExistingImages(prev => prev.filter(url => url !== imageUrl));
    if (imageUrl === mainImage) {
      setMainImage('');
    }
  };

  const setAsMainImage = (imageUrl: string) => {
    setMainImage(imageUrl);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        toast.error(t('Пожалуйста, введите название товара'));
        return;
      }

      const productData = {
        name: formData.name || null,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        price_dealer: formData.price_dealer ? parseFloat(formData.price_dealer) : null,
        video_instr: formData.video_instr || null,
        compound: formData.compound || null,
        category: formData.category || null,
        flagman: formData.flagman,
      };

      await updateProduct(productId, productData);

      // Delete marked images
      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          try {
            await productService.deleteProductImage(imageUrl);
          } catch (err) {
            console.error('Error deleting image:', err);
          }
        }
        
        const { data: currentProduct } = await supabase
          .from('products')
          .select('image_url, gallery')
          .eq('id', productId)
          .single();

        if (currentProduct) {
          const updates: any = {};
          
          if (currentProduct.image_url && imagesToDelete.includes(currentProduct.image_url)) {
            updates.image_url = null;
          }
          
          if (currentProduct.gallery) {
            updates.gallery = currentProduct.gallery.filter(
              (url: string) => !imagesToDelete.includes(url)
            );
          }
          
          if (Object.keys(updates).length > 0) {
            await supabase
              .from('products')
              .update(updates)
              .eq('id', productId);
          }
        }
      }

      // Upload new images
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        
        const { data: currentProduct } = await supabase
          .from('products')
          .select('image_url')
          .eq('id', productId)
          .single();
        
        const needMainImage = !currentProduct?.image_url;
        
        if (needMainImage && selectedFiles[0]) {
          await productService.uploadProductImage(productId, selectedFiles[0]);
          
          if (selectedFiles.length > 1) {
            const galleryFiles = selectedFiles.slice(1);
            await productService.uploadProductImages(productId, galleryFiles);
          }
        } else {
          await productService.uploadProductImages(productId, selectedFiles);
        }
        
        setUploadingImages(false);
      }

      toast.success(t('Товар успешно обновлен!'));
      router.push('/admin/warehouse');
    } catch (err) {
      console.error('Error updating product:', err);
      const msg = (err as Error)?.message ?? '';
      toast.error(t('Ошибка при обновлении товара: {msg}').replace('{msg}', msg));
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex flex-col bg-[#F6F6F6] min-h-screen">
        <MoreHeaderAD title={t('Редактировать товар')} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DA6A52]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#F6F6F6] min-h-screen">
      <MoreHeaderAD title={t('Редактировать товар')} />

      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-10 px-4 max-w-full">
        <div className="bg-white rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-4">
            <Image src="/icons/IconAppsOrange.png" alt="icon" width={18} height={18} />
            {t('Редактировать товар')}
          </h2>

          <div className="w-full h-px bg-gray-300 mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Name */}
            <div className="lg:col-span-2">
              <label className="block text-base font-medium text-gray-700 mb-2">{t('Название *')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 bg-white rounded-lg p-4 text-base text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52] focus:border-transparent"
                placeholder={t('Введите название товара')}
              />
            </div>

            {/* Photos */}
            <div className="lg:col-span-1 row-span-3">
              <label className="block text-base font-medium text-gray-700 mb-2">{t('Фотографии')}</label>

              {existingImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">{t('Текущие изображения')}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group h-24">
                        <Image
                          src={url}
                          alt={`Existing ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          onClick={() => markImageForDeletion(url)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        {url === mainImage && (
                          <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            {t('Главное')}
                          </span>
                        )}
                        {url !== mainImage && (
                          <button
                            onClick={() => setAsMainImage(url)}
                            className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {t('Сделать главным')}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewUrls.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">{t('Новые изображения')}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative group h-24">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove"
                        >
                          <X size={14} />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          {t('Новое')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label htmlFor="product-images" className="block h-40 w-full cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl flex flex-col items-center justify-center h-full hover:bg-gray-100 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-base font-medium text-gray-600">
                    {t('Добавить изображения')}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {t('PNG, JPG до 10MB')}
                  </p>
                </div>
              </label>

              <input
                ref={fileInputRef}
                id="product-images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-base font-medium text-gray-700 mb-2">{t('Описание')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 bg-white rounded-lg p-4 text-base text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52] focus:border-transparent resize-none"
                placeholder={t('Введите описание')}
              />
            </div>

            {/* Store Price */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">{t('Цена Магазина')}</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full border border-gray-300 bg-white rounded-lg p-4 text-base text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52] focus:border-transparent"
                placeholder={t('0.00')}
                step="0.01"
              />
            </div>

            {/* Dealer Price */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">{t('Цена Дилера')}</label>
              <input
                type="number"
                name="price_dealer"
                value={formData.price_dealer}
                onChange={handleInputChange}
                className="w-full border border-gray-300 bg-white rounded-lg p-4 text-base text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52] focus:border-transparent"
                placeholder={t('0.00')}
                step="0.01"
              />
            </div>

            {/* Video instruction */}
            <div className="lg:col-span-2">
              <label className="block text-base font-medium text-gray-700 mb-2">{t('Видео инструкция')}</label>
              <input
                type="text"
                name="video_instr"
                value={formData.video_instr}
                onChange={handleInputChange}
                className="w-full border border-gray-300 bg-white rounded-lg p-4 text-base text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52] focus:border-transparent"
                placeholder={t('Ссылка на видео')}
              />
            </div>

            {/* Compound */}
            <div className="lg:col-span-2">
              <label className="block text-base font-medium text-gray-700 mb-2">{t('Состав')}</label>
              <input
                type="text"
                name="compound"
                value={formData.compound}
                onChange={handleInputChange}
                className="w-full border border-gray-300 bg-white rounded-lg p-4 text-base text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52] focus:border-transparent"
                placeholder={t('Введите состав')}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">{t('Категория')}</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 bg-white rounded-lg p-4 text-base text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52] focus:border-transparent"
                placeholder={t('Категория')}
              />
            </div>

            {/* Flagship toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="flagman"
                  checked={formData.flagman}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DA6A52]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DA6A52]"></div>
                <span className="ml-3 text-base font-medium text-gray-700">
                  {t('Флагман')}
                </span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="lg:col-span-3 mt-8 flex gap-6">
              <button 
                onClick={() => router.back()}
                className="px-8 py-4 bg-gray-200 text-gray-700 text-base font-medium rounded-xl hover:bg-gray-300 transition"
              >
                {t('Отмена')}
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isLoading || uploadingImages}
                className="flex-1 bg-[#DA6A52] text-white py-4 text-base font-medium rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isLoading || uploadingImages) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('Сохранение...')}</span>
                  </>
                ) : (
                  <span>{t('Сохранить изменения')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
