'use client';

import Image from 'next/image';

export default function CreateProductPage() {
  return (
    <div className="flex flex-col bg-[#F6F6F6] min-h-screen pl-[140px] px-6 pt-7 pb-7">
      {/* Верхняя панель с заголовком и кнопками */}
      <div className="w-full flex justify-between items-start gap-4 mb-6">
        {/* Заголовок слева */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold leading-tight">
            <span className="text-gray-400">Склад Tannur / </span>
            <span className="text-[#111]">Создать новый товар</span>
          </h1>
          <p className="text-sm text-gray-400 leading-tight mt-0.5">
            It is a long established fact that.
          </p>
        </div>

        {/* Кнопки справа */}
        <div className="flex items-center gap-4 mt-1">
          <button className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center hover:opacity-80 transition">
            <Image src="/icons/Icon notifications.png" alt="уведомления" width={16} height={16} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full" />
          </button>
          <button className="flex items-center gap-3 bg-white px-4 py-2 rounded-full hover:opacity-90 transition cursor-pointer">
            <img src="/Icons/Users avatar 6.png" alt="User" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-sm font-medium text-[#111] whitespace-nowrap">Маргоза Каныбат</span>
          </button>
          <button className="hover:opacity-80 transition">
            <Image src="/Icons/IconOutRed.png" alt="выйти" width={20} height={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-10">
       {/* Основной блок */}
<div className="flex-1 mx-auto mt-15 w-full max-w-[1250px] min-h-[1500px] h-fit flex flex-col justify-start">
  <div className="bg-white rounded-xl p-6 w-full min-h-[600px]">
    <h2 className="text-xl text-black font-semibold mb-4 flex items-center gap-2">
      <Image src="/icons/IconAppsOrange.png" alt="icon" width={18} height={18} />
      Создать
    </h2>

    {/* Серая разделительная линия */}
    <div className="w-full h-[1px] bg-gray-300 mt-15 mb-6" />

    <div className="grid grid-cols-4 gap-y-4 gap-x-4">
      {/* Название — 50% */}
      <div className="col-span-2">
        <label className="block text-sm text-gray-500 mb-1">Название</label>
        <input
          type="text"
          className="border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder:text-[#111] focus:outline-none focus:ring-0 w-full"
        />
      </div>

      {/* Фотографии — 50% */}
      <div className="col-span-2 row-span-2">
        <label className="block text-sm text-gray-500 mb-1">Фотографии</label>
        <div className="border border-dashed border-gray-300 bg-gray-100 p-6 rounded-xl flex flex-col items-center justify-center min-h-[160px]">
          <Image src="/icons/UploadIcon.png" alt="upload" width={40} height={40} />
          <p className="text-[#111] mt-2 text-sm">Выберите файл</p>
        </div>
      </div>

      {/* Описание — 50% */}
      <div className="col-span-2">
        <label className="block text-sm text-gray-500 mb-1">Описание</label>
        <input
          type="text"
          className="border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder:text-[#111] focus:outline-none focus:ring-0 w-full"
        />
      </div>

      {/* Цена для Магазина — 25% */}
      <div className="col-span-1">
        <label className="block text-sm text-gray-500 mb-1">Цена для Магазина</label>
        <input
          type="text"
          className="border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder:text-[#111] focus:outline-none focus:ring-0 w-full"
        />
      </div>

      {/* Цена для Дилера — 25% */}
      <div className="col-span-1">
        <label className="block text-sm text-gray-500 mb-1">Цена для Дилера</label>
        <input
          type="text"
          className="border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder:text-[#111] focus:outline-none focus:ring-0 w-full"
        />
      </div>

      {/* Видео инструкция — 50% */}
      <div className="col-span-2">
        <label className="block text-sm text-gray-500 mb-1">Видео инструкция</label>
        <input
          type="text"
          className="border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder:text-[#111] focus:outline-none focus:ring-0 w-full"
        />
      </div>

      {/* Состав — 50% */}
      <div className="col-span-2">
        <label className="block text-sm text-gray-500 mb-1">Состав</label>
        <input
          type="text"
          className="border border-gray-200 bg-gray-100 rounded-md p-3 text-sm text-[#111] placeholder:text-[#111] focus:outline-none focus:ring-0 w-full"
        />
      </div>

      {/* Кнопка — 50% */}
      <div className="col-span-2 flex">
       <button className="bg-[#DA6A52] text-white h-[45px] px-8 mt-6 rounded-xl hover:opacity-90 transition w-full">
  Создать
</button>

      </div>
    </div>
  </div>
</div>




        {/* Правая панель */}
        <div className="w-[400px] flex flex-col mt-15 gap-3">
          {/* Заведующий складом */}
          <div className="bg-white rounded-xl p-5 h-[140px] flex flex-col justify-between w-full">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-[#111] cursor-pointer hover:text-blue-500">
                Заведующий складом
              </p>
              <Image
                src="/icons/IconThreedots.png"
                alt="..."
                width={4}
                height={4}
                className="opacity-60"
              />
            </div>
            <div className="flex items-center gap-3">
              <img
                src="/Icons/Users avatar 7.png"
                className="w-[56px] h-[56px] object-cover rounded-lg"
                alt="manager"
              />
              <div>
                <p className="text-sm font-semibold text-[#111] flex items-center gap-1">
                  Алишан Берденов
                  <Image src="/icons/Icon check mark.png" alt="check" width={16} height={16} />
                </p>
                <p className="text-xs text-gray-900">KZ849970</p>
                <p className="text-xs text-gray-400">+7 707 700 00 02</p>
              </div>
            </div>
          </div>

          {/* Инструкция */}
          <div className="bg-white rounded-xl p-8 h-[470px] overflow-auto">
            <h3 className="text-xl font-semibold text-[#111] mb-2">Инструкция по созданию товара</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
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
