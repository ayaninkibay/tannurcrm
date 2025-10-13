// lib/permissions.ts
import { getRequiredPermissions } from './permissions-config';

/**
 * Проверяет, есть ли у пользователя доступ к странице
 */
export function hasPageAccess(
  userPermissions: string[] | null | undefined,
  pathname: string
): boolean {
  const requiredPermissions = getRequiredPermissions(pathname);
  
  // Если маршрут не требует разрешений - доступ открыт
  if (!requiredPermissions) {
    return true;
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
  userPermissions: string[] | null | undefined,
  permission: string
): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes('all') || userPermissions.includes(permission);
}

/**
 * Фильтрует пункты меню по правам доступа
 */
export function filterMenuByPermissions<T extends { href: string }>(
  menuItems: T[],
  userPermissions: string[] | null | undefined
): T[] {
  return menuItems.filter(item => hasPageAccess(userPermissions, item.href));
}