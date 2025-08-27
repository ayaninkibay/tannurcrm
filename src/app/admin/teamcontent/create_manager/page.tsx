'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';

type ManagerDraft = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  telegram?: string;
  region?: string;
  channel?: string;        // основной канал коммуникации
  hireDate?: string;       // YYYY-MM-DD
  baseSalary?: number;
  commissionPct?: number;  // %
  notes?: string;

  tags: string[];
  responsibilities: string[];
  products: string[];      // направления / линейки
  isActive: boolean;

  // Права доступа
  canViewLeads: boolean;
  canEditDeals: boolean;
  canViewWarehouse: boolean;
  canViewFinance: boolean;
  canManageTeam: boolean;
};

export default function CreateManagerPage() {
  const router = useRouter();

  // базовые поля
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [region, setRegion] = useState('');
  const [channel, setChannel] = useState('WhatsApp');
  const [hireDate, setHireDate] = useState('');
  const [baseSalary, setBaseSalary] = useState<number | ''>('');
  const [commissionPct, setCommissionPct] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // динамические списки
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [respInput, setRespInput] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [prodInput, setProdInput] = useState('');

  // флаги
  const [isActive, setIsActive] = useState(true);
  const [canViewLeads, setCanViewLeads] = useState(true);
  const [canEditDeals, setCanEditDeals] = useState(true);
  const [canViewWarehouse, setCanViewWarehouse] = useState(false);
  const [canViewFinance, setCanViewFinance] = useState(false);
  const [canManageTeam, setCanManageTeam] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // helpers
  function addTo(listSetter: React.Dispatch<React.SetStateAction<string[]>>, value: string, reset: () => void) {
    const v = value.trim();
    if (!v) return;
    listSetter(prev => [...prev, v]);
    reset();
  }
  function removeFrom(listSetter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) {
    listSetter(prev => prev.filter((_, i) => i !== idx));
  }

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

    const draft: ManagerDraft = {
      id: Date.now().toString(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      telegram: telegram.trim() || undefined,
      region: region.trim() || undefined,
      channel,
      hireDate: hireDate || undefined,
      baseSalary: baseSalary === '' ? undefined : Number(baseSalary),
      commissionPct: commissionPct === '' ? undefined : Number(commissionPct),
      notes: notes.trim() || undefined,

      tags,
      responsibilities,
      products,
      isActive,

      canViewLeads,
      canEditDeals,
      canViewWarehouse,
      canViewFinance,
      canManageTeam,
    };

    try {
      const key = 'admin_team_managers';
      const raw = localStorage.getItem(key);
      const list: ManagerDraft[] = raw ? JSON.parse(raw) : [];
      list.push(draft);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    if (goBack) router.push('/admin/teamcontent');
  }

  const isValid = useMemo(
    () => fullName.trim() && phone.trim() && email.trim(),
    [fullName, phone, email]
  );

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD title="Создать менеджера"
      showBackButton={true} 
      />

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        {/* базовые поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">ФИО *</span>
            <input value={fullName} onChange={e=>setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="Иванов Иван" />
            {errors.fullName && <div className="text-xs text-red-500 mt-1">{errors.fullName}</div>}
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Телефон *</span>
            <input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="+7 7.." />
            {errors.phone && <div className="text-xs text-red-500 mt-1">{errors.phone}</div>}
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">E-mail *</span>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="mail@domain.kz" />
            {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Telegram</span>
            <input value={telegram} onChange={e=>setTelegram(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="@username" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Регион</span>
            <input value={region} onChange={e=>setRegion(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="Алматы" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Канал</span>
            <select value={channel} onChange={e=>setChannel(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]">
              <option>WhatsApp</option><option>Telegram</option><option>Instagram</option><option>Телефон</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Дата выхода</span>
            <input type="date" value={hireDate} onChange={e=>setHireDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-700">Оклад</span>
              <input type="number" min={0} value={baseSalary} onChange={e=>setBaseSalary(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="250000" />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Комиссия, %</span>
              <input type="number" min={0} value={commissionPct} onChange={e=>setCommissionPct(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="5" />
            </label>
          </div>
          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">Заметки</span>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="Доп. условия, график…"/>
          </label>
        </div>

        {/* теги */}
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Теги</div>
          <div className="flex gap-2">
            <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();addTo(setTags, tagInput, ()=>setTagInput(''))}}} className="w-full md:w-1/2 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="лидоген, ключевой и т.д."/>
            <button type="button" onClick={()=>addTo(setTags, tagInput, ()=>setTagInput(''))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Добавить</button>
          </div>
          {!!tags.length && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((t,i)=>(
                <span key={i} className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-full bg-gray-100">
                  {t}
                  <button type="button" onClick={()=>removeFrom(setTags,i)} className="text-gray-500 hover:text-gray-700">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* обязанности */}
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Обязанности</div>
          <div className="flex gap-2">
            <input value={respInput} onChange={e=>setRespInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();addTo(setResponsibilities, respInput, ()=>setRespInput(''))}}} className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="Напр.: ежедневные обзвоны, отчёт по CRM…"/>
            <button type="button" onClick={()=>addTo(setResponsibilities, respInput, ()=>setRespInput(''))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Добавить пункт</button>
          </div>
          {!!responsibilities.length && (
            <ul className="mt-3 space-y-2">
              {responsibilities.map((o,i)=>(
                <li key={i} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800">{o}</span>
                  <button type="button" onClick={()=>removeFrom(setResponsibilities,i)} className="text-xs text-gray-500 hover:text-gray-700">Удалить</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* направления/линейки */}
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Линейки/направления</div>
          <div className="flex gap-2">
            <input value={prodInput} onChange={e=>setProdInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();addTo(setProducts, prodInput, ()=>setProdInput(''))}}} className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]" placeholder="Напр.: Hair Care, Face Care…"/>
            <button type="button" onClick={()=>addTo(setProducts, prodInput, ()=>setProdInput(''))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Добавить</button>
          </div>
          {!!products.length && (
            <div className="flex flex-wrap gap-2 mt-3">
              {products.map((p,i)=>(
                <span key={i} className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-full bg-gray-100">
                  {p}
                  <button type="button" onClick={()=>removeFrom(setProducts,i)} className="text-gray-500 hover:text-gray-700">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* права доступа */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={canViewLeads} onChange={e=>setCanViewLeads(e.target.checked)} /> Доступ к лидам
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={canEditDeals} onChange={e=>setCanEditDeals(e.target.checked)} /> Редактирование сделок
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={canViewWarehouse} onChange={e=>setCanViewWarehouse(e.target.checked)} /> Склад / остатки
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={canViewFinance} onChange={e=>setCanViewFinance(e.target.checked)} /> Финансы / отчёты
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={canManageTeam} onChange={e=>setCanManageTeam(e.target.checked)} /> Управление командой
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} /> Активен
          </label>
        </div>

        {/* действия */}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={()=>save(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            Сохранить черновик
          </button>
          <button type="button" disabled={!isValid} onClick={()=>save(true)} className="px-4 py-2.5 bg-[#DC7C67] hover:bg-[#c96d59] disabled:opacity-60 text-white rounded-lg text-sm font-medium">
            Сохранить и выйти
          </button>
          <Link href="/admin/teamcontent" className="ml-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            Отмена
          </Link>
        </div>
      </div>
    </div>
  );
}
