'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const adminNavItems = [
  {
    href: "/admin/dashboard",
    icon: "/icons/Icon home white.png",
    iconGray: "/icons/Icon home gray.png",
    label: "Админ Главная",
  },
  {
    href: "/admin/store",
    icon: "/icons/Icon shop white.png",
    iconGray: "/icons/Icon shop gray.png",
    label: "Магазин",
  },
  {
    href: "/admin/teamcontent",
    icon: "/icons/Icon stats white.png",
    iconGray: "/icons/Icon stats white.png",
    label: "Команда",
  },
  {
    href: "/admin/settings", 
    icon: "/icons/IconSettingsWhite.png",
    iconGray: "/icons/IconSettingsWhite.png",
    label: "Настройки",
  },
  {
    href: "/admin/educationcontent",
    icon: "/icons/Icon share white.png",
    iconGray: "/icons/Icon share gray.png",
    label: "Ваши финансы",
  },
  {
    href: "/admin/warehouse",
    icon: "/icons/IconBoxWhite.png",
    iconGray: "/icons/IconBoxWhite.png",
    label: "Склад",
  },
  {
    href: "/admin/documents",
    icon: "/icons/Icon docs white.png",
    iconGray: "/icons/Icon docs gray.png",
    label: "Документы",
  },
];

export default function DashboardSidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="h-screen w-36 bg-gray-100 border-r border-gray-300 flex flex-col items-center pt-14 pb-8 fixed left-0 top-0 z-10">
      {/* Логотип-кнопка */}
      <button
        onClick={() => router.push("/")}
        className={`mb-8 w-[60px] h-[60px] rounded-xl flex items-center justify-center transition-all ${
          pathname === "/" ? "bg-[#D77E6C]" : "hover:bg-gray-100"
        }`}
        title="Админ Главная"
      >
        <Image
          src="/icons/IconTannurBlack.png"
          alt="Логотип"
          width={40}
          height={40}
        />
      </button>

      {/* Навигация */}
      <div className="flex-grow flex flex-col justify-center items-center gap-6">
        {adminNavItems.map(({ href, icon, iconGray, label }) => {
          const isActive = pathname === href;
          return (
            <Link href={href} key={href}>
              <div
                className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center transition-all ${
                  isActive ? "bg-[#D77E6C]" : "hover:bg-gray-100"
                }`}
                title={label}
              >
                <Image
                  src={isActive ? iconGray : icon}
                  alt={label}
                  width={24}
                  height={24}
                  style={{
                    filter: isActive
                      ? "brightness(0) invert(1)" // белая иконка
                      : "grayscale(100%) brightness(0.7)" // серая
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
