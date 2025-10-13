// src/types/bonus.types.ts

import type { Database } from './supabase'

// ============================================
// БАЗОВЫЕ ТИПЫ ИЗ SUPABASE
// ============================================

export type BonusLevel = Database['public']['Tables']['bonus_levels']['Row']
export type UserTurnover = Database['public']['Tables']['user_turnover_current']['Row']
export type MonthlyBonus = Database['public']['Tables']['monthly_bonuses']['Row']
export type BonusEvent = Database['public']['Tables']['bonus_events']['Row']
export type BonusEventTarget = Database['public']['Tables']['bonus_event_targets']['Row']

// ============================================
// РАСШИРЕННЫЕ ТИПЫ ДЛЯ UI
// ============================================

/**
 * Статистика бонусов пользователя для текущего месяца
 */
export interface BonusStats {
  // Товарооборот
  personalTurnover: number
  teamTurnover: number
  totalTurnover: number
  
  // Бонусы
  bonusPercent: number
  expectedBonus: number
  personalBonus: number
  differentialBonus: number
  totalBonus: number
  
  // Уровни
  currentLevel: BonusLevel | null
  nextLevel: BonusLevel | null
  amountToNextLevel: number
  progressToNextLevel: number // в процентах
}

/**
 * Статистика команды (из SQL функции get_team_stats)
 */
export interface TeamStatsData {
  totalMembers: number       // total_members из SQL
  directMembers: number      // direct_members из SQL
  totalTurnover: number      // total_turnover из SQL
  activeMembersCount: number // active_members из SQL (подтвержденные)
  maxDepth: number           // max_depth из SQL (глубина иерархии)
  
  // Вычисляемые поля (добавляем в TypeScript)
  goal: number
  remaining: number
}

/**
 * Полные данные для дашборда пользователя
 * Возвращается методом getUserDashboardData()
 */
export interface UserDashboardData {
  // Основные данные
  turnover: UserTurnover | null
  bonusLevel: BonusLevel | null
  nextLevel: BonusLevel | null
  
  // Команда
  teamStats: TeamStatsData
  
  // Бонусы за месяц
  monthlyBonuses: MonthlyBonus[]
  
  // Вычисленная статистика
  bonusStats: BonusStats
}

/**
 * Детальная информация о пользователе для админки
 */
export interface UserBonusDetails {
  user_info: {
    id: string
    email: string | null
    full_name: string
    phone: string | null
    avatar_url: string | null
    role: string | null
    joined_date: string
  }
  
  current_turnover: UserTurnover | null
  bonus_level: BonusLevel | null
  monthly_bonuses: MonthlyBonus[]
  team_structure: TeamMember[]
  sponsor_chain: SponsorChainMember[]
}

/**
 * Участник спонсорской цепочки
 */
export interface SponsorChainMember {
  user_id: string
  email: string
  full_name: string
  level_num: number
  parent_id: string | null
}

/**
 * Участник команды с расширенными данными
 */
export interface TeamMember {
  user_id: string
  email: string | null
  full_name: string
  phone: string | null
  avatar_url: string | null
  parent_id: string | null
  level: number
  
  // Финансовые данные
  personal_turnover: number
  team_turnover: number
  total_turnover: number
  bonus_percent: number
  bonus_amount: number
  
  // Команда
  team_size: number
  
  // Статус
  status: string | null
  joined_date: string | null
}

/**
 * Узел дерева команды для визуализации
 */
export interface TeamTreeNode {
  id: string
  name: string
  email: string | null
  
  // Финансы
  turnover: number
  personal_turnover: number
  team_turnover: number
  total_turnover: number
  bonus_percent: number
  bonus_amount: number
  
  // Структура
  children: TeamTreeNode[]
  expanded: boolean
  level: number
}

/**
 * Статистика бонусов (общая)
 */
export interface BonusStatistics {
  current_month: {
    personal_turnover: number
    team_turnover: number
    total_turnover: number
    expected_bonus: number
    bonus_percent: number
    current_level: BonusLevel | null
    next_level: BonusLevel | null
    amount_to_next_level: number
  }
  
  history: {
    total_earned: number
    total_paid: number
    pending_amount: number
    months_active: number
    average_monthly_bonus: number
  }
  
  team: {
    total_members: number
    active_members: number
    total_team_turnover: number
    direct_members: number
    levels_deep: number
    top_performers: TeamMember[]
  }
}

/**
 * История заказов
 */
