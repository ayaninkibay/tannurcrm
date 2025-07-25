'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const navItems = [
  {
    href: "/dealer/dashboard",
    icon: "/icons/Icon home white.png",
    iconGray: "/icons/Icon home gray.png",
    label: "Дэшборд",
  },
  {
    href: "/dealer/shop",
    icon: "/icons/Icon shop white.png",
    iconGray: "/icons/Icon shop gray.png",
    label: "Магазин",
  },
  {
    href: "/dealer/team",
    icon: "/icons/Icon share white.png",
    iconGray: "/icons/Icon share gray.png",
    label: "Ваша команда",
  },
  {
    href: "/dealer/education",
    icon: "/icons/Icon course white.png",
    iconGray: "/icons/Icon course gray.png",
    label: "Академия Tannur",
  },
  {
    href: "/dealer/stats",
    icon: "/icons/Icon stats white.png",
    iconGray: "/icons/Icon stats gray.png",
    label: "Ваши финансы",
  },
  {
    href: "/dealer/documents",
    icon: "/icons/Icon docs white.png",
    iconGray: "/icons/Icon docs gray.png",
    label: "Ваши файлы",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeTop, setActiveTop] = useState(0);

  const goToHome = () => {
    if (pathname !== "/") {
      router.push("/");
    }
  };

  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.href === pathname);
    const activeEl = itemRefs.current[activeIndex];
    const containerEl = containerRef.current;

    if (activeEl && containerEl) {
      const containerTop = containerEl.getBoundingClientRect().top;
      const itemTop = activeEl.getBoundingClientRect().top;
      setActiveTop(itemTop - containerTop);
    }
  }, [pathname]);

  return (
    <aside className="h-screen w-36 bg-[#e08672] flex flex-col items-center pt-12 pb-6 fixed left-0 top-0 z-10">
      {/* Логотип */}
      <button
        onClick={goToHome}
        className={`mb-6 mt-4 w-[60px] h-[60px] rounded-xl flex items-center justify-center transition-all ${
          pathname === "/" ? "bg-[#d9d9d9]" : "hover:bg-white/20"
        }`}
        title="Главная"
      >
        <Image src="/icons/Icon Tannur.png" alt="Логотип" width={30} height={30} />
      </button>

      {/* Навигация */}
      <div
        ref={containerRef}
        className="relative flex-grow flex flex-col justify-center items-center gap-8 mt-2 w-full"
      >
        {/* Анимированный фон */}
        <motion.div
          layout
          layoutId="active-indicator"
          className="absolute w-[60px] h-[60px] bg-white rounded-xl left-1/2 -translate-x-1/2 z-0"
          style={{ top: activeTop }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        {/* Кнопки */}
        {navItems.map(({ href, icon, iconGray, label }, index) => {
          const isActive = pathname === href;
          return (
            <Link href={href} key={href} className="relative z-10">
              <div
ref={(el) => {
  itemRefs.current[index] = el;
}}

                className="w-[60px] h-[60px] rounded-xl flex items-center justify-center transition-all hover:bg-[#ffffff33]"
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
