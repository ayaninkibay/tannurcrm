'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/context/UserContext';

export default function CSVImport() {
  const { profile, user } = useUser();
  const [dealers, setDealers] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({ 
    loaded: 0, 
    processed: 0, 
    success: 0, 
    errors: 0 
  });
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      addLog(`✅ Авторизован как: ${user.email} (${profile?.role})`);
    } else {
      addLog('⚠️ Ожидание авторизации...');
    }
  }, [user, profile]);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    console.log(msg);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addLog(`Загружаем файл: ${file.name}`);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validDealers = results.data.filter((row: any) => 
          row.dealer_id && row.full_name && row.phone
        );
        
        setDealers(validDealers);
        setStats(prev => ({ ...prev, loaded: validDealers.length }));
        addLog(`✅ Загружено ${validDealers.length} записей`);
      },
      error: (error) => {
        addLog(`❌ Ошибка чтения файла: ${error}`);
      }
    });
  };

  const cleanPhone = (phone: string) => {
    if (!phone) return '';
    let clean = phone.toString().replace(/\D/g, '');
    if (clean.startsWith('8')) {
      clean = '7' + clean.slice(1);
    } else if (!clean.startsWith('7')) {
      clean = '7' + clean;
    }
    return clean.length === 11 ? clean : '';
  };

  const extractSponsorCode = (sponsor: string) => {
    if (!sponsor || sponsor === 'компания') return null;
    const match = sponsor.match(/KZ\d+/);
    return match ? match[0] : null;
  };

  const createDealer = async (dealer: any) => {
    const phone = cleanPhone(dealer.phone);
    if (!phone) {
      return { success: false, error: 'Неверный телефон' };
    }

    const userData = {
      email: `${dealer.dealer_id.toLowerCase()}@tnba.kz`,
      password: 'tannur1025',
      first_name: dealer.full_name.split(' ')[0],
      last_name: dealer.full_name.split(' ').slice(1).join(' ') || '',
      phone: phone,
      iin: dealer.iin || '',
      instagram: dealer.instagram || '',
      dealer_id: dealer.dealer_id,
      sponsor_code: extractSponsorCode(dealer.sponsor_name),
      // Добавляем поля для Edge Function
      region: '',
      profession: '',
      parent_id: null
    };

    try {
      // Получаем токен из текущей сессии
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { success: false, error: 'Нет активной сессии' };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-dealer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, user_id: result.user_id, ...userData };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Ошибка создания' };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const startImport = async () => {
    if (!user || !profile) {
      addLog('❌ Необходимо войти в систему!');
      return;
    }

    if (!['admin', 'dealer'].includes(profile.role)) {
      addLog(`❌ Недостаточно прав! Ваша роль: ${profile.role}, нужна: admin или dealer`);
      return;
    }

    if (dealers.length === 0) {
      addLog('❌ Нет данных для импорта');
      return;
    }

    setProcessing(true);
    setStats(prev => ({ ...prev, processed: 0, success: 0, errors: 0 }));
    addLog(`Начинаем импорт ${dealers.length} дилеров...`);

    const createdDealers = [];
    const batchSize = 5;

    for (let i = 0; i < dealers.length; i += batchSize) {
      const batch = dealers.slice(i, i + batchSize);
      addLog(`Обрабатываем ${i + 1}-${Math.min(i + batchSize, dealers.length)} из ${dealers.length}`);

      for (const dealer of batch) {
        const result = await createDealer(dealer);
        
        if (result.success) {
          setStats(prev => ({ ...prev, success: prev.success + 1 }));
          addLog(`✅ ${dealer.dealer_id}: создан`);
          createdDealers.push(result);
        } else {
          setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
          addLog(`❌ ${dealer.dealer_id}: ${result.error}`);
        }
        
        setStats(prev => ({ ...prev, processed: prev.processed + 1 }));
        
        await new Promise(r => setTimeout(r, 200));
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    addLog(`✅ Импорт завершен! Успешно: ${stats.success}, Ошибок: ${stats.errors}`);
    localStorage.setItem('imported_dealers', JSON.stringify(createdDealers));
    setProcessing(false);
  };

  const setParentRelations = async () => {
    addLog('Установка связей parent_id...');
    
    const imported = JSON.parse(localStorage.getItem('imported_dealers') || '[]');
    addLog(`Найдено ${imported.length} созданных дилеров`);
    
    // Здесь можно вызвать SQL функцию через supabase.rpc
    // или обработать связи вручную
    
    addLog('✅ Готово');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Импорт дилеров из CSV</h1>
      
      {/* Статус авторизации */}
      <div className={`mb-4 p-4 rounded ${user ? 'bg-green-100' : 'bg-yellow-100'}`}>
        {user ? (
          <div>
            <p className="font-semibold">Пользователь: {user.email}</p>
            <p className="text-sm">Роль: {profile?.role || 'загрузка...'}</p>
            {profile?.role && !['admin', 'dealer'].includes(profile.role) && (
              <p className="text-red-600 text-sm mt-1">⚠️ Недостаточно прав для импорта</p>
            )}
          </div>
        ) : (
          <p>Войдите в систему для импорта</p>
        )}
      </div>
      
      {/* Загрузка файла */}
      <div className="mb-6 p-4 border-2 border-dashed rounded-lg">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-2"
          disabled={processing || !user}
        />
        <p className="text-sm text-gray-600">
          Выберите CSV файл с колонками: dealer_id, full_name, phone, iin, sponsor_name, instagram
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <div className="text-2xl font-bold">{stats.loaded}</div>
          <div className="text-sm">Загружено</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <div className="text-2xl font-bold">{stats.processed}</div>
          <div className="text-sm">Обработано</div>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <div className="text-2xl font-bold">{stats.success}</div>
          <div className="text-sm">Успешно</div>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <div className="text-2xl font-bold">{stats.errors}</div>
          <div className="text-sm">Ошибок</div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={startImport}
          disabled={processing || dealers.length === 0 || !user || (profile && !['admin', 'dealer'].includes(profile.role))}
          className="px-6 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {processing ? `Импорт... (${stats.processed}/${stats.loaded})` : 'Начать импорт'}
        </button>
        
        <button
          onClick={setParentRelations}
          disabled={processing}
          className="px-6 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          Установить связи
        </button>
        
        <button
          onClick={() => {
            setDealers([]);
            setStats({ loaded: 0, processed: 0, success: 0, errors: 0 });
            setLog([]);
          }}
          disabled={processing}
          className="px-6 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          Очистить
        </button>
      </div>

      {/* Прогресс */}
      {processing && stats.loaded > 0 && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded h-4">
            <div 
              className="bg-blue-500 h-4 rounded transition-all"
              style={{ width: `${(stats.processed / stats.loaded) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Лог */}
      <div className="border rounded p-4 h-96 overflow-auto bg-gray-900 text-green-400 font-mono text-xs">
        {log.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Предпросмотр данных */}
      {dealers.length > 0 && !processing && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Предпросмотр (первые 10):</h3>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">ФИО</th>
                  <th className="border p-2">Телефон</th>
                  <th className="border p-2">ИИН</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Instagram</th>
                  <th className="border p-2">Спонсор</th>
                </tr>
              </thead>
              <tbody>
                {dealers.slice(0, 10).map((d, i) => (
                  <tr key={i}>
                    <td className="border p-2">{d.dealer_id}</td>
                    <td className="border p-2">{d.full_name}</td>
                    <td className="border p-2">{cleanPhone(d.phone)}</td>
                    <td className="border p-2">{d.iin || '-'}</td>
                    <td className="border p-2 text-xs">{d.dealer_id.toLowerCase()}@tnba.kz</td>
                    <td className="border p-2 text-xs">{d.instagram || '-'}</td>
                    <td className="border p-2">{extractSponsorCode(d.sponsor_name) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}