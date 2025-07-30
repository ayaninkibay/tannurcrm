// src/app/page.tsx
'use client';

export default function Page() {
  return (
    <main className="p-4">
      <div className="bg-yellow-200 p-4 mb-4">
        Растяните окно и смотрите, как меняются цвета
      </div>
      <div className="
        xs:bg-red-200 
        sm:bg-orange-200 
        md:bg-yellow-200 
        lg:bg-green-200 
        xl:bg-blue-200 
        xxxxl:bg-purple-200 
        p-6
      ">
        xs / sm / md / lg / xl / xxl
      </div>
    </main>
  );
}
