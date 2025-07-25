"use client";

import React, { useState } from 'react';
import Image from 'next/image';

const stats = [
  {
    label: 'Выплаты за подписки',
    amount: '1 984 321 ₸',
    dotColor: 'bg-green-500',
  },
  {
    label: 'Бонус за Личный Тов.Оборот',
    amount: '273 980 ₸',
    dotColor: 'bg-blue-500',
  },
  {
    label: 'Бонус за Командный Тов.Оборот',
    amount: '273 980 ₸',
    dotColor: 'bg-yellow-400',
  },
  {
    label: 'Личный товарооборот',
    amount: '7 412 000 ₸',
    dotColor: 'bg-pink-500',
  },
  {
    label: 'Командный товарооборот',
    amount: '29 412 000 ₸',
    dotColor: 'bg-purple-500',
  },
];

const StatsContent = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');

  
  return (
    <div className="flex flex-col gap-6 ml-[40px] mt-6 pr-[40px]">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-black">Ваши финансы</h1>

        <div className="flex items-center gap-4 z-10">
          <button
            type="button"
            className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition cursor-pointer"
            onClick={() => console.log('Уведомления нажаты')}
          >
            <img
              src="/icons/Icon notifications.png"
              alt="Уведомления"
              className="w-5 h-5"
            />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full" />
          </button>

          <button
            type="button"
            className="flex items-center bg-white px-3 py-2 rounded-full hover:opacity-80 transition cursor-pointer"
            onClick={() => console.log('Профиль нажат')}
          >
            <Image
              src="/icons/Users avatar 1.png"
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full mr-4 object-cover"
            />
            <span className="font-medium text-black">Інжу Ануарбек</span>
            <img
              src="/icons/Icon arow botom.png"
              alt="Стрелка"
              className="w-4 h-4 ml-2"
            />
          </button>
        </div>
      </div>

      {/* Первый длинный блок */}
      <div className="bg-white p-6 rounded-2xl flex justify-between items-center">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col gap-1 min-w-[170px]">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${stat.dotColor}`} />
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <span className="text-lg font-semibold text-black">{stat.amount}</span>
          </div>
        ))}
      </div>

      {/* Нижний блок с балансом и двумя боковыми */}
      <div className="flex gap-6">
        {/* Блок баланса */}
        <div className="bg-white rounded-2xl p-6 h-[350px] w-[400px] relative flex flex-col">
          <Image
            src="/icons/Icon decor.png"
            alt="decor"
            width={100}
            height={100}
            className="absolute top-5 right-5 opacity-40"
          />
          <div className="flex-grow" />
          <div>
            <p className="text-gray-500 text-sm mb-1">Ваш баланс</p>
            <h2 className="text-2xl font-bold text-black mb-6">890 020 ₸</h2>

            <button className="w-full bg-[#D8765E] hover:opacity-90 transition text-white flex items-center justify-center gap-2 py-2 rounded-xl">
              <Image src="/icons/Icon withdraw.png" alt="withdraw" width={16} height={16} />
              <span className="text-sm font-medium">Вывод средств</span>
            </button>

            <button className="mt-4 w-full flex items-center justify-center gap-2 text-black text-sm hover:underline transition">
              <Image src="/icons/Icon time.png" alt="history" width={16} height={16} />
              <span>Посмотреть историю</span>
            </button>
          </div>
        </div>

{/* Блок условий и отчётов */}
<div className="flex flex-col gap-6">
  {/* Условия сотрудничества */}
  <div className="bg-white rounded-2xl p-6 w-[400px] h-[200px] flex flex-col justify-between">
    <div>
      <h2 className="text-lg font-semibold text-black mb-4">Условия сотрудничества</h2>
      <ul className="text-sm text-gray-500 space-y-1">
        <li>8% – с оборота команды</li>
        <li>15% – с покупки в магазине</li>
        <li>50% – с подписки диллеров</li>
        <li>3% – бонусов от Tannur</li>
      </ul>
    </div>
    <div className="flex justify-end">
      <button className="flex items-center gap-2 text-black text-sm hover:underline transition">
        <Image src="/icons/Icon download.png" alt="download" width={14} height={14} />
        <span>Скачать договор</span>
      </button>
    </div>
  </div>

  {/* Отчёты */}
  <div className="bg-white rounded-2xl p-6 w-[400px] h-[130px] flex flex-col justify-between">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-black">Отчеты</h2>
      <button className="flex items-center gap-1 text-sm text-black bg-[#f2f2f2] px-3 py-1 rounded-full hover:opacity-80 transition">
        За всё время
        <Image src="/icons/Icon arow down.png" alt="dropdown" width={12} height={12} />
      </button>
    </div>
    <div className="flex flex-col gap-1 mt-4">
      <button className="flex items-center gap-2 text-black text-sm hover:underline transition">
        <Image src="/icons/Icon download.png" alt="download" width={14} height={14} />
        <span>Скачать отчет за товарооборот</span>
      </button>
      <button className="flex items-center gap-2 text-black text-sm hover:underline transition">
        <Image src="/icons/Icon download.png" alt="download" width={14} height={14} />
        <span>Скачать отчет за подписки</span>
      </button>
    </div>
  </div>
