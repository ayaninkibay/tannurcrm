import SidebarAdmin from '@/components/admin/SidebarAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen">
      <SidebarAdmin />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
