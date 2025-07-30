// src/components/ui/DealerPost.tsx
import Image from 'next/image';

interface DealerPostProps {
  imageSrc: string;
  alt: string;
  title: string;
  description?: string;       // новый пропс
}

export default function DealerPost({
  imageSrc,
  alt,
  title,
  description,
}: DealerPostProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col">
      <div className="overflow-hidden rounded-lg border border-gray-200 mb-3">
        <Image
          src={imageSrc}
          alt={alt}
          width={300}
          height={200}
          className="w-full h-auto object-cover"
        />
      </div>
      <h3 className="text-normal font-semibold text-black mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
}
