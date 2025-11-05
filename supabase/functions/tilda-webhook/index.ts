import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    let tildaData: any = {}

    // Парсим данные от Tilda (form-urlencoded)
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text()
      const params = new URLSearchParams(text)
      for (const [key, value] of params.entries()) {
        tildaData[key] = value
      }
    } else {
      const text = await req.text()
      const params = new URLSearchParams(text)
      for (const [key, value] of params.entries()) {
        tildaData[key] = value
      }
    }

    console.log('Получены данные от Tilda:', tildaData)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Парсим товары если они есть
    let products = null
    if (tildaData.products) {
      try {
        products = JSON.parse(tildaData.products)
      } catch (e) {
        console.log('Не удалось распарсить products:', e)
        products = [{ raw: tildaData.products }]
      }
    }

    // Генерируем уникальный номер заказа
    const orderNumber = `TILDA-${Date.now()}`

    // Формируем данные для вставки
    const orderData = {
      order_number: orderNumber,
      
      // Данные клиента
      customer_name: tildaData.Name || tildaData.name || null,
      customer_email: tildaData.Email || tildaData.email || null,
      customer_phone: tildaData.Phone || tildaData.phone || null,
      customer_address: tildaData.Address || tildaData.address || null,
      
      // Финансы
      total_amount: parseFloat(tildaData.Amount || tildaData.payment?.amount || 0),
      
      // Товары
      products: products,
      
      // Статусы
      status: 'new',
      payment_status: tildaData.payment?.status || 'pending',
      
      // Сырые данные на всякий случай
      raw_data: tildaData,
      
      // Флаг обработки
      processed: false
    }

    // Вставляем в базу
    const { data: order, error } = await supabaseClient
      .from('tilda_orders')
      .insert([orderData])
      .select()
      .single()

    if (error) {
      console.error('Ошибка при создании заказа:', error)
      throw error
    }

    console.log('✅ Заказ успешно создан:', order.id, order.order_number)

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: order.id,
        order_number: order.order_number,
        message: 'Заказ получен и будет обработан'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Ошибка:', error.message)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})