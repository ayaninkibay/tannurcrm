'use client'

import { useTranslate } from '@/hooks/useTranslate'

export default function BonusTableBlock() {
  const { t } = useTranslate()

  const rows = [
    { turnover: '300 000 тг', percent: '5%',  income: '15 000 тг' },
    { turnover: '1 000 000 тг', percent: '8%',  income: '80 000 тг' },
    { turnover: '3 000 000 тг', percent: '10%', income: '300 000 тг' },
    { turnover: '5 000 000 тг', percent: '13%', income: '650 000 тг' },
    { turnover: '10 000 000 тг', percent: '15%', income: '1 500 000 тг' },
    { turnover: '20 000 000 тг', percent: '18%', income: '3 600 000 тг' },
    { turnover: '50 000 000 тг', percent: '20%', income: '10 000 000 тг', highlight: true },
    { turnover: '100 000 000 тг', percent: '21%', income: '21 000 000 тг' },
    { turnover: '150 000 000 тг', percent: '22%', income: '33 000 000 тг' },
    { turnover: '200 000 000 тг', percent: '23%', income: '46 000 000 тг' },
    { turnover: '300 000 000 тг', percent: '24%', income: '72 000 000 тг' },
    { turnover: '400 000 000 тг', percent: '25%', income: '100 000 000 тг' },
    { turnover: '500 000 000 тг', percent: '26%', income: '130 000 000 тг', highlight: true },
    { turnover: '700 000 000 тг', percent: '27%', income: '189 000 000 тг' },
    { turnover: '1 000 000 000 тг', percent: '28%', income: '280 000 000 тг', highlight: true },
  ]

  return (
    <div className="flex-1 flex flex-col justify-start">
      <p className="text-sm text-gray-500 mb-4">
        {t('Для выхода на доход свыше 13%, необходимо лично пригласить в Бизнес Академию 10 человек.')}
      </p>

      <div className="overflow-y-auto h-[300px] md:h-[500px] xl:h-full rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left text-[12px] md:text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 border-r border-gray-200">{t('Товар оборот')}</th>
              <th className="px-4 py-3 border-r border-gray-200">{t('Процент')}</th>
              <th className="px-4 py-3">{t('Ежемесячный доход')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-t border-gray-200 ${row.highlight ? 'text-green-600 font-semibold bg-green-50' : ''}`}
              >
                <td className="px-4 py-2 border-r border-gray-100">{t(row.turnover)}</td>
                <td className="px-4 py-2 border-r border-gray-100">{t(row.percent)}</td>
                <td className="px-4 py-2">{t(row.income)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        {t('Это ускорит рост командного дохода и позволит получить статус')}{' '}
        <strong className="text-black">{t('БИЗНЕС ЭКСПЕРТА')}</strong>.
      </p>
    </div>
  )
}
