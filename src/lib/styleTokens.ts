// src/lib/styleTokens.ts

/**
 * 1. Точки останова (breakpoints)
 *   — это ширины экрана, при которых переключается ваш дизайн.
 *     Tailwind-классы (sm:, md:, lg: и т.п.) «привязаны» к этим значениям.
 *   • В Tailwind: lg:bg-red-500, 3xl:text-xl и т.д.
 *   • В JS-логике: window.matchMedia(`(min-width: ${breakpoints.lg})`)
 */
export const breakpoints = {
  mobile: '480px',   // очень узкие экраны (старые телефоны)
  sm:     '640px',   // телефоны
  md:     '768px',   // планшеты в портрете
  lg:     '1024px',  // планшеты в ландшафте / маленькие ноуты
  xl:     '1280px',  // стандартный десктоп
  xl2:    '1400px',  // большие десктопы
  '2xl':  '1536px',  // крупные мониторы
  '3xl':  '1920px',  // FullHD / телевизоры
  '4xl':  '3440px',  // ультраширокие
}

/**
 * 2. Отступы и контейнеры
 *   — базовые паддинги и ограничения ширины страницы.
 *   Используйте в корне страницы, чтобы задать единый layout.
 */

export const layout = {
  // паддинги по бокам для всего контента справа от sidebar
pagePadding: 'px-1 sm:px-2 md:px-6 lg:px-8',
  // у нас больше нет ни center, ни maxWidth
  maxWidth:    '',
  center:      '',
}

/**
 * 3. Сетка (grid)
 *   — готовые комбинации для grid-контейнеров.
 *   oneCol:    всегда 1 колонка.
 *   twoCols:   1 колонка на мобиле, 2 — на lg+.
 *   threeCols: 1 колонка на мобиле, 3 — на md+.
 *   layoutDs:  кастом 2fr/1fr на md+ (для дашборда).
 */
export const grid = {
  oneCol:          'grid grid-cols-1 gap-6',
  twoCols:         'grid grid-cols-1 lg:grid-cols-2 gap-6',
  threeCols:       'grid grid-cols-1 md:grid-cols-3 gap-6',
  layoutDashboard: 'grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-8',
}

/**
 * 4. Типографика
 *   — базовые классы для текста.
 *   Комбинируются как `${typography.h2} ${colors.primaryText}`.
 */
export const typography = {
  h1:    'text-4xl sm:text-5xl font-bold tracking-tight',
  h2:    'text-3xl sm:text-4xl font-semibold',
  h3:    'text-2xl sm:text-3xl font-medium',
  body:  'text-base sm:text-lg leading-relaxed',
  small: 'text-sm sm:text-base',
  label: 'text-sm font-medium uppercase tracking-wide',
}

/**
 * 5. Цвета
 *   — храните здесь HEX-коды или CSS-переменные.
 *   В компонентах: className={colors.primaryBg} или style={{ color: colors.primaryText }}
 */
export const colors = {
  primaryBg:     '#FFFFFF',
  secondaryBg:   '#F3F4F6',
  accentBg:      '#6366F1',
  primaryText:   '#111827',
  secondaryText: '#6B7280',
  accentText:    '#FFFFFF',
  mutedText:     '#9CA3AF',
}

/**
 * 6. Радиусы (radii)
 *   — три уровня скругления для разных устройств.
 *   mobile:   для узких экранов
 *   tablet:   для планшетов
 *   desktop:  для больших мониторов
 */
export const radii = {
  mobile:  'rounded-md',
  tablet:  'rounded-lg',
  desktop: 'rounded-xl',
}

/**
 * 7. Состояния (states)
 *   — префиксы для Tailwind-состояний:
 *     hover:bg-red-500   ≅ `${states.hover}bg-red-500`
 *     focus:ring-2       ≅ `${states.focus}ring-2`
 *     active:, disabled: и т.д.
 */
export const states = {
  hover:    'hover:',
  focus:    'focus:',
  active:   'active:',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
}

/**
 * 8. Переходы и анимации (transitions)
 *   — базовые transition-классы для плавности.
 *   Пример использования: `${transitions.base} ${states.hover}bg-blue-600`
 */
export const transitions = {
  base: 'transition ease-in-out duration-150',
  fast: 'transition ease-out duration-100',
  slow: 'transition ease-in duration-300',
}
