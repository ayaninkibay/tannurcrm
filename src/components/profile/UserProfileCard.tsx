'use client'

import Image from 'next/image'
import { useUser } from '@/context/UserContext'

export default function UserProfileCard() {
  const { profile, loading } = useUser()

  return (
    <div className="w-full bg-white rounded-2xl transition-all duration-300 ease-in-out h-full">
      {loading ? (
        <>
          <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-xl animate-pulse shrink-0" />
            <div className="flex flex-1 min-w-0 flex-col justify-center space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </>
      ) : profile ? (
        <>
          <div className="flex justify-between items-start">
            <h2 className="text-md font-semibold text-[#111] mb-4">Мой профиль</h2>
            <Image src="/icons/buttom/more.svg" alt="more" width={4} height={4} />
          </div>

          <div className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
            <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-300 shrink-0">
              <Image
                src={profile.avatar_url || '/img/avatar-default.png'}
                alt="avatar"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex flex-col justify-center flex-1 min-w-[200px]">
              <div className="flex items-center gap-1 flex-wrap">
                <p className="text-base font-semibold text-[#111] truncate">
                  {profile.first_name} {profile.last_name}
                </p>
                {profile.is_confirmed && (
                  <Image src="/icons/confirmed.svg" alt="confirmed" width={16} height={16} />
                )}
              </div>
              <p className="text-sm text-[#111] font-medium truncate">{profile.referral_code}</p>
              <p className="text-sm text-gray-500 truncate">{profile.region}</p>
              <p className="text-sm text-gray-500 truncate">{profile.phone}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-300" />
        </>
      ) : null}
    </div>
  )
}
