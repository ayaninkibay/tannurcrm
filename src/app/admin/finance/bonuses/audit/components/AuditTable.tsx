// app/admin/audit/components/AuditTable.tsx
'use client'

import { useState } from 'react'
import { resolveIssue } from '../actions/audit'
import { 
  CheckCircle, AlertTriangle, AlertCircle, Info, X, ExternalLink, 
  Clock, User, FileText, Settings, Eye, Calendar, MoreHorizontal, ChevronDown, ChevronRight, Search, Database, Zap
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface AuditTableProps {
  data: any[]
  onRefresh: () => void
  detailedLog?: any[] // Добавляем детальный лог
}

export function AuditTable({ data, onRefresh, detailedLog = [] }: AuditTableProps) {
  const { profile } = useUser()
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [resolving, setResolving] = useState<string | null>(null)
  const [showAuditLog, setShowAuditLog] = useState(false)
  
  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-[#D77E6C]" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-[#D77E6C]" />
      default: return <Info className="w-5 h-5 text-[#D77E6C]" />
    }
  }
  
  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-[#D77E6C] text-white'
      case 'warning': return 'bg-[#D77E6C]/10 text-[#D77E6C]'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  const getTypeIcon = (checkType: string) => {
    switch(checkType) {
      case 'discrepancy': return <AlertTriangle className="w-4 h-4" />
      case 'member_discrepancy': return <User className="w-4 h-4" />
      case 'overlimit': return <Settings className="w-4 h-4" />
      case 'stale': return <Clock className="w-4 h-4" />
      case 'unpaid_members': return <FileText className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }
  
  const getTypeLabel = (checkType: string) => {
    const labels = {
      discrepancy: 'Расхождение сумм',
      member_discrepancy: 'Проблема участника',
      overlimit: 'Превышение лимита',
      stale: 'Застрявшая закупка',
      unpaid_members: 'Неоплаченные участники'
    }
    return labels[checkType as keyof typeof labels] || checkType
  }

  const getStepIcon = (step: string) => {
    switch(step) {
      case 'audit_start': return <Zap className="w-4 h-4" />
      case 'purchase_analysis': return <Search className="w-4 h-4" />
      case 'member_analysis': return <User className="w-4 h-4" />
      case 'discrepancy_check': return <AlertTriangle className="w-4 h-4" />
      case 'issue_detected': return <AlertCircle className="w-4 h-4" />
      case 'issue_logged': return <FileText className="w-4 h-4" />
      case 'issue_skipped': return <Info className="w-4 h-4" />
      case 'auto_resolved': return <CheckCircle className="w-4 h-4" />
      case 'audit_complete': return <CheckCircle className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }
  
  const handleResolve = async (id: string) => {
    if (!profile?.id) {
      toast.error('Необходимо авторизоваться')
      return
    }
    
    setResolving(id)
    try {
      const result = await resolveIssue(id, profile.id)
      if (result.success) {
        toast.success('Проблема отмечена как решенная')
        onRefresh()
      } else {
        toast.error('Ошибка при обновлении статуса')
      }
    } catch (error) {
      toast.error('Произошла ошибка')
    } finally {
      setResolving(null)
    }
  }
  
  if (data.length === 0) {
    return (
      <div className="space-y-6">
        {/* Показываем лог аудита даже если проблем нет */}
        {detailedLog.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <button
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="flex items-center gap-3 text-left w-full"
              >
                {showAuditLog ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                <div>
                  <h3 className="font-semibold text-gray-900">Детальный лог последнего аудита</h3>
                  <p className="text-sm text-gray-500">
                    {detailedLog.length} шагов выполнено
                  </p>
                </div>
              </button>
            </div>
            
            {showAuditLog && (
              <div className="p-6">
                <AuditLogViewer log={detailedLog} />
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-[#D77E6C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#D77E6C]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Все отлично!</h3>
            <p className="text-gray-500 mb-4">
              Проблем не обнаружено. Система работает стабильно.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#D77E6C] bg-[#D77E6C]/10 px-4 py-2 rounded-xl font-medium">
              <CheckCircle className="w-4 h-4" />
              Статус: Здоровая система
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <div className="space-y-6">
        {/* Детальный лог аудита */}
        {detailedLog.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <button
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="flex items-center gap-3 text-left w-full hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
              >
                {showAuditLog ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D77E6C]/10 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-[#D77E6C]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Детальный лог аудита</h3>
                    <p className="text-sm text-gray-500">
                      {detailedLog.length} шагов выполнено • Последний запуск: {new Date().toLocaleTimeString('ru-RU')}
                    </p>
                  </div>
                </div>
              </button>
            </div>
            
            {showAuditLog && (
              <div className="p-6 bg-gray-50">
                <AuditLogViewer log={detailedLog} />
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Обнаруженные проблемы</h2>
            <p className="text-gray-600 mt-1">
              Найдено {data.length} {data.length === 1 ? 'проблема' : data.length < 5 ? 'проблемы' : 'проблем'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Обновлено: {new Date().toLocaleString('ru-RU')}
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <div
                key={item.id}
                className="group p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Icon & Badge */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(item.severity)}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-xl ${getSeverityBadge(item.severity)}`}>
                          {item.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title & Type */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.purchase_title || 'Командная закупка без названия'}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          {getTypeIcon(item.check_type)}
                          <span>{getTypeLabel(item.check_type)}</span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {item.message}
                      </p>
                      
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          ID: {item.team_purchase_id?.slice(0, 8)}...
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.created_at).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {item.resolved && (
                          <div className="flex items-center gap-1 text-[#D77E6C]">
                            <CheckCircle className="w-4 h-4" />
                            Решено
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.team_purchase_id && (
                      <Link 
                        href={`/admin/finance/team-purchase/${item.team_purchase_id}`}
                        className="p-2 bg-[#D77E6C]/10 text-[#D77E6C] rounded-lg hover:bg-[#D77E6C]/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="Открыть закупку"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedItem(item)
                      }}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Подробнее"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {!item.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResolve(item.id)
                        }}
                        disabled={resolving === item.id}
                        className="p-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C86B59] disabled:opacity-50 transition-colors"
                        title="Отметить как решенное"
                      >
                        {resolving === item.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {selectedItem && (
        <AuditDetails 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </>
  )
}

// Компонент для отображения детального лога
function AuditLogViewer({ log }: { log: any[] }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())
  
  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSteps(newExpanded)
  }

  const getStepIcon = (step: string) => {
    switch(step) {
      case 'audit_start': return <Zap className="w-4 h-4 text-blue-500" />
      case 'purchase_analysis': return <Search className="w-4 h-4 text-indigo-500" />
      case 'member_analysis': return <User className="w-4 h-4 text-purple-500" />
      case 'discrepancy_check': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'issue_detected': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'issue_logged': return <FileText className="w-4 h-4 text-red-600" />
      case 'issue_skipped': return <Info className="w-4 h-4 text-gray-500" />
      case 'auto_resolved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'audit_complete': return <CheckCircle className="w-4 h-4 text-green-600" />
      default: return <Database className="w-4 h-4 text-gray-400" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {log.map((logEntry, index) => (
        <div key={index} className="border border-gray-200 rounded-lg bg-white">
          <button
            onClick={() => toggleStep(index)}
            className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {getStepIcon(logEntry.step)}
              <div>
                <div className="font-medium text-gray-900">
                  {logEntry.step} 
                  <span className="ml-2 text-sm text-gray-500 font-normal">
                    {formatTimestamp(logEntry.timestamp)}
                  </span>
                </div>
                {logEntry.message && (
                  <div className="text-sm text-gray-600 mt-1">
                    {logEntry.message}
                  </div>
                )}
              </div>
            </div>
            {expandedSteps.has(index) ? 
              <ChevronDown className="w-4 h-4 text-gray-400" /> : 
              <ChevronRight className="w-4 h-4 text-gray-400" />
            }
          </button>
          
          {expandedSteps.has(index) && (
            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
              <pre className="text-sm text-gray-700 overflow-auto whitespace-pre-wrap font-mono mt-3 p-3 bg-white rounded border">
                {JSON.stringify(logEntry, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AuditDetails({ item, onClose }: any) {
  const [showAuditLog, setShowAuditLog] = useState(false)
  const auditLog = item.details?.audit_log || []

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#D77E6C]/10 rounded-xl flex items-center justify-center">
                {item.severity === 'critical' ? <AlertTriangle className="w-6 h-6 text-[#D77E6C]" /> :
                 item.severity === 'warning' ? <AlertCircle className="w-6 h-6 text-[#D77E6C]" /> :
                 <Info className="w-6 h-6 text-[#D77E6C]" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Детали проблемы</h3>
                <p className="text-gray-600">{item.purchase_title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="p-8 overflow-auto flex-1">
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Основная информация</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Тип проблемы</label>
                      <p className="mt-1 font-medium text-gray-900">{item.check_type}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Уровень важности</label>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-xl ${
                          item.severity === 'critical' ? 'bg-[#D77E6C] text-white' :
                          'bg-[#D77E6C]/10 text-[#D77E6C]'
                        }`}>
                          {item.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Время обнаружения</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(item.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {item.resolved && (
                  <div className="bg-[#D77E6C]/10 border border-[#D77E6C]/20 rounded-xl p-6">
                    <h4 className="font-semibold text-[#D77E6C] mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Статус решения
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <strong>Решено:</strong> {new Date(item.resolved_at).toLocaleString('ru-RU')}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-gray-700">
                          <strong>Комментарий:</strong> {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="bg-[#D77E6C]/5 border border-[#D77E6C]/20 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Описание проблемы</h4>
                  <p className="text-gray-800 leading-relaxed">{item.message}</p>
                </div>
                
                {item.notes && !item.resolved && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Дополнительные примечания</h4>
                    <p className="text-gray-700">{item.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Детальный лог аудита для данной проблемы */}
            {auditLog.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Детальный лог обнаружения проблемы</h4>
                  <button
                    onClick={() => setShowAuditLog(!showAuditLog)}
                    className="text-sm text-[#D77E6C] hover:text-[#C86B59] transition-colors"
                  >
                    {showAuditLog ? 'Скрыть' : 'Показать'} ({auditLog.length} шагов)
                  </button>
                </div>
                {showAuditLog && (
                  <div className="bg-white rounded-lg border border-gray-200">
                    <AuditLogViewer log={auditLog} />
                  </div>
                )}
              </div>
            )}
            
            {/* Technical Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Технические детали</h4>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <pre className="text-sm text-gray-700 overflow-auto whitespace-pre-wrap font-mono">
                  {JSON.stringify(item.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Закрыть
            </button>
            {item.team_purchase_id && (
              <Link
                href={`/admin/finance/team-purchase/${item.team_purchase_id}`}
                className="px-6 py-3 bg-[#D77E6C] text-white rounded-xl hover:bg-[#C86B59] transition-all duration-200 font-medium"
                onClick={onClose}
              >
                Открыть закупку
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}