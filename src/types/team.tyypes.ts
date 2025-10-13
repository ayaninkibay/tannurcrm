// src/types/team.types.ts

import type { Database } from './supabase'

// ============================================
// БАЗОВЫЕ ТИПЫ ИЗ SUPABASE
// ============================================

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

// ============================================
// СТАТИСТИКА КОМАНДЫ (из SQL функции get_team_stats)
// ============================================

/**
 * Статистика команды из SQL функции get_team_stats
 * Соответствует возвращаемым данным из БД
 */
export interface TeamStatsData {
  // Данные из SQL (bigint преобразуется в number)
  totalMembers: number       // total_members - общее количество участников
  directMembers: number      // direct_members - прямые рефералы
  totalTurnover: number      // total_turnover - общий товарооборот команды
  activeMembersCount: number // active_members - подтвержденные участники
  maxDepth: number           // max_depth - максимальная глубина иерархии
  
  // Вычисляемые поля (добавляются в TypeScript)
  goal: number               // Цель по количеству участников
  remaining: number          // Осталось до цели
}

/**
 * Сырые данные из SQL функции get_team_stats (до преобразования)
 */
export interface TeamStatsRaw {
  total_members: string | number  // bigint из PostgreSQL
  direct_members: string | number
  total_turnover: string | number // numeric из PostgreSQL
  active_members: string | number
  max_depth: number
}

// ============================================
// УЧАСТНИК КОМАНДЫ
// ============================================

/**
 * Участник команды с расширенными данными
 * Используется в TeamTree и других компонентах
 */
export interface TeamMember {
  // Основная информация
  user_id: string
  email: string | null
  full_name: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  profession: string | null
  role: string | null
  
  // Иерархия
  parent_id: string | null
  level: number
  hierarchy_path?: string[]
  
  // Финансовые данные
  personal_turnover: number
  team_turnover: number
  total_turnover: number
  bonus_percent: number
  bonus_amount: number
  
  // Команда
  team_size: number
  direct_referrals_count?: number
  
  // Статус
  status: string | null
  is_confirmed: boolean
  joined_date: string | null
  created_at: string
  
  // Дополнительно
  referral_code: string | null
}

/**
 * Узел дерева команды для визуализации
 */
export interface TeamTreeNode {
  id: string
  name: string
  email: string | null
  avatar_url: string | null
  
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
  
  // Статус
  status: string | null
  is_confirmed: boolean
  joined_date: string | null
}

// ============================================
// ИЕРАРХИЯ КОМАНДЫ (из SQL функции get_full_team_hierarchy)
// ============================================

/**
 * Полная иерархия команды из SQL функции
 */
export interface TeamHierarchyMember {
  id: string
  parent_id: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  profession: string | null
  role: string | null
  is_confirmed: boolean
  referral_code: string | null
  created_at: string
  hierarchy_level: number
  hierarchy_path: string[]
}

// ============================================
// ПРЯМЫЕ РЕФЕРАЛЫ (из SQL функции get_direct_referrals_with_stats)
// ============================================

/**
 * Прямой реферал со статистикой
 */
export interface DirectReferralWithStats {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  profession: string | null
  role: string | null
  is_confirmed: boolean
  created_at: string
  team_size: number
  personal_turnover: number
  total_turnover: number
}

// ============================================
// СТАТИСТИКА ПО УРОВНЯМ (из SQL функции get_team_stats_by_level)
// ============================================

/**
 * Статистика по уровню иерархии
 */
export interface TeamStatsByLevel {
  hierarchy_level: number
  members_count: number
  confirmed_count: number
  total_turnover: number
}

// ============================================
// ПОИСК В КОМАНДЕ (из SQL функции search_in_team)
// ============================================

/**
 * Результат поиска в команде
 */
export interface TeamSearchResult {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  role: string | null
  is_confirmed: boolean
  hierarchy_level: number
}

// ============================================
// ХУКИ - ВОЗВРАЩАЕМЫЕ ТИПЫ
// ============================================

/**
 * Результат хука useTeamStats
 */