</div>

<div className="bg-white rounded-2xl p-6 w-[810px] h-[355px] relative">
  {/* Верх: заголовок + фильтр */}
  <div className="flex justify-between items-start mb-4">
    <div>
      <p className="text-sm text-gray-500">Заработок от товарооборота</p>
      <h2 className="text-[28px] font-bold text-gray-700">3 876 000 ₸</h2>
    </div>
    <button className="flex items-center gap-2 bg-[#F3F3F3] text-sm px-4 py-1.5 rounded-full text-black">
      За всё время
      <img src="/icons/Icon arow down.png" alt="dropdown" className="w-4 h-4" />
    </button>
  </div>

  {/* Линия графика */}
  <img
    src="/icons/Icon line.png"
    alt="chart line"
    className="absolute top-[90px] left-0 w-full pointer-events-none"
  />

  {/* Подсказка Августа */}
  <div className="absolute top-[110px] left-[80.5%] z-10">
    <div className="bg-black text-white text-sm px-3 py-1 rounded-lg relative w-max">
      763 909 ₸
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-black"></div>
    </div>
  </div>

  {/* Столбики с фиксированными подписями ниже */}
  <div className="flex justify-between h-[180px] px-2 mt-[1px] relative z-0">
    {[
      { month: 'Окт', height: 12 },
      { month: 'Ноя', height: 16 },
      { month: 'Дек', height: 12 },
      { month: 'Янв', height: 24 },
      { month: 'Фев', height: 16 },
      { month: 'Март', height: 18 },
      { month: 'Апр', height: 14 },
      { month: 'Май', height: 16 },
      { month: 'Июнь', height: 13 },
      { month: 'Июль', height: 20 },
      { month: 'Авг', height: 32, active: true },
      { month: 'Сен', height: 2 },
    ].map((bar, idx) => (
      <div key={idx} className="relative flex flex-col items-center w-10">
        {/* Столбик */}
        <div className="h-full flex items-end justify-center">
          <div
            className={`w-10 rounded-md ${
              bar.active ? 'bg-[#DB6A56]' : 'bg-[#E9D7D6]'
            }`}
            style={{ height: `${bar.height * 4}px` }}
          />
        </div>

        {/* Абсолютно позиционированный текст под каждым столбиком */}
        <div className="absolute bottom-[-45px] left-1/2 -translate-x-1/2">
          <p
            className={`text-sm ${
              bar.active ? 'font-medium text-black' : 'text-gray-600'
            }`}
          >
            {bar.month}
          </p>
        </div>
      </div>
    ))}
  </div>
  
</div>

 </div>
 
{/* Переключатель вкладок: Отчёты по подпискам и товарам */}
<div className="flex justify-between items-center mt-6">
  <h2 className="text-[16px] font-medium text-[#111]">Выберите отчёт</h2>

  <div className="relative flex items-center bg-white rounded-full p-0">
    {/* Подписки */}
    <button
      onClick={() => setActiveTab('subscriptions')}
      className={`flex items-center gap-2 px-8 py-3 text-sm font-medium rounded-full transition-all z-10 ${
        activeTab === 'subscriptions' ? 'bg-[#DC7C67] text-white' : 'text-black'
      }`}
      style={{
        marginRight: activeTab === 'subscriptions' ? '-10px' : '0',
        zIndex: activeTab === 'subscriptions' ? 20 : 10,
      }}
    >
      <img
        src={
          activeTab === 'subscriptions'
            ? '/icons/IconCronwWhite.png'
            : '/icons/IconCrownBlack.png'
        }
        alt="Подписки"
        className="w-4 h-4"
      />
      Отчет по подпискам
    </button>

    {/* Товары */}
    <button
      onClick={() => setActiveTab('products')}
      className={`flex items-center gap-2 px-6 py-3  text-sm font-medium rounded-full transition-all z-10 ${
        activeTab === 'products' ? 'bg-[#DC7C67] text-white' : 'text-black'
      }`}
      style={{
        marginLeft: activeTab === 'products' ? '-10px' : '0',
        zIndex: activeTab === 'products' ? 20 : 10,
      }}
    >
      <img
        src={
          activeTab === 'products'
            ? '/icons/IconShoppingWhite.png'
            : '/icons/IconShoppingBlack.png'
        }
        alt="Товары"
        className="w-4 h-4"
      />
      Отчет по товарам
    </button>
  </div>
