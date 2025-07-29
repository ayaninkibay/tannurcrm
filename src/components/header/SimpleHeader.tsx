'use client';

import { usePathname } from 'next/navigation';

interface SimpleHeaderProps {
  title: string;
}

export default function SimpleHeader({ title }: SimpleHeaderProps) {
  const pathname = usePathname();

  const isProfile = pathname === '/myprofile';
  const isNotifications = pathname === '/notifications';

  return (
    <div className="w-full border-b border-black/20 mb-10">
      <div className="h-[72px] flex items-center justify-between bg-[]">
      <h1 className="text-3xl font-semibold text-[#111]">{title}</h1>
      
      <div className="flex items-center gap-3">
        <a href="/notifications">
          <button
            className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isNotifications ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            <img src="/icons/buttom/IconBell.svg" alt="Уведомления" width={16} height={16} />
          </button>
        </a>
        <a href="/myprofile">
          <button
            className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isProfile ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            <img src="/icons/buttom/IconProfile.svg" alt="Профиль" width={16} height={16} />
          </button>
        </a>
      </div>
    </div>
        </div>
  );
}
