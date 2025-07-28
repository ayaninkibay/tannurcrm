'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RightSidebar() {
  const router = useRouter();

  return (
    <div className="w-[300px] flex flex-col gap-4">
      {/* Заведующий складом */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-semibold text-[#111] cursor-pointer hover:text-blue-500">
            Заведующий складом
          </p>
          <Image src="/icons/IconThreedots.png" alt="..." width={3} height={3} />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <img
            src="/Icons/Users avatar 7.png"
            className="w-14 h-14 object-cover rounded-lg"
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

      {/* Товары */}
      <div className="bg-[#F6F6F6] rounded-xl p-4">
        <p className="text-sm font-semibold mb-2 text-[#111]">Товары</p>
        <button className="flex justify-between items-center text-sm py-3 px-4 rounded-xl bg-white hover:bg-gray-100 w-full transition">
          <span className="flex items-center gap-2 text-[#111] font-medium">
            <Image src="/icons/IconProfileOrange.png" alt="icon" width={16} height={16} />
            Выпуск товара из склада
          </span>
          <Image src="/icons/Icon arow botom.png" alt=">" width={18} height={18} />
        </button>
      </div>

      {/* История */}
      <div className="bg-[#F6F6F6] rounded-xl p-4">
        <p className="text-sm font-semibold mb-2 text-[#111]">История</p>
        <button className="flex justify-between items-center text-sm py-3 px-4 rounded-xl bg-white hover:bg-gray-100 w-full transition">
          <span className="flex items-center gap-2 text-[#111] font-medium">
            <Image src="/icons/IconProfileOrange.png" alt="icon" width={16} height={16} />
            Составить отчет по остаткам
          </span>
          <Image src="/icons/Icon arow botom.png" alt=">" width={18} height={18} />
        </button>
        <button className="flex justify-between items-center text-sm py-3 px-4 mt-2 rounded-xl bg-white hover:bg-gray-100 w-full transition">
          <span className="flex items-center gap-2 text-[#111] font-medium">
            <Image src="/icons/IconProfileOrange.png" alt="icon" width={16} height={16} />
            История движения на складе
          </span>
          <Image src="/icons/Icon arow botom.png" alt=">" width={18} height={18} />
        </button>
      </div>

      {/* Товары (создание) */}
      <div className="bg-[#F6F6F6] rounded-xl p-4">
        <p className="text-sm font-semibold mb-2 text-[#111]">Товары</p>
        <button
          onClick={() => router.push('/admin/warehouse/create_product')}
          className="flex justify-between items-center text-sm py-3 px-4 rounded-xl bg-white hover:bg-gray-100 w-full transition"
        >
          <span className="flex items-center gap-2 text-[#111] font-medium">
            <Image src="/icons/IconProfileOrange.png" alt="cart" width={16} height={16} />
            Создать новый товар
          </span>
          <Image src="/icons/Icon arow botom.png" alt=">" width={18} height={18} />
        </button>
      </div>

      {/* Пользователи */}
      <div className="bg-[#F6F6F6] rounded-xl p-4">
        <p className="text-sm font-semibold mb-2 text-[#111]">Пользователи</p>
        <button className="flex justify-between items-center text-sm py-3 px-4 rounded-xl bg-white hover:bg-gray-100 w-full transition">
          <span className="flex items-center gap-2 text-[#111] font-medium">
            <Image src="/icons/IconProfileOrange.png" alt="icon" width={16} height={16} />
            Создать менеджера
          </span>
          <Image src="/icons/Icon arow botom.png" alt=">" width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