</div>

{/* Финальный блок с таблицей отчёта */}
{activeTab === 'subscriptions' && (
  <div className="bg-white rounded-2xl p-6 w-full overflow-auto">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <img
          src="/icons/IconCrownBlack.png"
          alt="subscriptions icon"
          className="w-4 h-4"
        />
        <h2 className="text-md font-semibold text-black">Отчет по подпискам</h2>
      </div>
      <button className="text-sm font-semibold hover:underline text-black">
        Скачать отчет
      </button>
    </div>

    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-gray-400 text-left border-b border-gray-200">
          <th className="py-2">Имя</th>
          <th className="py-2">Профессия</th>
          <th className="py-2">Дата</th>
          <th className="py-2">ID</th>
          <th className="py-2">Сумма</th>
          <th className="py-2 pr-4 text-right">Статус</th>
        </tr>
      </thead>
      <tbody className="text-black">
        {[
          {
            name: 'Аян Инкибаев',
            profession: 'Доктор',
            date: '22-02-2025',
            id: 'KZ84970',
            amount: '25 000₸',
            avatar: '/icons/Users avatar 3.png',
          },
          {
            name: 'Томирис Смак',
            profession: 'Business',
            date: '22-02-2025',
            id: 'KZ84970',
            amount: '25 000₸',
            avatar: '/icons/Users avatar 2.png',
          },
        ].map((item, idx) => (
          <tr key={idx} className="border-b border-gray-100">
            <td className="py-3 flex items-center gap-2">
              <img
                src={item.avatar}
                alt="avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
              {item.name}
            </td>
            <td className="py-3">{item.profession}</td>
            <td className="py-3">{item.date}</td>
            <td className="py-3">{item.id}</td>
            <td className="py-3 font-medium">{item.amount}</td>
            <td className="py-3 pr-1 text-right">
              <span className="bg-green-200 text-black text-xs font-medium px-3 py-1 rounded-full">
                Зачислен
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

{activeTab === 'products' && (
  <div className="bg-white rounded-2xl p-6 w-full overflow-auto">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <img
          src="/icons/IconShoppingBlack.png"
          alt="products icon"
          className="w-4 h-4"
        />
        <h2 className="text-md font-semibold text-black">Отчет по товарам</h2>
      </div>
      <button className="text-sm font-semibold hover:underline text-black">
        Скачать отчет
      </button>
    </div>

    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-gray-400 text-left border-b border-gray-200">
          <th className="py-2">Имя</th>
          <th className="py-2">Профессия</th>
          <th className="py-2">Дата</th>
          <th className="py-2">ID</th>
          <th className="py-2">Сумма</th>
          <th className="py-2 pr-4 text-right">Статус</th>
        </tr>
      </thead>
      <tbody className="text-black">
        {[
          {
            name: 'Аян Инкибаев',
            profession: 'Доктор',
            date: '22-02-2025',
            id: 'KZ84970',
            amount: '25 000₸',
            avatar: '/icons/Users avatar 3.png',
          },
          {
            name: 'Томирис Смак',
            profession: 'Business',
            date: '22-02-2025',
            id: 'KZ84970',
            amount: '25 000₸',
            avatar: '/icons/Users avatar 2.png',
          },
        ].map((item, idx) => (
          <tr key={idx} className="border-b border-gray-100">
            <td className="py-3 flex items-center gap-2">
              <img
                src={item.avatar}
                alt="avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
              {item.name}
            </td>
            <td className="py-3">{item.profession}</td>
            <td className="py-3">{item.date}</td>
            <td className="py-3">{item.id}</td>
            <td className="py-3 font-medium">{item.amount}</td>
            <td className="py-3 pr-1 text-right">
              <span className="bg-green-200 text-black text-xs font-medium px-3 py-1 rounded-full">
                Зачислен
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}




    </div>

);
};

export default StatsContent;
