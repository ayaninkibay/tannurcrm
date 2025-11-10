// types/custom.types.ts

import type { Database } from './supabase';

// ========================================
// ВАШИ СУЩЕСТВУЮЩИЕ ТИПЫ
// ========================================

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'refunded'
  | 'processing';

export type OrderStatus = 
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type BonusPayoutStatus = 
  | 'pending_payment'
  | 'processing'
  | 'assembled'
  | 'paid';

export type UserRole = 
  | 'admin'
  | 'celebrity'
  | 'dealer'
  | 'user';

export type UserStatus = 
  | 'active'
  | 'inactive'
  | 'blocked';

// ========================================
// БАЗОВЫЕ ИНТЕРФЕЙСЫ
// ========================================

export interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  user_id: string;  
  paid_at?: string;
  status: OrderStatus;
  order_number: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  delivery_address?: string;
  delivery_date?: string;
  notes?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  created_at: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  volume?: number;
  user_id?: string;  // Массив участников для командных заказов
}

// ========================================
// ПОЛЬЗОВАТЕЛИ
// ========================================

export interface User {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  is_confirmed: boolean;
  
  // Бонусная система
  personal_level: number;
  personal_turnover: number;
  temp_bonus_percent?: number;
  temp_bonus_until?: string;
  
  // Иерархия
  parent_id?: string;
  star_id?: string;
  
  // Дополнительно
  region?: string;
  instagram?: string;
  avatar_url?: string;
  referral_code?: string;
  
  // Вычисляемые поля
  full_name?: string;
  effective_percent?: number;
}

// ========================================
// КОМАНДНЫЕ ЗАКАЗЫ (используем существующие таблицы)
// ========================================

// Расширенный тип для командного заказа
export interface TeamOrder extends Order {
  initiator_id: string;              // user_id[0] - инициатор
  team_member_ids: string[];         // user_id[1:] - остальные участники
  team_members?: User[];             // Загруженные данные участников
  team_relations?: TeamRelation[];   // Связи из team_relations
  bonus_distribution?: BonusPayout[]; // Распределение бонусов
  
  // Дополнительные поля для командных закупок
  is_team_purchase?: boolean;        // Флаг командной закупки
  team_discount_percent?: number;    // Процент скидки для команды
  min_participants?: number;         // Минимум участников
  deadline?: string;                 // Дедлайн для присоединения
}

// Командные связи (существующая таблица team_relations)
export interface TeamRelation {
  id: string;
  created_at: string;
  order_id: string;                  // К какому заказу
  user_id: string;                   // Участник
  parent_id?: string;                // Кто привел
  level: number;                     // Уровень в иерархии (0,1,2...)
  path?: string[];                   // Путь от инициатора
  
  // Финансы
  contribution_amount?: number;      // Вклад участника в командный заказ
  personal_bonus_percent?: number;   // % бонуса на момент заказа
  personal_bonus_amount?: number;    // Личный бонус
  parent_bonus_amount?: number;      // Бонус для parent
  
  joined_at?: string;                // Когда присоединился к заказу
  
  // Дополнительно для командных закупок
  contribution_status?: 'pending' | 'confirmed' | 'paid'; // Статус вклада
  target_amount?: number;            // Целевая сумма участника
}

// Представление командной закупки (для UI)
export interface TeamPurchaseView {
  order: TeamOrder;                  // Основной заказ
  relations: TeamRelation[];         // Все связи участников
  initiator: User;                   // Организатор
  participants: User[];              // Все участники
  orderItems: OrderItem[];           // Товары в заказе
  products: Product[];               // Данные о продуктах
  totalContributions: number;        // Общая сумма вкладов
  participantsWithRelations: {      // Участники с их связями
    user: User;
    relation: TeamRelation;
  }[];
}

// ========================================
// ПРОДУКТЫ И СКЛАД
// ========================================

export interface Product {
  id: string;
  created_at: string;
  updated_at?: string;
  name?: string;
  description?: string;
  price?: number;
  price_dealer?: number;
  image_url?: string;
  gallery?: string[];
  is_active?: boolean;
  compound?: string;
  video_instr?: string;
  stock?: number;
  category?: string;
  flagman?: boolean;
}

