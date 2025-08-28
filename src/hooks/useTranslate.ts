import { useState, useEffect } from 'react';

// Кеш для уже загруженных переводов
const translationCache: Record<string, Record<string, string>> = {};

export function useTranslate() {
  // Состояние текущего языка
  const [language, setLanguage] = useState('ru');
  
  // Состояние переводов для текущего языка
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Функция загрузки переводов
  const loadTranslations = async (lang: string) => {
    // Сначала проверяем - может переводы уже загружены?
    if (translationCache[lang]) {
      setTranslations(translationCache[lang]);
      return;
    }

    try {
      // Загружаем файл с сервера
      const response = await fetch(`/translations/${lang}.json`);
      const data = await response.json();
      
      // Сохраняем в кеш, чтобы не загружать повторно
      translationCache[lang] = data;
      
      // Обновляем состояние
      setTranslations(data);
    } catch (error) {
      console.error('Ошибка загрузки переводов:', error);
    }
  };

  // При первой загрузке компонента
  useEffect(() => {
    // Пробуем достать сохраненный язык из браузера
    const savedLanguage = localStorage.getItem('language') || 'ru';
    
    setLanguage(savedLanguage);
    loadTranslations(savedLanguage);
  }, []);

  // Функция смены языка
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang); // Сохраняем в браузер
    loadTranslations(lang); // Загружаем переводы
  };

  // Функция перевода строки
  const t = (text: string): string => {
    return translations[text] || text; // Если перевод не найден - возвращаем оригинал
  };

  return { t, language, changeLanguage };
}