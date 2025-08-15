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

export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};

export const isOrder = (obj: any): obj is Order => {
  return obj && typeof obj.id === 'string' && Array.isArray(obj.user_id);
};

export const isTeamOrder = (order: Order): order is TeamOrder => {
  return order.user_id.length > 1;
};