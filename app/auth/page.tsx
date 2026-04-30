'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Role = 'PARENT' | 'CONTENT_CREATOR'

/* ---------- Helpers ---------- */
function strengthOf(pw: string): number {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 4)
}

/* ---------- SVG Illustrations ---------- */
function MascotSignIn() {
  return (
    <svg viewBox="0 0 380 360" width="100%" style={{ maxWidth: 420, display: 'block' }} aria-hidden>
      <path d="M30 320 Q 80 300 130 320 T 230 320 T 330 320" stroke="#1F1A2E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="300" cy="80" r="46" fill="#FFE08A" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r1 = 54, r2 = 66, rad = (a * Math.PI) / 180
        return (
          <line key={a}
            x1={300 + Math.cos(rad) * r1} y1={80 + Math.sin(rad) * r1}
            x2={300 + Math.cos(rad) * r2} y2={80 + Math.sin(rad) * r2}
            stroke="#1F1A2E" strokeWidth="2" strokeLinecap="round" />
        )
      })}
      <g transform="translate(60,70)">
        <path d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4 Z" fill="#7CC5F2" stroke="#1F1A2E" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
      <g transform="translate(110,150)" stroke="#1F1A2E" strokeWidth="2" fill="#FFF7EC">
        <ellipse cx="0" cy="0" rx="22" ry="14" />
        <ellipse cx="20" cy="-4" rx="14" ry="10" />
      </g>
      <g transform="translate(40,230) rotate(-8)">
        <rect x="0" y="0" width="60" height="60" rx="10" fill="#FF8C8C" stroke="#1F1A2E" strokeWidth="2.5" />
        <text x="30" y="42" textAnchor="middle" fontFamily="DM Serif Display, serif" fontSize="34" fill="#1F1A2E">А</text>
      </g>
      <g transform="translate(190,210)">
        <path d="M-80 110 Q -80 60 0 60 Q 80 60 80 110 Z" fill="#7DD3A7" stroke="#1F1A2E" strokeWidth="2.5" />
        <path d="M-30 60 Q 0 80 30 60" stroke="#1F1A2E" strokeWidth="2.5" fill="none" />
        <circle cx="0" cy="10" r="58" fill="#FFE2C7" stroke="#1F1A2E" strokeWidth="2.5" />
        <path d="M-40 -30 Q -20 -55 0 -45 Q 20 -55 40 -30 Q 30 -20 0 -22 Q -30 -20 -40 -30 Z" fill="#3B2A20" stroke="#1F1A2E" strokeWidth="2.5" />
        <circle cx="-18" cy="6" r="3.5" fill="#1F1A2E" />
        <circle cx="18" cy="6" r="3.5" fill="#1F1A2E" />
        <circle cx="-30" cy="22" r="6" fill="#FF8C8C" opacity="0.6" />
        <circle cx="30" cy="22" r="6" fill="#FF8C8C" opacity="0.6" />
        <path d="M-12 28 Q 0 38 12 28" stroke="#1F1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <g>
          <rect x="-50" y="-58" width="100" height="10" rx="2" fill="#1F1A2E" transform="rotate(-4)" />
          <polygon points="-46,-58 46,-58 56,-66 -56,-66" fill="#1F1A2E" />
          <circle cx="46" cy="-62" r="3" fill="#FFC93C" />
          <path d="M46 -62 Q 60 -50 60 -36" stroke="#FFC93C" strokeWidth="2.5" fill="none" />
          <circle cx="60" cy="-34" r="4" fill="#FFC93C" />
        </g>
      </g>
      <g fill="#1F1A2E">
        <circle cx="340" cy="200" r="2.5" />
        <circle cx="20" cy="180" r="2" />
        <circle cx="350" cy="280" r="2" />
      </g>
    </svg>
  )
}

