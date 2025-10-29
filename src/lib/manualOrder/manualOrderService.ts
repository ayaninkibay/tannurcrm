import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

export interface ManualOrderItem {
  product_id: string;
  quantity: number;
  price?: number;
}

export interface CreateManualOrderParams {
  user_id: string;
  order_date: string; // ISO timestamp
  items: ManualOrderItem[];
  delivery_address?: string;
  delivery_method?: string;
  notes?: string;
  status?: Database['public']['Enums']['order_status'];
  payment_status?: Database['public']['Enums']['payment_status'];
}

export interface ManualOrderResult {
  success: boolean;
  order_id?: string;
  order_number?: string;
  total_amount?: number;
  items_count?: number;
  message?: string;
  error?: string;
}

/**
 * Поиск пользователей по email, телефону или имени
 */
export async function searchUsers(query: string) {
  if (!query || query.length < 2) {
    return { data: [], error: null };
  }

  const searchQuery = `%${query}%`;

  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      phone,
      first_name,
      last_name,
      role,
      region,
      is_confirmed,
      created_at
    `)
    .or(`email.ilike.${searchQuery},phone.ilike.${searchQuery},first_name.ilike.${searchQuery},last_name.ilike.${searchQuery}`)
    .order('created_at', { ascending: false })
    .limit(20);

  return { data, error };
}

/**
 * Получить информацию о пользователе по ID
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      phone,
      first_name,
      last_name,
      role,
      region,
      is_confirmed,
      created_at
    `)
    .eq('id', userId)
    .single();

  return { data, error };
}

/**
 * Поиск продуктов по названию
 */
export async function searchProducts(query: string) {
  if (!query || query.length < 2) {
    return { data: [], error: null };
  }

  const searchQuery = `%${query}%`;

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      price_dealer,
      stock,
      category,
      is_active,
      image_url
    `)
    .eq('is_active', true)
    .ilike('name', searchQuery)
    .order('name')
    .limit(20);

  return { data, error };
}

/**
 * Получить все активные продукты (основная функция для списка товаров)
 */
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      price_dealer,
      stock,
      category,
      is_active,
      image_url
    `)
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  return { data, error };
}

/**
 * Создать ручной заказ через SQL функцию
 */
export async function createManualOrder(
  params: CreateManualOrderParams
): Promise<ManualOrderResult> {
  try {
    const { data, error } = await supabase.rpc('create_manual_order', {
      p_user_id: params.user_id,
      p_order_date: params.order_date,
      p_items: params.items as any,
      p_delivery_address: params.delivery_address || null,
      p_delivery_method: params.delivery_method || 'pickup',
      p_notes: params.notes || null,
      p_status: params.status || 'confirmed',
      p_payment_status: params.payment_status || 'paid',
    });

    if (error) {
      console.error('Error creating manual order:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Функция возвращает JSON объект
    if (typeof data === 'object' && data !== null) {
      return data as ManualOrderResult;
    }

    return {
      success: false,
      error: 'Invalid response from server',
    };
  } catch (err) {
    console.error('Exception creating manual order:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Проверить права доступа текущего пользователя
 */
export async function checkAdminAccess() {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log('Session check:', { session, sessionError });

    if (sessionError || !session) {
      console.error('No session:', sessionError);
      return { hasAccess: false, error: 'Not authenticated', role: null };
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    console.log('User check:', { user, error });

    if (error || !user) {
      console.error('User not found:', error);
      return { hasAccess: false, error: 'User not found', role: null };
    }

    const hasAccess = user.role === 'admin' || user.role === 'financier';

    console.log('Access check:', { role: user.role, hasAccess });

    return { hasAccess, role: user.role };
  } catch (err) {
    console.error('Exception in checkAdminAccess:', err);
    return { hasAccess: false, error: 'Error checking access', role: null };
  }
}