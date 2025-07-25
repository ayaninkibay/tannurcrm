'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();

  const goToHome = () => {
    if (pathname !== "/dashboard-home") {
      router.push("/dashboard-home");
    }
  };

  return (
    <aside className="h-screen w-36 bg-[#e08672] flex flex-col items-center pt-12 pb-6 fixed left-0 top-0 z-10">
      <Link href="/admin/adashboard">
  <div className="w-15 h-15 rounded-xl flex items-center justify-center transition-all hover:bg-[#ffffff33]" title="Админка">
    <Image src="/icons/Icon admin white.png" alt="Админка" width={22} height={22} />
  </div>
</Link>

      
      {/* Логотип-кнопка */}
      <button
        onClick={goToHome}
        className={`mb-6 mt-4 w-[60px] h-[60px] rounded-xl flex items-center justify-center transition-all ${
          pathname === "/dashboard-home" ? "bg-[#d9d9d9]" : "hover:bg-white/20"
        }`}
        title="Главная"
      >
        <Image src="/icons/Icon Tannur.png" alt="Логотип" width={30} height={30} />
      </button>

      {/* Навигация */}
      <div className="flex-grow flex flex-col justify-center items-center gap-8 mt-2">
        {navItems.map(({ href, icon, iconGray, label }) => {
          const isActive = pathname === href;
          return (
            <Link href={href} key={href}>
              <div
                className={`w-15 h-15 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? "bg-white" : "hover:bg-[#ffffff33]"
                }`}
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