export interface OrderHistory {
  id: string
  order_number: string | null
  total_amount: number | null
  order_status: Database['public']['Enums']['order_status'] | null
  payment_status: Database['public']['Enums']['payment_status'] | null
  created_at: string
  items_count: number
}

/**
 * История транзакций
 */
export interface TransactionHistory {
  id: string
  amount: number
  operation: Database['public']['Enums']['transaction_operation']
  transaction_type: Database['public']['Enums']['transaction_type']
  status: Database['public']['Enums']['transaction_status'] | null
  notes: string | null
  source_type: string | null
  source_id: string | null
  source_details: any
  created_at: string | null
  confirmed_at: string | null
  cancelled_at: string | null
}

/**
 * Иерархия дилеров с бонусами
 */
export interface DealerHierarchy {
  user_id: string
  parent_id: string | null
  email: string
  full_name: string
  level: number
  
  // Товарооборот
  personal_turnover: number
  team_turnover: number
  total_turnover: number
  
  // Бонусы
  bonus_percent: number
  personal_bonus: number
  differential_bonus: number
  total_bonus: number
  
  // Статистика
  month_orders: number
}

/**
 * Предпросмотр расчета бонусов
 */
export interface BonusCalculationPreview {
  month: string
  total_users: number
  total_bonuses: number
  
  details: Array<{
    user_id: string
    email: string
    full_name: string
    personal_turnover: number
    team_turnover: number
    total_turnover: number
    bonus_percent: number
    personal_bonus: number
    differential_bonus: number
    total_bonus: number
  }>
}

/**
 * Статус месяца
 */
export interface MonthStatus {
  isCurrentMonth: boolean
  isHistorical: boolean
  isFuture: boolean
  isFinalized: boolean
  isPaid: boolean
  canCalculate: boolean
  canFinalize: boolean
  hasData: boolean
  dataCount: number
}

/**
 * Здоровье системы
 */
export interface SystemHealth {
  hasIssues: boolean
  issuesCount: number
  canProceed: boolean
  message: string
}

/**
 * Результат аудита товарооборота
 */
export interface TurnoverAuditResult {
  user_id: string
  email: string
  full_name: string
  check_type: string
  stored_value: number
  calculated_value: number
  difference: number
  is_correct: boolean
}

/**
 * Результат исправления данных
 */
export interface FixResult {
  user_id: string
  old_value: number
  new_value: number
  difference: number
  fixed: boolean
}

/**
 * Результат финализации месяца
 */
export interface MonthFinalizationResult {
  month_finalized: string
  users_count: number
  total_bonuses: number
  status: string
}

/**
 * Данные о товарообороте за месяц
 */
export interface MonthTurnoverData {
  data: UserTurnover[]
  source: 'current' | 'history'
  status?: string
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ТИПЫ
// ============================================

/**
 * Фильтры для поиска
 */
export interface BonusFilters {
  month?: string
  userId?: string
  minAmount?: number
  maxAmount?: number
  bonusType?: 'personal' | 'differential' | 'referral_subscription'
  status?: 'pending' | 'calculated' | 'paid'
}

/**
 * Параметры сортировки
 */
export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

/**
 * Пагинация
 */
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

/**
 * Результат с пагинацией
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ============================================
// ТИПЫ ДЛЯ ФОРМ
// ============================================

/**
 * Форма создания/редактирования уровня бонусов
 */
export interface BonusLevelFormData {
  name: string
  description: string | null
  min_amount: number
  max_amount: number | null
  bonus_percent: number
  color: string | null
  icon: string | null
  sort_order: number | null
  is_active: boolean
}

/**
 * Форма ручного начисления бонусов
 */
export interface ManualBonusFormData {
  user_id: string
  amount: number
  bonus_type: string
  notes: string | null
  month_period: string
}

// ============================================
// КОНСТАНТЫ
// ============================================

export const BONUS_TYPES = {
  PERSONAL: 'personal',
  DIFFERENTIAL: 'differential',
  REFERRAL_SUBSCRIPTION: 'referral_subscription',
  TEAM_PURCHASE: 'team_purchase_bonus',
  ORDER: 'order_bonus'
} as const

export type BonusType = typeof BONUS_TYPES[keyof typeof BONUS_TYPES]

export const BONUS_STATUS = {
  PENDING: 'pending',
  CALCULATED: 'calculated',
  PAID: 'paid',
  CANCELLED: 'cancelled'
} as const

export type BonusStatus = typeof BONUS_STATUS[keyof typeof BONUS_STATUS]

// ============================================
// ЭКСПОРТ ВСЕХ ТИПОВ
// ============================================

export type {
  Database
}