// src/app/admin/finance/bonuses/[month]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import { BonusService } from '@/lib/bonuses/BonusService';
import {
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ChevronRight,
  RefreshCw,
  Check,
  Eye,
  AlertCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  History,
  FileText,
  Loader2,
  Info,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function MonthBonusesPage() {
  const router = useRouter();
  const params = useParams();
  const selectedMonth = params.month as string;

  const [users, setUsers] = useState([]);
  const [bonusLevels, setBonusLevels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthStatus, setMonthStatus] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCheckingAudit, setIsCheckingAudit] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [dataSource, setDataSource] = useState('current');
  const [auditResults, setAuditResults] = useState(null);
  const [showAuditPopup, setShowAuditPopup] = useState(false);
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTurnover: 0,
    totalBonuses: 0,
    averagePercent: 0
  });

  useEffect(() => {
    if (!selectedMonth) return;
    
    setSearchQuery('');
    loadData();
    checkMonthStatus();
    
    const timer = setTimeout(() => {
      checkSystemHealth();
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedMonth]);

  const checkMonthStatus = async () => {
    try {
      const status = await BonusService.getMonthStatus(selectedMonth);
      setMonthStatus(status);
    } catch (err) {
      console.error('Error checking month status:', err);
    }
  };

  const checkSystemHealth = async () => {
    try {
      setIsCheckingAudit(true);
      
      if (monthStatus?.isHistorical && (monthStatus?.isFinalized || monthStatus?.isPaid)) {
        setSystemHealth({
          hasIssues: false,
          issuesCount: 0,
          canProceed: true,
          message: 'Месяц уже финализирован'
        });
        return;
      }

      const currentMonth = BonusService.getCurrentMonth();
      const lastMonth = new Date(currentMonth + '-01');
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().substring(0, 7);
      
      if (selectedMonth === currentMonth || selectedMonth === lastMonthStr) {
        const issues = await BonusService.auditTurnoverCheck();
        const problemsOnly = issues.filter(i => !i.is_correct);
        
        setSystemHealth({
          hasIssues: problemsOnly.length > 0,
          issuesCount: problemsOnly.length,
          canProceed: problemsOnly.length === 0,
          message: problemsOnly.length > 0 
            ? `Найдено ${problemsOnly.length} проблем. Требуется аудит.`
            : 'Система работает корректно'
        });
        
        setAuditResults(problemsOnly);
      } else {
        setSystemHealth({
          hasIssues: false,
          issuesCount: 0,
          canProceed: true,
          message: 'Архивные данные'
        });
      }
    } catch (err) {
      console.error('Error checking system health:', err);
      setSystemHealth({
        hasIssues: false,
        issuesCount: 0,
        canProceed: true,
        message: 'Не удалось проверить систему'
      });
    } finally {
      setIsCheckingAudit(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [turnoverData, levelsData] = await Promise.all([
        BonusService.getTurnoverForMonth(selectedMonth),
        BonusService.getBonusLevels()
      ]);

      setDataSource(turnoverData.source);

      const dealers = searchQuery 
        ? []
        : turnoverData.data.filter(u => {
            if (!u || !u.users) return false;
            if (!u.users.parent_id) return true;
            const parentExists = turnoverData.data.some(
              item => item.user_id === u.users.parent_id
            );
            return !parentExists;
          });

      setUsers(dealers);
      setBonusLevels(levelsData);

      const totalTurnover = dealers.reduce((sum, u) => sum + (u.total_turnover || 0), 0);
      const totalBonuses = dealers.reduce((sum, u) => {
        if (turnoverData.source === 'history') {
          return sum + (u.bonus_amount || 0);
        }
        return sum + ((u.personal_turnover || 0) * (u.bonus_percent || 0) / 100);
      }, 0);
      const averagePercent = dealers.length > 0
        ? dealers.reduce((sum, u) => sum + (u.bonus_percent || 0), 0) / dealers.length
        : 0;

      setStats({
        totalUsers: dealers.length,
        totalTurnover,
        totalBonuses,
        averagePercent
      });
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err?.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadData();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const results = await BonusService.searchUsersWithTurnover(searchQuery, selectedMonth);
      
      setUsers(results);
      setDataSource(selectedMonth === BonusService.getCurrentMonth() ? 'current' : 'history');
      
      const totalTurnover = results.reduce((sum, u) => sum + (u.total_turnover || 0), 0);
      const totalBonuses = results.reduce((sum, u) => {
        if (dataSource === 'history' && u.bonus_amount) {
          return sum + u.bonus_amount;
        }
        return sum + ((u.personal_turnover || 0) * (u.bonus_percent || 0) / 100);
      }, 0);
      const averagePercent = results.length > 0
        ? results.reduce((sum, u) => sum + (u.bonus_percent || 0), 0) / results.length
        : 0;

      setStats({
        totalUsers: results.length,
        totalTurnover,
        totalBonuses,
        averagePercent
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeMonth = async () => {
    if (!window.confirm('Инициализировать данные для текущего месяца?')) {
      return;
    }

    try {
      setIsInitializing(true);
      setError(null);
      
      await BonusService.initializeCurrentMonth();
      toast.success('Данные успешно инициализированы');
      await loadData();
      await checkMonthStatus();
    } catch (err) {
      console.error('Initialize error:', err);
      toast.error('Ошибка инициализации');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCalculatePreview = async () => {
    try {
      setIsCalculating(true);
      setError(null);
      
      const preview = await BonusService.calculateMonthlyBonuses(selectedMonth);
      
      setPreviewData(preview);
      
      if (preview.success) {
        setShowPreviewPopup(true);
        toast.success('Превью успешно рассчитано');
      } else {
        toast.error('Не удалось рассчитать превью');
      }
      
      await loadData();
    } catch (err) {
      console.error('Calculation error:', err);
      toast.error('Ошибка расчета бонусов: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFinalizeBonuses = async () => {
    setShowFinalizeConfirm(false);
    
    try {
      setIsFinalizing(true);
      setError(null);
      
      const turnoverResult = await BonusService.finalizeMonthlyTurnover(selectedMonth + '-01');
      
      if (turnoverResult && turnoverResult.status.includes('Success')) {
        const result = await BonusService.finalizeMonthlyBonuses(selectedMonth);
        
        if (result.success) {
          toast.success(`Успешно! Выплачено ${result.bonuses_paid} бонусов на сумму ${BonusService.formatCurrency(result.total_amount)}`);
          setPreviewData(null);
          setShowPreviewPopup(false);
          await loadData();
          await checkMonthStatus();
        }
      } else {
        throw new Error(turnoverResult?.status || 'Ошибка финализации товарооборота');
      }
    } catch (err) {
      console.error('Finalize error:', err);
      toast.error(err.message || 'Ошибка финализации бонусов');
    } finally {
      setIsFinalizing(false);
    }
  };

  const getBonusLevel = (amount) => {
    return bonusLevels.find(level => 
      amount >= level.min_amount && (!level.max_amount || amount <= level.max_amount)
    );
  };

  const navigateToUserDetails = (userId) => {
    router.push(`/admin/finance/bonuses/user/${userId}`);
  };

  const navigateToAudit = () => {
    router.push('/admin/finance/bonuses/audit');
  };

  const navigateToMonthDetails = () => {
    router.push(`/admin/finance/bonuses/month/${selectedMonth}`);
  };

  const canCalculatePreview = () => {
    return monthStatus?.hasData && 
           !monthStatus?.isFinalized && 
           !monthStatus?.isPaid &&
           !systemHealth?.hasIssues;
  };

  const canFinalize = () => {
    const currentMonth = BonusService.getCurrentMonth();
    const lastMonth = new Date(currentMonth + '-01');
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().substring(0, 7);
    
    return selectedMonth === lastMonthStr &&
           !monthStatus?.isFinalized && 
           !monthStatus?.isPaid &&
           previewData?.success &&
           !systemHealth?.hasIssues;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D77E6C] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MoreHeaderAD 
        title={`Бонусы за ${BonusService.getMonthName(selectedMonth)}`}
        showBackButton={true}
      />

      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* Month Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="w-full lg:w-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {BonusService.getMonthName(selectedMonth)}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {monthStatus && (
                  <>
                    {monthStatus.isCurrentMonth && (
                      <span className="px-3 py-1.5 bg-[#D77E6C]/10 text-[#D77E6C] rounded-full text-xs font-medium">
                        Текущий месяц
                      </span>
                    )}
                    {monthStatus.isHistorical && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <History className="h-3 w-3" />
                        Прошедший месяц
                      </span>
                    )}
                    {monthStatus.isFinalized && (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Финализирован
                      </span>
                    )}
                    {monthStatus.isPaid && (
                      <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Выплачен
                      </span>
                    )}
                    {previewData?.success && (
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Превью рассчитано
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={navigateToAudit}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-xl hover:from-[#C66B5A] hover:to-[#B55A4A] font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Shield className="h-4 w-4" />
              Детальный аудит
            </button>
          </div>

          {systemHealth && !monthStatus?.isFinalized && !monthStatus?.isPaid && (
            <div className={`mt-4 p-4 rounded-xl ${
              systemHealth.hasIssues ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                {isCheckingAudit ? (
                  <>
                    <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                    <span className="text-sm text-gray-600">Проверка системы...</span>
                  </>
                ) : systemHealth.hasIssues ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm text-red-800 font-medium flex-1">{systemHealth.message}</span>
                    <button
                      onClick={() => setShowAuditPopup(true)}
                      className="text-sm text-red-600 hover:text-red-800 underline whitespace-nowrap"
                    >
                      Показать
                    </button>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800 font-medium">{systemHealth.message}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Продолжение содержимого - Stats, Control Panel, Table */}
        {/* ... (используй остальное содержимое из старой страницы) */}
        
      </div>
    </div>
  );
}