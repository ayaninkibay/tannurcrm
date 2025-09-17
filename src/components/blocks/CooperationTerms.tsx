import React, { useState } from 'react'
import { Download, Users, ShoppingBag, UserCheck, X, FileText, FileCheck, File } from 'lucide-react'
import { useTranslate } from '@/hooks/useTranslate'

interface CooperationTermsProps {
  variant?: 'light' | 'dark'
}

interface FileItem {
  id: string
  name: string
  size: string
  icon: React.ElementType
  url: string
}

export default function CooperationTerms({ 
  variant = 'light'
}: CooperationTermsProps) {
  const { t } = useTranslate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const isDark = variant === 'dark'
  
  const bgClass = isDark ? 'bg-[#3A3D43]' : 'bg-white'
  const titleClass = isDark ? 'text-white' : 'text-gray-900'
  const textClass = isDark ? 'text-gray-400' : 'text-gray-600'
  const accentClass = 'text-[#D77E6C]'

  // Файлы отображаемые в основном блоке
  const displayFiles = [
    { 
      icon: FileText,
      name: t('Договор дилера'),
      size: '245 KB',
      url: '/files/dealer-contract.pdf'
    },
    { 
      icon: FileCheck,
      name: t('Условия программы'),
      size: '186 KB',
      url: '/files/program-terms.pdf'
    },
    { 
      icon: File,
      name: t('Маркетинг план'),
      size: '512 KB',
      url: '/files/marketing-plan.pdf'
    }
  ]

  // Файлы для скачивания
  const files: FileItem[] = [
    {
      id: '1',
      name: t('Договор дилера'),
      size: '245 KB',
      icon: FileText,
      url: '/files/dealer-contract.pdf'
    },
    {
      id: '2',
      name: t('Условия программы'),
      size: '186 KB',
      icon: FileCheck,
      url: '/files/program-terms.pdf'
    },
    {
      id: '3',
      name: t('Маркетинг план'),
      size: '512 KB',
      icon: File,
      url: '/files/marketing-plan.pdf'
    }
  ]

  const handleDownload = (file: any) => {
    // Создаем ссылку для скачивания
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAll = () => {
    // Скачиваем все файлы
    files.forEach(file => {
      setTimeout(() => handleDownload(file), 100)
    })
  }

  return (
    <>
      <div className={`${bgClass} rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${titleClass}`}>
            {t('Условия сотрудничества')}
          </h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`${textClass} hover:${accentClass} transition-colors`}
            title={t('Скачать документы')}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {displayFiles.map((file, index) => (
            <button
              key={index}
              onClick={() => handleDownload(file)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
            >
              <file.icon className={`w-3.5 h-3.5 ${accentClass}`} />
              <span className={`${textClass} text-xs flex-1 text-left`}>
                {file.name}
              </span>
              <span className={`${textClass} text-xs opacity-60`}>
                {file.size}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('Документы для скачивания')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Список файлов */}
            <div className="space-y-3 mb-6">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <file.icon className="w-5 h-5 text-[#D77E6C]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title={t('Скачать')}
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                {t('Закрыть')}
              </button>
              <button
                onClick={handleDownloadAll}
                className="flex-1 py-2.5 px-4 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('Скачать все')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Примеры использования
export function CooperationTermsExamples() {
  const { t } = useTranslate()

  return (
    <div className="p-8 bg-gray-100 space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        {t('Условия сотрудничества - Компактная версия')}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div>
          <p className="text-sm text-gray-600 mb-2">{t('Light версия')}</p>
          <CooperationTerms variant="light" />
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">{t('Dark версия')}</p>
          <CooperationTerms variant="dark" />
        </div>
      </div>
    </div>
  )
}