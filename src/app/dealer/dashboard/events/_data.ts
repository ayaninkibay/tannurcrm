// src/app/dealer/dashboard/events/_data.ts

// Базовый тип мок-элемента (подходит и для событий, и для новостей)
export type Item = {
  id: string;
  title: string;
  description: string;

  // Базовые поля, которые уже используются на страницах
  date?: string;         // период/дата ("1–31 августа", "Сегодня" и т.п.)
  badge?: string;        // метка ("Акция", "Событие", "Обучение" и т.п.)
  icon?: string;         // файл из /public/icons, например: "Icon cover 2.png"
  cover?: string;        // крупная обложка из /public/images, например: "/images/event-august.jpg"
  hot?: boolean;         // выделение (🔥/Важно)
  terms?: string[];      // условия участия (чаще для событий)

  // --- Дополнительные расширенные поля ---
  location?: string;     // место (или "Онлайн")
  time?: string;         // время проведения / дедлайн
  organizer?: string;    // организатор
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
    link?: string;       // ссылка на чат/форму/сайт
  };
  price?: string;        // стоимость (для мероприятий)
  discount?: string;     // условия скидки
  tags?: string[];       // теги для поиска/фильтрации
  gallery?: string[];    // галерея (пути до картинок в /public/images)
  program?: Array<{      // программа/расписание (чаще для оффлайн-событий)
    time: string;
    title: string;
    speaker?: string;
  }>;
  content?: string[];    // расширенный текст (чаще для новостей)
  links?: Array<{        // полезные ссылки
    label: string;
    url: string;
  }>;
  social?: string[];     // хэштеги/соцметки
  ctaLabel?: string;     // текст кнопки действия
  ctaUrl?: string;       // ссылка кнопки действия
};

// -------------------------
// МОКИ СОБЫТИЙ
// -------------------------
export const EVENTS: Record<string, Item> = {
  e1: {
    id: 'e1',
    title: 'События на август',
    description:
      'Если купишь 10 кушонов 3-в-1, получишь скидку 10% на все товары. Акция действует при единовременной покупке.',
    date: '1–31 августа',
    badge: 'Акция',
    icon: 'Icon cover 2.png',
    cover: '/images/event-august.jpg',
    hot: true,
    terms: [
      'Скидка применяется при единовременной покупке комплекта.',
      'Не суммируется с персональными промокодами.',
      'Количество товара ограничено.',
    ],
    // Новое
    location: 'Онлайн — Tannur Store',
    time: '24/7 в период акции',
    organizer: 'Tannur Cosmetics',
    contact: {
      name: 'Поддержка',
      email: 'support@tannur.kz',
      link: 'https://t.me/tannur_support',
    },
    discount: '—10% на весь чек при покупке 10 кушонов 3-в-1',
    tags: ['акция', 'скидка', 'кушон', 'август'],
    gallery: [
      '/images/e1-1.jpg',
      '/images/e1-2.jpg',
      '/images/e1-3.jpg',
    ],
    links: [
      { label: 'Перейти в Tannur Store', url: '/dealer/shop' },
      { label: 'Условия программы лояльности', url: '/dealer/stats' },
    ],
    social: ['#tannur', '#акция', '#август'],
    ctaLabel: 'Перейти в магазин',
    ctaUrl: '/dealer/shop',
  },

  e2: {
    id: 'e2',
    title: 'Командная закупка недели',
    description:
      'Собери команду из 5 человек и получи дополнительную скидку 5% к текущим акциям.',
    date: 'На этой неделе',
    badge: 'Команда',
    icon: 'Icon cover 3.png',
    cover: '/images/event-team.jpg',
    terms: [
      'Скидка активируется при 5 оплаченных заказах за неделю.',
      'Суммируется с командными закупками, если не противоречит правилам.',
    ],
    // Новое
    location: 'Онлайн — Командные закупки',
    time: 'До воскресенья 23:59',
    organizer: 'Tannur Community',
    contact: {
      name: 'Куратор командных закупок',
      link: '/dealer/myteam',
    },
    discount: '+5% к текущим акциям при выполнении условий',
    tags: ['команда', 'закупка', 'скидка'],
    gallery: ['/images/e2-1.jpg', '/images/e2-2.jpg'],
    program: [
      { time: 'Пн', title: 'Старт сбора команды' },
      { time: 'Пт', title: 'Подтверждение заявок и оплат' },
      { time: 'Вс', title: 'Финиш и начисление бонусов' },
    ],
    links: [
      { label: 'Открыть командные закупки', url: '/dealer/shop' },
      { label: 'Моя команда', url: '/dealer/myteam' },
    ],
    social: ['#tannur', '#команда'],
    ctaLabel: 'Создать команду',
    ctaUrl: '/dealer/myteam',
  },

  e3: {
    id: 'e3',
    title: 'TNBA — интенсив по продажам',
    description:
      'Практический воркшоп по скриптам и апселлам. Места ограничены.',
    date: '24 августа',
    badge: 'Обучение',
    icon: 'Icon cover 4.png',
    cover: '/images/event-tnba.jpg',
    terms: [
      'Регистрация обязательна.',
      'Оплата билета — на месте или онлайн.',
    ],
    // Новое
    location: 'Алматы, Tannur Hub (ул. Абая, 25)',
    time: '10:00–18:00',
    organizer: 'TNBA',
    contact: {
      name: 'TNBA Office',
      phone: '+7 (700) 000-00-00',
      email: 'tnba@tannur.kz',
    },
    price: '15 000 ₸',
    discount: '—20% для партнёров Tannur',
    tags: ['обучение', 'офлайн', 'tnba', 'воркшоп'],
    gallery: ['/images/e3-1.jpg', '/images/e3-2.jpg', '/images/e3-3.jpg'],
    program: [
      { time: '10:00', title: 'Открытие и знакомство' },
      { time: '10:30', title: 'Скрипты: от открытия до апсела', speaker: 'Алия Ж.' },
      { time: '13:00', title: 'Перерыв' },
      { time: '14:00', title: 'Практика: продаём в парах', speaker: 'Кураторы TNBA' },
      { time: '17:00', title: 'Вопросы и разбор кейсов' },
    ],
    links: [
      { label: 'Зарегистрироваться', url: '/dealer/education' },
      { label: 'Программа TNBA', url: '/dealer/education' },
    ],
    social: ['#tnba', '#tannur', '#обучение'],
    ctaLabel: 'Зарегистрироваться',
    ctaUrl: '/dealer/education',
  },
};

