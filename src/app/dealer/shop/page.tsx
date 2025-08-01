'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MoreHeader from '@/components/header/MoreHeader'
import { supabase } from '@/lib/supabase/client'

export default function ShopPage() {
  return (

 <main className="grid flex-1 gap-4">
        <MoreHeader title="Магазин Tannur" />


        
<section className="grid grid-cols-1 bg-white w-full h-25 gap-4 rounded-2xl">
</section>


<section className="grid grid-cols-6 gap-4">
            <div className="col-span-5 grid grid-rows-2 row-span-1 gap-4">
              <div className="grid row-span-1 grid-cols-5 gap-4">
                            <div className="grid col-span-1 w-full h-full bg-white rounded-2xl">
                            </div>
                            <div className="grid col-span-1 w-full h-full bg-white rounded-2xl">
                            </div>
                            <div className="grid col-span-1 w-full h-full bg-white rounded-2xl">
                            </div>
                            <div className="grid col-span-2 w-full h-full bg-white rounded-2xl">
                            </div>
              </div>
              <div className="grid row-span-1 grid-cols-5 gap-4">
                          <div className="grid col-span-1 w-full h-full bg-white rounded-2xl">
                          </div>
                          <div className="grid col-span-1 w-full h-full bg-white rounded-2xl">
                          </div>
                          <div className="grid col-span-1 w-full h-full bg-white rounded-2xl">
                          </div>
                          <div className="grid col-span-1 w-full h-full bg-white rounded-2xl">
                          </div>
                          <div className="grid col-span-1 w-full h-full bg-white rounded-2xl">
                          </div>
              </div>
            </div>

      <div className="grid col-span-1 w-full h-150 bg-white gap-4 rounded-2xl">
     </div>

</section>

    
      </main>
  )
}