function MascotSignUp() {
  return (
    <svg viewBox="0 0 380 360" width="100%" style={{ maxWidth: 440, display: 'block' }} aria-hidden>
      <line x1="20" y1="320" x2="360" y2="320" stroke="#1F1A2E" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      <g transform="translate(260,90) rotate(15)">
        <path d="M0 -50 Q 18 -50 18 -10 L 18 40 L -18 40 L -18 -10 Q -18 -50 0 -50 Z" fill="#FFF7EC" stroke="#1F1A2E" strokeWidth="2.5" />
        <circle cx="0" cy="-5" r="9" fill="#7CC5F2" stroke="#1F1A2E" strokeWidth="2" />
        <path d="M-18 25 L -32 50 L -18 40 Z" fill="#FFC93C" stroke="#1F1A2E" strokeWidth="2.5" />
        <path d="M18 25 L 32 50 L 18 40 Z" fill="#FFC93C" stroke="#1F1A2E" strokeWidth="2.5" />
        <path d="M-8 40 L -8 56 M 0 40 L 0 60 M 8 40 L 8 56" stroke="#F26A6A" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(70,90)">
        <circle r="28" fill="#7E5BD9" stroke="#1F1A2E" strokeWidth="2.5" />
        <ellipse rx="46" ry="10" fill="none" stroke="#1F1A2E" strokeWidth="2" transform="rotate(-18)" />
      </g>
      <g transform="translate(105,195)">
        {/* book 3 - bottom, widest */}
        <g transform="translate(0,82)">
          <rect x="0" y="0" width="185" height="38" rx="5" fill="#7CC5F2" stroke="#1F1A2E" strokeWidth="2.5" />
          {/* spine */}
          <rect x="0" y="0" width="18" height="38" rx="5" fill="#5AAED8" stroke="#1F1A2E" strokeWidth="2.5" />
          <rect x="9" y="0" width="9" height="38" fill="#5AAED8" />
          {/* page lines on right edge */}
          <line x1="175" y1="4" x2="175" y2="34" stroke="#1F1A2E" strokeWidth="1" opacity="0.3" />
          <line x1="179" y1="4" x2="179" y2="34" stroke="#1F1A2E" strokeWidth="1" opacity="0.3" />
          <text x="96" y="24" textAnchor="middle" fontFamily="Lexend, sans-serif" fontSize="12" fontWeight="700" fill="#1F1A2E">ҮЛГЭР · ТОМ НОМ</text>
        </g>

        {/* book 2 - middle */}
        <g transform="translate(8,40)">
          <rect x="0" y="0" width="172" height="36" rx="5" fill="#7DD3A7" stroke="#1F1A2E" strokeWidth="2.5" />
          <rect x="0" y="0" width="16" height="36" rx="5" fill="#5BBF8A" stroke="#1F1A2E" strokeWidth="2.5" />
          <rect x="8" y="0" width="8" height="36" fill="#5BBF8A" />
          <line x1="163" y1="4" x2="163" y2="32" stroke="#1F1A2E" strokeWidth="1" opacity="0.3" />
          <line x1="167" y1="4" x2="167" y2="32" stroke="#1F1A2E" strokeWidth="1" opacity="0.3" />
          <text x="92" y="23" textAnchor="middle" fontFamily="Lexend, sans-serif" fontSize="12" fontWeight="700" fill="#1F1A2E">ТООЛОЛ · 2-Р АНГИ</text>
        </g>

        {/* book 1 - top */}
        <g transform="translate(14,2)">
          <rect x="0" y="0" width="158" height="34" rx="5" fill="#FFC93C" stroke="#1F1A2E" strokeWidth="2.5" />
          <rect x="0" y="0" width="15" height="34" rx="5" fill="#E8B020" stroke="#1F1A2E" strokeWidth="2.5" />
          <rect x="7" y="0" width="8" height="34" fill="#E8B020" />
          <line x1="149" y1="4" x2="149" y2="30" stroke="#1F1A2E" strokeWidth="1" opacity="0.3" />
          <line x1="153" y1="4" x2="153" y2="30" stroke="#1F1A2E" strokeWidth="1" opacity="0.3" />
          <text x="88" y="21" textAnchor="middle" fontFamily="Lexend, sans-serif" fontSize="12" fontWeight="700" fill="#1F1A2E">МОНГОЛ · 1-Р АНГИ</text>
        </g>

        {/* apple on top of books */}
        <g transform="translate(148,-18)">
          <circle r="14" fill="#F26A6A" stroke="#1F1A2E" strokeWidth="2.5" />
          <path d="M0 -14 Q 4 -22 12 -20" stroke="#1F1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="6" cy="-12" rx="6" ry="3" fill="#7DD3A7" stroke="#1F1A2E" strokeWidth="2" transform="rotate(-30 6 -12)" />
        </g>

        {/* pencil leaning left */}
        <g transform="translate(-28,55) rotate(-18)">
          <rect x="0" y="0" width="52" height="10" fill="#FFE08A" stroke="#1F1A2E" strokeWidth="2" />
          <polygon points="52,0 64,5 52,10" fill="#FFF7EC" stroke="#1F1A2E" strokeWidth="2" />
          <rect x="-8" y="0" width="8" height="10" fill="#F26A6A" stroke="#1F1A2E" strokeWidth="2" />
        </g>
      </g>
      <g fill="#1F1A2E">
        <path d="M40 220 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 z" />
        <path d="M340 250 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" />
      </g>
    </svg>
  )
}