export interface StockMovement {
  id: string;
  created_at: string;
  product_id: string;
  change: number;
  reason: string;
  created_by: string;
  source: string;
  order_id?: string;
  notes?: string;
  previous_stock?: number;
  new_stock?: number;
  updated_at?: string;
}

// ========================================
// БОНУСНАЯ СИСТЕМА
// ========================================

export interface BonusLevel {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;                      // "Рубин", "Сапфир", "Бриллиант"
  min_amount: number;
  max_amount?: number;
  bonus_percent: number;
  color: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface BonusPayout {
  id: string;
  created_at: string;
  user_id: string;
  order_id: string[];                // Массив заказов
  reference_user_id?: string;        // От кого пришел бонус
  calculation_base: number;
  amount: number;
  type: 'personal' | 'team_difference' | 'referral';
  status: BonusPayoutStatus;
  note?: string;
  paid_at?: string;
}

export interface BonusStatistics {
  total_earned: number;
  pending_bonuses: number;
  paid_bonuses: number;
  team_bonuses: number;
  personal_bonuses: number;
  current_month_bonuses: number;
}

export interface BonusLevelInfo {
  level_id: string;
  level_name: string;
  bonus_percent: number;
  color: string;
  next_level_amount?: number;
  next_level_name?: string;
  next_level_percent?: number;
  progress_percent?: number;
}

// ========================================
// КОРЗИНА
// ========================================

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'ordered' | 'abandoned';
  promo_code?: string;
  promo_discount?: number;
  delivery_method: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_cost?: number;
  notes?: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product?: Product;                 // Связанный продукт
  quantity: number;
  created_at: string;
  updated_at?: string;
}

// Представление для UI
export interface CartItemView extends CartItem {
  name: string;
  image: string;
  price: number;
  price_dealer: number;
  stock: number;
  category: string;
  is_gift?: boolean;
  promotion_id?: string | null;
}

// ========================================
// ПРОМОКОДЫ
// ========================================

export interface PromoCode {
  id: string;
  created_at: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  valid_until?: string;
  max_uses?: number;
  current_uses: number;
  min_order_amount?: number;         // Минимальная сумма заказа
  for_new_users_only?: boolean;      // Только для новых пользователей
}

// ========================================
// СТАТИСТИКА
// ========================================

export interface TeamStatistics {
  team_size: number;
  total_turnover: number;
  active_members: number;
  new_members_this_month: number;
  total_bonuses_paid: number;
  active_team_purchases: number;     // Активные командные закупки
  completed_team_purchases: number;  // Завершенные командные закупки
}

export interface DealerDashboard {
  personal_stats: {
    current_level: number;
    current_level_name: string;
    personal_turnover: number;
    current_month_sales: number;
    pending_bonuses: number;
    paid_bonuses: number;
  };
  team_stats: TeamStatistics;
  recent_orders: Order[];
  active_team_purchases: TeamOrder[];
}

// ========================================
// ТИПЫ ДЛЯ ФОРМ
// ========================================

// Создание обычного заказа
export interface CreateOrderInput {
  products: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  delivery_address?: string;
  delivery_method: 'pickup' | 'delivery';
  promo_code?: string;
  notes?: string;
}

// Создание командного заказа
export interface CreateTeamOrderInput {
  title: string;                     // Название закупки
  participants: {
    user_id: string;
    target_amount: number;           // Целевая сумма участника
  }[];
  products: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  target_amount: number;              // Общая целевая сумма
  min_amount: number;                 // Минимальная сумма для начала
  deadline: string;                   // Дедлайн для присоединения
  team_discount_percent?: number;     // Процент скидки для команды
  delivery_address?: string;
  notes?: string;
}

// Присоединение к командному заказу
export interface JoinTeamOrderInput {
  order_id: string;
  contribution_amount: number;        // Сумма вклада
  target_amount: number;              // Целевая сумма участника
}

// Обновление вклада в командный заказ
export interface UpdateContributionInput {
  order_id: string;
  user_id: string;
  new_amount: number;
}

// Создание товара
export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  price_dealer: number;
  image_url?: string;
  gallery?: string[];
  is_active?: boolean;
  compound?: string;
  video_instr?: string;
  stock?: number;
  category?: string;
  flagman?: boolean;
}

