'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { referralService, ReferrerInfo } from '@/lib/referral/referralService'
import { Loader2, UserCheck, CheckCircle2, AlertCircle, Sparkles, Award, Users, TrendingUp, ArrowRight, Eye, EyeOff, LogIn } from 'lucide-react'
import Image from 'next/image'
import { useUser } from '@/context/UserContext'

const REGIONS = [
  'Алматы', 'Астана', 'Шымкент', 'Актобе', 'Караганда', 'Тараз',
  'Павлодар', 'Усть-Каменогорск', 'Семей', 'Атырау', 'Костанай',
  'Кызылорда', 'Актау', 'Петропавловск', 'Другой'
]

export default function ReferralRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const referralCode = params.referralCode as string
  const year = new Date().getFullYear()
  const { profile } = useUser()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [registrationStep, setRegistrationStep] = useState<'form' | 'waiting' | 'payment'>('form')
  const [paymentSubStep, setPaymentSubStep] = useState<'initial' | 'waiting' | 'confirm'>('initial')

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '+7 ', email: '',
    password: '', confirmPassword: '', iin: '', region: '', profession: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [iinChecking, setIinChecking] = useState(false)
  const [iinAvailable, setIinAvailable] = useState<boolean | null>(null)
  const [phoneChecking, setPhoneChecking] = useState(false)
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Определяем авторизован ли пользователь
  const isAuthenticated = !!profile
  const currentUser = profile ? {
    email: profile.email || '',
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  } : null

  // Валидация реферального кода при загрузке
  useEffect(() => {
    const validateCode = async () => {
      setLoading(true)
      setError(null)
      const result = await referralService.validateReferralCode(referralCode)
      if (!result.valid || !result.referrer) {
        setError(result.error || 'Реферальная ссылка недействительна')
        setLoading(false)
        return
      }
      setReferrer(result.referrer)
      setLoading(false)
    }
    if (referralCode) validateCode()
  }, [referralCode])

  useEffect(() => {
    if (!formData.email || formErrors.email) { setEmailAvailable(null); return }
    const timeoutId = setTimeout(async () => {
      setEmailChecking(true)
      const result = await referralService.checkEmailAvailability(formData.email)
      setEmailAvailable(result.available)
      setEmailChecking(false)
      if (!result.available) setFormErrors(prev => ({ ...prev, email: 'Этот email уже зарегистрирован' }))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.email, formErrors.email])

  useEffect(() => {
    if (!formData.iin || formData.iin.length !== 12 || formErrors.iin) { setIinAvailable(null); return }
    const timeoutId = setTimeout(async () => {
      setIinChecking(true)
      const result = await referralService.checkIinAvailability(formData.iin)
      setIinAvailable(result.available)
      setIinChecking(false)
      if (!result.available) setFormErrors(prev => ({ ...prev, iin: 'Этот ИИН уже зарегистрирован' }))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.iin, formErrors.iin])

  useEffect(() => {
    const phoneDigits = formData.phone.replace(/^\+7\s*/, '').replace(/\D/g, '')
    if (!formData.phone || phoneDigits.length !== 10 || formErrors.phone) { setPhoneAvailable(null); return }
    const timeoutId = setTimeout(async () => {
      setPhoneChecking(true)
      const phoneForCheck = formData.phone.replace(/\D/g, '')
      const result = await referralService.checkPhoneAvailability(phoneForCheck)
      setPhoneAvailable(result.available)
      setPhoneChecking(false)
      if (!result.available) setFormErrors(prev => ({ ...prev, phone: 'Этот телефон уже зарегистрирован' }))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.phone, formErrors.phone])

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {}
    switch (name) {
      case 'email':
        if (!value) errors.email = 'Email обязателен'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Некорректный формат email'
        break
      case 'password':
        if (!value) errors.password = 'Пароль обязателен'
        else if (value.length < 6) errors.password = 'Минимум 6 символов'
        break
      case 'confirmPassword':
        if (!value) errors.confirmPassword = 'Подтвердите пароль'
        else if (value !== formData.password) errors.confirmPassword = 'Пароли не совпадают'
        break
      case 'firstName':
        if (!value) errors.firstName = 'Имя обязательно'
        break
      case 'lastName':
        if (!value) errors.lastName = 'Фамилия обязательна'
        break
      case 'phone':
        const phoneDigits = value.replace(/^\+7\s*/, '').replace(/\D/g, '')
        if (!value) errors.phone = 'Телефон обязателен'
        else if (phoneDigits.length !== 10) errors.phone = 'Введите 10 цифр номера'
        break
      case 'iin':
        if (!value) errors.iin = 'ИИН обязателен'
        else if (!/^\d{12}$/.test(value)) errors.iin = 'ИИН должен содержать 12 цифр'
        break
      case 'region':
        if (!value) errors.region = 'Регион обязателен'
        break
    }
    return errors
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'iin') {
      const cleaned = value.replace(/\D/g, '').slice(0, 12)
      setFormData(prev => ({ ...prev, [name]: cleaned }))
    } else if (name === 'phone') {
      let cleaned = value.replace(/\D/g, '')
      if (cleaned.startsWith('8')) cleaned = '7' + cleaned.slice(1)
      if (!cleaned.startsWith('7')) cleaned = '7' + cleaned
      cleaned = cleaned.slice(0, 11)
      
      let formatted = '+7'
      if (cleaned.length > 1) formatted += ' ' + cleaned.slice(1, 4)
      if (cleaned.length > 4) formatted += ' ' + cleaned.slice(4, 7)
      if (cleaned.length > 7) formatted += ' ' + cleaned.slice(7, 9)
      if (cleaned.length > 9) formatted += ' ' + cleaned.slice(9, 11)
      
      setFormData(prev => ({ ...prev, [name]: formatted }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    setFormErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })

    const fieldErrors = validateField(name, value)
    if (Object.keys(fieldErrors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...fieldErrors }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const allErrors: Record<string, string> = {}
    Object.keys(formData).forEach(key => {
      if (['firstName', 'lastName', 'phone', 'email', 'password', 'confirmPassword', 'iin', 'region'].includes(key)) {
        const errors = validateField(key, formData[key as keyof typeof formData])
        Object.assign(allErrors, errors)
      }
    })

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors)
      return
    }

    if (!emailAvailable || !iinAvailable || !phoneAvailable) return

    // Переходим в шаг ожидания вместо регистрации
    setRegistrationStep('waiting')
  }

  const handlePaymentClick = () => {
    // Переходим в шаг оплаты
    setRegistrationStep('payment')
  }

  const handleFinalRegistration = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const phoneForDB = formData.phone.replace(/\D/g, '')
      
      const result = await referralService.registerViaReferral({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: phoneForDB,
        iin: formData.iin,
        region: formData.region,
        profession: formData.profession,
        referralCode: referralCode
      })

      if (!result.success) {
        setError(result.error || 'Ошибка при регистрации')
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/signin'), 2000)
    } catch (err) {
      setError('Произошла ошибка. Попробуйте еще раз.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#D77E6C]" />
          <p className="mt-4 text-gray-600">Проверяем реферальную ссылку...</p>
        </div>
      </div>
    )
  }

  if (error && !referrer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ссылка недействительна</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-[#D77E6C] to-[#E89185] text-white rounded-xl hover:shadow-lg transition font-medium"
          >
            Вернуться на главную
          </button>
        </motion.div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Регистрация успешна!</h1>
          <p className="text-gray-600 mb-2">Добро пожаловать в команду {referrer?.fullName}</p>
          <p className="text-sm text-gray-500">Перенаправляем на страницу входа...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-4 md:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Логотип */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <a href="/" className="inline-block hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
              <Image src="/icons/company/tannur_black.svg" alt="Tannur" width={40} height={40} className="w-20 h-20 md:w-25 md:h-25" />
            </div>
          </a>
          <p className="text-gray-600 text-xs md:text-base">Регистрация в Tannur Business Academy</p>
        </motion.div>

        {/* Информация о пригласившем */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 md:mb-6">
          <div className="bg-gradient-to-r from-[#D77E6C] to-[#E89185] rounded-2xl md:rounded-3xl p-0.5 md:p-1 shadow-xl">
            <div className="bg-white rounded-[15px] md:rounded-[22px] p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#D77E6C] to-[#E89185] rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">
                    {referrer?.firstName?.[0]}{referrer?.lastName?.[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-green-500 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 md:border-4 border-white"></div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-[#D77E6C]" />
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900">{referrer?.fullName}</h2>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-3">приглашает вас в Tannur Cosmetics</p>
                  
                  <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
                    <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full">
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
                      <span className="text-xs md:text-sm font-medium text-purple-700">Активный</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full">
                      <Award className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                      <span className="text-xs md:text-sm font-medium text-blue-700">Проверенный дилер</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Преимущества */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          {[
            { icon: <Users className="w-4 h-4 md:w-5 md:h-5" />, title: 'Команда', desc: 'Поддержка 24/7' },
            { icon: <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />, title: 'Рост', desc: 'Бонусная система' },
            { icon: <Award className="w-4 h-4 md:w-5 md:h-5" />, title: 'Статус', desc: 'Карьерный рост' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 text-center hover:bg-white/80 transition">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#D77E6C] to-[#E89185] rounded-full flex items-center justify-center text-white mx-auto mb-1 md:mb-2">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-xs md:text-sm">{item.title}</h3>
              <p className="text-[10px] md:text-xs text-gray-600 hidden sm:block">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Форма */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8">
          
          {/* Шаг ожидания */}
          {registrationStep === 'waiting' && (
            <div>
              <div className="text-center mb-8">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-white animate-spin" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                  Данные проверены! ✓
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mb-2">
                  {formData.firstName} {formData.lastName}
                </p>
                <p className="text-gray-500">
                  Осталось только оплатить подписку
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-[#D77E6C]/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xl md:text-2xl text-gray-900">Подписка дилера</h3>
                  <div className="text-right">
                    <div className="text-3xl md:text-4xl font-bold text-[#D77E6C]">100,000 ₸</div>
                    <div className="text-sm text-gray-600">единоразово</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-gray-700">Доступ к дилерским ценам и эксклюзивным продуктам</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-gray-700">Бонусы с продаж вашей команды (до 3 уровней)</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-gray-700">Обучающие материалы и поддержка наставника</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePaymentClick}
                className="w-full py-4 md:py-5 bg-gradient-to-r from-[#D77E6C] to-[#E89185] text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 md:gap-3"
              >
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                Перейти к оплате
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <button
                onClick={() => setRegistrationStep('form')}
                className="w-full mt-3 py-3 text-gray-600 hover:text-gray-800 transition text-sm md:text-base"
              >
                ← Вернуться к форме
              </button>
            </div>
          )}

          {/* Шаг оплаты */}
          {registrationStep === 'payment' && (
            <div>
              {/* Initial - показываем ссылку Kaspi */}
              {paymentSubStep === 'initial' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#D77E6C] to-[#E89185] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Оплата подписки</h2>
                    <p className="text-gray-600 text-sm md:text-base">
                      Сумма к оплате: <span className="font-bold text-[#D77E6C] text-xl md:text-2xl">100,000 ₸</span>
                    </p>
                  </div>

                  {/* Ссылка Kaspi */}
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-[#D77E6C]/30">
                    <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-4 flex items-center gap-2">
                      <span>💳</span> Оплата через Kaspi
                    </h3>
                    
                    {/* QR Code */}
                    <div className="bg-white rounded-xl p-4 mb-4 text-center">
                      <p className="text-sm text-gray-600 mb-3">Отсканируйте QR-код или нажмите кнопку ниже</p>
                      <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-4 bg-gray-50 rounded-xl overflow-hidden">
                        <Image
                          src="/img/kaspi_qr.png"
                          alt="Kaspi QR Code"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>

                    {/* Кнопка открыть Kaspi */}
                    <a
                      href="https://pay.kaspi.kz/pay/lafnp2v5"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setPaymentSubStep('waiting')}
                      className="block w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-center hover:shadow-xl transition-all mb-3"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🔗</span>
                        <span>Открыть Kaspi для оплаты</span>
                      </div>
                    </a>

                    <p className="text-xs md:text-sm text-gray-600 text-center">
                      После оплаты вернитесь сюда и нажмите "Я оплатил"
                    </p>
                  </div>

                  <button
                    onClick={() => setRegistrationStep('waiting')}
                    className="w-full mt-3 py-3 text-gray-600 hover:text-gray-800 transition text-sm md:text-base"
                  >
                    ← Назад
                  </button>
                </>
              )}

              {/* Waiting - анимация ожидания оплаты */}
              {paymentSubStep === 'waiting' && (
                <>
                  <div className="text-center mb-8">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="absolute w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                      <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                        <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-white animate-spin" />
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                      Ожидание оплаты...
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600">
                      Завершите оплату в приложении Kaspi
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl md:rounded-2xl p-6 mb-6 border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                        !
                      </div>
                      <div className="text-sm md:text-base text-blue-900">
                        <p className="font-bold mb-2">После оплаты:</p>
                        <p className="text-blue-700">Вернитесь сюда и нажмите кнопку "Я оплатил" ниже</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setPaymentSubStep('confirm')}
                    className="w-full py-4 md:py-5 bg-green-500 hover:bg-green-600 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                    Я оплатил →
                  </button>

                  <button
                    onClick={() => setPaymentSubStep('initial')}
                    className="w-full mt-3 py-3 text-gray-600 hover:text-gray-800 transition text-sm md:text-base"
                  >
                    Открыть ссылку снова
                  </button>
                </>
              )}

              {/* Confirm - финальное подтверждение */}
              {paymentSubStep === 'confirm' && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Подтверждение оплаты</h2>
                    <p className="text-gray-600 text-sm md:text-base">
                      Нажмите кнопку ниже для создания аккаунта
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        !
                      </div>
                      <div className="text-sm md:text-base text-blue-900">
                        <p className="font-medium mb-2">Что происходит:</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-800">
                          <li>Создаётся ваш аккаунт дилера</li>
                          <li>Подключаются бонусы от команды</li>
                          <li>Открывается доступ к продуктам</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleFinalRegistration}
                    disabled={submitting}
                    className="w-full py-4 md:py-5 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                        Создаём аккаунт...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                        Подтвердить и создать аккаунт
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentSubStep('waiting')}
                    disabled={submitting}
                    className="w-full mt-3 py-3 text-gray-600 hover:text-gray-800 transition disabled:opacity-50 text-sm md:text-base"
                  >
                    ← Назад
                  </button>
                </>
              )}
            </div>
          )}

          {/* Блок авторизованного пользователя */}
          {registrationStep === 'form' && isAuthenticated && currentUser && (
            <div className="mb-6 p-4 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl md:rounded-2xl">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <UserCheck className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">Вы уже авторизованы!</h3>
                  <p className="text-xs md:text-sm text-gray-700 mb-2">
                    {currentUser.name && <span className="font-semibold">{currentUser.name}</span>}
                    {currentUser.name && <br />}
                    <span className="text-gray-600">{currentUser.email}</span>
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 mb-3">
                    Вы не можете зарегистрировать новый аккаунт, находясь в системе. Выйдите из аккаунта, чтобы зарегистрировать нового пользователя.
                  </p>
                  <button
                    onClick={() => router.push('/dealer/dashboard')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Перейти в личный кабинет
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {registrationStep === 'form' && (
          <>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Заполните данные</h2>

          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl md:rounded-2xl flex items-start gap-2 md:gap-3">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-xs md:text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Имя и Фамилия */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Имя *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isAuthenticated}
                  className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm border-2 transition ${
                    formErrors.firstName ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-[#D77E6C]'
                  } focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Введите имя"
                />
                {formErrors.firstName && <p className="mt-1 text-[10px] md:text-xs text-red-600">{formErrors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Фамилия *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isAuthenticated}
                  className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm border-2 transition ${
                    formErrors.lastName ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-[#D77E6C]'
                  } focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Введите фамилию"
                />
                {formErrors.lastName && <p className="mt-1 text-[10px] md:text-xs text-red-600">{formErrors.lastName}</p>}
              </div>
            </div>

            {/* Телефон и Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Телефон *</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isAuthenticated}
                    className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm border-2 transition ${
                      formErrors.phone ? 'border-red-300' : phoneAvailable === false ? 'border-red-300' : phoneAvailable === true ? 'border-green-300' : 'border-transparent focus:border-[#D77E6C]'
                    } focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="+7 707 355 48 35"
                  />
                  {phoneChecking && <Loader2 className="absolute right-2 md:right-3 top-2 md:top-3 w-4 h-4 md:w-5 md:h-5 animate-spin text-gray-400" />}
                  {!phoneChecking && phoneAvailable === true && <CheckCircle2 className="absolute right-2 md:right-3 top-2 md:top-3 w-4 h-4 md:w-5 md:h-5 text-green-500" />}
                </div>
                {formErrors.phone && <p className="mt-1 text-[10px] md:text-xs text-red-600">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isAuthenticated}
                    className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm border-2 transition ${
                      formErrors.email ? 'border-red-300' : emailAvailable === false ? 'border-red-300' : emailAvailable === true ? 'border-green-300' : 'border-transparent focus:border-[#D77E6C]'
                    } focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="example@mail.com"
                  />
                  {emailChecking && <Loader2 className="absolute right-2 md:right-3 top-2 md:top-3 w-4 h-4 md:w-5 md:h-5 animate-spin text-gray-400" />}
                  {!emailChecking && emailAvailable === true && <CheckCircle2 className="absolute right-2 md:right-3 top-2 md:top-3 w-4 h-4 md:w-5 md:h-5 text-green-500" />}
                </div>
                {formErrors.email && <p className="mt-1 text-[10px] md:text-xs text-red-600">{formErrors.email}</p>}
              </div>
            </div>

            {/* Пароль */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Пароль *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isAuthenticated}
                    className={`w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm border-2 transition ${
                      formErrors.password ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-[#D77E6C]'
                    } focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Минимум 6 символов"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isAuthenticated}
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>
                </div>
                {formErrors.password && <p className="mt-1 text-[10px] md:text-xs text-red-600">{formErrors.password}</p>}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Подтверждение *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isAuthenticated}
                    className={`w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm border-2 transition ${
                      formErrors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-[#D77E6C]'
                    } focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Повторите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isAuthenticated}
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && <p className="mt-1 text-[10px] md:text-xs text-red-600">{formErrors.confirmPassword}</p>}
              </div>
            </div>

            {/* ИИН и Регион */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">ИИН *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="iin"
                    value={formData.iin}
                    onChange={handleInputChange}
                    disabled={isAuthenticated}
                    className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm border-2 transition ${
                      formErrors.iin ? 'border-red-300' : iinAvailable === false ? 'border-red-300' : iinAvailable === true ? 'border-green-300' : 'border-transparent focus:border-[#D77E6C]'
                    } focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="123456789012"
                    maxLength={12}
                  />
                  {iinChecking && <Loader2 className="absolute right-2 md:right-3 top-2 md:top-3 w-4 h-4 md:w-5 md:h-5 animate-spin text-gray-400" />}
                  {!iinChecking && iinAvailable === true && <CheckCircle2 className="absolute right-2 md:right-3 top-2 md:top-3 w-4 h-4 md:w-5 md:h-5 text-green-500" />}
                </div>
                {formErrors.iin && <p className="mt-1 text-[10px] md:text-xs text-red-600">{formErrors.iin}</p>}
                <span className="text-[10px] md:text-xs text-gray-400 mt-1 block">{formData.iin.length}/12 цифр</span>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Регион *</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  disabled={isAuthenticated}
                  className={`w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm border-2 transition ${
                    formErrors.region ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-[#D77E6C]'
                  } focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">Выберите регион</option>
                  {REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
                </select>
                {formErrors.region && <p className="mt-1 text-[10px] md:text-xs text-red-600">{formErrors.region}</p>}
              </div>
            </div>

            {/* Профессия */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Профессия</label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                disabled={isAuthenticated}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 rounded-lg md:rounded-xl text-xs md:text-sm border-2 border-transparent focus:border-[#D77E6C] focus:outline-none focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Ваша профессия"
              />
            </div>

            {/* Кнопка */}
            <button
              type="submit"
              disabled={submitting || !emailAvailable || !iinAvailable || !phoneAvailable || isAuthenticated}
              className={`group relative w-full py-3 md:py-4 px-6 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base text-white transition-all duration-300 ${
                submitting || !emailAvailable || !iinAvailable || !phoneAvailable || isAuthenticated ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#D77E6C] to-[#E89185] hover:shadow-xl'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    <span>Регистрация...</span>
                  </>
                ) : (
                  <>
                    <span>Зарегистрироваться</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              {!submitting && emailAvailable && iinAvailable && phoneAvailable && !isAuthenticated && (
                <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-[#D77E6C] to-[#E89185] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
              )}
            </button>

            <p className="text-[10px] md:text-xs text-center text-gray-500 mt-3 md:mt-4">
              Нажимая кнопку, вы соглашаетесь с условиями использования
            </p>
          </form>
          </>
          )}
        </motion.div>

        {/* Футер */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center py-4 md:py-6 mt-6 md:mt-8 text-xs md:text-sm text-gray-500">
          <p>© {year} Tannur Cosmetics. Все права защищены.</p>
        </motion.footer>
      </div>
    </div>
  )
}