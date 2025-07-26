import './globals.css';

export const metadata = {
  title: 'Tannur CRM',
  description: 'Выбор панели: Admin, Dealer, Celebrity',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-black">
        {children}
      </body>
    </html>
  );
}
