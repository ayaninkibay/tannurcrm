'use client'

import React from 'react'
import MoreHeaderDE from '@/components/header/MoreHeaderDE'
import TeamCard from '@/components/blocks/TeamCard'
import UserProfileCard from '@/components/profile/UserProfileCard'
import TannurButton from '@/components/Button'
import ReferalLink from '@/components/blocks/ReferralLink'
import SponsorCard from '@/components/blocks/SponsorCard'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'
import BonusCard from '@/components/blocks/BonusCard'
import AddDealerCard from '@/components/blocks/AddDealerCard'
import TeamTree from '@/components/team/TeamTree'

// Определяем интерфейс TeamMember для типобезопасности
interface TeamMember {
  id: string;
  parentId: string | null;
  name: string;
  avatar?: string;
  tariff: 'Basic' | 'Business' | 'Premium' | 'Enterprise';
  role: string;
  verified: boolean;
  teamCount?: number;
}

export default function TeamPage() {
  // Данные команды с правильной типизацией
  const teamMembers: TeamMember[] = [
    {
      id: 'KZ123456',
      parentId: null,
      name: 'Алина Сагатовна',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Enterprise',
      role: 'CEO',
      verified: true
    },
    {
      id: 'KZ848970',
      parentId: 'KZ123456',
      name: 'Инжу Ануарбек',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Business',
      role: 'Доктор наук',
      verified: true
    },
    {
      id: 'KZ789012',
      parentId: 'KZ123456',
      name: 'Аян Мұхамбет',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Premium',
      role: 'CTO',
      verified: true
    },
    {
      id: 'KZ345678',
      parentId: 'KZ848970',
      name: 'Дана Қасымова',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Business',
      role: 'Senior Researcher',
      verified: false
    },
    {
      id: 'KZ901234',
      parentId: 'KZ848970',
      name: 'Ернар Жандосов',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Basic',
      role: 'Junior Researcher',
      verified: false
    },
    {
      id: 'KZ112233',
      parentId: 'KZ789012',
      name: 'Камила Әли',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Premium',
      role: 'Lead Engineer',
      verified: true
    },
    {
      id: 'KZ223344',
      parentId: 'KZ789012',
      name: 'Тимур Сапар',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Business',
      role: 'DevOps Engineer',
      verified: true
    },
    {
      id: 'KZ334455',
      parentId: 'KZ345678',
      name: 'Лейла Жумабек',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Business',
      role: 'Research Analyst',
      verified: false
    },
    {
      id: 'KZ445566',
      parentId: 'KZ345678',
      name: 'Нурсултан Ержан',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Basic',
      role: 'Research Assistant',
      verified: false
    },
    {
      id: 'KZ556677',
      parentId: 'KZ901234',
      name: 'Асем Ислам',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Basic',
      role: 'Intern',
      verified: false
    },
    {
      id: 'KZ667788',
      parentId: 'KZ901234',
      name: 'Мейрам Ербол',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Basic',
      role: 'Junior Developer',
      verified: false
    },
    {
      id: 'KZ778899',
      parentId: 'KZ112233',
      name: 'Гульнар Сейдахмет',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Premium',
      role: 'Frontend Lead',
      verified: true
    },
    {
      id: 'KZ889900',
      parentId: 'KZ223344',
      name: 'Бекзат Төлеген',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Business',
      role: 'Site Reliability',
      verified: true
    },
    {
      id: 'KZ990011',
      parentId: 'KZ123456',
      name: 'Салтанат Жанибек',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Enterprise',
      role: 'CFO',
      verified: true
    },
    {
      id: 'KZ101112',
      parentId: 'KZ990011',
      name: 'Нұржан Бекзат',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Business',
      role: 'Accountant',
      verified: false
    },
    {
      id: 'KZ111213',
      parentId: 'KZ990011',
      name: 'Айзада Көкен',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Business',
      role: 'Financial Analyst',
      verified: false
    },
    {
      id: 'KZ121314',
      parentId: 'KZ101112',
      name: 'Жанболат Ермек',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Basic',
      role: 'Clerk',
      verified: false
    },
    {
      id: 'KZ131415',
      parentId: 'KZ101112',
      name: 'Аружан Нұрсұлтан',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Basic',
      role: 'Assistant',
      verified: false
    },
    {
      id: 'KZ141516',
      parentId: 'KZ778899',
      name: 'Самат Қармен',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Basic',
      role: 'UI/UX Designer',
      verified: true
    },
    {
      id: 'KZ151617',
      parentId: 'KZ778899',
      name: 'Диана Өтеген',
      avatar: '/icons/UsersAvatarPrew.jpg',
      tariff: 'Basic',
      role: 'Graphic Designer',
      verified: false
    },
  ];

  const handleSelectMember = (member: TeamMember) => {
    console.log('Выбран участник:', member);
    // Здесь можно обновить состояние или выполнить другие действия
  };

  const handleEditMember = (member: TeamMember) => {
    console.log('Редактирование участника:', member);
    // Открыть модалку редактирования или перейти на страницу редактирования
  };

  return (
    <div className="flex flex-col h-full p-2 md:p-6 bg-[#F5F5F5]">
      
      {/* Верхний хедер */}
      <MoreHeaderDE title="Моя команда" />

      {/* Контент страницы */}
      <div className="flex flex-col gap-6">

        {/* Первая секция */}
        <section className="grid grid-cols-10 rounded-xl mt-10 gap-4">
          <div className="col-span-10 sm:col-span-10 md:col-span-10 xl:col-span-4 grid grid-rows-3 xl:grid-rows-5 rounded-2xl gap-4">
            <div className="row-span-1 lg:row-span-1 xl:row-span-2 rounded-2xl bg-white h-full w-full">
              <TeamCard
                title="Моя команда"
                count={68}
                goal={100}
                showButton={false}
                variant="white"
              />
            </div>
            <div className="row-span-1 lg:row-span-1 xl:row-span-2 rounded-2xl bg-white h-full w-full">
              <BonusCard variant="white" turnover={7412000} goal={9800000} remaining={2388000} />
            </div>
            <div className="row-span-1 rounded-2xl flex bg-white h-full w-full">
              <AddDealerCard
                title="Присоединить нового партнёра"
                description="Вы можете пригласить человека в свою ветку, используя эту кнопку."
                onAdd={() => console.log('Добавить дилера')}
                onAvatarClick={() => console.log('Аватар нажат')}
              />
            </div>
          </div>

          <div className="col-span-10 md:col-span-5 xl:col-span-4 rounded-2xl p-4 bg-white">
            <BonusTableBlock />
          </div>

          <div className="col-span-10 md:col-span-5 xl:col-span-2 rounded-2xl bg-white grid grid-rows-[auto_auto_auto_auto] p-4 gap-4">
            <UserProfileCard />
            <div className="space-y-4 hidden md:block">
              <TannurButton href="/profile" text="Моя страница" iconSrc="/icons/IconGroupBlack.png" arrow="black" variant="gray" />
              <TannurButton href="/notifications" text="Уведомления" iconSrc="/icons/Icon notifications.png" arrow="black" variant="gray" />
            </div>
            <ReferalLink variant="orange" />
            <SponsorCard variant="gray" />
          </div>
        </section>

        {/* Вторая секция - Дерево команды */}
        <div className="h-screen">
          <section className="bg-white rounded-xl w-full h-full overflow-hidden">
            <TeamTree
              members={teamMembers}
              currentUserId="KZ123456"
              onSelectMember={handleSelectMember}
              onEditMember={handleEditMember}
            />
          </section>
        </div>

      </div>
    </div>
  )
}