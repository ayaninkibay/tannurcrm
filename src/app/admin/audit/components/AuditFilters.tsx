// app/admin/audit/components/AuditFilters.tsx
'use client'

import { useState } from 'react'
import { RefreshCw, Filter, Calendar, X } from 'lucide-react'

interface FilterProps {
  onFilterChange: (filters: any) => void
  onRefresh?: () => void
}

export function AuditFilters({ onFilterChange, onRefresh }: FilterProps) {
  const [filters, setFilters] = useState({
    severity: '',
    resolved: false,
    daysBack: 7
  })
  
  const handleChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  
  const resetFilters = () => {
    const defaultFilters = {
      severity: '',
      resolved: false,
      daysBack: 7
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }
  
  const activeFiltersCount = [
    filters.severity !== '',
    filters.resolved === true,
    filters.daysBack !== 7
  ].filter(Boolean).length
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D77E6C]/10 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-[#D77E6C]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Фильтры</h3>
            <p className="text-sm text-gray-500">Настройте параметры отображения</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#D77E6C]/10 text-[#D77E6C] text-sm rounded-xl font-medium">
                {activeFiltersCount} активных
              </span>
              <button
                onClick={resetFilters}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Сбросить фильтры"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C86B59] transition-all duration-200 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить
            </button>
          )}
        </div>
      </div>
      
      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Severity Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Уровень важности
          </label>
          <select 
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent transition-all duration-200"
            value={filters.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
          >
            <option value="">Все уровни</option>
            <option value="critical">Критические</option>
            <option value="warning">Предупреждения</option>
            <option value="info">Информационные</option>
          </select>
        </div>
        
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Статус проблем
          </label>
          <select
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent transition-all duration-200"
            value={filters.resolved ? 'resolved' : 'unresolved'}
            onChange={(e) => handleChange('resolved', e.target.value === 'resolved')}
          >
            <option value="unresolved">Активные проблемы</option>
            <option value="resolved">Решенные проблемы</option>
          </select>
        </div>
        
        {/* Time Period */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Период времени
          </label>
          <select
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D77E6C] focus:border-transparent transition-all duration-200"
            value={filters.daysBack}
            onChange={(e) => handleChange('daysBack', Number(e.target.value))}
          >
            <option value="1">Сегодня</option>
            <option value="7">За неделю</option>
            <option value="30">За месяц</option>
            <option value="90">За 3 месяца</option>
          </select>
        </div>
      </div>
    </div>
  )
}