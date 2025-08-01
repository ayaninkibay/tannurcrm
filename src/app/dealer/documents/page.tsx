"use client";

import React from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';
import Footer from '@/components/Footer';


export default function DocumentsPage() {
  const fileBlock = (title: string, files: string[], iconSrc: string) => (
    <div className="bg-white rounded-2xl p-6 flex-1 min-w-[100px]">
      <h2 className="text-sm md:text-lg text-gray-800 mb-4 flex items-center gap-2">
        {iconSrc && <Image src={iconSrc} alt="icon" width={18} height={18} />}
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="bg-[#F2F2F2] flex items-center justify-between px-4 py-2 rounded-xl"
          >
            <div className="flex items-center gap-2 mt-4 translate-y-[-7px]">
              <Image
                src="/icons/Icon file gray.png"
                alt="file"
                width={16}
                height={16}
                className="object-contain"
              />
              <span className="text-sm text-gray-800 truncate max-w-[180px]">
                {file}
              </span>
            </div>
            <button>
              <Image
                src="/icons/Icon download.png"
                alt="download"
                width={14}
                height={14}
                className="translate-y-[-1px]"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

return (
      <div className="space-y-8 p-2 md:p-6 bg-gray-100">
    {/* Контент */}
    <div className="flex-1 flex flex-col gap-6">
      <MoreHeader title="Документы Tannur" />

      {/* Блоки с файлами как grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>{fileBlock('Маркетинговые материалы', [
          'Tannur_Marketing_obuchenie.pdf',
          'Tannur_Marketing_obuchenie.pdf',
          'Tannur_obuchenie.pdf',
          'Tannur_Almaty.pdf',
          'Tannur_znanie.pdf',
          'Tannur_obuchenie.pdf',
        ], '/icons/Icon megaphone.png')}</div>

        <div>{fileBlock('Обучающие материалы', [
          'Tannur_Marketing_obuchenie.pdf',
          'Tannur_Marketing_obuchenie.pdf',
          'Tannur_obuchenie.pdf',
        ], '/icons/Icon graduation.png')}</div>

        <div>{fileBlock('Видео материалы', [
          'Tannur_Marketing_obuchenie.pdf',
          'Tannur_Marketing_obuchenie.pdf',
          'Tannur_obuchenie.pdf',
          'Tannur_Almaty.pdf',
        ], '/icons/Icon video red.png')}</div>
      </div>
    </div>
          <div className="absolute bottom-4 right-4">
        <Footer />
      </div>
  </div>
);

};

