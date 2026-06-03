'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ---------- Types ---------- */
interface Student {
  id: string
  name: string
  grade_level: number
  avatar: string
  points_balance: number
  level: number
}

/* ---------- Constants ---------- */
const AVATARS = [
  { id: 'bear',    src: '/avatars/bear head.png' },
  { id: 'cat',     src: '/avatars/elephant head.png' },
  { id: 'dog',     src: '/avatars/hippo head.png' },
  { id: 'rabbit',  src: '/avatars/lion head.png' },
  { id: 'penguin', src: '/avatars/panda head.png' },
  { id: 'fox',     src: '/avatars/tiger head.png' },
]
const AVATAR_NAMES: Record<string, string> = {
  bear: 'Баавгай', cat: 'Заан', dog: 'Нохой',
  rabbit: 'Туулай', penguin: 'Пингвин', fox: 'Үнэг',
}
const GRADES = [1, 2, 3, 4, 5]

/* brand tokens */
const T  = '#7AD1D1'
const BG = '#FAF7F2'
const BR = '#E5DDD3'
const TX = '#3D3D3D'
const S2 = '#6B7280'
const S3 = '#9CA3AF'
const GD = '#C4A77D'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Өглөөний мэнд! ☀️'
  if (h < 17) return 'Өдрийн мэнд! 🌤'
  return 'Оройн мэнд! 🌙'
}

