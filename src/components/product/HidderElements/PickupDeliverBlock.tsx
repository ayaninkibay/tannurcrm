'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const deliveryOptions = [
  'Доставка не доступна',
  'Добавить адрес',
];

export default function PickupDeliverBlock() {
  const [selected, setSelected] = useState(deliveryOptions[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setDropdownOpen((prev) => !prev);

  const handleSelect = (option: string) => {
    setSelected(option);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      {/* Основной блок */}
      <div
        onClick={handleToggle}
        className="cursor-pointer p-3 rounded-2xl transition hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Image
              src="/icons/buttom/delivery_black.svg"
              alt="delivery"
              width={28}
              height={28}
              className="mt-2"
            />
            <div>
              <p className="text-xs md:text-sm text-[#8C8C8C]">Адрес доставки</p>
              <p className="text-sm md:text-md font-semibold text-gray-400">
                {selected}
              </p>
            </div>
          </div>

          {/* Иконка стрелки */}
          <Image
            src="/icons/buttom/updown_black.svg"
            alt="toggle"
            width={16}
            height={16}
            className={`mt-2 transition-transform duration-300 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown — теперь СНИЗУ */}
      {dropdownOpen && (
        <div className="absolute top-full mt-2 left-0 w-full border border-[#eeeeee] bg-[#fffffc] rounded-xl z-20">
          {deliveryOptions
            .filter((opt) => opt !== selected)
            .map((opt) => (
              <div
                key={opt}
                onClick={() => handleSelect(opt)}
                className="px-4 py-2 hover:bg-gray-100 rounded-md text-sm text-[#1C1C1C] cursor-pointer"
              >
                {opt}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
