import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type DistributorRow = Database['public']['Tables']['distributors']['Row'];
type DistributorInsert = Database['public']['Tables']['distributors']['Insert'];
type UserRow = Database['public']['Tables']['users']['Row'];

export interface CreateDistributorData {
  // Данные пользователя
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  region: string;
  
  // Данные дистрибьютора
  org_name: string;
  bin?: string;
  address?: string;
  site?: string;
  notes?: string;
  start_balance?: number;
}

export interface DistributorWithUser extends DistributorRow {
  user: UserRow;
}

export class DistributorService {
  // Генерация уникального реферального кода
  private generateReferralCode(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  // Создание дистрибьютора
  async createDistributor(data: CreateDistributorData): Promise<{ success: boolean; data?: DistributorWithUser; error?: string }> {
    try {
      console.log('Creating distributor with data:', data);

      // Проверяем дублирование телефона
      const { data: existingPhone } = await supabase
        .from('users')
        .select('id')
        .eq('phone', data.phone)
        .limit(1);

      if (existingPhone && existingPhone.length > 0) {
        return { success: false, error: `Пользователь с номером ${data.phone} уже существует` };
      }

      // Проверяем дублирование email (если указан)
      if (data.email) {
        const { data: existingEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', data.email)
          .limit(1);

        if (existingEmail && existingEmail.length > 0) {
          return { success: false, error: `Пользователь с email ${data.email} уже существует` };
        }
      }

      // Генерируем уникальный реферальный код
      let referralCode = this.generateReferralCode();
      let attempts = 0;
      const maxAttempts = 5;

      // Проверяем уникальность реферального кода
      while (attempts < maxAttempts) {
        const { data: existingCode } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .limit(1);

        if (!existingCode || existingCode.length === 0) {
          break; // Код уникален
        }

        referralCode = this.generateReferralCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return { success: false, error: 'Не удалось сгенерировать уникальный реферальный код' };
      }

      console.log('Generated unique referral code:', referralCode);

      // Используем RPC функцию для создания пользователя, если она есть, или обычную вставку
      const { data: userData, error: userError } = await supabase.rpc('create_new_app_user', {
        new_email: data.email || `${Date.now()}@temp.local`,
        new_password: Math.random().toString(36).substring(2, 15),
        new_role: 'dealer',
        user_metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          region: data.region,
          referral_code: referralCode,
          status: 'active',
          is_confirmed: true
        }
      });

      console.log('User creation via RPC result:', { userData, userError });

      if (userError) {
        console.log('Using direct insert method for user creation...');
        
        // Если RPC не сработала, пробуем прямую вставку с сгенерированным UUID
        const newUserId = crypto.randomUUID();
        const { data: directUserData, error: directUserError } = await supabase
          .from('users')
          .insert({
            id: newUserId,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            email: data.email || null,
            region: data.region,
            role: 'dealer',
            status: 'active',
            is_confirmed: true,
            referral_code: referralCode,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        console.log('Direct insert result:', { directUserData, directUserError });

        if (directUserError || !directUserData) {
          console.error('Direct insert failed:', directUserError);
          return { success: false, error: `Ошибка создания пользователя: ${directUserError?.message}` };
        }

        // Используем данные из прямой вставки
        const finalUserData = directUserData;

        // Создаем запись дистрибьютора
        const { data: distributorData, error: distributorError } = await supabase
          .from('distributors')
          .insert({
            user_id: finalUserData.id,
            org_name: data.org_name,
            bin: data.bin || null,
            address: data.address || null,
            site: data.site || null,
            notes: data.notes || null,
            start_balance: data.start_balance || 0,
            current_balance: data.start_balance || 0,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (distributorError || !distributorData) {
          // Откатываем создание пользователя
          await supabase.from('users').delete().eq('id', finalUserData.id);
          return { success: false, error: `Ошибка создания дистрибьютора: ${distributorError?.message}` };
        }

        console.log('Distributor created successfully!');

        return {
          success: true,
          data: {
            ...distributorData,
            user: finalUserData
          }
        };
      }

      // Если RPC сработала, получаем созданного пользователя
      const { data: createdUser, error: getUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData)
        .single();

      if (getUserError || !createdUser) {
        return { success: false, error: 'Пользователь создан, но не найден в базе' };
      }

      // Создаем запись дистрибьютора
      const { data: distributorData, error: distributorError } = await supabase
        .from('distributors')
        .insert({
          user_id: createdUser.id,
          org_name: data.org_name,
          bin: data.bin || null,
          address: data.address || null,
          site: data.site || null,
          notes: data.notes || null,
          start_balance: data.start_balance || 0,
          current_balance: data.start_balance || 0,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (distributorError || !distributorData) {
        // Откатываем создание пользователя
        await supabase.from('users').delete().eq('id', createdUser.id);
        return { success: false, error: `Ошибка создания дистрибьютора: ${distributorError?.message}` };
      }

      console.log('Distributor created successfully via RPC!');

      return {
        success: true,
        data: {
          ...distributorData,
          user: createdUser
        }
      };

    } catch (error) {
      console.error('Unexpected error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  // Получение списка дистрибьюторов
  async getDistributors(): Promise<{ success: boolean; data?: DistributorWithUser[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('distributors')
        .select(`
          *,
          user:users(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as DistributorWithUser[] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }

  // Получение дистрибьютора по ID
  async getDistributor(id: string): Promise<{ success: boolean; data?: DistributorWithUser; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('distributors')
        .select(`
          *,
          user:users(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as DistributorWithUser };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      };
    }
  }
}