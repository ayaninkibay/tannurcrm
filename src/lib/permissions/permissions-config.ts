// lib/permissions-config.ts

/**
 * Маппинг путей страниц и требуемых разрешений
 * Если у пользователя есть ХОТЯ БЫ ОДНО из указанных разрешений - доступ разрешен
 */
export const PAGE_PERMISSIONS: Record<string, string[]> = {
  // Warehouse (склад)
  '/admin/warehouse': ['all', 'warehouse'],
  '/admin/products': ['all', 'warehouse'],
  '/admin/stock': ['all', 'warehouse'],
  
  // Orders (заказы)
  '/admin/orders': ['all', 'orders'],
  '/admin/gifts': ['all', 'orders'],
  
  // Finance (финансы)
  '/admin/finance': ['all', 'finance'],
  '/admin/finance/withdrawals': ['all', 'finance'],
  '/admin/finance/transactions': ['all', 'finance'],
  '/admin/finance/bonuses': ['all', 'finance'],
  
  // Общие админские (только 'all')
  '/admin/users': ['all'],
  '/admin/dashboard': ['all'],
  '/admin/dealers': ['all'],
  '/admin/events': ['all'],
  '/admin/courses': ['all'],
  '/admin/settings': ['all'],
} as const;

/**
 * Типы разрешений
 */
export type Permission = 'all' | 'warehouse' | 'orders' | 'finance';

/**
 * Проверяет, начинается ли путь с защищенного префикса
 */
export function isProtectedAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/**
 * Получает список требуемых разрешений для конкретного пути
 * Поддерживает вложенные пути (например /admin/finance/withdrawals)
 */
export function getRequiredPermissions(pathname: string): string[] | null {
  // Точное совпадение
  if (PAGE_PERMISSIONS[pathname]) {
    return PAGE_PERMISSIONS[pathname];
  }
  
  // Ищем совпадение по началу пути (для вложенных страниц)
  // Например: /admin/finance/withdrawals/123 -> найдет /admin/finance/withdrawals
  const matchingPath = Object.keys(PAGE_PERMISSIONS).find(path => 
    pathname.startsWith(path + '/')
  );
  
  if (matchingPath) {
    return PAGE_PERMISSIONS[matchingPath];
  }
  
  // Если путь админский, но не в списке - по умолчанию требуем 'all'
  if (isProtectedAdminRoute(pathname)) {
    return ['all'];
  }
  
  return null; // Не защищенный маршрут
}