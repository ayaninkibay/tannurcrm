// lib/permissions-config.ts

/**
 * Маппинг путей страниц и требуемых разрешений
 * Если у пользователя есть ХОТЯ БЫ ОДНО из указанных разрешений - доступ разрешен
 */
export const PAGE_PERMISSIONS: Record<string, string[]> = {

    // Общие
  '/admin/profile': ['all', 'warehouse', 'orders', 'finance'],
  '/admin/dashboard': ['all', 'warehouse', 'orders', 'finance'],


  // Warehouse (склад)
  '/admin/warehouse': ['all', 'warehouse'],
  '/admin/warehouse/warehouse_control': ['all', 'warehouse'],
  '/admin/warehouse/stock': ['all', 'warehouse'],
  '/admin/warehouse/warehouse_control/product_view': ['all', 'warehouse'],
  '/admin/warehouse/gifts': ['all', 'warehouse'],
  '/admin/warehouse/warehouse_control/create_product': ['all'],
  '/admin/warehouse/create_gift': ['all'],
  '/admin/warehouse/create_distributor': ['all'],
  '/admin/warehouse': ['all', 'warehouse'],
  
  // Orders (заказы)
  '/admin/store': ['all', 'orders'],
  '/admin/store/view_order/[id]': ['all', 'orders'],
  
  // Finance (финансы)
  '/admin/finance': ['all', 'finance'],
  '/admin/finance/subscription/[id]': ['all', 'finance'],
  '/admin/finance/transactions': ['all', 'finance'],
  '/admin/finance/transactions/[id]': ['all', 'finance'],
  '/admin/finance/bonuses': ['all', 'finance'],
  '/admin/finance/bonuses/user/[id]': ['all', 'finance'],
  '/admin/finance/bonuses/audit': ['all', 'finance'],
  
  // Общие админские (только 'all')
  '/admin/dashboard/create_bonus_event': ['all'],
  '/admin/dashboard/create_event': ['all'],
  '/admin/dashboard/events/[id]': ['all'],

  // Академия (только 'all')
  '/admin/tnba': ['all'],
  '/admin/tnba/course': ['all'],
  '/admin/tnba/create_cours': ['all'],
  '/admin/tnba/create_cours/create_lesson': ['all'],
  '/admin/tnba/documents': ['all'],

  // Команда (только 'all')
  '/admin/teamcontent': ['all'],
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