'use client'

import React from 'react'
import MoreHeader from '@/components/header/MoreHeader'
import TeamCard from '@/components/blocks/TeamCard'
import UserProfileCard from '@/components/profile/UserProfileCard'
import TannurButton from '@/components/Button'
import ReferalLink from '@/components/blocks/ReferralLink'
import SponsorCard from '@/components/blocks/SponsorCard'
import BonusTableBlock from '@/components/blocks/BonusTableBlock'
import BonusCard from '@/components/blocks/BonusCard'
import AddDealerCard from '@/components/blocks/AddDealerCard'
import TeamTree from '@/components/team/TeamTree'

export default function TeamPage() {
  // Данные команды — можете получать из API или props
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

  const handleSelectMember = (member: any) => {
    console.log('Выбран участник:', member);
    // Здесь можно обновить состояние или выполнить другие действия
  };

  const handleEditMember = (member: any) => {
    console.log('Редактирование участника:', member);
    // Открыть модалку редактирования или перейти на страницу редактирования
  };

  return (
    <div className="flex flex-col h-full p-2 md:p-6 bg-[#F5F5F5]">
      
      {/* Верхний хедер */}
      <MoreHeader title="Моя команда" />

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
              currentUserId="KZ123456" // ID текущего пользователя (например, CEO)
              onSelectMember={handleSelectMember}
              onEditMember={handleEditMember}
            />
          </section>
        </div>

      </div>
    </div>
  )
}