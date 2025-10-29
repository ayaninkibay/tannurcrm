// lib/permissions.ts

import { getRequiredPermissions } from './permissions-config';

/**
 * Проверяет, есть ли у пользователя доступ к странице
 */
export function hasPageAccess(
  userRole: string | null | undefined,
  userPermissions: string[] | null | undefined,
  pathname: string
): boolean {
  const requiredPermissions = getRequiredPermissions(pathname);
  
  // Если маршрут не требует разрешений - доступ открыт
  if (!requiredPermissions) {
    return true;
  }
  
  // 🔥 КРИТИЧНО: Админские разделы только для роли admin
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return false;
  }
  
  // Если у пользователя нет разрешений - доступ закрыт
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  // Проверяем, есть ли хотя бы одно совпадение
  return requiredPermissions.some(required => 
    userPermissions.includes(required)
  );
}

/**
 * Проверяет наличие конкретного разрешения у пользователя
 */
export function hasPermission(
  userRole: string | null | undefined,
  userPermissions: string[] | null | undefined,
  permission: string
): boolean {
  // Только админы могут иметь разрешения
  if (userRole !== 'admin') return false;
  
  if (!userPermissions) return false;
  return userPermissions.includes('all') || userPermissions.includes(permission);
}

/**
 * Фильтрует пункты меню по правам доступа
 */
export function filterMenuByPermissions<T extends { href: string }>(
  menuItems: T[],
  userRole: string | null | undefined,
  userPermissions: string[] | null | undefined
): T[] {
  return menuItems.filter(item => 
    hasPageAccess(userRole, userPermissions, item.href)
  );
}