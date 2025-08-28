'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RightSidebar() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col gap-4 p-0 mt-4">
      {/* Заведующий складом */}
      <div className="bg-white rounded-xl p-4 w-full">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-semibold text-[#111] cursor-pointer hover:text-blue-500">
            Заведующий складом
          </p>
          <Image src="/icons/IconThreedots.png" alt="..." width={3} height={3} />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <img
            src="/icons/Users avatar 7.png"
            className="w-14 h-14 object-cover rounded-lg"
            alt="manager"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111] flex items-center gap-1">
              Алихан Берденов
              <Image src="/icons/confirmed.svg" alt="check" width={16} height={16} />
            </p>
            <p className="text-xs text-gray-900">KZ849970</p>
            <p className="text-xs text-gray-400">+7 707 700 00 02</p>
          </div>
        </div>
      </div>


      {/* История */}
      <div className="w-full">
        <div className="space-y-2">

          
          <Link href="/admin/warehouse/product_view" className="block w-full">
            <button className="flex justify-between items-center text-sm py-3 px-4 rounded-xl bg-white hover:bg-gray-100 w-full transition">
              <span className="flex items-center gap-2 text-[#111] font-medium">
                <Image src="/icons/IconProfileOrange.png" alt="icon" width={16} height={16} />
                История движения товара на складе
              </span>
              <Image src="/icons/Icon arow botom.png" alt=">" width={18} height={18} />
            </button>
          </Link>
        </div>
      </div>

      {/* Товары (создание) */}
      <div className="w-full">
      
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


    </div>
  );
}