export interface UseTeamStatsResult {
  stats: TeamStatsData
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Результат хука useTeamTree
 */
export interface UseTeamTreeResult {
  members: TeamMember[]
  tree: TeamTreeNode | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Результат хука useTeamHierarchy
 */
export interface UseTeamHierarchyResult {
  hierarchy: TeamHierarchyMember[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// ============================================
// ФИЛЬТРЫ И ПАРАМЕТРЫ
// ============================================

/**
 * Фильтры для команды
 */
export interface TeamFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  level?: number
  minTurnover?: number
  maxTurnover?: number
  dateFrom?: string
  dateTo?: string
  role?: string
}

/**
 * Параметры сортировки команды
 */
export interface TeamSortParams {
  field: 'name' | 'turnover' | 'team_size' | 'joined_date' | 'level'
  direction: 'asc' | 'desc'
}

/**
 * Параметры для построения дерева
 */
export interface BuildTreeOptions {
  maxDepth?: number
  includeInactive?: boolean
  expandAll?: boolean
}

// ============================================
// СТАТИСТИКА КОМАНДЫ (РАСШИРЕННАЯ)
// ============================================

/**
 * Детальная статистика команды
 */
export interface TeamStatistics {
  // Общие показатели
  total_members: number
  active_members: number
  inactive_members: number
  
  // Структура
  direct_members: number
  max_depth: number
  average_team_size: number
  
  // Финансы
  total_turnover: number
  average_turnover: number
  top_earners: TeamMember[]
  
  // Динамика
  new_members_this_month: number
  growth_rate: number
  
  // По уровням
  by_level: TeamStatsByLevel[]
}

/**
 * Сравнение команд
 */
export interface TeamComparison {
  period: string
  current: TeamStatistics
  previous: TeamStatistics
  change: {
    members: number
    turnover: number
    percentage: number
  }
}

// ============================================
// ДЕЙСТВИЯ С КОМАНДОЙ
// ============================================

/**
 * Результат добавления участника
 */
export interface AddTeamMemberResult {
  success: boolean
  member?: TeamMember
  error?: string
}

/**
 * Результат обновления участника
 */
export interface UpdateTeamMemberResult {
  success: boolean
  member?: TeamMember
  error?: string
}

/**
 * Результат удаления участника
 */
export interface RemoveTeamMemberResult {
  success: boolean
  affected_members: number
  error?: string
}

// ============================================
// ЭКСПОРТ И ИМПОРТ
// ============================================

/**
 * Данные для экспорта команды
 */
export interface TeamExportData {
  members: TeamMember[]
  stats: TeamStatistics
  exported_at: string
  exported_by: string
}

/**
 * Формат CSV экспорта
 */
export interface TeamCSVRow {
  user_id: string
  email: string
  full_name: string
  phone: string
  level: number
  team_size: number
  personal_turnover: number
  total_turnover: number
  bonus_percent: number
  status: string
  joined_date: string
}

// ============================================
// КОНСТАНТЫ
// ============================================

export const TEAM_CONSTANTS = {
  DEFAULT_GOAL: 1000000,
  MIN_TEAM_SIZE: 0,
  MAX_TREE_DEPTH: 10,
  DEFAULT_PAGE_SIZE: 20
} as const

export const TEAM_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  BLOCKED: 'blocked'
} as const

export type TeamStatus = typeof TEAM_STATUS[keyof typeof TEAM_STATUS]

export const TEAM_ROLES = {
  DEALER: 'dealer',
  ADMIN: 'admin',
  CELEBRITY: 'celebrity',
  USER: 'user',
  FINANCIER: 'financier'
} as const

export type TeamRole = typeof TEAM_ROLES[keyof typeof TEAM_ROLES]

// ============================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С КОМАНДОЙ
// ============================================

/**
 * Опции для рекурсивного обхода дерева
 */
export interface TreeTraversalOptions {
  maxDepth?: number
  filter?: (node: TeamTreeNode) => boolean
  transform?: (node: TeamTreeNode) => TeamTreeNode
}

/**
 * Результат валидации иерархии
 */
export interface HierarchyValidationResult {
  isValid: boolean
  cycles: string[][]
  orphans: string[]
  errors: string[]
}

// ============================================
// ЭКСПОРТ ВСЕХ ТИПОВ
// ============================================

export type {
  Database
}