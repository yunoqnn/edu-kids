'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ---------- Types ---------- */
interface Course {
  id: string; title: string; description: string | null
  status: string; grade_level: number | null; created_at: string
  lesson_count: number; student_count: number
}

/* ---------- Constants ---------- */
const T  = '#7AD1D1'
const TB = '#5BBABA'
const BG = '#FAF7F2'
const BR = '#E5DDD3'
const TX = '#3D3D3D'
const S2 = '#6B7280'
const S3 = '#9CA3AF'

const PALETTE = ['#7AD1D1', '#E8A5A5', '#9B8BBC', '#C4A77D', '#8BC4A5', '#B5C4E8']
function courseColor(id: string) { return PALETTE[id.charCodeAt(0) % PALETTE.length] }

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  DRAFT:          { label: 'Түр хувилбар',    bg: '#F3F0EB', color: S2,       dot: S3        },
  PENDING_REVIEW: { label: 'Хянагдаж байна', bg: '#FFF8E1', color: '#B8860B', dot: '#F59E0B' },
  PUBLISHED:      { label: 'Нийтлэгдсэн',    bg: '#E5F7F7', color: '#0D9488', dot: '#14B8A6' },
  REJECTED:       { label: 'Татгалзсан',      bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
}

/* ---------- Sidebar ---------- */
function Sidebar({ active, onTab, name, onLogout }: {
  active: string; onTab: (t: string) => void
  name: string; onLogout: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const W = collapsed ? 72 : 260

  const nav = [
    { id: 'courses', label: 'Сургалтын хөтөлбөр', icon: (a: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : S2} strokeWidth="2" strokeLinecap="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      </svg>
    )},
  ]

  return (
    <aside style={{ width: W, minHeight: '100vh', background: '#fff', borderRight: `1.5px solid ${BR}`, display: 'flex', flexDirection: 'column', transition: 'width 0.25s cubic-bezier(.4,0,.2,1)', flexShrink: 0, overflow: 'hidden' }}>

      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '20px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: `1.5px solid ${BR}`, minHeight: 68 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: T, fontFamily: 'Nunito, sans-serif' }}>EduKids</span>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>
            </svg>
          </div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)}
            style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = T}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = BR}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
      </div>

      {/* Profile */}
      <div style={{ padding: collapsed ? '16px 0' : '16px 20px', borderBottom: `1.5px solid ${BR}`, display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: '#E5F7F7', border: `2px solid ${BR}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
          </svg>
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: TX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: TB, marginTop: 2 }}>Контент бүтээгч</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {nav.map(item => {
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => onTab(item.id)} title={collapsed ? item.label : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '12px 0' : '11px 14px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: isActive ? 700 : 500, background: isActive ? T : 'transparent', color: isActive ? '#fff' : S2, transition: 'all 0.15s', width: '100%' }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = '#F5F0EA'; (e.currentTarget as HTMLButtonElement).style.color = TX } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = S2 } }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon(isActive)}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Expand when collapsed */}
      {collapsed && (
        <div style={{ padding: '0 8px 8px', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setCollapsed(false)}
            style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = T}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = BR}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: collapsed ? '12px 8px 20px' : '12px 12px 20px', borderTop: `1.5px solid ${BR}` }}>
        <button onClick={onLogout} title={collapsed ? 'Гарах' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0' : '10px 14px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, background: 'transparent', color: '#EF4444', width: '100%', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!collapsed && <span>Гарах</span>}
        </button>
      </div>
    </aside>
  )
}

/* ---------- Course Row ---------- */
function CourseRow({ course, onClick }: { course: Course; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  const status = STATUS_CONFIG[course.status] ?? STATUS_CONFIG.DRAFT
  const color  = courseColor(course.id)

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: 'white', borderRadius: 16, border: `1.5px solid ${hover ? T : BR}`, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s', transform: hover ? 'translateY(-1px)' : 'translateY(0)', boxShadow: hover ? '0 4px 16px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: TX }}>{course.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
          {course.grade_level && <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{course.grade_level}-р анги</span>}
          <span style={{ fontSize: 12, color: '#D1D5DB' }}>·</span>
          <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{course.lesson_count} хичээл</span>
          {course.student_count > 0 && <>
            <span style={{ fontSize: 12, color: '#D1D5DB' }}>·</span>
            <span style={{ fontSize: 12, color: T, fontWeight: 700 }}>{course.student_count} сурагч</span>
          </>}
        </div>
      </div>
      <div style={{ padding: '5px 12px', borderRadius: 8, background: status.bg, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.dot }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: status.color }}>{status.label}</span>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </div>
  )
}

/* ---------- Page ---------- */
export default function CreatorDashboard() {
  const router = useRouter()
  const [name, setName]       = useState('')
  const [userId, setUserId]   = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [filter, setFilter]   = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/'); return }
      if (data.user.user_metadata?.role !== 'CONTENT_CREATOR') { router.push('/'); return }
      await supabase.from('profiles').upsert({
        id: data.user.id, email: data.user.email ?? '',
        name: data.user.user_metadata?.name ?? 'User', role: 'CONTENT_CREATOR',
      }, { onConflict: 'id' })
      setName(data.user.user_metadata?.name || 'Бүтээгч')
      setUserId(data.user.id)
      await fetchCourses(data.user.id)
      setLoading(false)
    })
  }, [router])

  const fetchCourses = async (uid: string) => {
    const { data } = await supabase
      .from('courses')
      .select('id, title, description, status, grade_level, created_at')
      .eq('creator_id', uid)
      .order('created_at', { ascending: false })

    const rows = data ?? []
    /* Count lessons per course */
    const coursesWithCounts: Course[] = await Promise.all(rows.map(async (c) => {
      const { count: lc } = await supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('course_id', c.id)
      const { count: ec } = await supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('course_id', c.id)
      return { ...c, lesson_count: lc ?? 0, student_count: ec ?? 0 }
    }))
    setCourses(coursesWithCounts)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: S3, fontFamily: 'Nunito, sans-serif' }}>
      Уншиж байна...
    </div>
  )

  const stats = {
    total:     courses.length,
    published: courses.filter(c => c.status === 'PUBLISHED').length,
    pending:   courses.filter(c => c.status === 'PENDING_REVIEW').length,
    draft:     courses.filter(c => c.status === 'DRAFT').length,
  }

  const statCards = [
    { label: 'Нийт',           val: stats.total,     bg: '#E5F7F7', color: '#0D9488' },
    { label: 'Нийтлэгдсэн',   val: stats.published,  bg: '#E5F7F7', color: '#14B8A6' },
    { label: 'Хянагдаж буй',  val: stats.pending,    bg: '#FFF8E1', color: '#B8860B' },
    { label: 'Түр хувилбар',   val: stats.draft,      bg: '#F3F0EB', color: S2        },
  ]

  const filterBtns = [
    { id: 'all',            label: 'Бүгд' },
    { id: 'PUBLISHED',      label: 'Нийтлэгдсэн' },
    { id: 'PENDING_REVIEW', label: 'Хянагдаж буй' },
    { id: 'DRAFT',          label: 'Түр хувилбар' },
  ]

  const filtered = filter === 'all' ? courses : courses.filter(c => c.status === filter)

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap'); * { box-sizing:border-box; } body { font-family:'Nunito',sans-serif; }`}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: 'Nunito, sans-serif' }}>

        <Sidebar active={activeTab} onTab={setActiveTab} name={name} onLogout={handleLogout} />

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 36px', overflow: 'auto', minWidth: 0 }}>

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: 0 }}>Сургалтын хөтөлбөрүүд</h1>
              <p style={{ fontSize: 14, color: S3, fontWeight: 500, marginTop: 4, marginBottom: 0 }}>Хөтөлбөрүүдээ удирдах, шинэ хөтөлбөр нэмэх</p>
            </div>
            <button onClick={() => router.push('/creator/courses/new')}
              style={{ background: T, color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s', boxShadow: `0 2px 8px ${T}4D` }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = TB; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = T; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Шинэ хөтөлбөр
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {filterBtns.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                style={{ padding: '7px 16px', borderRadius: 10, border: '1.5px solid', borderColor: filter === f.id ? T : BR, background: filter === f.id ? '#E5F7F7' : 'white', color: filter === f.id ? '#0D9488' : S2, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Course list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(c => (
              <CourseRow key={c.id} course={c} onClick={() => router.push(`/creator/courses/${c.id}`)} />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: S3 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Хөтөлбөр олдсонгүй</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}