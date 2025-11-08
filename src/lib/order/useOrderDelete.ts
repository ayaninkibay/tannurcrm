// src/lib/orders/useOrderDelete.ts

'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { orderDeleteService, type DeleteOrdersResult } from './OrderDeleteService';

export interface UseOrderDeleteReturn {
  // State
  isDeleting: boolean;
  deleteProgress: {
    current: number;
    total: number;
  } | null;

  // Actions
  deleteOrders: (
    orderIds: string[],
    options?: {
      skipConfirmation?: boolean;
      onSuccess?: () => void;
      onError?: (error: string) => void;
    }
  ) => Promise<boolean>;

  deleteOrder: (
    orderId: string,
    options?: {
      skipConfirmation?: boolean;
      onSuccess?: () => void;
      onError?: (error: string) => void;
    }
  ) => Promise<boolean>;

  checkCanDelete: (orderIds: string[]) => Promise<boolean>;
}

export const useOrderDelete = (): UseOrderDeleteReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  /**
   * Удалить выбранные заказы
   */
  const deleteOrders = async (
    orderIds: string[],
    options?: {
      skipConfirmation?: boolean;
      onSuccess?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<boolean> => {
    if (!orderIds || orderIds.length === 0) {
      toast.error('Выберите заказы для удаления');
      return false;
    }

    // Получаем статистику
    const stats = await orderDeleteService.getDeleteStats(orderIds);

    // Подтверждение удаления
    if (!options?.skipConfirmation) {
      const confirmMessage = orderIds.length === 1
        ? `Вы уверены, что хотите удалить этот заказ?\n\nБудет удалено позиций: ${stats.itemsCount}`
        : `Вы уверены, что хотите удалить ${orderIds.length} заказов?\n\nБудет удалено позиций: ${stats.itemsCount}\nОбщая сумма: ${stats.totalAmount.toLocaleString('ru-RU')} ₸`;

      if (!confirm(confirmMessage)) {
        return false;
      }
    }

    setIsDeleting(true);
    setDeleteProgress({ current: 0, total: orderIds.length });

    try {
      // Удаляем заказы
      const result = await orderDeleteService.deleteOrders(orderIds);

      if (result.success) {
        toast.success(
          `✅ ${result.message}\nЗаказов: ${result.deleted_orders}, позиций: ${result.deleted_items}`,
          { duration: 4000 }
        );

        // Вызываем callback успеха
        if (options?.onSuccess) {
          options.onSuccess();
        }

        return true;
      } else {
        const errorMsg = result.message || 'Ошибка при удалении заказов';
        toast.error(errorMsg);

        if (options?.onError) {
          options.onError(errorMsg);
        }

        return false;
      }

    } catch (error: any) {
      console.error('❌ Error deleting orders:', error);
      const errorMsg = error.message || 'Ошибка при удалении заказов';
      toast.error(errorMsg);

      if (options?.onError) {
        options.onError(errorMsg);
      }

      return false;
    } finally {
      setIsDeleting(false);
      setDeleteProgress(null);
    }
  };

  /**
   * Удалить один заказ
   */
  const deleteOrder = async (
    orderId: string,
    options?: {
      skipConfirmation?: boolean;
      onSuccess?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<boolean> => {
    return deleteOrders([orderId], options);
  };

  /**
   * Проверить можно ли удалить заказы
   */
  const checkCanDelete = async (orderIds: string[]): Promise<boolean> => {
    const check = await orderDeleteService.canDeleteOrders(orderIds);

    if (check.warnings.length > 0) {
      const proceed = confirm(
        `⚠️ Предупреждения:\n\n${check.warnings.join('\n')}\n\nПродолжить удаление?`
      );
      return proceed;
    }

    return check.canDelete;
  };

  return {
    isDeleting,
    deleteProgress,
    deleteOrders,
    deleteOrder,
    checkCanDelete
  };
};