// -------------------------
// МОКИ НОВОСТЕЙ
// -------------------------
export const NEWS: Record<string, Item> = {
  n1: {
    id: 'n1',
    title: 'Открылся новый филиал в Алматы',
    description:
      'Новый пункт выдачи и консультаций на Абая 25. Ждём вас ежедневно.',
    date: 'Сегодня',
    badge: 'Филиал',
    icon: 'Icon cover 1.png',
    cover: '/images/news-almaty.jpg',
    hot: true,
    // Новое
    location: 'Алматы, ул. Абая, 25',
    time: 'Ежедневно 10:00–20:00',
    organizer: 'Tannur Cosmetics',
    contact: {
      phone: '+7 (727) 000-00-00',
      link: 'https://maps.google.com/?q=Абая%2025%2C%20Алматы',
    },
    tags: ['филиал', 'алматы', 'открытие'],
    gallery: ['/images/n1-1.jpg', '/images/n1-2.jpg'],
    content: [
      'Открылся новый филиал Tannur в Алматы — просторный шоурум и удобная зона выдачи.',
      'В день открытия гостей ждут презентации новинок, консультации экспертов и подарки.',
      'Мы расширяем присутствие бренда и улучшаем клиентский сервис. Заходите!',
    ],
    links: [
      { label: 'Построить маршрут', url: 'https://maps.google.com/?q=Абая%2025%2C%20Алматы' },
      { label: 'Tannur Store', url: '/dealer/shop' },
    ],
    social: ['#tannur', '#almaty', '#открытие'],
    ctaLabel: 'Посмотреть на карте',
    ctaUrl: 'https://maps.google.com/?q=Абая%2025%2C%20Алматы',
  },

  n2: {
    id: 'n2',
    title: 'Живая встреча Tannur Community',
    description:
      'Нетворкинг, разбор кейсов и живые демо. Регистрация открыта.',
    date: 'Через 3 дня',
    badge: 'Событие',
    icon: 'Icon cover 4.png',
    cover: '/images/news-meetup.jpg',
    // Новое
    location: 'Astana Arena, зал C',
    time: '19:00–21:30',
    organizer: 'Tannur Community',
    contact: {
      link: '/dealer/mypage',
    },
    tags: ['комьюнити', 'встреча', 'астана'],
    gallery: ['/images/n2-1.jpg', '/images/n2-2.jpg', '/images/n2-3.jpg'],
    content: [
      'Погружаемся в реальные кейсы, делимся опытом и формируем практические навыки.',
      'После основной части — свободное общение и ответы на вопросы.',
    ],
    links: [
      { label: 'Регистрация', url: '/dealer/mypage' },
      { label: 'Команда Tannur', url: '/dealer/myteam' },
    ],
    social: ['#tannur', '#meetup'],
    ctaLabel: 'Зарегистрироваться',
    ctaUrl: '/dealer/mypage',
  },

  n3: {
    id: 'n3',
    title: 'TNBA — новый спикер',
    description:
      'Анонс приглашённого эксперта. Следите за расписанием.',
    date: 'На этой неделе',
    badge: 'Обучение',
    icon: 'Icon cover 3.png',
    cover: '/images/news-tnba.jpg',
    // Новое
    organizer: 'TNBA',
    tags: ['tnba', 'обучение', 'спикер'],
    gallery: ['/images/n3-1.jpg', '/images/n3-2.jpg'],
    content: [
      'К нашей программе присоединяется приглашённый эксперт с сильной практикой в b2c-продажах.',
      'В ближайшие дни анонсируем точную дату и программу выступления — следите за разделом “События”.',
    ],
    links: [{ label: 'Перейти в TNBA', url: '/dealer/education' }],
    social: ['#tnba', '#tannur'],
    ctaLabel: 'Открыть TNBA',
    ctaUrl: '/dealer/education',
  },
};

// Удобные хелперы
export const listEvents = () => Object.values(EVENTS);
export const listNews = () => Object.values(NEWS);
export const getEvent = (id: string) => EVENTS[id];
export const getNews = (id: string) => NEWS[id];
