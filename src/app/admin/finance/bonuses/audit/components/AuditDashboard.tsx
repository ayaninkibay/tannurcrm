// app/admin/audit/components/AuditDashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, AlertCircle, Info, CheckCircle, Loader2, Users, Clock, Shield } from 'lucide-react'
import { getAuditStats } from '../actions/audit'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  bgClass: string
  textColor: string
  description?: string
}

function StatCard({ title, value, icon, bgClass, textColor, description }: StatCardProps) {
  return (
    <div className={`${bgClass} rounded-2xl p-6 transition-all duration-200 hover:scale-105`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${textColor}`}>
              {value.toLocaleString()}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700 mt-1">{title}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function AuditDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTime, setRefreshTime] = useState<Date>(new Date())
  
  useEffect(() => {
    loadStats()
    // Обновляем каждые 5 минут
    const interval = setInterval(() => {
      loadStats()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await getAuditStats()
      setStats(data)
      setRefreshTime(new Date())
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats({
        critical: 0,
        warning: 0,
        info: 0,
        resolved: 0,
        total: 0,
        totalPurchases: 0,
        activePurchases: 0
      })
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (!stats) return null
  
  const healthScore = stats.total > 0 
    ? Math.round((stats.resolved / stats.total) * 100)
    : 100
  
  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Критические проблемы"
          value={stats.critical || 0}
          icon={<AlertTriangle className="w-8 h-8 text-white" />}
          bgClass="bg-[#D77E6C] shadow-sm"
          textColor="text-white"
          description="Требуют внимания"
        />
        
        <StatCard
          title="Предупреждения"
          value={stats.warning || 0}
          icon={<AlertCircle className="w-8 h-8 text-[#D77E6C]" />}
          bgClass="bg-[#D77E6C]/10 shadow-sm"
          textColor="text-[#D77E6C]"
          description="Рекомендуется проверить"
        />
        
        <StatCard
          title="Информационные"
          value={stats.info || 0}
          icon={<Info className="w-8 h-8 text-[#D77E6C]" />}
          bgClass="bg-white shadow-sm border border-gray-100"
          textColor="text-[#D77E6C]"
          description="Для информации"
        />
        
        <StatCard
          title="Решено"
          value={stats.resolved || 0}
          icon={<CheckCircle className="w-8 h-8 text-white" />}
          bgClass="bg-[#D77E6C] shadow-sm"
          textColor="text-white"
          description="Проблемы устранены"
        />
      </div>
      
      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#D77E6C]/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#D77E6C]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Здоровье системы</h3>
              <p className="text-sm text-gray-500">Общая оценка</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Индекс здоровья</span>
              <span className="font-bold text-[#D77E6C] text-xl">
                {healthScore}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div 
                className="h-3 bg-[#D77E6C] rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {healthScore >= 90 ? 'Отличное состояние' :
               healthScore >= 70 ? 'Требует внимания' : 'Критическое состояние'}
            </p>
          </div>
        </div>
        
        {/* Active Purchases */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#D77E6C]/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#D77E6C]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Активные закупки</h3>
              <p className="text-sm text-gray-500">Под наблюдением</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Всего закупок</span>
              <span className="font-semibold text-gray-900">{stats.totalPurchases || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Активных</span>
              <span className="font-semibold text-[#D77E6C]">{stats.activePurchases || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">С проблемами</span>
              <span className="font-semibold text-[#D77E6C]">{stats.purchasesWithIssues || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Monitoring Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#D77E6C]/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#D77E6C]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Мониторинг</h3>
              <p className="text-sm text-gray-500">Статус обновления</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D77E6C] rounded-full animate-pulse"></div>
              <span className="text-sm text-[#D77E6C] font-medium">Система активна</span>
            </div>
            <div className="text-xs text-gray-500">
              Обновлено: {refreshTime.toLocaleString('ru-RU')}
            </div>
            <div className="text-xs text-gray-500">
              Следующая проверка: через 5 минут
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}