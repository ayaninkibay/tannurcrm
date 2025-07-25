// src/app/layout.tsx

import DashboardSidebar from '../components/DashboardSidebar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {/* Весь layout внутри обёртки */}
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
