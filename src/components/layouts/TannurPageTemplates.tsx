// src/components/layouts/TannurPageTemplates.tsx
'use client'

import React, { ReactNode } from 'react'
import { layout } from '@/lib/styleTokens'

// ----------------- FirstTemplate -----------------
interface FirstTemplateProps {
  header: ReactNode
  column1: ReactNode
  column2: ReactNode
  column3: ReactNode
}
/**
 * FirstTemplate:
 *  - Верхняя сетка: grid-cols-1 → md:[3fr_1fr] → lg:[4fr_1fr]
 *  - Нижняя колонка full-width
 */
export function FirstTemplate({
  header,
  column1,
  column2,
  column3,
}: FirstTemplateProps) {
  return (
    <section
      className={`
        ${layout.pagePadding}
        flex-1 flex flex-col
      `}
    >
      <header>{header}</header>

      <div className="
        mt-6
        grid grid-cols-1
        md:grid-cols-[3fr_1fr]
        lg:grid-cols-[4fr_1fr]
        gap-6
      ">
        <div className="order-2 md:order-1">{column1}</div>
        <div className="order-1 md:order-2">{column2}</div>
      </div>

      <div className="mt-6">
        {column3}
      </div>
    </section>
  )
}

// ----------------- SecondTemplate -----------------
interface SecondTemplateProps {
  header: ReactNode
  column1: ReactNode
  column2: ReactNode
}
/**
 * SecondTemplate:
 *  - column1 и column2 подряд, full-width
 */
export function SecondTemplate({
  header,
  column1,
  column2,
}: SecondTemplateProps) {
  return (
    <section
      className={`
        ${layout.pagePadding}
        flex-1 flex flex-col
      `}
    >
      <header>{header}</header>

      <div className="mt-6">{column1}</div>
      <div className="mt-6">{column2}</div>
    </section>
  )
}

// ----------------- ThirdTemplate -----------------
interface ThirdTemplateProps {
  header: ReactNode
  column1: ReactNode
  column2: ReactNode
}
/**
 * ThirdTemplate:
 *  - mobile: column1 → column2
 *  - md+: [3fr_1fr] с column2 слева
 */
export function ThirdTemplate({
  header,
  column1,
  column2,
}: ThirdTemplateProps) {
  return (
    <section
      className={`
        ${layout.pagePadding}
        flex-1 flex flex-col
      `}
    >
      <header>{header}</header>

      <div className="
        mt-6
        grid grid-cols-1
        md:grid-cols-[3fr_1fr]
        gap-6
      ">
        <div className="md:order-2">{column1}</div>
        <div className="md:order-1">{column2}</div>
      </div>
    </section>
  )
}

// ----------------- FourthTemplate -----------------
interface FourthTemplateProps {
  header: ReactNode
  column1: ReactNode
  column2: ReactNode
  column3: ReactNode
}
/**
 * FourthTemplate:
 *  - column1 full-width
 *  - mobile: stacked; md+: two-cols
 */
export function FourthTemplate({
  header,
  column1,
  column2,
  column3,
}: FourthTemplateProps) {
  return (
    <section
      className={`
        ${layout.pagePadding}
        flex-1 flex flex-col
      `}
    >
      <header>{header}</header>

      <div className="mt-6">{column1}</div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>{column2}</div>
        <div>{column3}</div>
      </div>
    </section>
  )
}

// ----------------- FifthTemplate -----------------
interface FifthTemplateProps {
  header: ReactNode
  column1: ReactNode
  /** Широкий блок — 80% */
  column3: ReactNode
  /** Узкий блок — 20% */
  column2: ReactNode
}
/**
 * FifthTemplate:
 *  - column1 full-width
 *  - mobile: stacked; md+: [4fr_1fr]
 */
export function FifthTemplate({
  header,
  column1,
  column3,
  column2,
}: FifthTemplateProps) {
  return (
    <section
      className={`
        ${layout.pagePadding}
        flex-1 flex flex-col
      `}
    >
      <header>{header}</header>

      <div className="mt-6">{column1}</div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-6">
        <div>{column3}</div>
        <div>{column2}</div>
      </div>
    </section>
  )
}
