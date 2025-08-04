'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CloudSun,
  MoreVertical,
  Paperclip,
  Eye,
  Download,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

// Утилита для получения и форматирования времени
const formatTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${strMinutes} ${ampm}`;
};

const CardGrid = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
        {/* Верхний ряд */}
        <div className="flex flex-row items-center col-span-1 md:col-span-2 lg:col-span-2 gap-4">
          {/* Первая карточка - "30 mins" и "Book a Call" */}
          <div className="bg-white rounded-[32px] p-4 flex-1 flex items-center justify-between shadow-xl">
            <span className="text-xl font-bold">30 mins</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#D7E2FF] to-[#D7E2FF] rounded-2xl px-6 py-3 font-semibold text-gray-800 shadow-lg"
            >
              Book a Call
            </motion.button>
          </div>
          {/* Вторая карточка - аватар */}
          <div className="w-[80px] h-[80px] bg-white rounded-3xl p-2 shadow-xl flex items-center justify-center">
            <img src="https://placehold.co/100x100/333333/FFFFFF?text=JAY" alt="Аватар" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>

        {/* ...existing code for other cards... */}
      </div>
    </div>
  );
};

export default CardGrid;
