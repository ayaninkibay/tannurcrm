'use client'

import { UserProvider } from '@/context/UserContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ClientWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <UserProvider>
      {children}
      
      {/* React Toastify */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </UserProvider>
  )
}