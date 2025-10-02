//src/app/admin/finance/bonuses/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, Users, DollarSign, Calendar, 
  ChevronRight, RefreshCw, Check, Eye, AlertCircle,
  Shield, ArrowLeft, ChevronDown, ChevronUp, Clock,
  CheckCircle, XCircle, AlertTriangle, History,
  BookOpen, Edit2, Trash2, Plus, Grid3x3, BarChart3,
  Loader2, Info, X, FileText
} from 'lucide-react';
import { BonusService } from '@/lib/bonuses/BonusService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';

export default function AdminBonusesPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [bonusLevels, setBonusLevels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(BonusService.getCurrentMonth());
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
  const [previewDataByMonth, setPreviewDataByMonth] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTurnover: 0,
    totalBonuses: 0,
    averagePercent: 0
  });

  useEffect(() => {
    setSearchQuery('');
    loadData();
    checkMonthStatus();
    
    // Загружаем сохраненное превью для месяца если есть
    const savedPreview = previewDataByMonth[selectedMonth];
    if (savedPreview) {
      setPreviewData(savedPreview);
    } else {
      setPreviewData(null);
    }
    
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
          
          // Если нет parent_id - это точно ТОП дилер, показываем
          if (!u.users.parent_id) return true;
          
          // Если есть parent_id, проверяем есть ли его спонсор в данных
          const parentExists = turnoverData.data.some(
            item => item.user_id === u.users.parent_id
          );
          
          // Показываем только если спонсора нет в данных
          // (т.е. этот дилер - временная верхушка активной ветки)
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
      alert('Данные успешно инициализированы');
      await loadData();
      await checkMonthStatus();
    } catch (err) {
      console.error('Initialize error:', err);
      setError('Ошибка инициализации');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCalculatePreview = async () => {
    try {
      setIsCalculating(true);
      setError(null);
      
      const preview = await BonusService.calculateMonthlyBonuses(selectedMonth);
      
      setPreviewDataByMonth(prev => ({
        ...prev,
        [selectedMonth]: preview
      }));
      setPreviewData(preview);
      
      if (preview.success) {
        setShowPreviewPopup(true);
      } else {
        setError('Не удалось рассчитать превью');
      }
      
      await loadData();
    } catch (err) {
      console.error('Calculation error:', err);
      setError('Ошибка расчета бонусов: ' + (err.message || 'Неизвестная ошибка'));
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
          alert(`Успешно! Выплачено ${result.bonuses_paid} бонусов на сумму ${BonusService.formatCurrency(result.total_amount)}`);
          setPreviewData(null);
          setPreviewDataByMonth(prev => {
            const newState = {...prev};
            delete newState[selectedMonth];
            return newState;
          });
          setShowPreviewPopup(false);
          await loadData();
          await checkMonthStatus();
        }
      } else {
        throw new Error(turnoverResult?.status || 'Ошибка финализации товарооборота');
      }
    } catch (err) {
      console.error('Finalize error:', err);
      setError(err.message || 'Ошибка финализации бонусов');
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
    // Можно рассчитать превью для любого месяца с данными, если нет проблем
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
    
    const currentPreview = previewDataByMonth[selectedMonth] || previewData;
    
    // Можно финализировать только прошлый месяц после превью
    return selectedMonth === lastMonthStr &&
           !monthStatus?.isFinalized && 
           !monthStatus?.isPaid &&
           currentPreview?.success &&
           !systemHealth?.hasIssues;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D77E6C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <header className="flex">
        <MoreHeaderAD title="Управление бонусами" />
      </header>

      {/* Month selector */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 mt-2 sm:mt-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="w-full lg:w-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {BonusService.getMonthName(selectedMonth)}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {monthStatus && (
                <>
                  {monthStatus.isCurrentMonth && (
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#D77E6C]/10 text-[#D77E6C] rounded-full text-xs font-medium">
                      Текущий месяц
                    </span>
                  )}
                  {monthStatus.isHistorical && (
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <History className="h-3 w-3" />
                      Прошедший месяц
                    </span>
                  )}
                  {monthStatus.isFinalized && (
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Финализирован
                    </span>
                  )}
                  {monthStatus.isPaid && (
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Выплачен
                    </span>
                  )}
                  {previewData?.success && (
                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Превью рассчитано
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={navigateToAudit}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-lg sm:rounded-xl hover:from-[#C66B5A] hover:to-[#B55A4A] font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Shield className="h-4 w-4" />
            Детальный аудит
          </button>
        </div>

        {systemHealth && !monthStatus?.isFinalized && !monthStatus?.isPaid && (
          <div className={`mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl ${
            systemHealth.hasIssues ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center gap-2">
              {isCheckingAudit ? (
                <>
                  <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                  <span className="text-xs sm:text-sm text-gray-600">Проверка системы...</span>
                </>
              ) : systemHealth.hasIssues ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-red-800 font-medium flex-1">{systemHealth.message}</span>
                  <button
                    onClick={() => setShowAuditPopup(true)}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-800 underline whitespace-nowrap"
                  >
                    Показать
                  </button>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-green-800 font-medium">{systemHealth.message}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#D77E6C]/5 rounded-full hidden sm:block"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-[#D77E6C]/10 rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#D77E6C]" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
                <div className="text-xs text-gray-500">
                  {searchQuery ? 'Найдено' : 'ТОП дилеров'}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 hidden sm:block">
              {dataSource === 'history' ? 'Из архива' : 'Актуальные'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 relative overflow-hidden">
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-green-50 rounded-full hidden sm:block"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-semibold text-gray-900 break-all">
                  {BonusService.formatCurrency(stats.totalTurnover).split(' ')[0]}
                </div>
                <div className="text-xs text-gray-500">Товарооборот</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 hidden sm:block">Общий объем</p>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 relative overflow-hidden">
          <div className="absolute top-1/2 right-2 w-8 h-8 bg-yellow-50 rounded-full hidden sm:block"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-semibold text-gray-900 break-all">
                  {BonusService.formatCurrency(stats.totalBonuses).split(' ')[0]}
                </div>
                <div className="text-xs text-gray-500">
                  {previewData?.success ? 'Расчет (личные)' : monthStatus?.isPaid ? 'Выплачено' : 'Примерно'}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 hidden sm:block">
              Средний: {stats.averagePercent.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-50 rounded-full hidden sm:block"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs sm:text-base font-semibold text-gray-900">
                  {monthStatus?.isCurrentMonth && 'Активный'}
                  {monthStatus?.isHistorical && !monthStatus?.isFinalized && 'Требует финализации'}
                  {monthStatus?.isFinalized && !monthStatus?.isPaid && 'Готов к выплате'}
                  {monthStatus?.isPaid && 'Выплачен'}
                </div>
                <div className="text-xs text-gray-500">
                  {monthStatus?.hasData ? `${monthStatus.dataCount} записей` : 'Нет данных'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-4">
          {/* Поисковая панель */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Поиск дилеров..."
                className="pl-10 pr-4 py-2 sm:py-2.5 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] transition-all text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D77E6C]/20 focus:border-[#D77E6C] transition-all text-sm sm:text-base"
              max={BonusService.getCurrentMonth()}
            />
            <button
              onClick={handleSearch}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#D77E6C] to-[#C66B5A] text-white rounded-lg hover:from-[#C66B5A] hover:to-[#B55A4A] font-medium text-sm transition-all"
            >
              Найти
            </button>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {monthStatus?.isCurrentMonth && !monthStatus.hasData && (
              <button
                onClick={handleInitializeMonth}
                disabled={isInitializing}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all text-xs sm:text-sm font-medium"
              >
                {isInitializing ? (
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                Инициализировать
              </button>
            )}
            
            <button
              onClick={handleCalculatePreview}
              disabled={!canCalculatePreview() || isCalculating}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                canCalculatePreview()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-white cursor-not-allowed opacity-50'
              }`}
            >
              {isCalculating ? (
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              Рассчитать превью
            </button>
            
            {previewData?.success && (
              <button
                onClick={navigateToMonthDetails}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs sm:text-sm font-medium transition-all"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                Детальный просмотр
              </button>
            )}
            
            <button
              onClick={() => setShowFinalizeConfirm(true)}
              disabled={!canFinalize() || isFinalizing}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                canFinalize()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-400 text-white cursor-not-allowed opacity-50'
              }`}
            >
              {isFinalizing ? (
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              Финализировать
            </button>
          </div>
        </div>

        {/* More info section */}
        <div className="mt-4">
          <button
            onClick={() => setShowMoreInfo(!showMoreInfo)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-xs sm:text-sm"
          >
            {showMoreInfo ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span>Дополнительная информация</span>
          </button>
          
          {showMoreInfo && (
            <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500">Источник данных:</p>
                  <p className="font-medium text-gray-900">
                    {dataSource === 'current' ? 'user_turnover_current' : 'user_turnover_history'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Можно финализировать:</p>
                  <p className="font-medium text-gray-900">
                    {canFinalize() ? 'Да' : monthStatus?.isCurrentMonth ? 'Нет (текущий месяц)' : 'Нет'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Статус финализации:</p>
                  <p className="font-medium text-gray-900">
                    {monthStatus?.isFinalized ? 'Финализирован' : 
                     monthStatus?.isPaid ? 'Выплачен' : 
                     'Не финализирован'}
                  </p>
                </div>
              </div>
              
              {monthStatus?.isCurrentMonth && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Info className="h-4 w-4" />
                    <span className="text-xs">
                      Текущий месяц можно будет финализировать после его окончания (с 1 числа следующего месяца)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {searchQuery 
                  ? `Не найдено дилеров по запросу "${searchQuery}"` 
                  : `Нет данных за ${BonusService.getMonthName(selectedMonth)}`}
              </h3>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дилер
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Личный
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Командный
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Общий
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Уровень
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    %
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Бонус (личный)
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  if (!user || !user.users) return null;
                  
                  const level = getBonusLevel(user.total_turnover || 0);
                  const bonusAmount = dataSource === 'history' && user.bonus_amount
                    ? user.bonus_amount
                    : (user.personal_turnover || 0) * (user.bonus_percent || 0) / 100;
                  
                  return (
                    <tr key={user.user_id || user.users.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {user.users.first_name || ''} {user.users.last_name || ''}
                            {!user.users.parent_id && (
                              <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-gradient-to-r from-[#D77E6C]/10 to-[#C66B5A]/10 text-[#D77E6C] rounded-full">
                                TOP
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 sm:hidden">{user.users.email}</div>
                          <div className="text-xs text-gray-500 hidden sm:block">{user.users.email}</div>
                          <div className="text-xs text-gray-400 hidden sm:block">{user.users.phone}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {BonusService.formatCurrency(user.personal_turnover || 0)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {BonusService.formatCurrency(user.team_turnover || 0)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-bold text-gray-900">
                          {BonusService.formatCurrency(user.total_turnover || 0)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                        {level && (
                          <span 
                            className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full"
                            style={{ 
                              backgroundColor: `${level.color}20`,
                              color: level.color 
                            }}
                          >
                            {level.name}
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {user.bonus_percent || 0}%
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className={`text-xs sm:text-sm font-bold ${
                          monthStatus?.isPaid ? 'text-purple-600' : 'text-[#D77E6C]'
                        }`}>
                          {BonusService.formatCurrency(bonusAmount)}
                          {monthStatus?.isPaid && (
                            <CheckCircle className="inline-block ml-1 h-3 w-3" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <button
                          onClick={() => navigateToUserDetails(user.user_id || user.users.id)}
                          className="text-[#D77E6C] hover:text-[#C66B5A] flex items-center gap-1 transition-colors"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Детали</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Popup */}
      {showPreviewPopup && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Превью расчета</h3>
              <button
                onClick={() => setShowPreviewPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Месяц:</div>
                <div className="text-lg font-semibold text-gray-900">
                  {BonusService.getMonthName(selectedMonth)}
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Всего бонусов (включая дифференциальные):</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {BonusService.formatCurrency(previewData.total_amount)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Количество начислений: {previewData.total_bonuses}
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-yellow-800">
                    Это полный расчет включая дифференциальные бонусы. После финализации бонусы будут начислены на балансы дилеров.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPreviewPopup(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Закрыть
              </button>
              <button
                onClick={navigateToMonthDetails}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                Детали
              </button>
              {canFinalize() && (
                <button
                  onClick={() => {
                    setShowPreviewPopup(false);
                    setShowFinalizeConfirm(true);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Финализировать
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Finalize Confirm Popup */}
      {showFinalizeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Подтверждение финализации
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              Вы уверены, что хотите финализировать и выплатить бонусы за {BonusService.getMonthName(selectedMonth)}?
            </p>
            
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-red-800">
                  Это действие нельзя отменить. Бонусы будут начислены на балансы всех дилеров.
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinalizeConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleFinalizeBonuses}
                disabled={isFinalizing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
              >
                {isFinalizing && <RefreshCw className="h-3 w-3 animate-spin" />}
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Problems Popup */}
      {showAuditPopup && auditResults && auditResults.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Найденные проблемы</h3>
              <button
                onClick={() => setShowAuditPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {auditResults.map((issue, index) => (
                <div key={index} className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <p className="font-medium text-gray-900 text-sm">{issue.full_name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{issue.email}</p>
                      <p className="text-xs sm:text-sm text-red-600 mt-1">
                        Тип проверки: {issue.check_type}
                      </p>
                      <div className="mt-2 text-xs sm:text-sm">
                        <span className="text-gray-600">Сохранено: </span>
                        <span className="font-medium">{BonusService.formatCurrency(issue.stored_value)}</span>
                        <span className="mx-2">→</span>
                        <span className="text-gray-600">Расчет: </span>
                        <span className="font-medium">{BonusService.formatCurrency(issue.calculated_value)}</span>
                        <span className="ml-2 text-red-600">
                          (разница: {BonusService.formatCurrency(Math.abs(issue.difference))})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowAuditPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Закрыть
              </button>
              <Link
                href="/admin/finance/bonuses/audit"
                className="px-4 py-2 bg-[#D77E6C] text-white rounded-lg hover:bg-[#C66B5A] text-center text-sm font-medium"
              >
                Перейти к аудиту
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}