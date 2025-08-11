'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { ThirdTemplate } from '@/components/layouts/TannurPageTemplates';
import DealerPost from '@/components/ui/DealerPost';

// Import the necessary modules for user data
import { useUser } from '@/context/UserContext'; // Assuming UserContext provides the user profile
import { userService } from '@/lib/user/UserService'; // If you need to fetch user data directly
import { Database } from '@/types/supabase'; // For Supabase types

type UserProfile = Database['public']['Tables']['users']['Row'];

export default function ProfileDealer() {
  // Get user profile from context
  const { profile, loading: userContextLoading } = useUser();
  const [dealerProfile, setDealerProfile] = useState<UserProfile | null>(null);
  const [loadingDealer, setLoadingDealer] = useState(true);

  // Fetch the specific dealer's profile (assuming 'Aina Askarova' is the current user)
  // In a real application, you'd fetch the profile based on the authenticated user's ID
  useEffect(() => {
    const fetchDealerProfile = async () => {
      if (profile) {
        setDealerProfile(profile);
      }
      setLoadingDealer(false);
    };

    fetchDealerProfile();
  }, [profile]); // Rerun when the global profile changes

  // Function to copy the link to clipboard
  const handleCopy = () => {
    const text = 'tannur.app/KZ848970'; // This link might need to be dynamic based on the user's referral code
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Ссылка скопирована!');
      })
      .catch(() => {
        alert('Не удалось скопировать ссылку');
      });
  };

  if (loadingDealer || userContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F3F3F3]">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC7C67] mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля дилера...</p>
        </div>
      </div>
    );
  }

  // Fallback if no dealer profile is found
  if (!dealerProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F3F3F3]">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <p className="text-red-500">Ошибка: Профиль дилера не найден.</p>
        </div>
      </div>
    );
  }

  // Content for the left column
  const leftColumnContent = (
    <>
      {/* Team + Link */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
        {/* Top part: title + avatars */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
          {/* Title and number */}
          <div>
            <p className="text-xs sm:text-sm text-gray-600 ">Команда {dealerProfile.first_name || 'Алина'}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#111]">68 человек</p> {/* This count might need to be dynamic */}
          </div>

          {/* Avatar scheme - responsive */}
          <div className="relative w-full sm:w-[200px] h-[130px] mx-auto sm:mx-0">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 130"
              preserveAspectRatio="xMidYMid meet"
            >
              <line x1="100" y1="15" x2="80" y2="50" stroke="#DC7C67" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="80" y1="50" x2="110" y2="70" stroke="#DC7C67" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="60" y1="100" x2="110" y2="70" stroke="#DC7C67" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="160" y1="100" x2="110" y2="70" stroke="#DC7C67" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            <img
              src="/icons/Users avatar 1.png"
              alt="user1"
              className="absolute top-[2px] left-[45%] sm:left-[90px] w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#DC7C67]"
            />
            <img
              src="/icons/Users avatar 2.png"
              alt="user2"
              className="absolute top-[35px] left-[30%] sm:left-[60px] w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#DC7C67]"
            />
            <img
              src="/icons/Users avatar 3.png"
              alt="user3"
              className="absolute top-[60px] left-[50%] sm:left-[100px] w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white z-10 transform -translate-x-1/2 sm:translate-x-0"
            />
            <img
              src="/icons/Users avatar 5.png"
              alt="user4"
              className="absolute top-[79px] left-[25%] sm:left-[50px] w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#DC7C67]"
            />
            <img
              src="/icons/Users avatar 4.png"
              alt="user5"
              className="absolute top-[92px] left-[80%] sm:left-[160px] w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#DC7C67]"
            />
          </div>
        </div>

        {/* Invitation link */}
        <div className="w-full bg-[#DC7C67] text-white rounded-lg sm:rounded-xl p-2.5 sm:p-3">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <img src="/icons/Iconsharewhite.png" className="w-3.5 h-3.5 sm:w-4 sm:h-4" alt="share" />
            <p className="text-[11px] sm:text-[12px] font-medium">Ссылка для приглашения</p>
          </div>
          <div className="bg-white rounded-md px-2 py-1.5 sm:px-3 sm:py-2 flex justify-between items-center gap-2">
            <span className="text-[11px] sm:text-[12px] text-black truncate">
              <span className="text-gray-400">tannur.app/</span>
              {dealerProfile.referral_code || 'KZ848970'}
            </span>
            <img
              onClick={handleCopy}
              src="/icons/Icon copy gray.png"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer flex-shrink-0"
              alt="copy"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6">
        {/* Title */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#111]">
          Награды от Tannur Cosmetics
        </h2>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          It is a long established fact that a reader will be distracted by the
          readable content .
        </p>

        {/* Award cards */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          {/* First card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 flex flex-col items-center text-center">
            {/* Icon */}
            <Image
              src="/icons/IconBulbPink.svg"
              alt="Партнер года"
              width={60}
              height={60}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-[60px] md:h-[60px] mb-2 sm:mb-3 md:mb-4"
            />
            {/* Logo */}
            <Image
              src="/icons/LogotipTannurOrange.svg"
              alt="Tannur logo"
              width={40}
              height={12}
              className="w-8 h-2.5 sm:w-10 sm:h-3 mb-1 sm:mb-2"
            />
            {/* Text */}
            <p className="text-[10px] sm:text-xs md:text-sm text-[#111] leading-tight">
              Партнер года 2025<br />
              II место
            </p>
          </div>

          {/* Second card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 flex flex-col items-center text-center">
            <Image
              src="/icons/IconballoonsPink.svg"
              alt="Участник Awards"
              width={60}
              height={60}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-[60px] md:h-[60px] mb-2 sm:mb-3 md:mb-4"
            />
            <Image
              src="/icons/LogotipTannurOrange.svg"
              alt="Tannur logo"
              width={40}
              height={12}
              className="w-8 h-2.5 sm:w-10 sm:h-3 mb-1 sm:mb-2"
            />
            <p className="text-[10px] sm:text-xs md:text-sm text-[#111] leading-tight">
              Участник<br />
              Tannur Awards 2025
            </p>
          </div>
        </div>
      </div>
    </>
  );

  // Content for the right column
  const rightColumnContent = (
    <>
      {/* Alana Askarova block */}
      <div className="relative rounded-2xl bg-white overflow-hidden min-h-[240px] sm:min-h-[260px] md:min-h-[280px]">
        {/* Gradient stripe on top */}
        <div className="absolute inset-x-0 top-0 h-20 sm:h-24 md:h-32 lg:h-36 bg-gradient-to-r from-[#E79DBB] via-[#EAD2DC] to-[#BAC7EB]" />

        {/* Content: responsive */}
        <div className="relative pt-16 sm:pt-20 md:pt-28 lg:pt-36 p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Mobile version - vertical */}
          <div className="flex flex-col gap-3 sm:gap-4 md:hidden">
            {/* Avatar and main info */}
            <div className="flex gap-3">
              <img
                src={dealerProfile.avatar_url || '/icons/UsersAvatarPrew.jpg'}
                alt="dealer"
                className="w-28 h-28 sm:w-32 sm:h-32 -mt-10 sm:-mt-10 object-cover rounded-xl flex-shrink-0 "
              />
              <div className="flex-1 min-w-0 ">
                <p className="text-base sm:text-lg font-semibold text-[#111] flex items-center gap-1 mt-5">
                  {dealerProfile.first_name || 'Имя'} {dealerProfile.last_name || 'Фамилия'}
                  <Image src="/icons/IconCheckMarkBlue.svg" alt="verify" width={14} height={14} className="flex-shrink-0" />
                </p>
                <p className="text-xs sm:text-sm text-gray-800">Эксперт</p> {/* This role might need to be dynamic */}
                <p className="text-xs sm:text-sm text-gray-500 truncate">{dealerProfile.email || 'N/A'}</p>
                <p className="text-xs sm:text-sm text-gray-500">{dealerProfile.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Turnover */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-black">Товарооборот</p>
              <div className="flex items-center gap-2">
                <p className="text-lg sm:text-xl font-semibold text-gray-600">7 412 000 ₸</p> {/* This should be dynamic */}
                <Image src="/icons/IconStongs.png" alt="up" width={28} height={28} />
              </div>
            </div>
          </div>

          {/* Desktop version - horizontal */}
          <div className="hidden md:flex md:items-start lg:items-center gap-4 md:gap-6">
            {/* Avatar */}
            <img
              src={dealerProfile.avatar_url || '/icons/UsersAvatarPrew.jpg'}
              alt="dealer"
              className="w-[140px] h-[140px] lg:w-[180px] lg:h-[180px] -mt-24 lg:-mt-32 xl:-mt-40 object-cover rounded-2xl flex-shrink-0"
            />

            {/* Information */}
            <div className="flex-1 flex flex-col justify-center gap-1 min-w-0 mt-5">
              <p className="text-xl lg:text-2xl font-semibold text-[#111] flex items-center gap-1">
                {dealerProfile.first_name || 'Имя'} {dealerProfile.last_name || 'Фамилия'}
                <Image src="/icons/IconCheckMarkBlue.svg" alt="verify" width={16} height={16} className="flex-shrink-0" />
              </p>
              <p className="text-sm md:text-base text-gray-800">Эксперт</p> {/* This role might need to be dynamic */}
              <p className="text-sm text-gray-500 truncate">{dealerProfile.email || 'N/A'}</p>
              <p className="text-sm text-gray-500">{dealerProfile.phone || 'N/A'}</p>
            </div>

            {/* Turnover */}
            <div className="ml-auto flex-shrink-0">
              <p className="text-sm md:text-base text-black text-right">Товарооборот</p>
              <div className="flex items-center gap-2 justify-end">
                <p className="text-xl lg:text-2xl font-semibold text-gray-600">7 412 000 ₸</p> {/* This should be dynamic */}
                <Image src="/icons/IconStongs.png" alt="up" width={40} height={40} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex justify-between mt-4 sm:mt-6 items-center px-4 sm:px-6 md:px-8 text-[#111] text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
        <span>Лента</span>
        <Image
          src="/icons/IconSettingsBlack.svg"
          alt="settings"
          width={20}
          height={20}
          className="w-4 h-4 sm:w-5 sm:h-5"
        />
      </div>

      {/* Gallery - responsive grid */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <DealerPost
          imageSrc="/icons/gallery1.jpg"
          alt="Gallery image 1"
          title="It is a long established fact that ."
          description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        />
        <DealerPost
          imageSrc="/icons/gallery2.jpg"
          alt="Gallery image 2"
          title="It is a long established fact that ."
          description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        />
        <DealerPost
          imageSrc="/icons/gallery3.jpg"
          alt="Gallery image 3"
          title="It is a long established fact that ."
          description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        />
        <DealerPost
          imageSrc="/icons/gallery1.jpg"
          alt="Gallery image 1"
          title="It is a long established fact that ."
          description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        />
        <DealerPost
          imageSrc="/icons/gallery2.jpg"
          alt="Gallery image 2"
          title="It is a long established fact that ."
          description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        />
        <DealerPost
          imageSrc="/icons/gallery3.jpg"
          alt="Gallery image 3"
          title="It is a long established fact that ."
          description="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
        />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile version - show blocks in the desiredr */}
      <div className="md:hidden">

        <div className="p-3 sm:p-4">
          {rightColumnContent}
          <div className="mt-4 sm:mt-6">
            {leftColumnContent}
          </div>
        </div>
      </div>

      {/* Desktop version - use ThirdTemplate */}
      <div className="hidden md:block p-6">
        <ThirdTemplate
          header={
            <MoreHeaderAD
              title={
                <span>
                  <span className="text-gray-400">Tannur</span>
                  <span className="mx-1 text-[#111]">/</span>
                  <span className="text-[#111]">Профиль дилера</span>
                </span>
              }
            />
          }
          column1={leftColumnContent}
          column2={rightColumnContent}
        />
      </div>
    </>
  );
}