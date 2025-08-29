// src/hooks/useTranslate.ts
'use client';

import { useMemo, useSyncExternalStore } from 'react';

export type Lang = 'ru' | 'kz' | 'cn';
type Dict = Record<string, string>;

const CACHE: Record<Lang, Dict> = { ru: {}, kz: {}, cn: {} };
const STORAGE_KEY = 'language';

// --- Глобальное состояние (общее для всех компонентов) ---
let currentLanguage: Lang = 'ru';
let currentTranslations: Dict = {};
let initialized = false;

// Стабильный снапшот (одна и та же ссылка между обновлениями)
type Snapshot = { language: Lang; translations: Dict };
let snapshot: Snapshot = { language: currentLanguage, translations: currentTranslations };

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const notify = () => listeners.forEach((l) => l());
const getSnapshot = () => snapshot;

function updateSnapshot() {
  snapshot = { language: currentLanguage, translations: currentTranslations };
}

async function loadTranslations(lang: Lang) {
  if (Object.keys(CACHE[lang] || {}).length) {
    currentTranslations = CACHE[lang];
    updateSnapshot();
    notify();
    return;
  }
  try {
    const res = await fetch(`/translations/${lang}.json`, { cache: 'no-cache' });
    const data = (await res.json()) as Dict;
    CACHE[lang] = data;
    currentTranslations = data;
    updateSnapshot();
    notify();
  } catch (e) {
    console.error('Ошибка загрузки переводов:', e);
  }
}

function setLanguage(lang: Lang) {
  currentLanguage = lang;
  updateSnapshot();
}

async function initOnce() {
  if (initialized) return;
  initialized = true;

  if (typeof window !== 'undefined') {
    const saved = (localStorage.getItem(STORAGE_KEY) as Lang) || 'ru';
    setLanguage(saved);
    await loadTranslations(saved);

    // синхронизация между вкладками
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newLang = e.newValue as Lang;
        if (newLang !== currentLanguage) {
          setLanguage(newLang);
          void loadTranslations(newLang);
        }
      }
    });
  }
}

export function useTranslate() {
  initOnce();

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const changeLanguage = (lang: Lang) => {
    if (lang === currentLanguage) return;
    localStorage.setItem(STORAGE_KEY, lang);
    // моментально переключаем язык (с прежним словарём) => мгновенный ререндер
    setLanguage(lang);
    notify();
    // загружаем словарь и уведомляем ещё раз, когда будет готов
    void loadTranslations(lang);
  };

  const t = useMemo(() => {
    const dict = state.translations;
    return (key: string) => dict[key] ?? key; // ключ — source of truth
  }, [state.translations]);

  return { t, language: state.language, changeLanguage };
}
