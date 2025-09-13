// @/lib/team-purchase/BusinessRules.ts

/**
 * Бизнес-правила для командных закупок
 */
export const TEAM_PURCHASE_RULES = {
  // Финансовые правила
  finance: {
    MIN_PERSONAL_PURCHASE: 300000,      // Минимальная сумма покупки на человека
    DEFAULT_MIN_CONTRIBUTION: 10000,    // Минимальный вклад участника по умолчанию (не используется)
    BONUS_THRESHOLD_2: 1000000,         // Порог для золотого уровня  
    BONUS_THRESHOLD_3: 3000000,         // Порог для платинового уровня
  },
  
  // Правила участников
  participants: {
    MIN_MEMBERS: 1,                     // Минимум участников (может быть 1)
    MAX_MEMBERS: 100,                   // Максимум участников
    ROLES: {
      ORGANIZER: 'organizer',
      MEMBER: 'member'
    }
  },
  
  // Временные правила
  timing: {
    MIN_FORMING_DAYS: 1,                // Минимум дней на формирование
    MAX_FORMING_DAYS: 30,               // Максимум дней на формирование
    PAYMENT_DEADLINE_HOURS: 48,         // Часов на оплату после старта
  },
  
  // Статусы закупки
  statuses: {
    FORMING: 'forming',                 // Формируется (сбор участников)
    ACTIVE: 'active',                   // Активна (участники собирают корзины)
    PURCHASING: 'purchasing',           // Идет оплата
    CONFIRMING: 'confirming',           // Подтверждение оплат
    COMPLETED: 'completed',             // Завершена
    CANCELLED: 'cancelled'              // Отменена
  },
  
  // Статусы участников
  memberStatuses: {
    INVITED: 'invited',                 // Приглашен
    ACCEPTED: 'accepted',               // Принял участие
    PURCHASED: 'purchased',             // Оплатил
    LEFT: 'left',                       // Вышел
    REMOVED: 'removed'                  // Удален организатором
  }
};

/**
 * Проверка возможности оплаты заказа
 * Минимум 300К на человека
 */
export function canCheckout(cartTotal: number): boolean {
  return cartTotal >= TEAM_PURCHASE_RULES.finance.MIN_PERSONAL_PURCHASE;
}

/**
 * Проверка возможности старта закупки
 * Закупка может начаться сразу после создания
 */
export function canStartPurchase(): boolean {
  return true; // Всегда можно начать
}

/**
 * Расчет бонусов по сумме закупки
 */
export function calculateBonuses(totalAmount: number): {
  level: number;
  description: string;
  benefits: string[];
} {
  if (totalAmount >= TEAM_PURCHASE_RULES.finance.BONUS_THRESHOLD_3) {
    return {
      level: 3,
      description: 'Платиновый уровень',
      benefits: [
        'Скидка 25%',
        'Бесплатная доставка',
        'Приоритетное обслуживание',
        'Эксклюзивные подарки',
        'Персональный менеджер'
      ]
    };
  }
  
  if (totalAmount >= TEAM_PURCHASE_RULES.finance.BONUS_THRESHOLD_2) {
    return {
      level: 2,
      description: 'Золотой уровень',
      benefits: [
        'Скидка 25%',
        'Бесплатная доставка',
        'Приоритетное обслуживание',
        'Бонусные товары'
      ]
    };
  }
  
  if (totalAmount >= TEAM_PURCHASE_RULES.finance.BONUS_THRESHOLD_1) {
    return {
      level: 1,
      description: 'Серебряный уровень',
      benefits: [
        'Скидка 25%',
        'Бесплатная доставка',
        'Приоритетное обслуживание'
      ]
    };
  }
  
  return {
    level: 0,
    description: 'Базовый уровень',
    benefits: [
      'Скидка 25%',
      'Бесплатная доставка'
    ]
  };
}

/**
 * Проверка дедлайна
 */
export function isDeadlineExpired(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

/**
 * Расчет дней до дедлайна
 */
export function daysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}