'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MainHomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f4f4f4] flex flex-col items-center justify-center text-gray-900">
      {/* Логотип */}
      <div className="absolute top-4 left-6">
        <Image src="/icons/company/tannur_black.svg" alt="Tannur Logo" width={120} height={40} />
      </div>

      {/* Контейнер */}
      <div className="bg-white rounded-3xl shadow-lg p-10 flex w-[900px] h-[500px] overflow-hidden">
        {/* Левая часть - картинка */}
        <div className="w-1/2 h-full relative rounded-xl overflow-hidden">
          <Image
            src="/icons/company/LoginGraphic.png"
            alt="CRM Preview"
            fill
            className="object-cover rounded-xl"
          />
        </div>

        {/* Правая часть - форма */}
        <div className="w-1/2 flex flex-col justify-center px-10 gap-6">
          <h1 className="text-2xl font-bold">Добро пожаловать<br />в Tannur CRM</h1>
          <p className="text-sm text-gray-500">Выберите тип входа:</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#e08672] text-white rounded-full hover:opacity-90 transition font-medium"
            >
              <Image src="/icons/IconSettingsWhite.png" alt="admin icon" width={20} height={20} />
              Админ
            </button>

            <button
              onClick={() => router.push('/dealer/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#87c572] text-white rounded-full hover:opacity-90 transition font-medium"
            >
              <Image src="/icons/Icon shop white.png" alt="dealer icon" width={20} height={20} />
              Дилер
            </button>

            <button
              onClick={() => router.push('celebrity/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#b68ff5] text-white rounded-full hover:opacity-90 transition font-medium"
            >
              <Image src="/icons/Icon share white.png" alt="celebrity icon" width={20} height={20} />
              Селебрити
            </button>
          </div>
        </div>
      </div>

      {/* Футер */}
      <footer className="mt-12 text-xs text-gray-400">TOO Tannur Cosmetics (C) 2025. All Rights Reserved.</footer>
    </main>
  );
}
