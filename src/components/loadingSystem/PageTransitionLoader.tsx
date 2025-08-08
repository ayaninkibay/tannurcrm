'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import animationData from '@/components/lotties/loading.json'
import { AnimatePresence, motion } from 'framer-motion'

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [showContent, setShowContent] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Проверка устройства при монтировании
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setIsTransitioning(false)
      setShowContent(true)
      return
    }

    setIsTransitioning(true)
    setShowContent(false)

    const timeout = setTimeout(() => {
      setShowContent(true)
      setIsTransitioning(false)
    }, 500)

    return () => clearTimeout(timeout)
  }, [pathname, isMobile])

  return (
    <>
      {isMobile && (
        <AnimatePresence mode="wait">
          {isTransitioning && (
            <motion.div
              key="page-loader"
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Lottie
                animationData={animationData}
                loop
                autoplay
                style={{ width: 120, height: 120 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        {showContent && children}
      </motion.div>
    </>
  )
}
