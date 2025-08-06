'use client';
import FinanceHeader from '@/components/finance/FinanceHeader';
import FinanceTabs from '@/components/finance/FinanceTabs';

const FinanceTransactionsPage = () => {
  return (
    <div className="w-full h-full p-2 md:p-6">
      <FinanceHeader />
      <FinanceTabs />
    </div>
  );
};

export default FinanceTransactionsPage;
