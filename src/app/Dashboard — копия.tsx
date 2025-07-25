'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  {
    href: "/",
    icon: "/icons/Icon home white.png",
    iconGray: "/icons/Icon home gray.png",
    label: "Главная",
  },
  {
    href: "/shop",
    icon: "/icons/Icon shop white.png",
    iconGray: "/icons/Icon shop gray.png",
    label: "Магазин",
  },
  {
    href: "/invite",
    icon: "/icons/Icon share white.png",
    iconGray: "/icons/Icon share gray.png",
    label: "Ваша команда",
  },
  {
    href: "/education",
    icon: "/icons/Icon course white.png",
    iconGray: "/icons/Icon course gray.png",
    label: "Академия Tannur",
  },
  {
    href: "/stats",
    icon: "/icons/Icon stats white.png",
    iconGray: "/icons/Icon stats gray.png",
    label: "Ваши финансы",
  },
  {
    href: "/products",
    icon: "/icons/Icon docs white.png",
    iconGray: "/icons/Icon docs gray.png",
    label: "Ваши файлы",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-36 bg-[#e08672] flex flex-col items-center pt-12 pb-6 z-50">
      {/* Логотип */}
      <div className="mb-6 mt-4">
        <Image src="/icons/Icon Tannur.png" alt="Логотип" width={60} height={60} />
      </div>

      {/* Навигация */}
      <div className="flex-grow flex flex-col justify-center items-center gap-8">
        {navItems.map(({ href, icon, iconGray, label }) => {
          const isActive = pathname === href;
          return (
          <Link href={href} key={href}>
  <div
    className={`
      w-[60px] h-[60px] rounded-xl flex items-center justify-center 
      transition-all box-border
      ${isActive ? "bg-white" : "hover:bg-white/20"}
    `}
    title={label}
  >
    <Image
      src={isActive ? iconGray : icon}
      alt={label}
      width={22}
      height={22}
    />
  </div>
</Link>

          );
        })}
      </div>
    </aside>
  );
}
