'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslate } from '@/hooks/useTranslate'

interface AddDealerCardProps {
  title?: string
  description?: string
  onAdd?: () => void
  onAvatarClick?: () => void
  avatarSrc?: string
}

export default function AddDealerCard({
  title = 'Добавить дилера',
  description = 'Это давно установленный факт, что читатель будет отвлекаться на читаемое содержание.',
  onAdd,
  onAvatarClick,
  avatarSrc = '/img/avatar-default.png',
}: AddDealerCardProps) {
  const { t } = useTranslate()

  // Значение по умолчанию для клика по аватару — с переводом
  const handleAvatarClick = onAvatarClick ?? (() => alert(t('Аватар нажат')))

  // Путь для кнопки «Добавить»
  const addDealerPath = '/dealer/myteam/create_dealer'

  return (
    <div className="rounded-xl flex-1 flex items-center justify-center bg-neutral-700">
      <div className="text-white rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
        <div>
          <h3 className="text-md font-semibold">{t(title)}</h3>
          <p className="text-xs text-white/70 max-w-[80%]">{t(description)}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAvatarClick}
            className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex-shrink-0"
            title={t('Аватар')}
          >
            <img src={avatarSrc} alt={t('Аватар')} className="w-full h-full object-cover" />
          </button>

          {/* Кнопка «Добавить» с навигацией через Link */}
          <Link href={addDealerPath} passHref>
            <button
              // onClick={onAdd} // можно раскомментировать, если нужен побочный эффект
              className="flex items-center gap-2 bg-white text-black px-8 py-2 rounded-full text-sm hover:bg-gray-100 transition"
              title={t('Добавить')}
            >
              <Image src="/icons/buttom/useradd_black.svg" alt={t('Пользователь')} width={16} height={16} />
              {t('Добавить')}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
