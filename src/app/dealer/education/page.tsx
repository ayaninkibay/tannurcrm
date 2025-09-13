'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MoreHeaderDE from '@/components/header/MoreHeaderDE';
import { 
  Grid3x3, 
  Bookmark, 
  BookOpen, 
  ArrowRight,
  Play,
  Clock,
  Award,
  TrendingUp,
  Users,
  ShoppingBag,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

export default function EducationContent() {
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');

  // "сырой" ключ -> id
  const categoryIdMap: Record<string, number> = {
    'Знакомство с Tannur': 1,
    'Маркетинговая стратегия': 2
  };

  const getCategoryHref = (rawTitleKey: string) => {
    const id = categoryIdMap[rawTitleKey];
    return id
      ? `/dealer/education/all_courses?id=${id}`
      : `/dealer/education/all_courses?title=${encodeURIComponent(rawTitleKey)}`;
  };

  // используем raw ключи для логики и t(...) для отображения
  const categories: Array<{ titleKey: string; count: number; icon: React.ReactNode }> = [
    { titleKey: 'Знакомство с Tannur', count: 3, icon: <Sparkles className="w-5 h-5" /> },
    { titleKey: 'Маркетинговая стратегия', count: 7, icon: <TrendingUp className="w-5 h-5" /> },
    { titleKey: 'Менеджер по продажам', count: 3, icon: <Users className="w-5 h-5" /> },
    { titleKey: 'Как продавать продукцию?', count: 3, icon: <ShoppingBag className="w-5 h-5" /> }
  ];

  const courses = [
    { id: 1, image: '/icons/edu_1.png', categoryKey: 'Знакомство', title: 'Знакомство с продуктами Tannur', lessons: 8, duration: '2 часа', isNew: true },
    { id: 2, image: '/icons/edu_2.png', categoryKey: 'Маркетинг', title: 'Маркетинговая стратегия 2.0', lessons: 12, duration: '3.5 часа', isPopular: true },
    { id: 3, image: '/icons/edu_3.png', categoryKey: 'Продукты', title: 'Уходовый набор вместе с Інжу Ануарбек', lessons: 6, duration: '1.5 часа' },
    { id: 4, image: '/icons/edu_4.png', categoryKey: 'Практика', title: 'Эффективные продажи в сети', lessons: 10, duration: '4 часа' }
  ];

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderDE title={t('Академия TNBA')} 
      />

      {/* Hero Section */}
      <div className="mt-6 bg-gradient-to-r from-[#D77E6C] to-[#E09080] rounded-2xl p-6 md:p-8 text-white mb-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{t('Развивайте навыки вместе с Tannur')}</h1>
          <p className="text-white/90 text-sm md:text-base">{t('Пройдите обучение и станьте экспертом в продажах косметики')}</p>
          <div className="flex flex-wrap gap-4 md:gap-6 mt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">{t('24 курса')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">{t('120+ часов')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">{t('Сертификаты')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Заголовок и переключатель */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === 'all' ? t('Категории курсов') : t('Сохраненные курсы')}
          </h2>
        </div>

        {/* Переключатель вкладок */}
        <div className="flex bg-white rounded-lg p-1 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'all' ? 'bg-[#D77E6C] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            <span>{t('Все курсы')}</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'saved' ? 'bg-[#D77E6C] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{t('Сохраненные')}</span>
          </button>
        </div>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Категории курсов */}
          <div className="mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  href={getCategoryHref(category.titleKey)}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:border-[#D77E6C]/30 hover:shadow-sm transition-all block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-[#D77E6C]/10 rounded-lg text-[#D77E6C]">
                      {category.icon}
                    </div>
                    <span className="text-lg font-bold text-gray-900">{category.count}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{t(category.titleKey)}</p>
                  <p className="text-xs text-gray-500">{t('программы')}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Заголовок секции */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('Рекомендуемые курсы')}</h2>
            <Link
              href="/dealer/education/all_courses?id=1"
              className="text-[#D77E6C] hover:text-[#C66B5A] text-sm font-medium flex items-center gap-1 transition-colors"
            >
              {t('Все курсы')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Курсы */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/dealer/education/courses?id=${course.id}`}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200 group block"
              >
                {/* Изображение */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Badges */}
                  {course.isNew && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {t('Новинка')}
                    </span>
                  )}
                  {course.isPopular && (
                    <span className="absolute top-3 left-3 bg-[#D77E6C] text-white text-xs px-2 py-1 rounded-full font-medium">
                      {t('Популярное')}
                    </span>
                  )}
                  {/* Play */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-[#D77E6C] ml-1" />
                    </div>
                  </div>
                </div>

                {/* Контент */}
                <div className="p-4">
                  <span className="inline-block text-xs text-[#D77E6C] font-medium mb-2">{t(course.categoryKey)}</span>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[48px]">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{t('{count} уроков').replace('{count}', String(course.lessons))}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                  {/* Псевдо-кнопка */}
                  <div className="w-full bg-gray-100 group-hover:bg-[#D77E6C] text-gray-700 group-hover:text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2">
                    <span>{t('Начать курс')}</span>
                    <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        /* Пустое состояние для сохраненных курсов */
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookMarked className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Нет сохраненных курсов')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('Сохраняйте интересные курсы, чтобы вернуться к ним позже')}</p>
            <button 
              onClick={() => setActiveTab('all')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D77E6C] hover:bg-[#C66B5A] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Grid3x3 className="w-4 h-4" />
              {t('Перейти к курсам')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
