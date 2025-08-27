'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, ChevronUp } from 'lucide-react'; // 🔹 иконки

const sortOptions = ['Показаны все товары', 'Сначала дешёвые', 'Сначала дорогие'];

export default function SortProductsBlock() {
  const [selected, setSelected] = useState(sortOptions[0]);
  const [showClientPrice, setShowClientPrice] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setDropdownOpen((prev) => !prev);
  const handleSelect = (option: string) => {
    setSelected(option);
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
          <div className="flex items-start gap-3">
            <Settings size={28} className="mt-2 text-black" />
            <div>
              <p className="text-xs md:text-sm text-[#8C8C8C]">Сортировка</p>
              <p className="text-sm md:text-md font-semibold text-[#1C1C1C]">{selected}</p>
            </div>
          </div>

          <ChevronUp
            size={16}
            className={`mt-2 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {dropdownOpen && (
        <div className="absolute top-full border border-[#eeeeee] mt-2 left-0 w-full bg-[#fffffc] rounded-xl z-20 p-2">
          {sortOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              <div className="w-4 h-4 border border-[#cfcfcf] rounded-sm flex items-center justify-center">
                {selected === option && <div className="w-2 h-2 bg-[#D77E6C] rounded-sm" />}
              </div>
              <span className="text-sm text-[#1C1C1C]">{option}</span>
            </div>
          ))}

          {/* Кастомный флажок */}
          <div
            onClick={() => setShowClientPrice((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl cursor-pointer mt-2"
          >
            <div className="w-4 h-4 border border-[#cfcfcf] rounded-sm flex items-center justify-center">
              {showClientPrice && <div className="w-2 h-2 bg-[#D77E6C] rounded-sm" />}
            </div>
            <span className="text-sm text-[#1C1C1C]">Показать клиентскую цену</span>
          </div>
        </div>
      )}
    </div>
  );
}
