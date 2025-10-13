// app/admin/audit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { AuditDashboard } from './components/AuditDashboard'
import { AuditTable } from './components/AuditTable'
import { runAuditCheck, getAuditReport } from './actions/audit'
import { RefreshCw, Play } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuditPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [detailedLog, setDetailedLog] = useState<any[]>([])
  const [filters, setFilters] = useState({
    severity: '',
    resolved: false,
    daysBack: 7
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getAuditReport(filters)
      if (result.error) {
        toast.error('Ошибка загрузки данных аудита')
        setData([])
      } else {
        setData(result.data || [])
      }
    } catch (error) {
      toast.error('Произошла ошибка при загрузке')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const runAudit = async () => {
    setRunning(true)
    try {
      const result = await runAuditCheck()
      
      if (result.error) {
        toast.error('Ошибка выполнения аудита')
      } else {
        // Сохраняем детальный лог
        setDetailedLog(result.detailedLog || [])
        
        toast.success(`Аудит выполнен. ${result.auditResult?.new_issues || 0} новых проблем, ${result.auditResult?.auto_resolved || 0} решено автоматически`)
        
        // Обновляем данные
        await loadData()
      }
    } catch (error) {
      toast.error('Произошла ошибка при выполнении аудита')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Система аудита</h1>
          <p className="text-gray-600 mt-2">
            Мониторинг и анализ целостности данных командных закупок
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
          
          <button
            onClick={runAudit}
            disabled={running}
            className="flex items-center gap-2 px-6 py-2 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C86B59] disabled:opacity-50 transition-all duration-200 font-medium"
          >
            <Play className={`w-4 h-4 ${running ? 'animate-pulse' : ''}`} />
            {running ? 'Выполняется аудит...' : 'Запустить аудит'}
          </button>
        </div>
      </div>

      <AuditDashboard />
      
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Фильтры</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Уровень важности
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D77E6C] focus:border-[#D77E6C]"
              >
                <option value="">Все</option>
                <option value="critical">Критические</option>
                <option value="warning">Предупреждения</option>
                <option value="info">Информационные</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                value={filters.resolved.toString()}
                onChange={(e) => setFilters(prev => ({ ...prev, resolved: e.target.value === 'true' }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D77E6C] focus:border-[#D77E6C]"
              >
                <option value="false">Нерешенные</option>
                <option value="true">Решенные</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Период
              </label>
              <select
                value={filters.daysBack}
                onChange={(e) => setFilters(prev => ({ ...prev, daysBack: parseInt(e.target.value) }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D77E6C] focus:border-[#D77E6C]"
              >
                <option value="1">Сегодня</option>
                <option value="7">Последние 7 дней</option>
                <option value="30">Последние 30 дней</option>
                <option value="90">Последние 90 дней</option>
              </select>
            </div>
          </div>
        </div>

        <AuditTable 
          data={data} 
          onRefresh={loadData}
          detailedLog={detailedLog}
        />
      </div>
    </div>
  )
}