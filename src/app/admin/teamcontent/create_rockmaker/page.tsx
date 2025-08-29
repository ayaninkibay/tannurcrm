'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MoreHeaderAD from '@/components/header/MoreHeaderAD';
import SponsorCard from '@/components/blocks/SponsorCard';
import { useTranslate } from '@/hooks/useTranslate';

export default function CreateRockmakerPage() {
  const { t } = useTranslate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [shift, setShift] = useState('');
  const [notes, setNotes] = useState('');

  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [respInput, setRespInput] = useState('');
  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [whInput, setWhInput] = useState('');

  const [isActive, setIsActive] = useState(true);
  const [canReceive, setCanReceive] = useState(true);
  const [canShip, setCanShip] = useState(true);
  const [canAdjustStock, setCanAdjustStock] = useState(true);
  const [canViewOrders, setCanViewOrders] = useState(true);
  const [canManageLocations, setCanManageLocations] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const add = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string, reset: () => void) => {
    const v = value.trim(); if (!v) return; setter(p=>[...p,v]); reset();
  };
  const remove = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
    setter(p=>p.filter((_,i)=>i!==idx));
  };

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

    const draft = {
      id: Date.now().toString(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      warehouse: warehouse.trim() || undefined,
      shift: shift.trim() || undefined,
      notes: notes.trim() || undefined,
      responsibilities,
      warehouses,
      isActive,
      canReceive, canShip, canAdjustStock, canViewOrders, canManageLocations,
    };

    try {
      const key = 'admin_team_rockmakers';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push(draft);
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    if (goBack) window.location.href = '/admin/teamcontent';
  }

  const isValid = !!(fullName.trim() && phone.trim() && email.trim());

  return (
    <div className="p-2 md:p-6">
      <MoreHeaderAD
        title={
          <span>
            <span className="text-gray-400">Tannur</span>
            <span className="mx-1 text-[#111]">/</span>
            <span className="text-[#111]">{t('Создать складовщика')}</span>
          </span>
        }
        showBackButton={true}
      />

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">{t('ФИО *')}</span>
            <input
              value={fullName}
              onChange={e=>setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('ФИО')}
            />
            {errors.fullName && <div className="text-xs text-red-500 mt-1">{t(errors.fullName)}</div>}
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">{t('Телефон *')}</span>
            <input
              value={phone}
              onChange={e=>setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('+7 ...')}
            />
            {errors.phone && <div className="text-xs text-red-500 mt-1">{t(errors.phone)}</div>}
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">{t('E-mail *')}</span>
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('mail@domain.kz')}
            />
            {errors.email && <div className="text-xs text-red-500 mt-1">{t(errors.email)}</div>}
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">{t('Основной склад')}</span>
            <input
              value={warehouse}
              onChange={e=>setWarehouse(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('Алматы / Склад №1')}
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">{t('График / смена')}</span>
            <input
              value={shift}
              onChange={e=>setShift(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('5/2, 9:00–18:00')}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-700">{t('Заметки')}</span>
            <textarea
              value={notes}
              onChange={e=>setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('Особенности склада, пропуска и т.д.')}
            />
          </label>
        </div>

        {/* обязанности */}
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">{t('Обязанности')}</div>
          <div className="flex gap-2">
            <input
              value={respInput}
              onChange={e=>setRespInput(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); add(setResponsibilities, respInput, ()=>setRespInput('')); } }}
              className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('Приём/отгрузка, инвентаризация…')}
            />
            <button
              type="button"
              onClick={()=>add(setResponsibilities, respInput, ()=>setRespInput(''))}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
            >
              {t('Добавить пункт')}
            </button>
          </div>
          {!!responsibilities.length && (
            <ul className="mt-3 space-y-2">
              {responsibilities.map((o,i)=>(
                <li key={i} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800">{o}</span>
                  <button type="button" onClick={()=>remove(setResponsibilities,i)} className="text-xs text-gray-500 hover:text-gray-700">
                    {t('Удалить')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* дополнительные склады */}
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">{t('Дополнительные склады')}</div>
          <div className="flex gap-2">
            <input
              value={whInput}
              onChange={e=>setWhInput(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); add(setWarehouses, whInput, ()=>setWhInput('')); } }}
              className="w-full md:w-2/3 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#DC7C67]"
              placeholder={t('Склад №2 / Астана…')}
            />
            <button type="button" onClick={()=>add(setWarehouses, whInput, ()=>setWhInput(''))} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
              {t('Добавить')}
            </button>
          </div>
          {!!warehouses.length && (
            <div className="flex flex-wrap gap-2 mt-3">
              {warehouses.map((w,i)=>(
                <span key={i} className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-full bg-gray-100">
                  {w}
                  <button type="button" onClick={()=>remove(setWarehouses,i)} className="text-gray-500 hover:text-gray-700">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* права */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canReceive} onChange={e=>setCanReceive(e.target.checked)} /> {t('Приём товара')}</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canShip} onChange={e=>setCanShip(e.target.checked)} /> {t('Отгрузка')}</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canAdjustStock} onChange={e=>setCanAdjustStock(e.target.checked)} /> {t('Коррекция остатков')}</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canViewOrders} onChange={e=>setCanViewOrders(e.target.checked)} /> {t('Просмотр заказов')}</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={canManageLocations} onChange={e=>setCanManageLocations(e.target.checked)} /> {t('Управление ячейками')}</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800"><input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} /> {t('Активен')}</label>
        </div>

        {/* действия */}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={()=>save(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            {t('Сохранить черновик')}
          </button>
          <button type="button" disabled={!isValid} onClick={()=>save(true)} className="px-4 py-2.5 bg-[#DC7C67] hover:bg-[#c96d59] disabled:opacity-60 text-white rounded-lg text-sm font-medium">
            {t('Сохранить и выйти')}
          </button>
          <a href="/admin/teamcontent" className="ml-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            {t('Отмена')}
          </a>
        </div>
      </div>
    </div>
  );
}
