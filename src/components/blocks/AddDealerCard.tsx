'use client'

import Image from 'next/image'
import Link from 'next/link' // Import the Link component

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
  // onAdd is no longer directly used for navigation, but you can keep it for other side effects if needed
  onAdd, // Removed default alert, as we're adding navigation
  onAvatarClick = () => alert('Аватар нажат'),
  avatarSrc = '/img/avatar-default.png',
}: AddDealerCardProps) {

  // Define the path for the "Добавить" button
  const addDealerPath = "/dealer/create_dealer";

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

          {/* Wrap the "Добавить" button with Link */}
          <Link href={addDealerPath} passHref>
            <button
              // You can optionally add onAdd here if you need to perform other actions
              // onClick={onAdd}
              className="flex items-center gap-2 bg-white text-black px-8 py-2 rounded-full text-sm hover:bg-gray-100 transition"
            >
              <Image src="/icons/buttom/useradd_black.svg" alt="user" width={16} height={16} />
              Добавить
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}