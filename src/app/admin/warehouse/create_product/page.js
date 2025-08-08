'use client';

import Image from 'next/image';
import { useState } from 'react';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';

export default function CreateDealer() {
  const [fileName, setFileName] = useState('');


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="flex flex-col bg-[#F6F6F6] min-h-screen">
      <MoreHeaderAD title="Создать товар" />

      {/* Обёртка: одна колонка на мобилке, четыре — на lg */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-10">
        {/* Левый блок: форма создания товара (3/4 ширины на десктопе) */}
        <div className="bg-white rounded-xl p-6 col-span-1 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-4">
            <Image src="/icons/IconAppsOrange.png" alt="icon" width={18} height={18} />
            Создать
          </h2>

          {/* Разделительная линия */}
          <div className="w-full h-px bg-gray-300 mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Название */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Название</label>
              <input
                type="text"
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-[#111] focus:outline-none focus:ring-0"
              />
            </div>

            {/* Фотографии */}
    <div className="sm:col-span-2 row-span-2">
  <label htmlFor="product-images" className="block h-full w-full ">
    <span className="block text-sm  text-gray-500 mb-1">Фотографии</span>
    {/* сам «кликатор» */}
    <div className="border border-dashed border-gray-300 bg-gray-100 rounded-xl flex flex-col items-center justify-center h-full cursor-pointer">
      <Image src="/icons/UploadIcon.png" alt="upload" width={40} height={40} />
      <p className=" text-sm text-[#111]">Выберите файл</p>
    </div>
  </label>
  {/* скрытый инпут */}
  <input
    id="product-images"
    type="file"
    accept="image/*"
    multiple
    className="hidden"
    onChange={(e) => {
      const files = e.target.files;
      if (files && files.length) {
        console.log('Выбраны файлы:', files);
        // здесь можно сохранить их в state или отправить на сервер
      }
    }}
  />
</div>


            {/* Описание */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Описание</label>
              <input
                type="text"
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-[#111] focus:outline-none focus:ring-0"
              />
            </div>

            {/* Цена для Магазина */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Цена Магазина</label>
              <input
                type="text"
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-[#111] focus:outline-none focus:ring-0"
              />
            </div>

            {/* Цена для Дилера */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Цена Дилера</label>
              <input
                type="text"
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-[#111] focus:outline-none focus:ring-0"
              />
            </div>

            {/* Видео инструкция */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Видео инструкция</label>
              <input
                type="text"
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-[#111] focus:outline-none focus:ring-0"
              />
            </div>

            {/* Состав */}
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">Состав</label>
              <input
                type="text"
                className="w-full border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder-[#111] focus:outline-none focus:ring-0"
              />
            </div>
   <div className="sm:col-span-1 lg:col-span-2 mt-6">
              <button className="w-full bg-[#DA6A52] text-white h-12 rounded-xl hover:opacity-90 transition">
                Создать
              </button>
            </div>
            {/* Кнопка */}
         
          </div>
        </div>

        {/* Правый блок: col-span-1 на десктопе */}
        <div className="flex flex-col gap-4 col-span-1">
          {/* Заведующий складом */}
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
                    src="/icons/Icon check mark.png"
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

          {/* Инструкция */}
          <div className="bg-white rounded-xl p-4 overflow-auto h-full text-sm text-gray-500">
            <h3 className="font-semibold text-lg mb-2">
              Инструкция по созданию товара
            </h3>
            <p className="leading-relaxed">
              It is a long established fact that a reader will be distracted by the readable content of a page when
              looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution
              of letters, as opposed to using 'Content here, content here', making it look like readable English.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
