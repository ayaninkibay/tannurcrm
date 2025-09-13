// types/constants.ts

// ========================================
// СУЩЕСТВУЮЩИЕ КОНСТАНТЫ
// ========================================
export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "celebrity", "dealer", "user"],
      stock_movement_source: [
        "direct_update",
        "sale",
        "purchase",
        "return",
        "adjustment",
        "write_off",
        "transfer",
        "production",
      ],
    },
  },
} as const;

// ========================================
// ДОПОЛНИТЕЛЬНЫЕ КОНСТАНТЫ
// ========================================
export const BONUS_TYPES = {
  PERSONAL: 'personal',
  TEAM_DIFFERENCE: 'team_difference',
  REFERRAL: 'referral',
  SPECIAL: 'special'
} as const;

export const UI_CONSTANTS = {
  ITEMS_PER_PAGE: 20,
  MAX_TEAM_DEPTH: 10,
  DEFAULT_BONUS_PERCENT: 5,
  TOAST_DURATION: 3000
} as const;

export const ROUTES = {
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    WAREHOUSE: '/admin/warehouse',
    PRODUCT_VIEW: '/admin/warehouse/product_view',
    PRODUCT_EDIT: '/admin/warehouse/product_edit',
    STOCK: '/admin/warehouse/stock',
    REPORTS: '/admin/reports',
    FINANCE: '/admin/finance',
    TEAM: '/admin/teamcontent',
    DOCUMENTS: '/admin/documents'
  },
  DEALER: {
    DASHBOARD: '/dealer/dashboard',
    SHOP: '/dealer/shop',
    PRODUCT_VIEW: '/dealer/shop/product_view',
    TEAM: '/dealer/myteam',
    STATS: '/dealer/stats',
    EDUCATION: '/dealer/education',
    DOCUMENTS: '/dealer/documents'
  },
  AUTH: {
    LOGIN: '/signin',
    REGISTER: '/signup',
    FORGOT_PASSWORD: '/forgot-password'
  }
} as const;


// ========================================
// КОНСТАНТЫ ДЛЯ АКАДЕМИИ
// ========================================

export const COURSE_CATEGORIES = [
  'Знакомство с Tannur',
  'Продукты',
  'Маркетинг',
  'Продажи',
  'Лидерство',
  'Мотивация',
  'Финансы',
  'Личностный рост'
] as const;

export const COURSE_LANGUAGES = [
  { value: 'ru', label: 'Русский' },
  { value: 'kz', label: 'Қазақша' },
  { value: 'en', label: 'English' }
] as const;

export const COURSE_DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' }
] as const;

export const ACADEMY_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  DEFAULT_COURSE_COVER: '/images/default-course.jpg',
  DEFAULT_LESSON_THUMBNAIL: '/images/default-lesson.jpg'
} as const;