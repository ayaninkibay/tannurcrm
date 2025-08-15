/**
 * Бизнес-правила для командных закупок
 * Упрощенная версия без лишних ограничений
 */

export const TEAM_PURCHASE_RULES = {
  // ==========================================
  // ОСНОВНЫЕ ПРАВИЛА
  // ==========================================
  
  finance: {
    // Единственное ограничение - минимальная сумма для старта
    MIN_TOTAL_AMOUNT: 300000, // 300,000 ₸ - минимум для начала закупки
    
    // Минимальный вклад участника (по желанию организатора)
    DEFAULT_MIN_CONTRIBUTION: 300000, // 10,000 ₸ (может быть изменено)
  },

  // ==========================================
  // УЧАСТНИКИ
  // ==========================================
  
  participants: {
    // Минимум участников для старта (включая организатора)
    MIN_MEMBERS: 2, // Минимум 2 человека
    
    // Без максимальных ограничений
    MAX_MEMBERS: null, // Нет лимита
  },

  // ==========================================
  // СТАТУСЫ ЗАКУПКИ
  // ==========================================
  
  statuses: {
    // Статусы закупки
    PURCHASE_STATUSES: {
      FORMING: 'forming',         // Сбор участников
      ACTIVE: 'active',           // Выбор товаров
      PURCHASING: 'purchasing',   // Оплата
      CONFIRMING: 'confirming',   // Подтверждение
      COMPLETED: 'completed',     // Завершена
      CANCELLED: 'cancelled',     // Отменена
    },
    
    // Статусы участника
    MEMBER_STATUSES: {
      ACCEPTED: 'accepted',       // Участвует
      PURCHASED: 'purchased',     // Оплатил
      LEFT: 'left',              // Вышел
      REMOVED: 'removed',        // Удален организатором
    },
  },

  // ==========================================
  // БОНУСНАЯ СИСТЕМА (стандартная)
  // ==========================================
  
  bonuses: {
    // Личные бонусы по уровням дилера
    personalLevels: [
      { level: 1, percent: 0.05 },   // 5%
      { level: 2, percent: 0.07 },   // 7%
      { level: 3, percent: 0.10 },   // 10%
      { level: 4, percent: 0.15 },   // 15%
      { level: 5, percent: 0.20 },   // 20%
    ],
  },
};

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

/**
 * Проверить возможность старта закупки
 */
export function canStartPurchase(
  collectedAmount: number, 
  membersCount: number
): boolean {
  return (
    collectedAmount >= TEAM_PURCHASE_RULES.finance.MIN_TOTAL_AMOUNT &&
    membersCount >= TEAM_PURCHASE_RULES.participants.MIN_MEMBERS
  );
}

/**
 * Валидация суммы вклада
 */
export function validateContribution(
  amount: number,
  minContribution: number
): {
  valid: boolean;
  message?: string;
} {
  if (amount < minContribution) {
    return {
      valid: false,
      message: `Минимальный вклад: ${minContribution.toLocaleString('ru-RU')} ₸`
    };
  }
  
  return { valid: true };
}

/**
 * Получить следующий доступный статус
 */
export function getNextStatus(currentStatus: string): string | null {
  const { PURCHASE_STATUSES } = TEAM_PURCHASE_RULES.statuses;
  
  switch (currentStatus) {
    case PURCHASE_STATUSES.FORMING:
      return PURCHASE_STATUSES.ACTIVE;
    case PURCHASE_STATUSES.ACTIVE:
      return PURCHASE_STATUSES.PURCHASING;
    case PURCHASE_STATUSES.PURCHASING:
      return PURCHASE_STATUSES.CONFIRMING;
    case PURCHASE_STATUSES.CONFIRMING:
      return PURCHASE_STATUSES.COMPLETED;
    default:
      return null;
  }
}