'use client';

import Image from 'next/image';
import MoreHeader from '@/components/header/MoreHeader';
import { ThirdTemplate } from '@/components/layouts/TannurPageTemplates';

export default function ProfileDealer() {
  return (
    <ThirdTemplate
      header={
        <MoreHeader
          title={
            <span>
              <span className="text-gray-400">Tannur</span>
              <span className="mx-1 text-[#111]">/</span>
              <span className="text-[#111]">Профиль дилера</span>
            </span>
          }
        />
      }
      column1={
        <>
          {/* Команда + ссылка */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <p className="text-sm text-gray-600 mb-2">Команда Алина</p>
            <p className="text-2xl font-bold text-[#111] mb-4">68 человек</p>
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <img
                  key={i}
                  src={`/icons/Usersavatar${i}.png`}
                  className="w-10 h-10 rounded-full border-2 border-white"
                  alt={`team-${i}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-1">Ссылка для приглашения</p>
            <div className="flex items-center gap-2 bg-[#D46F4D] text-white px-4 py-2 rounded-xl text-sm">
              <span className="flex-1">tannur.app/KZ848970</span>
              <Image src="/icons/IconSearchWhite.svg" alt="copy" width={16} height={16} />
            </div>
          </div>

          {/* Инструкция */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <Image src="/icons/LogoTannur.svg" alt="Tannur" width={80} height={30} className="mb-3" />
            <p className="text-xs text-gray-500 leading-relaxed space-y-2 mb-4">
              <span>
                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
              </span>
              <br />
              <span>
                Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text,
                and a search for 'lorem ipsum' will uncover many web sites still in their infancy.
              </span>
              <br />
              <span>
                Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
              </span>
            </p>
            <p className="text-xs text-[#111] font-medium underline cursor-pointer">Перейти на сайт</p>
          </div>
        </>
      }
      column2={
        <>
          {/* Блок Алина Аскарова */}
          <div className="bg-gradient-to-r from-[#E79DBB] via-[#EAD2DC] to-[#BAC7EB] rounded-2xl p-6 md:p-8 flex items-center gap-6">
            <img
              src="/icons/Usersavatar6.png"
              alt="dealer"
              className="w-[100px] h-[100px] rounded-2xl object-cover"
            />
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-lg font-semibold text-[#111] flex items-center gap-1">
                Алина Аскарова
                <Image src="/icons/IconCheckMarkBlue.svg" alt="verify" width={16} height={16} />
              </p>
              <p className="text-sm text-gray-600">Эксперт</p>
              <p className="text-sm text-gray-500">inzhu@gmail.com</p>
              <p className="text-sm text-gray-500">+7 707 700 00 02</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-500">Товарооборот</p>
              <p className="text-xl font-semibold text-[#111] flex items-center gap-1">
                7 412 000 ₸
                <Image src="/icons/IconArrowGrow.svg" alt="up" width={16} height={16} />
              </p>
            </div>
          </div>

{/* Галерея - 3 пустых блока */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="w-full h-[200px] bg-white rounded-xl"
              />
            ))}
          </div>
        </>
      }
    />
  );
}
