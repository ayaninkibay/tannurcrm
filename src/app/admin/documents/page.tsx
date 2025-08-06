"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';
import Footer from '@/components/Footer';

interface FileItem {
  name: string;
  size?: string;
  id: string;
}

interface FileCategory {
  title: string;
  files: FileItem[];
  iconSrc: string;
  id: string;
}

export default function DocumentsPage() {
  const [categories, setCategories] = useState<FileCategory[]>([
    {
      id: 'training',
      title: 'Обучающие материалы',
      iconSrc: '/icons/Icon graduation.png',
      files: [
        { id: '1', name: 'Tannur_Marketing_obuchenie.pdf', size: '2.4 MB' },
        { id: '2', name: 'Tannur_Marketing_obuchenie.pdf', size: '1.8 MB' },
        { id: '3', name: 'Tannur_obuchenie.pdf', size: '3.2 MB' },
        { id: '4', name: 'Tannur_Almaty.pdf', size: '1.5 MB' },
        { id: '5', name: 'Tannur_znanie.pdf', size: '2.1 MB' },
        { id: '6', name: 'Tannur_obuchenie.pdf', size: '1.9 MB' },
      ]
    },
    {
      id: 'marketing',
      title: 'Маркетинговые материалы',
      iconSrc: '/icons/Icon megaphone.png',
      files: [
        { id: '7', name: 'Tannur_Marketing_obuchenie.pdf', size: '4.2 MB' },
        { id: '8', name: 'Tannur_Marketing_obuchenie.pdf', size: '3.8 MB' },
        { id: '9', name: 'Tannur_obuchenie.pdf', size: '2.9 MB' },
      ]
    },
    {
      id: 'video',
      title: 'Видео материалы',
      iconSrc: '/icons/IconVideoOrange.svg',
      files: [
        { id: '10', name: 'Tannur_Marketing_obuchenie.pdf', size: '1.7 MB' },
        { id: '11', name: 'Tannur_Marketing_obuchenie.pdf', size: '2.3 MB' },
        { id: '12', name: 'Tannur_obuchenie.pdf', size: '1.4 MB' },
        { id: '13', name: 'Tannur_Almaty.pdf', size: '3.1 MB' },
      ]
    }
  ]);

  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileUpload = (categoryId: string, files: FileList | null) => {
    if (!files) return;

    const newFiles: FileItem[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    }));

    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, files: [...category.files, ...newFiles] }
          : category
      )
    );
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOver(categoryId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOver(null);
    handleFileUpload(categoryId, e.dataTransfer.files);
  };

  const handleDeleteFile = (categoryId: string, fileId: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, files: category.files.filter(file => file.id !== fileId) }
          : category
      )
    );
  };

  const FileUploadArea = ({ categoryId }: { categoryId: string }) => (
    <div
      className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
        dragOver === categoryId
          ? 'border-[#DC7C67] bg-orange-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={(e) => handleDragOver(e, categoryId)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, categoryId)}
      onClick={() => fileInputRefs.current[categoryId]?.click()}
    >
      <input
        ref={(el) => {
  fileInputRefs.current[categoryId] = el;
}}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(categoryId, e.target.files)}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.avi,.mov"
      />
      
      <div className="flex flex-col items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </div>
    </div>
  );

  const fileBlock = (category: FileCategory) => (
    <div className="bg-white rounded-2xl p-4 sm:p-6 flex-1 h-full w-full">
      <h2 className="text-sm md:text-lg text-gray-800 mb-4 flex items-center gap-2">
        {category.iconSrc && (
          <Image src={category.iconSrc} alt="icon" width={18} height={18} />
        )}
        {category.title}
      </h2>
      
      <div className="flex flex-col gap-3">
        {category.files.map((file) => (
          <div
            key={file.id}
            className="bg-[#F2F2F2] flex items-center justify-between px-3 sm:px-4 py-2 rounded-xl group hover:bg-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Image
                src="/icons/Icon file gray.png"
                alt="file"
                width={16}
                height={16}
                className="object-contain flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm text-gray-800 truncate block">
                  {file.name}
                </span>
                {file.size && (
                  <span className="text-xs text-gray-500">
                    {file.size}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-2">
                            {/* Кнопка удаления */}
              <button 
                onClick={() => handleDeleteFile(category.id, file.id)}
                className="p-1 hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              {/* Кнопка скачивания */}
              <button className="p-1 hover:bg-gray-300 rounded transition-colors">
                <Image
                  src="/icons/Icon download.png"
                  alt="download"
                  width={14}
                  height={14}
                />
              </button>
              

            </div>
          </div>
        ))}
        
        {/* Область для добавления файлов */}
        <FileUploadArea categoryId={category.id} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-8 p-2 md:p-6 relative">
      {/* Контент */}
      <div className="flex-1 flex flex-col gap-4 sm:gap-6">
        <MoreHeader title="Документы Tannur" />

        {/* Блоки с файлами как grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div key={category.id}>
              {fileBlock(category)}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}