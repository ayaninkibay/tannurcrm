// src/app/dealer/dashboard/events/_data.ts
export type Item = {
  id: string;
  title: string;
  description: string;
  date?: string;
  badge?: string;
  icon?: string;
  cover?: string;
  hot?: boolean;
  terms?: string[]; // только для событий (если нужно)
};

export const EVENTS: Record<string, Item> = {
  e1: {
    id: 'e1',
    title: 'События на август',
    description: 'Если купишь 10 кушонов 3-в-1, получишь скидку 10% на все товары. Акция действует при единовременной покупке.',
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
  },
  e2: {
    id: 'e2',
    title: 'Командная закупка недели',
    description: 'Собери команду из 5 человек и получи дополнительную скидку 5% к текущим акциям.',
    date: 'На этой неделе',
    badge: 'Команда',
    icon: 'Icon cover 3.png',
    cover: '/images/event-team.jpg',
  },
  e3: {
    id: 'e3',
    title: 'TNBA — интенсив по продажам',
    description: 'Практический воркшоп по скриптам и апселлам. Места ограничены.',
    date: '24 августа',
    badge: 'Обучение',
    icon: 'Icon cover 4.png',
    cover: '/images/event-tnba.jpg',
  },
};

export const NEWS: Record<string, Item> = {
  n1: {
    id: 'n1',
    title: 'Открылся новый филиал в Алматы',
    description: 'Новый пункт выдачи и консультаций на Абая 25. Ждём вас ежедневно.',
    date: 'Сегодня',
    badge: 'Филиал',
    icon: 'Icon cover 1.png',
    cover: '/images/news-almaty.jpg',
    hot: true,
  },
  n2: {
    id: 'n2',
    title: 'Живая встреча Tannur Community',
    description: 'Нетворкинг, разбор кейсов и живые демо. Регистрация открыта.',
    date: 'Через 3 дня',
    badge: 'Событие',
    icon: 'Icon cover 4.png',
    cover: '/images/news-meetup.jpg',
  },
  n3: {
    id: 'n3',
    title: 'TNBA — новый спикер',
    description: 'Анонс приглашённого эксперта. Следите за расписанием.',
    date: 'На этой неделе',
    badge: 'Обучение',
    icon: 'Icon cover 3.png',
    cover: '/images/news-tnba.jpg',
  },
};

// Удобные хелперы
export const listEvents = () => Object.values(EVENTS);
export const listNews = () => Object.values(NEWS);
export const getEvent = (id: string) => EVENTS[id];
export const getNews = (id: string) => NEWS[id];