// Добавление в корзину
export interface AddToCartInput {
  product_id: string;
  quantity: number;
}

// ========================================
// ТИПЫ ДЛЯ API
// ========================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ========================================
// ТИПЫ ИЗ БАЗЫ (алиасы)
// ========================================

export type DbTables = Database['public']['Tables'];
export type DbEnums = Database['public']['Enums'];
export type DbFunctions = Database['public']['Functions'];

// Алиасы для таблиц
export type DbUser = DbTables['users']['Row'];
export type DbOrder = DbTables['orders']['Row'];
export type DbProduct = DbTables['products']['Row'];
export type DbOrderItem = DbTables['order_items']['Row'];
export type DbCart = DbTables['carts']['Row'];
export type DbCartItem = DbTables['cart_items']['Row'];

// ========================================
// УТИЛИТЫ ДЛЯ ТИПОВ
// ========================================

// Проверка является ли заказ командным
export const isTeamOrder = (order: Order): order is TeamOrder => {
  return Array.isArray(order.user_id) && order.user_id.length > 1;
};

// Проверка роли пользователя
export const isDealer = (user: User): boolean => {
  return user.role === 'dealer';
};

export const isAdmin = (user: User): boolean => {
  return user.role === 'admin';
};

// Расчет эффективного процента бонуса
export const getEffectiveBonusPercent = (user: User): number => {
  if (user.temp_bonus_until && new Date(user.temp_bonus_until) > new Date()) {
    return user.temp_bonus_percent || user.personal_level;
  }
  return user.personal_level;
};

// ==========================================
// КОМАНДНЫЕ ЗАКУПКИ
// ==========================================

export interface TeamPurchase {
  id: string;
  created_at: string;
  updated_at: string;
  initiator_id: string;
  title: string;
  description?: string;
  invite_code: string;
  target_amount: number;
  min_contribution: number;
  collected_amount: number;
  paid_amount: number;
  deadline?: string;
  started_at?: string;
  completed_at?: string;
  status: TeamPurchaseStatus;
  max_members?: number;
  auto_start?: boolean;
  allow_partial?: boolean;
  notes?: string;
  cancellation_reason?: string;
  manager_notes?: string;
}

export type TeamPurchaseStatus = 
  | 'forming'      // Формируется
  | 'active'       // Активна
  | 'purchasing'   // Идет оплата
  | 'confirming'   // Подтверждение
  | 'completed'    // Завершена
  | 'cancelled';   // Отменена

export interface TeamPurchaseMember {
  id: string;
  created_at: string;
  updated_at: string;
  team_purchase_id: string;
  user_id: string;
  invited_by?: string;
  status: TeamMemberStatus;
  contribution_target: number;
  contribution_actual: number;
  cart_total: number;
  joined_at?: string;
  left_at?: string;
  purchased_at?: string;
  role: TeamMemberRole;
}

export type TeamMemberStatus = 
  | 'invited'      // Приглашен
  | 'accepted'     // Принял
  | 'active'       // Активный
  | 'shopping'     // Выбирает товары
  | 'purchased'    // Оплатил
  | 'left'         // Вышел
  | 'removed';     // Удален

export type TeamMemberRole = 'organizer' | 'co_organizer' | 'member';

export interface TeamPurchaseCart {
  id: string;
  created_at: string;
  updated_at: string;
  team_purchase_id: string;
  member_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  status: 'active' | 'ordered' | 'removed';
  product?: Product; // Для JOIN
}

export interface TeamPurchaseOrder {
  id: string;
  created_at: string;
  team_purchase_id: string;
  member_id: string;
  order_id: string;
  user_id: string;
  order_amount: number;
  payment_status?: string;
}

// Расширенные типы для отображения
export interface TeamPurchaseView {
  purchase: TeamPurchase;
  initiator: User;
  members: TeamPurchaseMemberView[];
  totalMembers: number;
  totalPaid: number;
  progress: number;
  daysLeft: number;
  canStart: boolean;
  canComplete: boolean;
}

export interface TeamPurchaseMemberView {
  member: TeamPurchaseMember;
  user: User;
  cartItems: TeamPurchaseCart[];
  order?: Order;
  isOrganizer: boolean;
  hasPaid: boolean;
}

