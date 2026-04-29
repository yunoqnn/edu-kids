'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

type Role = 'PARENT' | 'CREATOR'
type Tab = 'signin' | 'signup'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFromUrl = (searchParams.get('role') as Role) || 'PARENT'
  const tabFromUrl = (searchParams.get('tab') as Tab) || 'signin'

  const [role, setRole] = useState<Role>(roleFromUrl)
  const [tab, setTab] = useState<Tab>(tabFromUrl)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => setRole(roleFromUrl), [roleFromUrl])
  useEffect(() => setTab(tabFromUrl), [tabFromUrl])

  const redirectByRole = (r: Role) => {
    if (r === 'PARENT') router.push('/parent/dashboard')
    else if (r === 'CREATOR') router.push('/creator/dashboard')
    else router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (tab === 'signup') {
      if (!name.trim()) return setError('Нэрээ оруулна уу')
      if (password.length < 8) return setError('Нууц үг хамгийн багадаа 8 тэмдэгт байна')
      if (password !== confirm) return setError('Нууц үг таарахгүй байна')
      if (!acceptedTerms) return setError('Үйлчилгээний нөхцөлийг зөвшөөрнө үү')
    }

    setLoading(true)
    try {
      if (tab === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, role },
          },
        })
        if (signUpError) { setError(signUpError.message); return }
        if (data.user) {
          redirectByRole(role)
        } else {
          setError('Имэйл рүүгээ орж баталгаажуулалтыг хийнэ үү.')
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) { setError('Имэйл эсвэл нууц үг буруу байна'); return }
        if (data.user) {
          const userRole = data.user.user_metadata?.role as Role
          redirectByRole(userRole)
        }
      }
    } catch {
      setError('Серверт холбогдож чадсангүй')
    } finally {
      setLoading(false)
    }
  }

  const isSignIn = tab === 'signin'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Illustration Panel */}
      <div 
        className={`hidden lg:flex lg:w-1/2 relative flex-col justify-between p-8 xl:p-12 ${
          isSignIn ? 'bg-[#7AD1D1]' : 'bg-[#F5A5A5]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎓</div>
            <span className="font-extrabold text-xl text-white drop-shadow-sm">StudyComp</span>
          </div>
          <nav className="hidden xl:flex items-center gap-6 text-white/90 text-sm font-semibold">
            <button onClick={() => router.push('/')} className="hover:text-white transition-colors">Нүүр</button>
            <button className="hover:text-white transition-colors">Тухай</button>
            <button className="hover:text-white transition-colors">Блог</button>
            <button className="hover:text-white transition-colors">Холбоо барих</button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-md">
            {isSignIn ? (
              <>
                <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
                  Нэвтэрч <br />
                  <span className="text-[#2A5858]">Хүүхдийнхээ сурлагыг</span> <br />
                  дэмжээрэй
                </h1>
                <p className="text-white/90 text-base mb-6">
                  Бүртгэлгүй бол{' '}
                  <button 
                    onClick={() => setTab('signup')} 
                    className="text-[#FFF5C3] font-bold hover:underline"
                  >
                    энд дарж бүртгүүлнэ үү!
                  </button>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
                  Хүүхдийнхээ <br />
                  <span className="text-[#8B4A4A]">боловсролын</span> <br />
                  аялалыг эхлүүлээрэй
                </h1>
                <p className="text-white/90 text-base">
                  Тоглоомоор дамжуулан сурах шинэ арга замыг нээгээрэй.
                </p>
              </>
            )}
          </div>

          {/* Floating Icons */}
          <div className="relative mt-8">
            <div className="absolute -top-4 left-0 text-4xl opacity-80 animate-bounce">📚</div>
            <div className="absolute top-8 left-20 text-3xl opacity-70" style={{ animationDelay: '0.2s' }}>✏️</div>
            <div className="absolute -top-8 right-20 text-4xl opacity-80 animate-pulse">⭐</div>
            <div className="absolute top-4 right-0 text-3xl opacity-70">🎯</div>
            <div className="absolute top-20 left-10 text-3xl opacity-60">🧩</div>
          </div>
        </div>

        {/* Illustration */}
        <div className="relative h-64 xl:h-80 mt-4">
          <Image
            src={isSignIn ? '/images/auth-login-illustration.jpg' : '/images/auth-signup-illustration.jpg'}
            alt="Education illustration"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 flex items-center justify-between border-b border-gray-100">
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-[#7AD1D1]">StudyComp</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Desktop Top Link */}
        <div className="hidden lg:flex justify-between items-center p-6 xl:p-8">
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <p className="text-sm text-gray-500">
            {isSignIn ? 'Бүртгэлгүй юу? ' : 'Бүртгэлтэй юу? '}
            <button 
              onClick={() => { setTab(isSignIn ? 'signup' : 'signin'); setError('') }}
              className="text-[#7AD1D1] font-semibold hover:underline"
            >
              {isSignIn ? 'Бүртгүүлэх' : 'Нэвтрэх'}
            </button>
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl xl:text-3xl font-extrabold text-gray-800">
                {isSignIn ? (
                  <span className="text-[#7AD1D1]">Нэвтрэх</span>
                ) : (
                  <>
                    Эхлүүлцгээе <span className="text-[#F5A5A5]">хамтдаа</span>
                  </>
                )}
              </h2>
            </div>

            {/* Social Buttons */}
            <div className="flex gap-3 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">эсвэл</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Role Selector */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
              {(['PARENT', 'CREATOR'] as Role[]).map((r) => (
                <button 
                  key={r} 
                  onClick={() => setRole(r)} 
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    role === r 
                      ? 'bg-[#7AD1D1] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r === 'PARENT' ? '👨‍👩‍👧 Эцэг эх' : '✏️ Бүтээгч'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isSignIn && (
                <div>
                  <input
                    type="text"
                    placeholder="Овог нэр"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7AD1D1] focus:ring-2 focus:ring-[#7AD1D1]/20 transition-all"
                  />
                </div>
              )}
              
              <div className="relative">
                <input
                  type="email"
                  placeholder="Имэйл хаяг"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7AD1D1] focus:ring-2 focus:ring-[#7AD1D1]/20 transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Нууц үг"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7AD1D1] focus:ring-2 focus:ring-[#7AD1D1]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>

              {!isSignIn && (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Нууц үг давтах"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7AD1D1] focus:ring-2 focus:ring-[#7AD1D1]/20 transition-all"
                  />
                </div>
              )}

              {isSignIn ? (
                <div className="text-right">
                  <button type="button" className="text-sm text-gray-500 hover:text-[#7AD1D1] transition-colors">
                    Нууц үг мартсан уу?
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#7AD1D1] focus:ring-[#7AD1D1]"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    Би{' '}
                    <button type="button" className="text-[#7AD1D1] font-medium hover:underline">
                      үйлчилгээний нөхцөл
                    </button>
                    -ийг зөвшөөрч байна
                  </label>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#7AD1D1] hover:bg-[#5BBABA] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-[#7AD1D1]/30 hover:shadow-xl hover:shadow-[#7AD1D1]/40"
              >
                {loading ? 'Уншиж байна...' : isSignIn ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </button>
            </form>

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden mt-6 text-center text-sm text-gray-500">
              {isSignIn ? 'Бүртгэлгүй юу? ' : 'Бүртгэлтэй юу? '}
              <button 
                onClick={() => { setTab(isSignIn ? 'signup' : 'signin'); setError('') }}
                className="text-[#7AD1D1] font-semibold hover:underline"
              >
                {isSignIn ? 'Бүртгүүлэх' : 'Нэвтрэх'}
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="hidden lg:block absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#D4F5D4] to-transparent rounded-tl-full opacity-60" />
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
