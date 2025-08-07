'use client'

import Image from 'next/image'

interface AddDealerCardProps {
  title?: string
  description?: string
  onAdd?: () => void
  onAvatarClick?: () => void
  avatarSrc?: string
}

export default function AddDealerCard({
  title = 'Добавить дилера',
  description = 'It is a long established fact that a reader will be distracted by the readable content.',
  onAdd = () => alert('Добавить нажат'),
  onAvatarClick = () => alert('Аватар нажат'),
  avatarSrc = '/icons/avatar-default.png',
}: AddDealerCardProps) {
  return (
    <div className="rounded-xl flex-1 flex items-center justify-center bg-neutral-700">
      <div className="text-white rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
        <div>
          <h3 className="text-md font-semibold">{title}</h3>
          <p className="text-xs text-white/70 max-w-[80%]">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAvatarClick}
            className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex-shrink-0"
          >
            <img src={avatarSrc} alt="Аватар" className="w-full h-full object-cover" />
          </button>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-white text-black px-8 py-2 rounded-full text-sm hover:bg-gray-100 transition"
          >
            <Image src="/icons/buttom/useradd_black.svg" alt="user" width={16} height={16} />
            Добавить
          </button>
        </div>
      </div>
    </div>
  )
}
