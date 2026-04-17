'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Role = 'PARENT' | 'CREATOR'
type Tab = 'signin' | 'signup'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleFromUrl = (searchParams.get('role') as Role) || 'PARENT'

  const [role, setRole] = useState<Role>(roleFromUrl)
  const [tab, setTab] = useState<Tab>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setRole(roleFromUrl), [roleFromUrl])

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
        // Trigger автоматаар profiles-д insert хийнэ
        // data.user байвал шууд redirect, үгүй бол email confirmation хүлээж байна
        if (data.user) {
          redirectByRole(role)
        } else {
          setError('Имэйл рүүгээ орж баталгаажуулалтыг хийнэ үү. Эсвэл Supabase → Authentication → Settings → Email Confirmation-г унтраана уу.')
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-body)', marginBottom: 24, padding: 0 }}>
          ← Буцах
        </button>

        <div className="card" style={{ padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎓</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>StudyComp</div>
          </div>

          {/* Role switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--surface-2)', borderRadius: 10, padding: 4, border: '1.5px solid var(--border)' }}>
            {(['PARENT', 'CREATOR'] as Role[]).map((r) => (
              <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', background: role === r ? 'var(--primary)' : 'transparent', color: role === r ? 'white' : 'var(--text-muted)' }}>
                {r === 'PARENT' ? '👨‍👩‍👧 Эцэг эх' : '✏️ Бүтээгч'}
              </button>
            ))}
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', marginBottom: 24 }}>
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError('') }} style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1.5, transition: 'all 0.2s' }}>
                {t === 'signin' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tab === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Овог нэр</label>
                <input className="input" type="text" placeholder="Овог нэр" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>И-мэйл хаяг</label>
              <input className="input" type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Нууц үг</label>
              <input className="input" type="password" placeholder="Хамгийн багадаа 8 тэмдэгт" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {tab === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Нууц үг давтах</label>
                <input className="input" type="password" placeholder="Нууц үг давтах" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
            )}

            {error && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '14px' }}>
              {loading ? 'Уншиж байна...' : tab === 'signin' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
            </button>
          </form>
        </div>
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