/* ---------- Field components ---------- */
function Field({
  label, type = 'text', value, onChange, error, autoComplete, icon, rightSlot,
}: {
  label: string; type?: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string; autoComplete?: string
  icon?: React.ReactNode; rightSlot?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const filled = value.length > 0

  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <div style={{
        position: 'relative', background: '#FFFFFF',
        border: `1.5px solid ${error ? '#F26A6A' : focused ? '#1F1A2E' : '#EADFCB'}`,
        borderRadius: 14, height: 58,
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
        transition: 'border-color 160ms ease',
      }}>
        {icon && <span style={{ color: '#A199B4', display: 'flex', flexShrink: 0 }}>{icon}</span>}
        <div style={{ position: 'relative', flex: 1, height: '100%' }}>
          <span style={{
            position: 'absolute', left: 0,
            top: focused || filled ? 8 : '50%',
            transform: focused || filled ? 'translateY(0) scale(0.82)' : 'translateY(-50%) scale(1)',
            transformOrigin: 'left center',
            color: error ? '#F26A6A' : focused ? '#1F1A2E' : '#A199B4',
            fontSize: 14, fontWeight: focused || filled ? 600 : 400,
            transition: 'all 160ms ease', pointerEvents: 'none',
            letterSpacing: focused || filled ? 0.4 : 0,
            textTransform: focused || filled ? 'uppercase' : 'none',
            whiteSpace: 'nowrap',
          }}>{label}</span>
          <input
            type={type} value={value} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            autoComplete={autoComplete}
            style={{
              position: 'absolute', inset: 0, paddingTop: focused || filled ? 20 : 0,
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 15, color: '#1F1A2E', width: '100%',
            }} />
        </div>
        {rightSlot}
      </div>
      {error && <div style={{ color: '#F26A6A', fontSize: 12, marginTop: 5, marginLeft: 4 }}>{error}</div>}
    </label>
  )
}

function PasswordField(props: Omit<React.ComponentProps<typeof Field>, 'type' | 'rightSlot'>) {
  const [show, setShow] = useState(false)
  return (
    <Field
      {...props}
      type={show ? 'text' : 'password'}
      rightSlot={
        <button type="button" onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, color: '#A199B4', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {show
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.06" /><path d="M6.61 6.61A17.7 17.7 0 0 0 2 12s3.5 7 10 7a10.94 10.94 0 0 0 5.39-1.39" /><path d="m2 2 20 20" /><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" /></svg>}
        </button>
      }
    />
  )
}

function StrengthMeter({ value }: { value: string }) {
  const s = strengthOf(value)
  const labels = ['Хэтэрхий богино', 'Бага зэрэг', 'Дунд зэрэг', 'Хүчтэй', 'Маш хүчтэй!']
  const colors = ['#EADFCB', '#F26A6A', '#FFC93C', '#7DD3A7', '#7DD3A7']
  return (
    <div style={{ marginTop: -8, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < s ? colors[s] : '#EADFCB', transition: 'background 200ms ease' }} />
        ))}
      </div>
      {value && <div style={{ fontSize: 11, color: '#5A5470', marginTop: 6, fontWeight: 500 }}>{labels[s]}</div>}
    </div>
  )
}