export interface TeamPurchaseStats {
  totalPurchases: number;
  activePurchases: number;
  completedPurchases: number;
  totalSaved: number;
  totalEarned: number;
  teamSize: number;
}


// ========================================
// СОБЫТИЯ (EVENTS)
// ========================================

export interface Event {
  id: string;
  created_at: string;
  updated_at?: string;
  
  // Основная информация
  title: string;
  description?: string;
  short_description?: string;
  
  // Медиа
  image_url?: string;
  banner_url?: string;
  gallery?: string[];
  
  // Период
  start_date: string;
  end_date: string;
  
  // Статус
  status: 'draft' | 'published' | 'archived';
  
  // Содержание
  goals?: string[];
  rewards?: string[];
  conditions?: string[];
  
  // Визуал
  badge_color?: string;
  badge_icon?: string;
  
  // Сортировка
  priority?: number;
  is_featured?: boolean;
  
  // Другое
  tags?: string[];
  created_by?: string;
  
  // Вычисляемые поля (из функции)
  event_status?: 'upcoming' | 'active' | 'past';
  days_until?: number;
  days_remaining?: number;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  banner_url?: string;
  gallery?: string[];
  start_date: string;
  end_date: string;
  goals?: string[];
  rewards?: string[];
  conditions?: string[];
  badge_color?: string;
  badge_icon?: string;
  priority?: number;
  is_featured?: boolean;
  tags?: string[];
  status?: 'draft' | 'published';
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}


// ========================================
// АКАДЕМИЯ / КУРСЫ
// ========================================

export interface Course {
  id: string;
  created_at: string;
  updated_at?: string;
  
  // Основная информация
  title: string;
  category: string;
  language: string;
  short_description?: string;
  full_description?: string;
  
  // Медиа
  cover_image?: string;
  
  // Статус и мета
  is_published: boolean;
  author_id?: string;
  
  // Дополнительные поля
  duration_hours?: number;
  lessons_count?: number;
  difficulty_level?: string;
  slug?: string;
  tags?: string[];
  views_count?: number;
  order_index?: number;
  
  // Связанные данные (через JOIN)
  author?: User;
}

export interface CourseLesson {
  id: string;
  created_at: string;
  updated_at?: string;
  
  // Связь с курсом
  course_id: string;
  
  // Основная информация
  title: string;
  description?: string;
  content?: string;
  
  // Медиа
  video_url?: string;
  thumbnail_url?: string;
  attachments?: string[];
  
  // Структура
  module_name?: string;
  order_index: number;
  
  // Параметры
  duration_minutes?: number;
  is_preview: boolean;
  is_published: boolean;
  
  // Дополнительно
  homework?: string;
  quiz_data?: any;
  
  // Связанные данные (через JOIN)
  course?: Course;
}

// ========================================
// ТИПЫ ДЛЯ ФОРМ АКАДЕМИИ
// ========================================

export interface CreateCourseInput {
  title: string;
  category: string;
  language?: string;
  shortDescription?: string;
  fullDescription?: string;
  coverImage?: File | string | null;
  isPublished?: boolean;
  difficultyLevel?: string;
  tags?: string[];
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  id?: string;
}

export interface CreateLessonInput {
  courseId: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  thumbnail?: File | string | null;
  moduleName?: string;
  orderIndex?: number;
  durationMinutes?: number;
  isPreview?: boolean;
  isPublished?: boolean;
  homework?: string;
  quizData?: any;
  attachments?: string[];
}

export interface UpdateLessonInput extends Partial<Omit<CreateLessonInput, 'courseId'>> {
  id?: string;
}

// ========================================
// ФИЛЬТРЫ И ПАРАМЕТРЫ
// ========================================

export interface CourseFilters {
  category?: string;
  language?: string;
  difficultyLevel?: string;
  isPublished?: boolean;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LessonFilters {
  courseId?: string;
  moduleNme?: string;
  isPublished?: boolean;
  isPreview?: boolean;
}

// ========================================
// ПРОГРЕСС СТУДЕНТОВ
// ========================================

export interface StudentProgress {
  id: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  is_completed: boolean;
  watch_time: number;
  quiz_score?: number;
  completed_at?: string;
  last_accessed: string;
}

export interface StudentProgressInput {
  userId: string;
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  watchTime: number;
  quizScore?: number;
}