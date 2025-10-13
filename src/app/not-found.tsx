// src/app/not-found.tsx
'use client'

import { useState } from 'react'
import Lottie from 'lottie-react'
import animationData from '@/components/lotties/404.json'

const translations = {
  ru: {
    title: '404',
    subtitle: 'Упс! Вы не туда попали',
    button: 'Домой',
  },
  kz: {
    title: '404',
    subtitle: 'Кешіріңіз! Сіз қате жерге кірдіңіз',
    button: 'Басты бет',
  },
  cn: {
    title: '404',
    subtitle: '哎呀！您走错了路',
    button: '主页',
  },
}

export default function NotFound() {
  const [lang, setLang] = useState<'ru' | 'kz' | 'cn'>('ru')
  const t = translations[lang]

  return (
    <div style={{
      background: '#fafafa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Переключатель языков */}
      <div style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        display: 'flex',
        gap: '8px',
      }}>
        {(['ru', 'kz', 'cn'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: '500',
              color: lang === l ? '#fff' : '#999',
              background: lang === l ? '#D77E6C' : 'transparent',
              border: `1px solid ${lang === l ? '#D77E6C' : '#e0e0e0'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Основной контент */}
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
      }}>
        {/* Lottie анимация */}
        <div style={{
          width: '350px',
          height: '350px',
          margin: '0 auto',
        }}>
          <Lottie 
            animationData={animationData}
            loop={true}
          />
        </div>

        {/* Заголовок */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          margin: '-150px 0 12px 0',
          color: '#1d1d1f',
          letterSpacing: '-1px',
        }}>
          {t.title}
        </h1>

        {/* Подзаголовок */}
        <p style={{
          fontSize: '18px',
          fontWeight: '400',
          margin: '0 0 32px 0',
          color: '#6e6e73',
          lineHeight: '1.5',
        }}>
          {t.subtitle}
        </p>

        {/* Кнопка Home */}
        <a 
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 36px',
            fontSize: '15px',
            fontWeight: '500',
            color: '#1d1d1f',
            background: '#fff',
            border: '1px solid #D77E6C',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#D77E6C'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.color = '#1d1d1f'
          }}
        >
          {t.button}
        </a>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        textAlign: 'center',
        color: '#999',
        fontSize: '13px',
        lineHeight: '1.6',
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#666' }}>
          Tannur CRM © 2025. All Rights Reserved.
        </p>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>
          made in 🇰🇿
        </p>
        <p style={{ 
          margin: '0',
          fontSize: '12px',
        }}>
          Created by{' '}
          <a 
            href="https://www.inqo.tech" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#D77E6C',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Inqo Technologies
          </a>
        </p>
      </div>
    </div>
  )
}