/* ---------- Avatar selector ---------- */
function AvatarSelector({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: TX, marginBottom: 10 }}>
        Дүр сонгох
      </label>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
        {AVATARS.map((av) => {
          const sel = selected === av.id
          return (
            <button key={av.id} type="button" onClick={() => onSelect(av.id)}
              style={{
                width: 64, height: 64, borderRadius: 18, flexShrink: 0,
                border: `3px solid ${sel ? T : BR}`,
                overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'none',
                transform: sel ? 'scale(1.1)' : 'scale(1)',
                boxShadow: sel ? `0 6px 16px ${T}44` : 'none',
                transition: 'all 180ms ease', position: 'relative',
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={av.src} alt={AVATAR_NAMES[av.id]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {sel && (
                <div style={{ position: 'absolute', inset: 0, background: `${T}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Grade selector ---------- */
function GradeSelector({ selected, onSelect }: { selected: number; onSelect: (g: number) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: TX, marginBottom: 10 }}>Анги</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {GRADES.map((g) => {
          const sel = selected === g
          return (
            <button key={g} type="button" onClick={() => onSelect(g)}
              style={{
                width: 48, height: 48, borderRadius: 14,
                border: `2px solid ${sel ? T : BR}`,
                background: sel ? T : 'white', color: sel ? 'white' : TX,
                fontSize: 17, fontWeight: 700, cursor: 'pointer',
                transform: sel ? 'scale(1.1)' : 'scale(1)',
                boxShadow: sel ? `0 4px 12px ${T}44` : 'none',
                transition: 'all 180ms ease', fontFamily: 'inherit',
              }}>
              {g}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Child Card ---------- */
function ChildCard({ student, onClick }: { student: Student; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  const src = AVATARS.find(a => a.id === student.avatar)?.src ?? AVATARS[0].src
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: 'white', borderRadius: 24,
        border: `2.5px solid ${hover ? T : BR}`,
        padding: '28px 16px 24px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        transition: 'all 200ms ease',
        transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hover ? `0 12px 32px ${T}33` : '0 2px 8px rgba(0,0,0,0.04)',
        fontFamily: 'inherit',
      }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, overflow: 'hidden', border: '3px solid #E5F7F7', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 17, color: TX }}>{student.name}</div>
      <div style={{ fontSize: 12, color: S2, marginTop: -6 }}>{student.grade_level}-р анги</div>
      <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: T }}>{student.points_balance}</div>
          <div style={{ fontSize: 10, color: S3, fontWeight: 600 }}>оноо</div>
        </div>
        <div style={{ width: 1, background: BR }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: GD }}>Lv.{student.level}</div>
          <div style={{ fontSize: 10, color: S3, fontWeight: 600 }}>түвшин</div>
        </div>
      </div>
      <div style={{ background: T, color: 'white', borderRadius: 14, padding: '10px 0', fontWeight: 700, fontSize: 14, width: '100%', textAlign: 'center', marginTop: 4 }}>
        Тоглох →
      </div>
    </button>
  )
}

/* ---------- Page ---------- */
export default function ChildrenPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [parentName, setParentName] = useState('')
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [gradeLevel, setGradeLevel] = useState(1)
  const [avatar, setAvatar] = useState('bear')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      await supabase.from('profiles').upsert({
        id: user!.id, email: user!.email ?? '',
        name: user!.user_metadata?.name ?? 'User', role: 'PARENT',
      }, { onConflict: 'id' })
      setParentName(user!.user_metadata?.name || '')
      setUserId(user!.id)
      await fetchStudents(user!.id)
      setLoading(false)
    }
    init()
  }, [router])

  const fetchStudents = async (uid: string) => {
    const { data } = await supabase.from('students').select('*').eq('parent_id', uid).order('created_at')
    setStudents(data || [])
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Нэр оруулна уу'); return }
    setAdding(true)
    const { error: err } = await supabase.from('students').insert({ parent_id: userId, name: name.trim(), grade_level: gradeLevel, avatar })
    if (err) { setError('Хадгалж чадсангүй: ' + err.message); setAdding(false); return }
    setName(''); setGradeLevel(1); setAvatar('bear'); setShowForm(false)
    await fetchStudents(userId)
    setAdding(false)
  }

  const resetForm = () => { setName(''); setGradeLevel(1); setAvatar('bear'); setError(''); setShowForm(false) }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: S3, fontFamily: 'Nunito, sans-serif' }}>
      Уншиж байна...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .ch-input { width:100%; height:50px; padding:0 16px; border-radius:14px; border:1.5px solid ${BR}; font-family:'Nunito',sans-serif; font-size:15px; color:${TX}; background:white; outline:none; transition:border-color 160ms; }
        .ch-input:focus { border-color:${T}; }
        .ch-input::placeholder { color:${S3}; }
        @media (max-width: 640px) {
          .ch-topbar { padding: 12px 16px !important; }
          .ch-content { padding: 16px 16px 80px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Nunito, sans-serif' }}>

        {/* Top bar */}
        <div className="ch-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: T }}>StudyComp</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.push('/parent/dashboard')}
              style={{ background: 'white', border: `1.5px solid ${BR}`, borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 700, color: S2, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="18" cy="9" r="3"/><path d="M21 21v-1.5a3 3 0 0 0-2.2-2.9"/></svg>
              Эцэг эхийн булан
            </button>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              style={{ background: 'white', border: `1.5px solid ${BR}`, borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: S2, cursor: 'pointer', fontFamily: 'inherit' }}>
              Гарах
            </button>
          </div>
        </div>

        <div className="ch-content" style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 48px 80px' }}>

          {/* Greeting */}
          <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T, background: '#E5F7F7', display: 'inline-block', padding: '6px 16px', borderRadius: 20, marginBottom: 14 }}>
              {greeting()}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: TX, lineHeight: 1.3, margin: '0 0 8px' }}>
              Хэн тоглох вэ?
            </h1>
            <p style={{ fontSize: 15, color: S2, margin: 0 }}>Профайлаа сонгоод эхлээрэй</p>
          </div>

          {/* Child cards */}
          {students.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 20, marginBottom: 32,
              maxWidth: 1100, margin: '0 auto 32px',
            }}>
              {students.map(s => (
                <ChildCard key={s.id} student={s} onClick={() => router.push(`/student/${s.id}`)} />
              ))}
              {!showForm && (
                <button onClick={() => setShowForm(true)}
                  style={{ background: 'white', borderRadius: 24, border: `2.5px dashed ${BR}`, padding: '28px 16px', cursor: 'pointer', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 200ms', fontFamily: 'inherit' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = T; (e.currentTarget as HTMLButtonElement).style.background = '#E5F7F7' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BR; (e.currentTarget as HTMLButtonElement).style.background = 'white' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 18, background: '#E5F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T }}>Хүүхэд нэмэх</span>
                </button>
              )}
            </div>
          )}

          {/* Empty state CTA */}
          {students.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', paddingTop: 20 }}>
              <button onClick={() => setShowForm(true)}
                style={{ background: T, color: 'white', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Хүүхэд нэмэх →
              </button>
            </div>
          )}

          {/* Modal popup */}
          {showForm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
              <div style={{ background: 'white', borderRadius: 28, padding: '40px', boxShadow: '0 24px 64px rgba(0,0,0,0.14)', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: TX, margin: 0 }}>Хүүхдийн профайл</h2>
                  <button type="button" onClick={resetForm}
                    style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TX} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <AvatarSelector selected={avatar} onSelect={setAvatar} />
                  <div style={{ height: 1, background: BR }} />
                  <div>
                    <label htmlFor="cname" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: TX, marginBottom: 8 }}>Хүүхдийн нэр</label>
                    <input id="cname" className="ch-input" type="text" placeholder="Нэрийг оруулна уу" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <GradeSelector selected={gradeLevel} onSelect={setGradeLevel} />
                  {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>{error}</div>}
                  <button type="submit" disabled={adding || !name.trim()}
                    style={{ width: '100%', padding: '15px', background: T, color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer', opacity: adding ? 0.6 : 1, fontFamily: 'inherit', transition: 'all 150ms' }}>
                    {adding ? 'Хадгалж байна...' : 'Профайл үүсгэх →'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}