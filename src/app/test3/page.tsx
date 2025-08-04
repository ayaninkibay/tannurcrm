'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Plus,
  ArrowRight,
  Power,
  ChevronRight,
  Zap,
  MoreVertical,
  Wifi,
  Monitor,
  Fan
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

// Заглушка для аватаров пользователей
const userAvatars = [
  'https://placehold.co/40x40/F0F0F0/888888?text=A',
  'https://placehold.co/40x40/D6E5FF/888888?text=B',
  'https://placehold.co/40x40/FFD9D9/888888?text=C',
];

// Заглушка для данных об активности
const activityData = [
  { time: '16 h', usage: 10 },
  { time: '17 h', usage: 15 },
  { time: '18 h', usage: 25 },
  { time: '19 h', usage: 18 },
  { time: '20 h', usage: 22 },
  { time: '21 h', usage: 20 },
  { time: '22 h', usage: 30 },
  { time: '23 h', usage: 28 },
];

const SmartHomeDashboard = () => {
  // State for Air Conditioner card
  const [isAcOn, setIsAcOn] = useState(true);
  const [temperature, setTemperature] = useState(24);

  // State for Scenes card
  const [scenesCreated, setScenesCreated] = useState(8);
  const [devicesInUse, setDevicesInUse] = useState(24);

  // Handlers for interaction
  const toggleAc = () => setIsAcOn(!isAcOn);
  const handleShare = () => console.log("Share button clicked!");
  const handleSeeAll = () => console.log("See All button clicked!");

  const handleAcTempChange = (delta) => {
    setTemperature(prevTemp => {
      const newTemp = prevTemp + delta;
      if (newTemp >= 10 && newTemp <= 40) {
        return newTemp;
      }
      return prevTemp;
    });
  };

  const getTemperaturePath = (temp) => {
    const angle = ((temp - 10) / 30) * 180; // Map temp 10-40 to angle 0-180
    const startX = 10;
    const startY = 100;
    const radius = 90;

    const endX = startX + radius * (1 - Math.cos((angle * Math.PI) / 180));
    const endY = startY - radius * Math.sin((angle * Math.PI) / 180);

    return `M 10 100 A 90 90 0 0 1 ${endX} ${endY}`;
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-[#F5F5F7] font-sans p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">

        {/* Первая карточка: Управление кондиционером */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-3xl p-6 shadow-md flex flex-col justify-between cursor-pointer"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <div className="flex items-center text-gray-800">
                <Fan className="w-5 h-5 mr-2" />
                <span className="font-semibold text-lg">Air Conditioner</span>
              </div>
              <span className="text-gray-500 text-sm">Auto cooling</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isAcOn ? 'text-gray-800' : 'text-gray-400'}`}>{isAcOn ? 'On' : 'Off'}</span>
              <button
                onClick={toggleAc}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${isAcOn ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <motion.div
                  className="bg-white w-4 h-4 rounded-full shadow-sm"
                  animate={{ x: isAcOn ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                />
              </button>
            </div>
          </div>
          <div className="relative flex flex-col items-center">
            <div className="relative w-64 h-32 flex items-center justify-center mb-4">
              <svg className="w-full h-full" viewBox="0 0 200 100" style={{ transform: 'rotate(180deg)' }}>
                <path
                  d="M 10 100 A 90 90 0 0 1 190 100"
                  fill="none"
                  stroke="#E0E0E0"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                 <path
                  d={getTemperaturePath(temperature)}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="10"
                  strokeLinecap="round"
                  style={{ transform: 'rotate(10deg) translateX(5px)' }}
                />
              </svg>
              <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-500">
                  <span className="text-4xl font-bold text-gray-800">{temperature}</span>°
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500 -mt-8">Temperature</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center text-gray-800">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAcTempChange(-1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                -
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAcTempChange(1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ml-2 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                +
              </motion.button>
            </div>
            <span className="text-sm text-gray-500">Auto</span>
          </div>
        </motion.div>

        {/* Вторая карточка: Счет за коммунальные услуги */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-3xl p-6 shadow-md col-span-1 md:col-span-2 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="text-4xl font-bold">$924.18</span>
              <span className="text-gray-500 text-sm mt-2">This is your offices utility bill for</span>
              <span className="text-gray-500 text-sm">01 Apr - 08 Apr week.</span>
            </div>
            <div className="bg-green-100 text-green-600 rounded-full px-2 py-1 text-xs font-semibold">
              +17.21%
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="flex -space-x-2">
              {userAvatars.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`User ${index + 1}`}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="bg-gray-200 text-gray-800 font-semibold rounded-full px-6 py-3 text-sm hover:bg-gray-300 transition-colors"
            >
              SHARE
            </motion.button>
          </div>
        </motion.div>

        {/* Третья карточка: Сценарии */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-3xl p-6 shadow-md col-span-1 md:col-span-2 flex justify-between gap-4 cursor-pointer"
        >
          <motion.div whileTap={{ scale: 0.98 }} className="flex flex-col w-1/2 p-4 rounded-2xl bg-blue-100 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-gray-500" />
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex items-center text-gray-800 mb-2">
              <Sun className="w-5 h-5 mr-2 text-blue-500" />
              <span className="font-semibold text-lg">Morning Scene</span>
            </div>
            <span className="text-gray-500 text-sm">7 Devices</span>
          </motion.div>

          <motion.div whileTap={{ scale: 0.98 }} className="flex flex-col w-1/2 p-4 rounded-2xl bg-gray-100 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-gray-500" />
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex items-center text-gray-800 mb-2">
              <Moon className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-semibold text-lg">Night Scene</span>
            </div>
            <span className="text-gray-500 text-sm">2 Devices</span>
          </motion.div>
        </motion.div>

        {/* Четвертая карточка: Информация о пользователе */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-3xl p-6 shadow-md flex items-center gap-4 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img src="https://placehold.co/100x100/FFF1EE/333?text=DK" alt="Аватар" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-gray-500">Hi,</span>
            <h3 className="text-xl font-bold">Diana Kemmer</h3>
            <span className="text-gray-500 text-sm">7 devices active</span>
          </div>
          <MoreVertical className="w-6 h-6 text-gray-400" />
        </motion.div>

        {/* Пятая карточка: Добавить сценарий */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-3xl p-6 shadow-md flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1">
              <span className="text-sm">You created {scenesCreated} scenes</span>
              <span className="block text-gray-500 text-sm">{devicesInUse} devices in use</span>
            </div>
          </div>
          <div className="mt-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSeeAll}
              className="bg-gray-200 text-gray-800 font-semibold rounded-full px-6 py-3 text-sm hover:bg-gray-300 transition-colors"
            >
              See All
            </motion.button>
          </div>
        </motion.div>

        {/* Шестая карточка: AI Power Analytics */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-3xl p-6 shadow-md cursor-pointer"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-gray-800" />
              <span className="text-lg font-semibold">AI Power Analytics</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500" />
          </div>
          <span className="text-gray-500 text-sm mb-4">Daily usage</span>
          <div className="space-y-4 mt-4">
            <motion.div whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-4 rounded-xl bg-gray-100">
              <div className="flex items-center gap-4">
                <Fan className="w-6 h-6 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">Air Conditioner</span>
                  <span className="text-xs text-gray-500">2 unit | 18kWh</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
            <motion.div whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-4 rounded-xl bg-gray-100">
              <div className="flex items-center gap-4">
                <Wifi className="w-6 h-6 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">Wi-Fi Router</span>
                  <span className="text-xs text-gray-500">1 unit | 8kWh</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
            <motion.div whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-4 rounded-xl bg-gray-100">
              <div className="flex items-center gap-4">
                <Monitor className="w-6 h-6 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">Smart TV</span>
                  <span className="text-xs text-gray-500">2 unit | 12kWh</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Седьмая карточка: Активность */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-3xl p-6 shadow-md flex flex-col justify-between cursor-pointer"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold">24%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={activityData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
              <XAxis dataKey="time" axisLine={false} tickLine={false} className="text-xs text-gray-500" />
              <Bar dataKey="usage" fill="#FFC107" name="Использование" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
};

export default SmartHomeDashboard;
