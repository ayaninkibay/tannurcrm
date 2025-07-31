// src/components/components_admins_dashboard/TaskCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface TaskCardProps {
  /** Заголовок задачи */
  title: string;
  /** Текст цветного статуса (например: "сделано") */
  statusLabel: string;
  /** Tailwind-класс фона для статуса, например "bg-green-200" */
  statusBg?: string;
  /** Tailwind-класс цвета текста статуса, например "text-green-800" */
  statusText?: string;
  /** URL для иконки настроек */
  settingsUrl?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  statusLabel,
  statusBg = 'bg-blue-200',
  statusText = 'text-blue-800',
  settingsUrl = '#',
}) => {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="bg-gray-100 rounded-sm p-2 flex items-center gap-1">
      {/* Иконка в белом квадрате */}
      <div className="bg-white rounded-sm p-2">
        <Image
          src="/icons/IconHourglassBlack.svg"
          width={15}
          height={15}
          alt="Task"
        />
      </div>

      {/* Текст задачи */}
      <div className="flex-1">
        <h4 className="pl-2 text-sm font-medium text-gray-900">{title}</h4>
        <p className="pl-2 text-xs text-gray-500">Задача</p>
      </div>

      {/* Цветной статус */}
      <div className={`${statusBg} px-3 rounded-full`}>
        <span className={`text-[12px] font-medium ${statusText}`}>{statusLabel}</span>
      </div>

      {/* Чекбокс */}
      <button onClick={() => setCompleted(prev => !prev)} className="p-1">
        {completed ? (
          <Image
            src="/icons/IconCheckBox.svg"
            width={15}
            height={15}
            alt="Completed"
          />
        ) : (
          <Image
            src="/icons/IconBoxBlack.svg"
            width={15}
            height={15}
            alt="Not completed"
          />
        )}
      </button>

      {/* Шестерёнка настроек */}
      <button onClick={() => window.open(settingsUrl, '_blank')} className="p-2">
        <Image
          src="/icons/IconBlackSettings.svg"
          width={17}
          height={17}
          alt="Settings"
        />
      </button>
    </div>
  );
};

// Пример вставки сразу трёх задач в блок:
//
// <div className="bg-white rounded-2xl p-4 space-y-4">
//   <TaskCard
//     title="Открыть новый филиал до 18 августа"
//     statusLabel="в процессе"
//     statusBg="bg-green-200"
//     statusText="text-green-800"
//     settingsUrl="#"
//   />
//   <TaskCard
//     title="Провести ревизию на складе до 6 июля"
//     statusLabel="просрочено"
//     statusBg="bg-red-200"
//     statusText="text-red-800"
//     settingsUrl="#"
//   />
//   <TaskCard
//     title="Объявить акцию на Август до 1 августа"
//     statusLabel="сделано"
//     statusBg="bg-blue-200"
//     statusText="text-blue-800"
//     settingsUrl="#"
//   />
// </div>

