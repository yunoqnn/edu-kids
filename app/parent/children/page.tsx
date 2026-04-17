'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const AVATARS = ['🐱', '🐶', '🐻', '🐼', '🦊', '🐸', '🐯', '🦁', '🐨', '🐰']

interface Student {
  id: string
  name: string
  age: number | null
  avatar: string
  points: number
  level: number
}

export default function ChildrenPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [parentName, setParentName] = useState('')
  const [userId, setUserId] = useState('')

  // Add child form state
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [avatar, setAvatar] = useState('🐱')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/'); return }
      if (data.user.user_metadata?.role !== 'PARENT') { router.push('/'); return }
      setParentName(data.user.user_metadata?.name || '')
      setUserId(data.user.id)
      await fetchStudents(data.user.id)
      setLoading(false)
    })
  }, [router])

  const fetchStudents = async (uid: string) => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('parent_id', uid)
      .order('created_at')
    setStudents(data || [])
  }

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Нэр оруулна уу'); return }
    setAdding(true)
    const { error: err } = await supabase.from('students').insert({
      parent_id: userId,
      name: name.trim(),
      age: age ? parseInt(age) : null,
      avatar,
    })
    if (err) { setError('Хадгалж чадсангүй: ' + err.message); setAdding(false); return }
    setName(''); setAge(''); setAvatar('🐱')
    await fetchStudents(userId)
    setAdding(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
      Уншиж байна...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-body)' }}>
      {/* Top bar */}
      <nav style={{ background: 'white', borderBottom: '1.5px solid var(--border)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎓</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--primary)' }}>StudyComp</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>👨‍👩‍👧 {parentName}</span>
          {/* Dashboard link - subtle, bottom corner style */}
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            Гарах
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* Children list */}
        {students.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
              Хүүхдүүд
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {students.map((s) => (
                <div
                  key={s.id}
                  onClick={() => router.push(`/student/${s.id}`)}
                  className="card"
                  style={{ padding: '28px 20px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(158,120,194,0.18)' }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}
                >
                  <div style={{ fontSize: 56, marginBottom: 10 }}>{s.avatar}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 4 }}>{s.name}</div>
                  {s.age && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{s.age} настай</div>}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>{s.points}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>оноо</div>
                    </div>
                    <div style={{ width: 1, background: 'var(--border)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#d97706' }}>{s.level}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>түвшин</div>
                    </div>
                  </div>
                  <div style={{ background: 'var(--primary)', color: 'white', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: 14 }}>
                    🎮 Тоглоом эхлэх
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add child form */}
        <div className="card" style={{ padding: '32px', maxWidth: 480 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            {students.length === 0 ? '👶 Хүүхдийн профайл нэмэх' : '+ Хүүхэд нэмэх'}
          </h2>
          {students.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Хүүхдийнхээ профайлыг үүсгэж суралцах замыг эхлүүлэнэ үү.</p>
          )}
          {students.length > 0 && <div style={{ marginBottom: 20 }} />}

          <form onSubmit={handleAddChild} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar picker */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Дүр сонгох</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    style={{ width: 44, height: 44, fontSize: 24, borderRadius: 10, border: avatar === a ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: avatar === a ? 'var(--primary-pale)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Нэр</label>
              <input className="input" placeholder="Хүүхдийн нэр" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Нас (заавал биш)</label>
              <input className="input" type="number" placeholder="Жишээ: 8" min={4} max={12} value={age} onChange={e => setAge(e.target.value)} />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>{error}</div>
            )}

            <button type="submit" className="btn-primary" disabled={adding} style={{ justifyContent: 'center', padding: '13px' }}>
              {adding ? 'Хадгалж байна...' : '+ Нэмэх'}
            </button>
          </form>
        </div>

        {/* Parent dashboard link - subtle, bottom */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            onClick={() => router.push('/parent/stats')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textDecoration: 'underline', textDecorationColor: 'transparent' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            📊 Хяналтын самбар харах
          </button>
        </div>
      </div>
    </div>
  )
}
