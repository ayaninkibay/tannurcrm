'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';

type FinancierDraft = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  position?: string;    // бухгалтер, финансовый менеджер и т.п.
  hireDate?: string;
  salary?: number;
  notes?: string;

  responsibilities: string[];
  bankAccounts: string[];
  currencies: string[];
  isActive: boolean;

  // права
  canApprovePayments: boolean;
  canViewPayroll: boolean;
  canViewPnL: boolean;
  canEditBudgets: boolean;
  canViewSalesData: boolean;
};

export default function CreateFinancierPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('Финансист');
  const [hireDate, setHireDate] = useState('');
  const [salary, setSalary] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [respInput, setRespInput] = useState('');
  const [bankAccounts, setBankAccounts] = useState<string[]>([]);
  const [accInput, setAccInput] = useState('');
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [curInput, setCurInput] = useState('');

  const [isActive, setIsActive] = useState(true);
  const [canApprovePayments, setCanApprovePayments] = useState(true);
  const [canViewPayroll, setCanViewPayroll] = useState(true);
  const [canViewPnL, setCanViewPnL] = useState(true);
  const [canEditBudgets, setCanEditBudgets] = useState(false);
  const [canViewSalesData, setCanViewSalesData] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const add = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string, reset: () => void) => {
    const v = value.trim(); if (!v) return; setter(p=>[...p,v]); reset();
  };
  const remove = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => setter(p=>p.filter((_,i)=>i!==idx));

  function validate() {
    const n: Record<string, string> = {};
    if (!fullName.trim()) n.fullName = 'Введите ФИО';
    if (!phone.trim()) n.phone = 'Укажите телефон';
    if (!email.trim()) n.email = 'Укажите e-mail';
    setErrors(n);
    return Object.keys(n).length === 0;
  }

  function save(goBack: boolean) {
    if (!validate()) return;

    const draft: FinancierDraft = {
      id: Date.now().toString(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      position: position.trim() || undefined,
      hireDate: hireDate || undefined,
      salary: salary === '' ? undefined : Number(salary),
      notes: notes.trim() || undefined,
      responsibilities,
      bankAccounts,
      currencies,
      isActive,
      canApprovePayments, canViewPayroll, canViewPnL, canEditBudgets, canViewSalesData,
    };

    try {
      const key = 'admin_team_financiers';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push(draft);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    if (goBack) router.push('/admin/teamcontent');
  }

  const isValid = useMemo(()=>fullName.trim() && phone.trim() && email.trim(), [fullName, phone, email]);

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title="Создать финансиста" 
      showBackButton={true}
      />

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        {/* базовые поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">ФИО *</span>
            <input value={fullName} onChange={e=>setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="ФИО"/>
            {errors.fullName && <div className="text-xs text-red-500 mt-1">{errors.fullName}</div>}
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Телефон *</span>
            <input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="+7 ..."/>
            {errors.phone && <div className="text-xs text-red-500 mt-1">{errors.phone}</div>}
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">E-mail *</span>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="mail@domain.kz"/>
            {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Должность</span>
            <input value={position} onChange={e=>setPosition(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="Финансист / Бухгалтер"/>
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Дата выхода</span>
            <input type="date" value={hireDate} onChange={e=>setHireDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Оклад</span>
            <input type="number" min={0} value={salary} onChange={e=>setSalary(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="300000"/>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">Заметки</span>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="Особые условия, испытательный срок…"/>
          </label>
        </div>

        {/* списки */}
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Обязанности</div>
          <div className="flex gap-2">
            <input value={respInput} onChange={e=>setRespInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();add(setResponsibilities, respInput, ()=>setRespInput(''))}}} className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="Платёжки, сверки, бюджеты…"/>
            <button type="button" onClick={()=>add(setResponsibilities, respInput, ()=>setRespInput(''))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Добавить пункт</button>
          </div>
          {!!responsibilities.length && (
            <ul className="mt-3 space-y-2">
              {responsibilities.map((o,i)=>(
                <li key={i} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800">{o}</span>
                  <button type="button" onClick={()=>remove(setResponsibilities,i)} className="text-xs text-gray-500 hover:text-gray-700">Удалить</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Банковские счета</div>
          <div className="flex gap-2">
            <input value={accInput} onChange={e=>setAccInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();add(setBankAccounts, accInput, ()=>setAccInput(''))}}} className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="Банк/номер счёта"/>
            <button type="button" onClick={()=>add(setBankAccounts, accInput, ()=>setAccInput(''))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Добавить</button>
          </div>
          {!!bankAccounts.length && (
            <div className="flex flex-wrap gap-2 mt-3">
              {bankAccounts.map((a,i)=>(
                <span key={i} className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-full bg-gray-100">
                  {a}
                  <button type="button" onClick={()=>remove(setBankAccounts,i)} className="text-gray-500 hover:text-gray-700">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Валюты</div>
          <div className="flex gap-2">
            <input value={curInput} onChange={e=>setCurInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();add(setCurrencies, curInput, ()=>setCurInput(''))}}} className="w-full md:w-1/2 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="KZT, USD, EUR…"/>
            <button type="button" onClick={()=>add(setCurrencies, curInput, ()=>setCurInput(''))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Добавить</button>
          </div>
          {!!currencies.length && (
            <div className="flex flex-wrap gap-2 mt-3">
              {currencies.map((c,i)=>(
                <span key={i} className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-full bg-gray-100">
                  {c}
                  <button type="button" onClick={()=>remove(setCurrencies,i)} className="text-gray-500 hover:text-gray-700">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* права */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canApprovePayments} onChange={e=>setCanApprovePayments(e.target.checked)} /> Подтверждение платежей</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canViewPayroll} onChange={e=>setCanViewPayroll(e.target.checked)} /> ФОТ и начисления</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canViewPnL} onChange={e=>setCanViewPnL(e.target.checked)} /> P&L / отчёты</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canEditBudgets} onChange={e=>setCanEditBudgets(e.target.checked)} /> Редактирование бюджетов</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canViewSalesData} onChange={e=>setCanViewSalesData(e.target.checked)} /> Доступ к продажам</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} /> Активен</label>
        </div>

        {/* действия */}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={()=>save(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Сохранить черновик</button>
          <button type="button" disabled={!isValid} onClick={()=>save(true)} className="px-4 py-2.5 bg-[#DC7C67] hover:bg-[#c96d59] disabled:opacity-60 text-white rounded-lg text-sm font-medium">Сохранить и выйти</button>
          <Link href="/admin/teamcontent" className="ml-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Отмена</Link>
        </div>
      </div>
    </div>
  );
}
