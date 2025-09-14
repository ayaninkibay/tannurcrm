// src/app/layout.tsx
import './globals.css'
import ClientWrapper from '@/components/ClientWrapper'  // импорт обертки

export const metadata = {
  title: 'Tannur CRM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="bg-gray-100 text-black">
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}