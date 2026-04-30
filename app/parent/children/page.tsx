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
  { id: 'bear',    name: 'Bear',  src: '/avatars/bear head.png' },
  { id: 'cat',     name: 'Заан',     src: '/avatars/elephant head.png' },
  { id: 'dog',     name: 'Нохой',    src: '/avatars/hippo head.png' },
  { id: 'rabbit',  name: 'Туулай',   src: '/avatars/lion head.png' },
  { id: 'penguin', name: 'Пингвин',  src: '/avatars/panda head.png' },
  { id: 'fox',     name: 'Үнэг',     src: '/avatars/tiger head.png' },
]

const GRADES = [1, 2, 3, 4, 5]

/* ---------- Avatar Selector ---------- */
function AvatarSelector({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1F1A2E', marginBottom: 12 }}>
        Дүр сонгох
      </label>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {AVATARS.map((av) => {
          const isSelected = selected === av.id
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onSelect(av.id)}
              aria-label={av.name}
              aria-pressed={isSelected}
              style={{
                position: 'relative',
                width: 80, height: 80, flexShrink: 0,
                borderRadius: 18,
                border: `3px solid ${isSelected ? '#7E5BD9' : '#EADFCB'}`,
                padding: 0, overflow: 'hidden',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isSelected ? '0 8px 20px rgba(126,91,217,0.30)' : 'none',
                transition: 'all 200ms ease',
                background: 'none',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={av.src}
                alt={av.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Check overlay */}
              {isSelected && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(126,91,217,0.30)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#7E5BD9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
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

/* ---------- Grade Selector ---------- */
function GradeSelector({
  selected,
  onSelect,
}: {
  selected: number
  onSelect: (g: number) => void
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1F1A2E', marginBottom: 10 }}>
        Анги
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {GRADES.map((g) => {
          const isSelected = selected === g
          return (
            <button
              key={g}
              type="button"
              onClick={() => onSelect(g)}
              aria-pressed={isSelected}
              aria-label={`${g}-р анги`}
              style={{
                width: 52, height: 52,
                borderRadius: 14,
                border: `2px solid ${isSelected ? '#7E5BD9' : '#EADFCB'}`,
                background: isSelected ? '#7E5BD9' : 'white',
                color: isSelected ? 'white' : '#1F1A2E',
                fontSize: 18, fontWeight: 700,
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                boxShadow: isSelected ? '0 6px 16px rgba(126,91,217,0.28)' : 'none',
                transition: 'all 200ms ease',
                fontFamily: 'inherit',
              }}
            >
              {g}
            </button>
          )
        })}
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: '#A199B4' }}>
        Сонгосон: <span style={{ fontWeight: 600, color: '#7E5BD9' }}>{selected}-р анги</span>
      </p>
    </div>
  )
}

/* ---------- Student Card ---------- */
function StudentCard({ student, onClick }: { student: Student; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  const avatarSrc = AVATARS.find((a) => a.id === student.avatar)?.src ?? '/avatars/cat.jpg'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'white',
        borderRadius: 24,
        border: '1.5px solid #EADFCB',
        padding: '28px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover ? '0 12px 32px rgba(126,91,217,0.16)' : '0 2px 8px rgba(31,26,46,0.06)',
        transition: 'all 200ms ease',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 80, height: 80, borderRadius: 20, overflow: 'hidden',
        margin: '0 auto 14px',
        border: '3px solid #EADFCB',
        boxShadow: '0 4px 12px rgba(31,26,46,0.10)',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarSrc} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ fontWeight: 700, fontSize: 17, color: '#1F1A2E', marginBottom: 4, fontFamily: 'DM Serif Display, serif' }}>
        {student.name}
      </div>
      <div style={{ fontSize: 12, color: '#A199B4', marginBottom: 16 }}>
        {student.grade_level}-р анги
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 18 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#7E5BD9' }}>{student.points_balance}</div>
          <div style={{ fontSize: 11, color: '#A199B4' }}>оноо</div>
        </div>
        <div style={{ width: 1, background: '#EADFCB' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#FFC93C' }}>{student.level}</div>
          <div style={{ fontSize: 11, color: '#A199B4' }}>түвшин</div>
        </div>
      </div>

      <div style={{
        background: '#7E5BD9', color: 'white',
        borderRadius: 12, padding: '10px 0',
        fontWeight: 700, fontSize: 14,
      }}>
        Тоглоом эхлэх →
      </div>
    </div>
  )
}

/* ---------- Main Page ---------- */
export default function ChildrenPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [parentName, setParentName] = useState('')
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)

  /* Form state */
  const [name, setName] = useState('')
  const [gradeLevel, setGradeLevel] = useState<number>(1)
  const [avatar, setAvatar] = useState('cat')
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
    if (!avatar) { setError('Дүр сонгоно уу'); return }
    setAdding(true)
    const { error: err } = await supabase.from('students').insert({
      parent_id: userId,
      name: name.trim(),
      grade_level: gradeLevel,
      avatar,
    })
    if (err) { setError('Хадгалж чадсангүй: ' + err.message); setAdding(false); return }
    setName('')
    setGradeLevel(1)
    setAvatar('cat')
    setShowForm(false)
    await fetchStudents(userId)
    setAdding(false)
  }

  const resetForm = () => {
    setName('')
    setGradeLevel(1)
    setAvatar('cat')
    setError('')
    setShowForm(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lexend, sans-serif', color: '#A199B4' }}>
      Уншиж байна...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Lexend:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Lexend', sans-serif; }
        .child-input {
          width: 100%;
          height: 52px;
          padding: 0 16px;
          border-radius: 14px;
          border: 1.5px solid #EADFCB;
          font-family: 'Lexend', sans-serif;
          font-size: 15px;
          color: #1F1A2E;
          background: white;
          outline: none;
          transition: border-color 160ms ease;
        }
        .child-input:focus { border-color: #7E5BD9; }
        .child-input::placeholder { color: #A199B4; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#FFF7EC', fontFamily: 'Lexend, sans-serif' }}>

        {/* Nav */}
        <nav style={{
          background: 'white', borderBottom: '1.5px solid #EADFCB',
          padding: '0 40px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden>
              <circle cx="24" cy="24" r="22" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeDasharray="4 3" />
              <path d="M14 28 L24 16 L34 28 L24 22 Z" fill="#1F1A2E" />
              <circle cx="24" cy="32" r="2.5" fill="#1F1A2E" />
            </svg>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1F1A2E', letterSpacing: -0.3 }}>edukids</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#A199B4' }}>{parentName}</span>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              style={{
                border: '1.5px solid #EADFCB', borderRadius: 10,
                padding: '7px 16px', fontSize: 13, color: '#5A5470',
                background: 'white', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Гарах
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>

          {/* Page header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-block', marginBottom: 12,
              background: 'rgba(126,91,217,0.10)', color: '#7E5BD9',
              borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 600,
            }}>
              Эцэг эхийн хэсэг
            </span>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, color: '#1F1A2E', margin: 0, lineHeight: 1.1 }}>
              {students.length === 0 ? 'Хүүхдийн профайл үүсгэх' : 'Хүүхдүүд'}
            </h1>
          </div>

          {/* Existing students grid */}
          {students.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 20, marginBottom: 40,
            }}>
              {students.map((s) => (
                <StudentCard
                  key={s.id}
                  student={s}
                  onClick={() => router.push(`/student/${s.id}`)}
                />
              ))}

              {/* Add another card */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    background: 'white', borderRadius: 24,
                    border: '2px dashed #EADFCB',
                    padding: '28px 20px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 12,
                    minHeight: 240, transition: 'border-color 200ms ease',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7E5BD9' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EADFCB' }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'rgba(126,91,217,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7E5BD9" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#7E5BD9' }}>Хүүхэд нэмэх</span>
                </button>
              )}
            </div>
          )}

          {/* Create profile form card */}
          {(showForm || students.length === 0) && (
            <div style={{
              background: 'white',
              borderRadius: 28,
              border: '1.5px solid #EADFCB',
              padding: '40px',
              boxShadow: '0 20px 60px rgba(31,26,46,0.08)',
              maxWidth: 520,
              margin: '0 auto',
            }}>
              {/* Form header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                  <span style={{
                    display: 'inline-block', marginBottom: 8,
                    background: 'rgba(126,91,217,0.10)', color: '#7E5BD9',
                    borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600,
                  }}>
                    Шинэ профайл
                  </span>
                  <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: '#1F1A2E', margin: 0 }}>
                    Хүүхдийн профайл үүсгэх
                  </h2>
                </div>
                {students.length > 0 && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: '1.5px solid #EADFCB', background: 'white',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <form onSubmit={handleAddChild}>
                {/* Avatar selector */}
                <AvatarSelector selected={avatar} onSelect={setAvatar} />

                {/* Divider */}
                <div style={{ height: 1, background: '#EADFCB', margin: '28px 0' }} />

                {/* Name input */}
                <div style={{ marginBottom: 24 }}>
                  <label htmlFor="childName" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1F1A2E', marginBottom: 8 }}>
                    Хүүхдийн нэр
                  </label>
                  <input
                    id="childName"
                    className="child-input"
                    type="text"
                    placeholder="Нэрийг оруулна уу"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Grade selector */}
                <div style={{ marginBottom: 28 }}>
                  <GradeSelector selected={gradeLevel} onSelect={setGradeLevel} />
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background: '#fef2f2', border: '1.5px solid #fca5a5',
                    borderRadius: 12, padding: '10px 14px',
                    color: '#dc2626', fontSize: 13, marginBottom: 20,
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <SubmitButton disabled={adding || !name.trim() || !avatar}>
                  {adding ? 'Хадгалж байна...' : 'Профайл үүсгэх'}
                </SubmitButton>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ---------- Submit button with hover ---------- */
function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="submit"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', padding: '16px 24px',
        background: '#7E5BD9', color: 'white',
        border: 'none', borderRadius: 14,
        fontSize: 16, fontWeight: 700, fontFamily: 'Lexend, sans-serif',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: hover && !disabled ? '0 8px 0 0 rgba(126,91,217,0.22)' : '0 4px 0 0 rgba(126,91,217,0.22)',
        transform: hover && !disabled ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 140ms ease',
      }}
    >
      {children}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
      </svg>
    </button>
  )
}