function PrimaryButton({ children, onClick, color = '#1F1A2E', disabled }: {
  children: React.ReactNode; onClick?: () => void; color?: string; disabled?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button type="submit" onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', background: color, color: '#FFF7EC',
        border: 'none', borderRadius: 14, padding: '18px 20px',
        fontFamily: 'inherit', fontSize: 16, fontWeight: 600, letterSpacing: 0.2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        boxShadow: hover && !disabled ? '0 8px 0 0 rgba(31,26,46,0.18)' : '0 4px 0 0 rgba(31,26,46,0.18)',
        transform: hover && !disabled ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 140ms ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
      {children}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    </button>
  )
}

/* ---------- Sign In panel ---------- */
function SignInPanel({ role, onSwitch }: { role: Role; onSwitch: () => void }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const redirectByRole = (r: string) => {
    if (r === 'PARENT') router.push('/parent/dashboard')
    else if (r === 'CONTENT_CREATOR') router.push('/creator/dashboard')
    else router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!/.+@.+\..+/.test(email)) errs.email = 'Зөв и-мэйл хаяг оруулна уу'
    if (password.length < 6) errs.password = 'Нууц үг хамгийн багадаа 6 тэмдэгт байна'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setServerError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setServerError('И-мэйл эсвэл нууц үг буруу байна'); return }
      if (data.user) redirectByRole(data.user.user_metadata?.role ?? role)
    } catch {
      setServerError('Серверт холбогдож чадсангүй')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 42, lineHeight: 1, margin: '0 0 8px', color: '#1F1A2E' }}>
        Нэвтрэх
      </h1>
      <p style={{ color: '#5A5470', fontSize: 14, marginBottom: 32 }}>
        {role === 'PARENT' ? 'Эцэг эхийн хэсэгт тавтай морил' : 'Контент бүтээгчийн хэсэгт тавтай морил'}
      </p>

      <Field label="И-мэйл хаяг" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email"
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>} />

      <PasswordField label="Нууц үг" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} autoComplete="current-password"
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>} />

      {serverError && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {serverError}
        </div>
      )}

      <PrimaryButton color="#F26A6A" disabled={loading}>
        {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
      </PrimaryButton>

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#5A5470' }}>
        Шинэ хэрэглэгч үү?{' '}
        <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#F26A6A', fontWeight: 700, fontFamily: 'inherit', fontSize: 14, borderBottom: '1.5px solid #F26A6A' }}>
          Бүртгүүлэх
        </button>
      </div>
    </form>
  )
}

/* ---------- Sign Up panel ---------- */
function SignUpPanel({ role, onSwitch }: { role: Role; onSwitch: () => void }) {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const redirectByRole = (r: Role) => {
    if (r === 'PARENT') router.push('/parent/dashboard')
    else router.push('/creator/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = 'Нэрээ оруулна уу'
    if (!lastName.trim()) errs.lastName = 'Овгоо оруулна уу'
    if (!/.+@.+\..+/.test(email)) errs.email = 'Зөв и-мэйл хаяг оруулна уу'
    if (password.length < 8) errs.password = 'Нууц үг хамгийн багадаа 8 тэмдэгт байна'
    if (confirm !== password) errs.confirm = 'Нууц үг таарахгүй байна'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setServerError('')
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: `${lastName} ${firstName}`,
            role,
          },
        },
      })
      if (error) { setServerError(error.message); return }
      if (data.user) {
        redirectByRole(role)
      } else {
        setServerError('И-мэйл рүүгээ орж баталгаажуулалтыг хийнэ үү.')
      }
    } catch {
      setServerError('Серверт холбогдож чадсангүй')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 460 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button type="button" onClick={onSwitch} aria-label="Буцах"
          style={{ width: 40, height: 40, borderRadius: 12, border: '1.5px solid #EADFCB', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div style={{ fontSize: 13, color: '#5A5470' }}>
          Бүртгэлтэй юу?{' '}
          <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#7E5BD9', fontWeight: 700, fontFamily: 'inherit', fontSize: 13, borderBottom: '1.5px solid #7E5BD9' }}>
            Нэвтрэх
          </button>
        </div>
      </div>

      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 38, lineHeight: 1, margin: '20px 0 24px', color: '#1F1A2E' }}>
        Бүртгүүлэх
      </h1>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Овог" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} autoComplete="family-name" />
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Нэр" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} autoComplete="given-name" />
        </div>
      </div>

      <Field label="И-мэйл хаяг" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email"
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>} />

      <PasswordField label="Нууц үг" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} autoComplete="new-password"
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>} />

      <StrengthMeter value={password} />

      <PasswordField label="Нууц үг давтах" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} autoComplete="new-password"
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>} />

      {serverError && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {serverError}
        </div>
      )}

      <PrimaryButton color="#7E5BD9" disabled={loading}>
        {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
      </PrimaryButton>
    </form>
  )
}

