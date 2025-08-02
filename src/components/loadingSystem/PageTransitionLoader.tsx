'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import animationData from '@/lotties/loading.json'
import { AnimatePresence, motion } from 'framer-motion'

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [showContent, setShowContent] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)

  useEffect(() => {
    setIsTransitioning(true)
    setShowContent(false)

    const timeout = setTimeout(() => {
      setShowContent(true)
      setIsTransitioning(false)
    }, 500) // длительность анимации

    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <>
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
