'use client';

import React, { useState } from 'react';
import {
  Home,
  ShoppingBag,
  Users,
  Trophy,
  CreditCard,
  User,
  Plus,
  ArrowRight,
  ChevronRight,
  MoreVertical,
  Bell,
  LogOut,
  Settings,
  Briefcase
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// --- Mock-данные для наполнения макета ---
const mockUser = {
  name: 'Алина Аскарова',
  id: 'KB248970',
  email: 'alinushka@mail.com',
  phone: '+7 707 700 00 02',
  avatar: 'https://placehold.co/100x100/F0F0F0/888888?text=АА',
  sponsor: {
    name: 'Маруся Карабаева',
    phone: '+7 707 700 00 02',
    avatar: 'https://placehold.co/100x100/A0B9D6/FFFFFF?text=МК'
  }
};

const teamMembers = [
  { id: 1, avatar: 'https://placehold.co/40x40/FF7F50/FFFFFF?text=A' },
  { id: 2, avatar: 'https://placehold.co/40x40/008080/FFFFFF?text=Б' },
  { id: 3, avatar: 'https://placehold.co/40x40/D2B48C/FFFFFF?text=В' },
  { id: 4, avatar: 'https://placehold.co/40x40/F08080/FFFFFF?text=Г' },
  { id: 5, avatar: 'https://placehold.co/40x40/DE3163/FFFFFF?text=Д' },
  { id: 6, avatar: 'https://placehold.co/40x40/4B0082/FFFFFF?text=Е' },
  { id: 7, avatar: 'https://placehold.co/40x40/50C878/FFFFFF?text=Ж' },
];

const totalSalesData = [
  { name: 'Апр', sales: 5000000 },
  { name: 'Май', sales: 6500000 },
  { name: 'Июнь', sales: 7000000 },
  { name: 'Июль', sales: 8500000 },
  { name: 'Авг', sales: 11000000 },
  { name: 'Сен', sales: 9000000 },
];

const promotions = [
  { title: 'Новый филиал в Алматы', type: 'новости', icon: 'https://placehold.co/48x48/C5C5C5/FFFFFF?text=Ф' },
  { title: 'Путевка в Египет за 50 человек', type: 'новости', icon: 'https://placehold.co/48x48/C5C5C5/FFFFFF?text=П' },
  { title: 'TNBA - Новый спикер в Академии', type: 'новости', icon: 'https://placehold.co/48x48/C5C5C5/FFFFFF?text=С' },
  { title: 'Мероприятие Tannur Event 08 в Astana Arena', type: 'новости', icon: 'https://placehold.co/48x48/C5C5C5/FFFFFF?text=М' },
];

// Утилита для форматирования чисел
const formatNumber = (num) => {
  return new Intl.NumberFormat('ru-RU').format(Math.round(num));
};

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <div className="flex w-full min-h-screen bg-[#F8F9FB] text-[#2D2D2D] font-inter">

      {/* Левый сайдбар */}
      <div className="hidden md:flex flex-col w-[280px] bg-[#EEB89D] text-white p-6 rounded-r-3xl relative">
        <div className="flex items-center gap-2 mb-10">
          <img src="https://placehold.co/40x40/ffffff/000000?text=Л" alt="Логотип" className="w-10 h-10 rounded-full" />
          <span className="text-xl font-bold">TANNUR</span>
        </div>
        <nav className="space-y-4">
          <div className="flex items-center gap-4 px-4 py-3 rounded-full bg-[#E5A88B] cursor-pointer hover:bg-[#E0A07B] transition-colors">
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Мой кабинет</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 rounded-full cursor-pointer hover:bg-[#E5A88B] transition-colors">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-medium">Мои заказы</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 rounded-full cursor-pointer hover:bg-[#E5A88B] transition-colors">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Моя команда</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 rounded-full cursor-pointer hover:bg-[#E5A88B] transition-colors">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Рейтинг</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 rounded-full cursor-pointer hover:bg-[#E5A88B] transition-colors">
            <CreditCard className="w-5 h-5" />
            <span className="text-sm font-medium">Мои счета</span>
          </div>
        </nav>

        {/* Стилизованный логотип CRM Tannur 1 внизу */}
        <div className="absolute bottom-6 left-6 text-sm opacity-50">
            <span className="text-white">CRM Tannur 1</span>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-6 md:p-10 flex flex-col gap-6">

        {/* Хедер с приветствием и кнопками */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">Дэшборд</h1>
            <p className="text-xl font-medium mt-2 text-[#9A9A9A]">С возвращением, Анжу</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white text-black font-semibold rounded-full px-6 py-3 shadow-sm hover:shadow-md transition">
              <span className="flex items-center gap-2 whitespace-nowrap">
                Ваши покупки <ArrowRight className="w-4 h-4" />
              </span>
            </button>
            <div className="flex items-center gap-2 text-black cursor-pointer">
              <User className="w-6 h-6" />
              <Bell className="w-6 h-6" />
              <MoreVertical className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Блоки с информацией */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Моя команда */}
          <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Моя команда</h3>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-4xl font-bold my-4">68 человек</div>
              <div className="flex -space-x-2 overflow-hidden mb-4">
                {teamMembers.map(member => (
                  <img key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={member.avatar} alt="" />
                ))}
              </div>
              <button className="flex items-center gap-2 text-[#E5A88B] font-semibold text-sm">
                <Plus className="w-4 h-4" /> Добавить
              </button>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-[#9F5736] h-2.5 rounded-full" style={{ width: '50%' }}></div>
              </div>
              <p className="text-sm text-[#9A9A9A] mt-2">До следующего статуса осталось <span className="font-semibold">32 человек</span></p>
              <p className="text-sm text-[#9A9A9A] mt-1">68 человек</p>
            </div>
          </div>

          {/* Ваш баланс */}
          <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ваш баланс</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-4xl font-bold my-4">890 020 ₸</div>
            <button className="flex items-center gap-2 text-[#E5A88B] font-semibold text-sm">
              <Briefcase className="w-4 h-4" /> Вывод средств
            </button>
          </div>

          {/* Ваш бонус */}
          <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ваш бонус</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-4xl font-bold my-4">15%</div>
            <ul className="text-sm text-[#9A9A9A] space-y-1">
              <li>8% - с оборота команды</li>
              <li>15% - с покупки в магазине</li>
              <li>50% - с подписки дилеров</li>
              <li>3% - бонусов от Tannur</li>
            </ul>
            <button className="flex items-center justify-end gap-2 text-[#E5A88B] font-semibold text-sm mt-4">
              Посмотреть таблицу <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Товарооборот и Специальные акции */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Товарооборот за все время */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Товарооборот за все время</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-4xl font-bold text-[#2D2D2D] mb-4">7 412 000 ₸</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={totalSalesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs text-[#9A9A9A]" />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="sales" fill="#EEB89D" name="Продажи (₸)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Специальные акции */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Специальные акции за Август</h3>
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex flex-col gap-4">
              {promotions.map((promo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={promo.icon} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{promo.title}</span>
                      <span className="text-xs text-[#9A9A9A]">{promo.type}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Правая колонка с профилем */}
      <div className="hidden lg:flex flex-col w-[350px] bg-white p-6 shadow-sm space-y-6 rounded-l-3xl">
        {/* Карточка профиля */}
        <div className="bg-[#FFF1EE] rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white mb-4">
            <img src={mockUser.avatar} alt="Аватар пользователя" className="w-full h-full object-cover" />
          </div>
          <h4 className="text-lg font-bold">{mockUser.name}</h4>
          <p className="text-sm text-[#9A9A9A]">{mockUser.id}</p>
          <p className="text-sm text-[#2D2D2D] mt-2">{mockUser.email}</p>
          <p className="text-sm text-[#2D2D2D]">{mockUser.phone}</p>
        </div>

        {/* Ссылки профиля */}
        <div className="space-y-4">
          <div className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-[#E5A88B]" />
              <span className="text-sm">Мой профиль</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#E5A88B]" />
          </div>
          <div className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-[#E5A88B]" />
              <span className="text-sm">Уведомления</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#E5A88B]" />
          </div>
        </div>

        {/* Ссылка для приглашения */}
        <div className="flex flex-col bg-[#F8F9FB] rounded-2xl p-4">
          <h5 className="text-sm font-semibold mb-2">Ссылка для приглашения</h5>
          <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <input
              type="text"
              value={`tannur.az/${mockUser.id}`}
              readOnly
              className="flex-1 p-3 text-sm text-gray-600 bg-white border-none focus:outline-none"
            />
            <button className="bg-[#E5A88B] text-white p-3 h-full hover:bg-[#E0A07B] transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Мой спонсор */}
        <div className="flex flex-col bg-[#F8F9FB] rounded-2xl p-4">
          <h5 className="text-sm font-semibold mb-2">Мой спонсор</h5>
          <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm">
            <img src={mockUser.sponsor.avatar} alt="Аватар спонсора" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{mockUser.sponsor.name}</p>
              <p className="text-xs text-[#9A9A9A]">{mockUser.sponsor.phone}</p>
            </div>
            <button className="bg-gray-200 text-gray-800 p-2 rounded-full hover:bg-gray-300 transition-colors">
              <Briefcase className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Выйти из профиля */}
        <div className="flex items-center justify-center cursor-pointer group hover:bg-red-50 rounded-xl p-2 transition-colors">
          <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600" />
          <span className="text-sm ml-2 text-red-500 font-semibold group-hover:text-red-600">Выйти из профиля</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
