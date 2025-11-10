// src/components/FastLink.tsx
'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ReactNode, useState, useEffect, useRef } from 'react'

interface FastLinkProps {
  href: string
  children: ReactNode
  className?: string
  prefetchDelay?: number
  prefetch?: boolean
  onClick?: (e: React.MouseEvent) => void
  onLoadingChange?: (isLoading: boolean) => void
}

export function FastLink({ 
  href, 
  children, 
  className,
  prefetchDelay = 200,
  prefetch = false,
  onClick,
  onLoadingChange
}: FastLinkProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const prefetchTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const navigationStartTime = useRef<number | undefined>(undefined)

  // Отслеживаем изменение маршрута для остановки загрузки
  useEffect(() => {
    if (isNavigating) {
      // Если навигация завершилась (pathname изменился) или прошло слишком много времени
      const now = Date.now()
      const timeSinceStart = navigationStartTime.current ? now - navigationStartTime.current : 0
      
      if (pathname === href || timeSinceStart > 5000) { // 5 секунд таймаут
        setIsNavigating(false)
        onLoadingChange?.(false)
        navigationStartTime.current = undefined
      }
    }
  }, [pathname, href, isNavigating, onLoadingChange])

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (prefetchTimer.current) {
        clearTimeout(prefetchTimer.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current)
    }
    
    prefetchTimer.current = setTimeout(() => {
      // Предзагружаем страницу при наведении
      router.prefetch(href)
    }, prefetchDelay)
  }

  const handleMouseLeave = () => {
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // Запускаем анимацию загрузки только если переходим на другую страницу
    if (pathname !== href && !isNavigating) {
      setIsNavigating(true)
      navigationStartTime.current = Date.now()
      onLoadingChange?.(true)
    }
    
    // Вызываем пользовательский обработчик
    onClick?.(e)
  }

  return (
    <Link 
      href={href} 
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  )
}