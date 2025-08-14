'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { useProductModule } from '@/lib/product/ProductModule';
import { productService } from '@/lib/product/ProductService';
import { useRouter } from 'next/navigation';

export default function CreateDealer() {
  const router = useRouter();
  const { createProduct, isLoading, error } = useProductModule();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Add new files to existing ones
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove image from selection
  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      // Revoke the URL to free up memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name) {
        alert('Пожалуйста, введите название товара');
        return;
      }

      // Create product
      const productData = {
        name: formData.name || null,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        price_dealer: formData.price_dealer ? parseFloat(formData.price_dealer) : null,
        video_instr: formData.video_instr || null,
        compound: formData.compound || null,
        category: formData.category || null,
        flagman: formData.flagman,
        is_active: true,
        gallery: [],
      };

      const createdProduct = await createProduct(productData);

      // Upload images if any
      if (selectedFiles.length > 0 && createdProduct.id) {
        setUploadingImages(true);
        
        // Upload main image (first file)
        if (selectedFiles[0]) {
          await productService.uploadProductImage(createdProduct.id, selectedFiles[0]);
        }
        
        // Upload gallery images (rest of the files)
        if (selectedFiles.length > 1) {
          const galleryFiles = selectedFiles.slice(1);
          await productService.uploadProductImages(createdProduct.id, galleryFiles);
        }
        
        setUploadingImages(false);
      }

      // Success - redirect or show message
      alert('Товар успешно создан!');
      router.push('/admin/warehouse'); // Adjust the redirect path as needed
      
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Ошибка при создании товара: ' + (err as Error).message);
    }
  };

  return (
    <div className="flex flex-col bg-[#F6F6F6] min-h-screen">
      <MoreHeaderAD title="Создать товар" />

      {/* Error display */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-10 px-4">
        {/* Left block: product creation form */}
        <div className="bg-white rounded-xl p-6 col-span-1 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-4">
            <Image src="/icons/IconAppsOrange.png" alt="icon" width={18} height={18} />
            Создать
          </h2>

          {/* Divider */}
          <div className="w-full h-px bg-gray-300 mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Название *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52]"
                placeholder="Введите название товара"
              />
            </div>

            {/* Photos */}
            <div className="sm:col-span-2 row-span-2">
              <label className="block text-sm text-gray-500 mb-1">Фотографии</label>
              
              {/* Preview selected images */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          Главное
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload button */}
              <label htmlFor="product-images" className="block h-32 w-full cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl flex flex-col items-center justify-center h-full hover:bg-gray-100 transition-colors">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {previewUrls.length > 0 ? 'Добавить еще' : 'Выберите файлы'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {previewUrls.length > 0 ? `Выбрано: ${previewUrls.length}` : 'PNG, JPG до 10MB'}
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
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Описание</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52]"
                placeholder="Введите описание"
              />
            </div>

            {/* Store Price */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Цена Магазина</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52]"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            {/* Dealer Price */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Цена Дилера</label>
              <input
                type="number"
                name="price_dealer"
                value={formData.price_dealer}
                onChange={handleInputChange}
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52]"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            {/* Video instruction */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Видео инструкция</label>
              <input
                type="text"
                name="video_instr"
                value={formData.video_instr}
                onChange={handleInputChange}
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52]"
                placeholder="Ссылка на видео"
              />
            </div>

            {/* Compound */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Состав</label>
              <input
                type="text"
                name="compound"
                value={formData.compound}
                onChange={handleInputChange}
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52]"
                placeholder="Введите состав"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Категория</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DA6A52]"
                placeholder="Категория"
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
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Флагман
                </span>
              </label>
            </div>

            {/* Submit button */}
            <div className="sm:col-span-1 lg:col-span-2 mt-6">
              <button 
                onClick={handleSubmit}
                disabled={isLoading || uploadingImages}
                className="w-full bg-[#DA6A52] text-white h-12 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isLoading || uploadingImages) ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Создание...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Создать</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right block */}
        <div className="flex flex-col gap-4 col-span-1">
          {/* Warehouse manager */}
          <div className="bg-white rounded-xl p-4 flex flex-col text-sm text-gray-900">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold cursor-pointer hover:text-blue-500">
                Заведующий складом
              </p>
              <Image
                src="/icons/buttom/more.svg"
                alt="..."
                width={4}
                height={4}
                className="opacity-60"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 relative">
                <Image
                  src="/Icons/Users avatar 7.png"
                  alt="manager"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold flex items-center gap-1">
                  Алишан Берденов
                  <Image
                    src="/icons/iconchekmark.svg"
                    alt="check"
                    width={16}
                    height={16}
                  />
                </p>
                <p className="text-xs text-gray-900">KZ849970</p>
                <p className="text-xs text-gray-400">+7 707 700 00 02</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl p-4 overflow-auto h-full text-sm text-gray-500">
            <h3 className="font-semibold text-lg mb-2">
              Инструкция по созданию товара
            </h3>
            <div className="space-y-2">
              <p className="leading-relaxed">
                <strong>1. Название:</strong> Введите уникальное название товара, которое будет отображаться в каталоге.
              </p>
              <p className="leading-relaxed">
                <strong>2. Фотографии:</strong> Загрузите изображения товара. Первое фото станет главным. Поддерживаются форматы JPG, PNG.
              </p>
              <p className="leading-relaxed">
                <strong>3. Цены:</strong> Укажите розничную цену и цену для дилеров.
              </p>
              <p className="leading-relaxed">
                <strong>4. Флагман:</strong> Отметьте, если товар является флагманским продуктом.
              </p>
              <p className="leading-relaxed text-xs text-orange-600 mt-3">
                * Обязательные поля помечены звездочкой
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}