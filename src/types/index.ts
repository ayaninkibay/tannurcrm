// types/index.ts

// ========================================
// ЭКСПОРТ ВСЕХ ТИПОВ
// ========================================

// Автогенерированные типы (если нужны)
export type { Database } from './supabase';

// Все кастомные типы
export * from './custom.types';

// Все константы
export * from './constants';

// ========================================
// УТИЛИТЫ ДЛЯ ТИПОВ
// ========================================

// Получить элемент массива
export type ArrayElement<ArrayType extends readonly unknown[]> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// Сделать поля опциональными
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Сделать поля обязательными
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Тип или null
export type Nullable<T> = T | null;

// Тип или undefined
export type Maybe<T> = T | undefined;

// ========================================
// TYPE GUARDS (проверки типов)
// ========================================
// Note: Type guards are defined in custom.types.ts and exported via export *