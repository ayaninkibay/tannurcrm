"use client";

import React from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';

const FilesContent = () => {
  const fileBlock = (title: string, files: string[], iconSrc: string) => (
    <div className="bg-white rounded-2xl p-6 flex-1 min-w-[500px]">
      <h2 className="text-lg text-gray-800 mb-4 flex items-center gap-2">
        {iconSrc && (
          <Image src={iconSrc} alt="icon" width={18} height={18} />
        )}
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
  );

  return (
    <div className="flex gap-6 mt-6 ml-[40px] items-start pr-[40px]">
      {/* Контент */}
      <div className="flex-1 flex flex-col gap-6">
                <MoreHeader title="Магазин Tannur" />

        {/* Блоки с файлами */}
        <div className="flex gap-6 flex-wrap">
          {fileBlock('Маркетинговые материалы', [
            'Tannur_Marketing_obuchenie.pdf',
            'Tannur_Marketing_obuchenie.pdf',
            'Tannur_obuchenie.pdf',
            'Tannur_Almaty.pdf',
            'Tannur_znanie.pdf',
            'Tannur_obuchenie.pdf',
          ], '/icons/Icon megaphone.png')}

          {fileBlock('Обучающие материалы', [
            'Tannur_Marketing_obuchenie.pdf',
            'Tannur_Marketing_obuchenie.pdf',
            'Tannur_obuchenie.pdf',
          ], '/icons/Icon graduation.png')}

          {fileBlock('Видео материалы', [
            'Tannur_Marketing_obuchenie.pdf',
            'Tannur_Marketing_obuchenie.pdf',
            'Tannur_obuchenie.pdf',
            'Tannur_Almaty.pdf',
          ], '/icons/Icon video red.png')}
        </div>
      </div>
    </div>
  );
};

export default FilesContent;
