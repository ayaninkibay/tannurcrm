// src/app/testpage-fifth/page.tsx
'use client'

import React from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import Sidebar from '@/components/Sidebar'
import { FifthTemplate } from '@/components/layouts/TannurPageTemplates'

export default function TestPageFifth() {

const teamMembers = [
  {
    id: 'KZ123456',
    parentId: null,
    name: 'Алина Сагатовна',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Enterprise' as const,
    role: 'CEO',
    verified: true
  },
  {
    id: 'KZ848970',
    parentId: 'KZ123456',
    name: 'Инжу Ануарбек',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Business' as const,
    role: 'Доктор наук',
    verified: true
  },
  {
    id: 'KZ789012',
    parentId: 'KZ123456',
    name: 'Аян Мұхамбет',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Premium' as const,
    role: 'CTO',
    verified: true
  },
  {
    id: 'KZ345678',
    parentId: 'KZ848970',
    name: 'Дана Қасымова',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Business' as const,
    role: 'Senior Researcher',
    verified: false
  },
  {
    id: 'KZ901234',
    parentId: 'KZ848970',
    name: 'Ернар Жандосов',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Basic' as const,
    role: 'Junior Researcher',
    verified: false
  },
  {
    id: 'KZ112233',
    parentId: 'KZ789012',
    name: 'Камила Әли',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Premium' as const,
    role: 'Lead Engineer',
    verified: true
  },
  {
    id: 'KZ223344',
    parentId: 'KZ789012',
    name: 'Тимур Сапар',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Business' as const,
    role: 'DevOps Engineer',
    verified: true
  },
  {
    id: 'KZ334455',
    parentId: 'KZ345678',
    name: 'Лейла Жумабек',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Business' as const,
    role: 'Research Analyst',
    verified: false
  },
  {
    id: 'KZ445566',
    parentId: 'KZ345678',
    name: 'Нурсултан Ержан',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Basic' as const,
    role: 'Research Assistant',
    verified: false
  },
  {
    id: 'KZ556677',
    parentId: 'KZ901234',
    name: 'Асем Ислам',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Basic' as const,
    role: 'Intern',
    verified: false
  },
  {
    id: 'KZ667788',
    parentId: 'KZ901234',
    name: 'Мейрам Ербол',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Basic' as const,
    role: 'Junior Developer',
    verified: false
  },
  {
    id: 'KZ778899',
    parentId: 'KZ112233',
    name: 'Гульнар Сейдахмет',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Premium' as const,
    role: 'Frontend Lead',
    verified: true
  },
  {
    id: 'KZ889900',
    parentId: 'KZ223344',
    name: 'Бекзат Төлеген',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Business' as const,
    role: 'Site Reliability',
    verified: true
  },
  {
    id: 'KZ990011',
    parentId: 'KZ123456',
    name: 'Салтанат Жанибек',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Enterprise' as const,
    role: 'CFO',
    verified: true
  },
  {
    id: 'KZ101112',
    parentId: 'KZ990011',
    name: 'Нұржан Бекзат',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Business' as const,
    role: 'Accountant',
    verified: false
  },
  {
    id: 'KZ111213',
    parentId: 'KZ990011',
    name: 'Айзада Көкен',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Business' as const,
    role: 'Financial Analyst',
    verified: false
  },
  {
    id: 'KZ121314',
    parentId: 'KZ101112',
    name: 'Жанболат Ермек',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Basic' as const,
    role: 'Clerk',
    verified: false
  },
  {
    id: 'KZ131415',
    parentId: 'KZ101112',
    name: 'Аружан Нұрсұлтан',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Basic' as const,
    role: 'Assistant',
    verified: false
  },
  {
    id: 'KZ141516',
    parentId: 'KZ778899',
    name: 'Самат Қармен',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Basic' as const,
    role: 'UI/UX Designer',
    verified: true
  },
  {
    id: 'KZ151617',
    parentId: 'KZ778899',
    name: 'Диана Өтеген',
    avatar: '/Icons/UsersAvatarPrew.jpg',
    tariff: 'Basic' as const,
    role: 'Graphic Designer',
    verified: false
  },
];


  const fullBlock = (
    <div className="w-full h-48 bg-purple-200 flex items-center justify-center">
      <span className="text-xl font-semibold">Блок 1 — Full Width</span>
    </div>
  )

  const wideBlock = (
    <div className="w-full h-32 bg-yellow-300 flex items-center justify-center">
      <span className="text-lg font-medium">Блок 2 — 80%</span>
    </div>
  )

  const narrowBlock = (
    <div className="w-full h-32 bg-red-300 flex items-center justify-center">
      <span className="text-lg font-medium">Блок 3 — 20%</span>
    </div>
  )

  return (
    <FifthTemplate
      header={<MoreHeader title="Тестовая 5 — FifthTemplate" />}
      column1={fullBlock}
      column3={wideBlock}
      column2={narrowBlock}
    />
  )
}
