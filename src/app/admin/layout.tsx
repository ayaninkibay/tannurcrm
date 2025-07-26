import DashboardSidebarAdmin from '@/components/admin/DashboardSidebarAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen">
      <DashboardSidebarAdmin />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
