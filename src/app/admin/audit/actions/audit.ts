'use server'

import { getSupabaseServer } from '@/lib/supabase/server'

export async function runAuditCheck(purchaseId?: string) {
  try {
    const supabase = await getSupabaseServer()
    
    // Сначала запускаем функцию аудита с детальным логированием
    const { data: auditResult, error: auditError } = await supabase.rpc('audit_team_purchases')
    
    if (auditError) {
      console.error('Audit error:', auditError)
    }
    
    // Получаем результаты проверки
    const { data, error } = await supabase.rpc('check_team_purchase_discrepancies', {
      p_team_purchase_id: purchaseId || null
    })
    
    return { 
      data, 
      error, 
      auditResult,
      // Извлекаем детальный лог из результата аудита
      detailedLog: auditResult?.detailed_log || []
    }
  } catch (error) {
    console.error('Audit check error:', error)
    return { data: null, error, detailedLog: [] }
  }
}

export async function getAuditReport(filters: {
  severity?: string
  resolved?: boolean
  daysBack?: number
}) {
  try {
    const supabase = await getSupabaseServer()
    
    const { data, error } = await supabase.rpc('get_audit_report', {
      p_severity: filters.severity || null,
      p_resolved: filters.resolved ?? false,
      p_days_back: filters.daysBack || 7
    })
    
    return { data, error }
  } catch (error) {
    console.error('Get audit report error:', error)
    return { data: null, error }
  }
}

export async function resolveIssue(issueId: string, userId: string) {
  try {
    const supabase = await getSupabaseServer()
    
    const { error } = await supabase
      .from('team_purchase_audit_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: userId
      })
      .eq('id', issueId)
    
    return { success: !error, error }
  } catch (error) {
    console.error('Resolve issue error:', error)
    return { success: false, error }
  }
}

export async function getAuditStats() {
  try {
    const supabase = await getSupabaseServer()
    
    // 1. Запускаем аудит для получения свежих данных
    const { data: auditResult } = await supabase.rpc('audit_team_purchases')
    
    // 2. Получаем данные аудита за последние 7 дней
    const { data: auditData, error: auditError } = await supabase
      .from('team_purchase_audit_logs')
      .select('severity, resolved, team_purchase_id')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    
    // 3. Получаем общую статистику по командным закупкам
    const { data: purchaseStats, error: purchaseError } = await supabase
      .from('team_purchases')
      .select('id, status, created_at')
    
    if (auditError || purchaseError) {
      console.error('Get audit stats error:', auditError || purchaseError)
      return {
        critical: 0,
        warning: 0,
        info: 0,
        resolved: 0,
        total: 0,
        totalPurchases: 0,
        activePurchases: 0,
        purchasesWithIssues: 0,
        lastAuditLog: auditResult?.detailed_log || []
      }
    }
    
    // Обрабатываем статистику аудита
    const critical = auditData?.filter(d => d.severity === 'critical' && !d.resolved).length || 0
    const warning = auditData?.filter(d => d.severity === 'warning' && !d.resolved).length || 0
    const info = auditData?.filter(d => d.severity === 'info' && !d.resolved).length || 0
    const resolved = auditData?.filter(d => d.resolved).length || 0
    const total = auditData?.length || 0
    
    // Обрабатываем статистику закупок
    const totalPurchases = purchaseStats?.length || 0
    const activePurchases = purchaseStats?.filter(p => 
      ['forming', 'active', 'purchasing', 'confirming'].includes(p.status || '')
    ).length || 0
    
    // Уникальные закупки с проблемами
    const uniquePurchasesWithIssues = new Set(
      auditData?.filter(d => !d.resolved && d.team_purchase_id)
        .map(p => p.team_purchase_id)
    ).size
    
    return {
      critical,
      warning,
      info,
      resolved,
      total,
      totalPurchases,
      activePurchases,
      purchasesWithIssues: uniquePurchasesWithIssues,
      lastAuditLog: auditResult?.detailed_log || []
    }
    
  } catch (error) {
    console.error('Get audit stats error:', error)
    return {
      critical: 0,
      warning: 0,
      info: 0,
      resolved: 0,
      total: 0,
      totalPurchases: 0,
      activePurchases: 0,
      purchasesWithIssues: 0,
      lastAuditLog: []
    }
  }
}