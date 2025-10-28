import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface ReferrerInfo {
  id: string
  firstName: string | null
  lastName: string | null
  fullName: string
  avatarUrl: string | null
  role: string
  teamSize: number
  referralCode: string
}

export interface ValidationResult {
  valid: boolean
  referrer?: ReferrerInfo
  error?: string
}

export interface RegistrationData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  iin?: string
  region?: string
  instagram?: string
  profession?: string
  referralCode: string
}

export interface RegistrationResult {
  success: boolean
  userId?: string
  message?: string
  error?: string
}

class ReferralService {
  private supabase = createClient(supabaseUrl, supabaseAnonKey)

  /**
   * Валидация referral code через API
   */
  async validateReferralCode(code: string): Promise<ValidationResult> {
    try {
      const response = await fetch(`/api/referral/validate?code=${encodeURIComponent(code)}`)
      const data = await response.json()

      if (!response.ok) {
        return {
          valid: false,
          error: data.error || 'Failed to validate referral code'
        }
      }

      return {
        valid: data.valid,
        referrer: data.referrer,
        error: data.error
      }
    } catch (error) {
      console.error('Validation error:', error)
      return {
        valid: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  /**
   * Проверка доступности email
   */
  async checkEmailAvailability(email: string): Promise<{ available: boolean; error?: string }> {
    try {
      const response = await fetch('/api/referral/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          available: false,
          error: data.error || 'Failed to check email availability'
        }
      }

      return {
        available: data.available
      }
    } catch (error) {
      console.error('Email check error:', error)
      return {
        available: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  /**
   * Регистрация через реферальную ссылку
   * Вызывает Supabase Edge Function
   */
  async registerViaReferral(data: RegistrationData): Promise<RegistrationResult> {
    try {
      // Сначала валидируем код еще раз (на всякий случай)
      const validation = await this.validateReferralCode(data.referralCode)
      
      if (!validation.valid || !validation.referrer) {
        return {
          success: false,
          error: validation.error || 'Invalid referral code'
        }
      }

      // Вызываем Edge Function для создания пользователя
      const { data: functionData, error: functionError } = await this.supabase.functions.invoke(
        'register-via-referral',
        {
          body: {
            email: data.email.toLowerCase(),
            password: data.password,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            iin: data.iin,
            region: data.region,
            instagram: data.instagram,
            profession: data.profession,
            referral_code: data.referralCode,
            parent_id: validation.referrer.id
          }
        }
      )

      if (functionError) {
        console.error('Edge function error:', functionError)
        return {
          success: false,
          error: functionError.message || 'Registration failed'
        }
      }

      if (!functionData.success) {
        return {
          success: false,
          error: functionData.error || 'Registration failed'
        }
      }

      return {
        success: true,
        userId: functionData.user_id,
        message: functionData.message || 'Registration successful'
      }

    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  /**
   * Проверка уникальности IIN
   */
  async checkIinAvailability(iin: string): Promise<{ available: boolean; error?: string }> {
    try {
      const response = await fetch('/api/referral/check-iin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iin }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          available: false,
          error: data.error || 'Failed to check IIN availability'
        }
      }

      return {
        available: data.available
      }
    } catch (error) {
      console.error('IIN check error:', error)
      return {
        available: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  /**
   * Проверка уникальности телефона
   */
  async checkPhoneAvailability(phone: string): Promise<{ available: boolean; error?: string }> {
    try {
      const response = await fetch('/api/referral/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          available: false,
          error: data.error || 'Failed to check phone availability'
        }
      }

      return {
        available: data.available
      }
    } catch (error) {
      console.error('Phone check error:', error)
      return {
        available: false,
        error: 'Network error. Please try again.'
      }
    }
  }
}

export const referralService = new ReferralService()