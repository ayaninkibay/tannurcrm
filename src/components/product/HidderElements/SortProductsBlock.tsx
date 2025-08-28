'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, ChevronUp } from 'lucide-react';

interface SortProductsBlockProps {
  showClientPrice?: boolean;
  onToggleClientPrice?: (value: boolean) => void;
  onSortChange?: (sortOption: string) => void;
}

const sortOptions = ['Показаны все товары', 'Сначала дешёвые', 'Сначала дорогие'];

export default function SortProductsBlock({ 
  showClientPrice = false, 
  onToggleClientPrice,
  onSortChange 
}: SortProductsBlockProps) {
  const [selected, setSelected] = useState(sortOptions[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setDropdownOpen((prev) => !prev);
  
  const handleSelect = (option: string) => {
    setSelected(option);
    setDropdownOpen(false);
    onSortChange?.(option);
  };

  const handleToggleClientPrice = () => {
    const newValue = !showClientPrice;
    onToggleClientPrice?.(newValue);
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
        className="cursor-pointer p-2 sm:p-3 rounded-xl sm:rounded-2xl transition hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <Settings size={20} className="mt-1 sm:mt-2 text-black flex-shrink-0 sm:w-7 sm:h-7" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#8C8C8C]">Сортировка</p>
              <p className="text-sm font-semibold text-[#1C1C1C] truncate">{selected}</p>
              {showClientPrice && (
                <p className="text-xs text-[#D77E6C] mt-0.5">+ клиентские цены</p>
              )}
            </div>
          </div>

          <ChevronUp
            size={14}
            className={`mt-1 sm:mt-2 transition-transform duration-300 flex-shrink-0 sm:w-4 sm:h-4 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {dropdownOpen && (
        <div className="absolute top-full border border-[#eeeeee] mt-2 left-0 w-full bg-white rounded-xl z-20 p-2 shadow-lg">
          {/* Сортировка */}
          <div className="mb-2">
            <p className="text-xs font-medium text-[#8C8C8C] px-2 mb-2">Сортировка</p>
            {sortOptions.map((option) => (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="w-4 h-4 border border-[#cfcfcf] rounded-sm flex items-center justify-center flex-shrink-0">
                  {selected === option && <div className="w-2 h-2 bg-[#D77E6C] rounded-sm" />}
                </div>
                <span className="text-sm text-[#1C1C1C]">{option}</span>
              </div>
            ))}
          </div>

          {/* Разделитель */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Дополнительные опции */}
          <div>
            <p className="text-xs font-medium text-[#8C8C8C] px-2 mb-2">Отображение</p>
            <div
              onClick={handleToggleClientPrice}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <div className="w-4 h-4 border border-[#cfcfcf] rounded-sm flex items-center justify-center flex-shrink-0">
                {showClientPrice && <div className="w-2 h-2 bg-[#D77E6C] rounded-sm" />}
              </div>
              <span className="text-sm text-[#1C1C1C]">Показать клиентские цены</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}