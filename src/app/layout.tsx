// src/app/layout.tsx
import './globals.css'
import { UserProvider } from '@/context/UserContext'


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
      <body className="bg-white text-black">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