/* ---------- Main auth form (reads URL params) ---------- */
function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFromUrl = (searchParams.get('role') as Role) ?? 'PARENT'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const isSignIn = mode === 'signin'
  /* left panel color: yellow for PARENT, pink for CONTENT_CREATOR */
  const leftBg = roleFromUrl === 'PARENT' ? '#FFC93C' : '#FF8C8C'
  const headlineAccent = roleFromUrl === 'PARENT' ? '#F26A6A' : '#7E5BD9'

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Lexend:wght@400;600;700&display=swap');
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Lexend', sans-serif; }
        @media (max-width: 900px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-left { display: none !important; }
        }
      `}</style>

      <div className="auth-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', minHeight: '100vh', overflow: 'hidden' }}>
        {/* LEFT PANEL */}
        <div className="auth-left" style={{
          position: 'relative', overflow: 'hidden',
          background: leftBg, transition: 'background 360ms ease',
          padding: '40px 60px', display: 'flex', flexDirection: 'column',
        }}>
          {/* Dotted texture */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(31,26,46,0.10) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: 0.6, pointerEvents: 'none' }} />
          {/* Blob */}
          <div style={{ position: 'absolute', right: -120, top: -120, width: 340, height: 340, background: roleFromUrl === 'PARENT' ? '#FFE08A' : '#FFB3B3', borderRadius: '50%', transition: 'background 360ms ease' }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden>
              <circle cx="24" cy="24" r="22" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeDasharray="4 3" />
              <path d="M14 28 L24 16 L34 28 L24 22 Z" fill="#1F1A2E" />
              <circle cx="24" cy="32" r="2.5" fill="#1F1A2E" />
            </svg>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#1F1A2E', letterSpacing: -0.3 }}>edukids</span>
          </div>

          {/* Headline */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: 64, maxWidth: 480 }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(40px, 4.4vw, 60px)', lineHeight: 1.05, color: '#1F1A2E', margin: 0 }}>
              {isSignIn
                ? <>Тавтай <span style={{ color: headlineAccent }}>морил.</span></>
                : <>Эхэлцгээе <span style={{ color: headlineAccent }}>эндээс.</span></>}
            </h2>
          </div>

          {/* Illustration */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            {isSignIn ? <MascotSignIn /> : <MascotSignUp />}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 60px', overflow: 'auto', background: '#FFF7EC' }}>
          {/* Paper card border */}
          <div style={{ position: 'absolute', inset: 24, borderRadius: 32, background: '#FFF7EC', boxShadow: '0 20px 60px -30px rgba(31,26,46,0.25), inset 0 0 0 1.5px #EADFCB', pointerEvents: 'none' }} />

          {/* Back to role select */}
          <button
            type="button"
            onClick={() => router.push('/role-select')}
            style={{
              position: 'absolute', top: 48, left: 60, zIndex: 3,
              width: 40, height: 40, borderRadius: 10,
              background: '#FFFFFF', border: '1.5px solid #EADFCB',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(31,26,46,0.08)',
              transition: 'border-color 140ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1F1A2E' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EADFCB' }}
            aria-label="Буцах"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Role badge */}
          <div style={{
            position: 'absolute', top: 48, right: 60, zIndex: 3,
            background: '#1F1A2E', color: '#FFF7EC',
            padding: '8px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {roleFromUrl === 'PARENT' ? 'Эцэг эх' : 'Бүтээгч'}
          </div>

          {/* Form */}
          <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div key={mode} style={{ animation: 'slideIn 380ms cubic-bezier(.2,.8,.2,1)', width: '100%', display: 'flex', justifyContent: 'center' }}>
              {isSignIn
                ? <SignInPanel role={roleFromUrl} onSwitch={() => setMode('signup')} />
                : <SignUpPanel role={roleFromUrl} onSwitch={() => setMode('signin')} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}