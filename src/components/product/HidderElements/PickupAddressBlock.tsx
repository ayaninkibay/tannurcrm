'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronUp } from 'lucide-react'; // 🔹 иконки

const addresses = ['Алматы, Аскарова 24', 'Алматы, Тимирязева 60', 'Алматы, Гагарина 115'];

export default function PickupAddressBlock() {
  const [selected, setSelected] = useState(addresses[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setDropdownOpen((prev) => !prev);
  const handleSelect = (address: string) => {
    setSelected(address);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div
        onClick={handleToggle}
        className="cursor-pointer p-3 rounded-2xl transition hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 mt-2">
            <MapPin size={28} className="text-black" />
            <div>
              <p className="text-xs md:text-sm text-[#8C8C8C]">Адрес самовывоза</p>
              <p className="text-sm md:text-md font-semibold text-[#1C1C1C]">{selected}</p>
            </div>
          </div>

          <div className="mt-2">
            <ChevronUp
              size={16}
              className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {dropdownOpen && (
        <div className="absolute top-full mt-2 left-0 w-full border border-[#eeeeee] bg-[#fffffc] rounded-xl z-20">
          {addresses
            .filter((addr) => addr !== selected)
            .map((addr) => (
              <div
                key={addr}
                onClick={() => handleSelect(addr)}
                className="px-4 py-2 hover:bg-gray-100 rounded-md text-sm text-[#1C1C1C] cursor-pointer"
              >
                {addr}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
