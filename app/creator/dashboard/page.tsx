'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ── Types ─────────────────────────────────────────────────────── */
interface Exercise {
  id: string
  title: string
  game_type: string
  points_reward: number
  order_index: number
}
interface Lesson {
  id: string
  title: string
  type?: string
  order_index: number
  is_published: boolean
  exercises: Exercise[]
}
interface Course {
  id: string
  title: string
  description: string | null
  status: string
  grade_level: number | null
  created_at: string
  lessons: Lesson[]
}
interface EnrolledStudent {
  id: string
  studentId: string
  studentName: string
  avatar: string
  gradeLevel: number
  pointsTotal: number
  courseId: string
  courseTitle: string
}

/* ── Constants ──────────────────────────────────────────────────── */
const T  = '#7AD1D1'
const TB = '#5BBABA'
const BG = '#FAF7F2'
const BR = '#E5DDD3'
const TX = '#3D3D3D'
const S2 = '#6B7280'
const S3 = '#9CA3AF'

const PALETTE = ['#7AD1D1', '#E8A5A5', '#9B8BBC', '#C4A77D', '#8BC4A5', '#B5C4E8']
function courseColor(id: string) { return PALETTE[id.charCodeAt(0) % PALETTE.length] }

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  DRAFT:          { label: 'Ноорог',          bg: '#F3F0EB', color: S2,       dot: S3        },
  PENDING_REVIEW: { label: 'Хянагдаж байна', bg: '#FFF8E1', color: '#B8860B', dot: '#F59E0B' },
  PUBLISHED:      { label: 'Нийтлэгдсэн',    bg: '#E5F7F7', color: '#0D9488', dot: '#14B8A6' },
  REJECTED:       { label: 'Татгалзсан',      bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
}

const GAME_LABELS: Record<string, string> = {
  SIMPLE_QUIZ: 'Асуулт', DRAG_DROP: 'Чирж тавих', MATCHING: 'Хос тааруулах',
  PATTERN: 'Дараалал', ODD_ONE_OUT: 'Өөр нэгийг ол', CATEGORY_SORT: 'Ангилал',
  SEQUENCE_REPEAT: 'Дараалал давтах', READ_REMEMBER: 'Уншиж санаарай', MATCHSTICK: 'Хутга',
}

async function deleteExerciseById(exerciseId: string) {
  const response = await fetch(`/api/creator/exercises/${encodeURIComponent(exerciseId)}`, {
    method: 'DELETE',
  })
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.error ?? 'Дасгал устгахад алдаа гарлаа')
  }
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; -webkit-font-smoothing: antialiased; background: #FAF7F2; overflow: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E5DDD3; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #C4A77D; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes modalIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .panel-enter { animation: fadeIn 0.25s ease both; }
  .lesson-hdr:hover { background: #FAFAF8 !important; }
  @media (max-width: 768px) {
    .creator-topbar { padding: 10px 16px !important; }
    .creator-topbar-search { display: none !important; }
    .creator-content { padding: 16px 16px 48px !important; }
    .stats-4col { grid-template-columns: repeat(2, 1fr) !important; }
    .stats-3col { grid-template-columns: repeat(2, 1fr) !important; }
    .course-header-actions { flex-wrap: wrap !important; }
    .course-hdr-row { flex-direction: column !important; align-items: flex-start !important; }
  }
`

/* ── Shared UI Atoms ────────────────────────────────────────────── */
function Sep() {
  return <span style={{ fontSize: 12, color: '#D1D5DB' }}>·</span>
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: S3 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{children as string}</div>
    </div>
  )
}

function CreateBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: T, color: 'white', border: 'none', borderRadius: 12,
      padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
      boxShadow: `0 2px 8px ${T}4D`, fontFamily: 'inherit',
    }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.background = TB; el.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.background = T; el.style.transform = 'translateY(0)' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      {children}
    </button>
  )
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 16px', borderRadius: 10, border: '1.5px solid',
      borderColor: active ? T : BR,
      background: active ? '#E5F7F7' : 'white',
      color: active ? '#0D9488' : S2,
      fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
    }}>{children}</button>
  )
}

function ModalInput({ label, required, placeholder, value, onChange, autoFocus }: {
  label: string; required?: boolean; placeholder?: string; value: string
  onChange: (v: string) => void; autoFocus?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: TX, marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#E8A5A5' }}>*</span>}
      </label>
      <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${BR}`,
          fontSize: 14, fontWeight: 500, outline: 'none', color: TX, background: 'white',
          transition: 'border-color 0.15s', fontFamily: 'inherit',
        }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = T}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = BR}
      />
    </div>
  )
}

function ModalTextarea({ label, placeholder, value, onChange }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: TX, marginBottom: 6 }}>{label}</label>
      <textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${BR}`,
          fontSize: 14, fontWeight: 500, outline: 'none', color: TX, background: 'white',
          transition: 'border-color 0.15s', resize: 'vertical', minHeight: 80, fontFamily: 'inherit',
        }}
        onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = T}
        onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = BR}
      />
    </div>
  )
}

function ModalSelect({ label, required, value, onChange, options }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: TX, marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#E8A5A5' }}>*</span>}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${BR}`,
        fontSize: 14, fontWeight: 500, outline: 'none', color: TX, background: 'white',
        cursor: 'pointer', fontFamily: 'inherit',
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

/* ── Sidebar ────────────────────────────────────────────────────── */
function Sidebar({ active, onTab, name, onLogout }: {
  active: string; onTab: (t: string) => void; name: string; onLogout: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const W = collapsed ? 72 : 260

  const navItems = [
    {
      id: 'courses', label: 'Сургалтын хөтөлбөрүүд',
      icon: (a: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : S2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
      ),
    },
    {
      id: 'lessons', label: 'Хичээлүүд',
      icon: (a: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : S2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
        </svg>
      ),
    },
    {
      id: 'exercises', label: 'Дасгал даалгаврууд',
      icon: (a: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : S2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>
        </svg>
      ),
    },
    {
      id: 'classes', label: 'Анги',
      icon: (a: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : S2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
  ]

  return (
    <aside style={{
      width: W, minHeight: '100vh', background: '#fff',
      borderRight: `1.5px solid ${BR}`, display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(.4,0,.2,1)', flexShrink: 0,
      overflow: 'hidden', position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: `1.5px solid ${BR}`, minHeight: 68,
      }}>
        {collapsed ? (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>
            </svg>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 17, color: T }}>StudyComp</span>
            </div>
            <button onClick={() => setCollapsed(true)} style={{
              width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${BR}`,
              background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = T}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = BR}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2" strokeLinecap="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Profile */}
      <div style={{
        padding: collapsed ? '16px 0' : '16px 20px',
        borderBottom: `1.5px solid ${BR}`,
        display: 'flex', alignItems: 'center', gap: 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14, background: '#E5F7F7',
          border: `2px solid ${BR}`, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
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
        {navItems.map(item => {
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => onTab(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '12px 0' : '11px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                background: isActive ? T : 'transparent',
                color: isActive ? '#fff' : S2,
                transition: 'all 0.15s', width: '100%',
              }}
              onMouseEnter={e => { if (!isActive) { const el = e.currentTarget; el.style.background = '#F5F0EA'; el.style.color = TX } }}
              onMouseLeave={e => { if (!isActive) { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = S2 } }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon(isActive)}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Expand button (collapsed state) */}
      {collapsed && (
        <div style={{ padding: '0 8px 8px', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setCollapsed(false)} style={{
            width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${BR}`,
            background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = T}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = BR}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2" strokeLinecap="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: collapsed ? '12px 8px 20px' : '12px 12px 20px', borderTop: `1.5px solid ${BR}` }}>
        <button onClick={onLogout} title={collapsed ? 'Гарах' : undefined} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '10px 0' : '10px 14px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 600,
          background: 'transparent', color: '#EF4444', width: '100%', transition: 'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!collapsed && <span>Гарах</span>}
        </button>
      </div>
    </aside>
  )
}

/* ── TopBar ─────────────────────────────────────────────────────── */
function TopBar() {
  const dateStr = new Date().toLocaleDateString('mn-MN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  return (
    <header className="creator-topbar" style={{
      position: 'sticky', top: 0, zIndex: 5,
      background: 'rgba(250,247,242,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1.5px solid ${BR}`,
      padding: '14px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: 13, color: S3, fontWeight: 600 }}>{dateStr}</span>
      <div className="creator-topbar-search" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'white', borderRadius: 10, padding: '8px 14px',
          border: `1.5px solid ${BR}`, minWidth: 200,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input type="text" placeholder="Хайх..." style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: TX, width: '100%',
          }} />
        </div>
      </div>
    </header>
  )
}

/* ── CoursesPanel ───────────────────────────────────────────────── */
function CoursesPanel({ courses, onSelectCourse, onCreateNew, onRefresh }: {
  courses: Course[]
  onSelectCourse: (c: Course) => void
  onCreateNew: () => void
  onRefresh: () => void
}) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? courses : courses.filter(c => c.status === filter)
  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'PUBLISHED').length,
    pending: courses.filter(c => c.status === 'PENDING_REVIEW').length,
    draft: courses.filter(c => c.status === 'DRAFT').length,
  }
  const statCards = [
    { label: 'Нийт',          val: stats.total,     bg: '#E5F7F7', color: '#0D9488' },
    { label: 'Нийтлэгдсэн',  val: stats.published,  bg: '#E5F7F7', color: '#14B8A6' },
    { label: 'Хянагдаж буй', val: stats.pending,    bg: '#FFF8E1', color: '#B8860B' },
    { label: 'Ноорог',        val: stats.draft,      bg: '#F3F0EB', color: S2        },
  ]
  const filterBtns = [
    { id: 'all',            label: 'Бүгд'           },
    { id: 'PUBLISHED',      label: 'Нийтлэгдсэн'   },
    { id: 'PENDING_REVIEW', label: 'Хянагдаж буй'  },
    { id: 'DRAFT',          label: 'Ноорог'         },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: 0 }}>Сургалтын хөтөлбөрүүд</h1>
          <p style={{ fontSize: 14, color: S3, fontWeight: 500, marginTop: 4 }}>Хөтөлбөрүүдээ удирдах, шинэ хөтөлбөр нэмэх</p>
        </div>
        <CreateBtn onClick={onCreateNew}>Шинэ хөтөлбөр</CreateBtn>
      </div>

      {/* Stats */}
      <div className="stats-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '16px 18px', border: '1.5px solid transparent' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {filterBtns.map(f => (
          <FilterPill key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</FilterPill>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(c => (
          <CourseRow key={c.id} course={c} onSelect={() => onSelectCourse(c)} onDelete={onRefresh} />
        ))}
        {filtered.length === 0 && <EmptyState>Хөтөлбөр олдсонгүй</EmptyState>}
      </div>
    </div>
  )
}

function CourseRow({ course, onSelect, onDelete }: { course: Course; onSelect: () => void; onDelete: () => void }) {
  const [hover, setHover] = useState(false)
  const status = STATUS_CFG[course.status] ?? STATUS_CFG.DRAFT
  const color = courseColor(course.id)
  const totalEx = course.lessons.reduce((s, l) => s + l.exercises.length, 0)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`"${course.title}" хөтөлбөрийг устгах уу?\nБүх хичээл, дасгал хамт устгагдана.`)) return
    await supabase.from('courses').delete().eq('id', course.id)
    onDelete()
  }

  return (
    <div onClick={onSelect}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: 'white', borderRadius: 16,
        border: `1.5px solid ${hover ? T : BR}`,
        padding: '18px 20px', cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hover ? '0 4px 16px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: TX }}>{course.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
          {course.grade_level && <><span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{course.grade_level}-р анги</span><Sep /></>}
          <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{course.lessons.length} хичээл</span>
          <Sep />
          <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{totalEx} дасгал</span>
        </div>
      </div>
      <div style={{ padding: '5px 12px', borderRadius: 8, background: status.bg, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.dot }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: status.color }}>{status.label}</span>
      </div>
      <button onClick={handleDelete} title="Устгах" style={{
        flexShrink: 0, width: 30, height: 30, borderRadius: 8, border: 'none',
        background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#D1D5DB', transition: 'all 0.15s',
      }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#FEF2F2'; el.style.color = '#EF4444' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'transparent'; el.style.color = '#D1D5DB' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
        </svg>
      </button>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </div>
  )
}

/* ── CourseDetailView ───────────────────────────────────────────── */
function CourseDetailView({ course, onBack, onRefresh }: {
  course: Course; onBack: () => void; onRefresh: () => void
}) {
  const router = useRouter()
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [addingLesson, setAddingLesson] = useState(false)
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [localLessons, setLocalLessons] = useState<Lesson[]>(course.lessons)

  const color = courseColor(course.id)
  const status = STATUS_CFG[course.status] ?? STATUS_CFG.DRAFT
  const totalEx = localLessons.reduce((s, l) => s + l.exercises.length, 0)

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return
    setSubmitting(true)
    const { data, error } = await supabase.from('lessons').insert({
      course_id: course.id,
      title: newLessonTitle.trim(),
      order_index: localLessons.length,
    }).select().single()
    if (!error && data) {
      setLocalLessons(prev => [...prev, { ...data, exercises: [] }])
      setNewLessonTitle('')
      setAddingLesson(false)
      onRefresh()
    } else {
      setSubmitError(error?.message ?? 'Алдаа гарлаа')
    }
    setSubmitting(false)
  }

  const handleSubmitForReview = async () => {
    await supabase.from('courses').update({ status: 'PENDING_REVIEW' }).eq('id', course.id)
    onRefresh()
  }

  const togglePublish = async (lessonId: string, current: boolean) => {
    await supabase.from('lessons').update({ is_published: !current }).eq('id', lessonId)
    setLocalLessons(prev => prev.map(l => l.id === lessonId ? { ...l, is_published: !current } : l))
  }

  const deleteLesson = async (lessonId: string, title: string) => {
    if (!window.confirm(`"${title}" хичээлийг устгах уу?\nБүх дасгал хамт устгагдана.`)) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    setLocalLessons(prev => prev.filter(l => l.id !== lessonId))
    onRefresh()
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${BR}`,
          background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = T}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = BR}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S2} strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <span style={{ fontSize: 13, color: S3, fontWeight: 600 }}>Хөтөлбөрүүд</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
        <span style={{ fontSize: 13, color: TX, fontWeight: 700 }}>{course.title}</span>
      </div>

      {/* Course header card */}
      <div style={{
        background: 'white', borderRadius: 18, border: `1.5px solid ${BR}`,
        padding: '24px', marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: color }} />
        <div className="course-hdr-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TX, margin: 0 }}>{course.title}</h2>
              <div style={{ padding: '4px 12px', borderRadius: 8, background: status.bg, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: status.dot }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: status.color }}>{status.label}</span>
              </div>
            </div>
            {course.description && (
              <p style={{ fontSize: 14, color: S2, margin: '0 0 12px', lineHeight: 1.5 }}>{course.description}</p>
            )}
            <div style={{ display: 'flex', gap: 20 }}>
              {course.grade_level && <span style={{ fontSize: 13, fontWeight: 600, color: S2 }}>{course.grade_level}-р анги</span>}
              <span style={{ fontSize: 13, fontWeight: 600, color: S2 }}>{localLessons.length} хичээл</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: S2 }}>{totalEx} дасгал</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {course.status === 'DRAFT' && (
              <button onClick={handleSubmitForReview} style={{
                background: '#FFF8E1', color: '#B8860B', border: '1.5px solid #F5D87020',
                borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#FFF3CD'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#FFF8E1'}>
                Хянуулах
              </button>
            )}
            <button onClick={() => router.push(`/creator/courses/${course.id}`)} style={{
              background: '#F3F0EB', color: S2, border: 'none',
              borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#E5E2DC'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#F3F0EB'}>
              Засах
            </button>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <h3 style={{ fontSize: 17, fontWeight: 800, color: TX, margin: '0 0 12px' }}>Хичээлүүд</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {localLessons.map((lesson, idx) => {
          const expanded = expandedLesson === lesson.id
          const isFT = lesson.type === 'FAIRY_TALE'
          return (
            <div key={lesson.id} style={{
              background: 'white', borderRadius: 14,
              border: `1.5px solid ${expanded ? color : BR}`,
              overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              <div className="lesson-hdr"
                onClick={() => setExpandedLesson(expanded ? null : lesson.id)}
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 11,
                  background: isFT ? '#FFF3D6' : `${color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14, color: isFT ? '#C4A77D' : color, flexShrink: 0,
                }}>
                  {isFT ? '📖' : idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: TX }}>{lesson.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{isFT ? 'Үлгэр' : 'Хичээл'}</span>
                    <Sep />
                    <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{lesson.exercises.length} дасгал</span>
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px', borderRadius: 7,
                  background: lesson.is_published ? '#E5F7F7' : '#F3F0EB',
                  fontSize: 11, fontWeight: 700,
                  color: lesson.is_published ? '#14B8A6' : S3, flexShrink: 0,
                }}>
                  {lesson.is_published ? 'Нийтлэгдсэн' : 'Ноорог'}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>

              {expanded && (
                <div style={{ borderTop: `1.5px solid #F3F0EB`, padding: '12px 18px', background: '#FAFAF8' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: lesson.exercises.length > 0 ? 12 : 8, flexWrap: 'wrap' }}>
                    <button onClick={() => router.push(`/creator/lessons/${lesson.id}`)} style={{
                      padding: '7px 14px', background: `${color}15`, color,
                      border: `1.5px solid ${color}30`, borderRadius: 9, fontWeight: 700, fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>✏️ Засах / Үзүүлэн</button>
                    <button onClick={() => router.push(`/creator/exercises/new?lessonId=${lesson.id}`)} style={{
                      padding: '7px 14px', background: '#E5F7F7', color: '#0D9488',
                      border: '1.5px solid #A3DDD980', borderRadius: 9, fontWeight: 700, fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>🎮 Дасгал нэмэх</button>
                    <button onClick={() => togglePublish(lesson.id, lesson.is_published)} style={{
                      padding: '7px 14px', background: '#F3F0EB', color: S2,
                      border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>{lesson.is_published ? 'Нуух' : 'Нийтлэх'}</button>
                    <button onClick={() => deleteLesson(lesson.id, lesson.title)} style={{
                      padding: '7px 10px', background: 'transparent', color: S3,
                      border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto',
                      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#FEF2F2'; el.style.color = '#EF4444' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'transparent'; el.style.color = S3 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      </svg>
                      Устгах
                    </button>
                  </div>

                  {lesson.exercises.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {lesson.exercises.map(ex => (
                        <div key={ex.id} style={{
                          background: 'white', borderRadius: 10, border: `1.5px solid ${BR}`,
                          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${color}15`, color }}>
                            {GAME_LABELS[ex.game_type] ?? ex.game_type}
                          </span>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TX }}>{ex.title}</span>
                          {ex.points_reward > 0 && (
                            <div style={{ background: '#FFF3D6', borderRadius: 6, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <span style={{ fontSize: 10 }}>⭐</span>
                              <span style={{ fontWeight: 800, fontSize: 11, color: '#C4A77D' }}>+{ex.points_reward}</span>
                            </div>
                          )}
                          <button onClick={() => router.push(`/creator/exercises/${ex.id}/edit`)} style={{
                            background: '#F3F0EB', border: 'none', borderRadius: 7, padding: '5px 10px',
                            cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, color: S2,
                          }}>Засах</button>
                          <button onClick={async () => {
                            if (!window.confirm(`"${ex.title}" дасгалыг устгах уу?`)) return
                            try {
                              await deleteExerciseById(ex.id)
                              setLocalLessons(prev => prev.map(l => l.id === lesson.id
                                ? { ...l, exercises: l.exercises.filter(e => e.id !== ex.id) }
                                : l))
                              onRefresh()
                            } catch (error) {
                              window.alert(error instanceof Error ? error.message : 'Дасгал устгахад алдаа гарлаа')
                            }
                          }} title="Устгах" style={{
                            background: 'transparent', border: 'none', borderRadius: 7, padding: '5px 8px',
                            cursor: 'pointer', color: '#D1D5DB', transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#FEF2F2'; el.style.color = '#EF4444' }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'transparent'; el.style.color = '#D1D5DB' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {lesson.exercises.length === 0 && (
                    <p style={{ fontSize: 13, color: S3, fontWeight: 500, padding: '4px 0', margin: 0 }}>
                      Дасгал оруулаагүй байна
                    </p>
                  )}

                  <button onClick={() => router.push(`/creator/exercises/new?lessonId=${lesson.id}`)} style={{
                    width: '100%', padding: '10px', marginTop: 8,
                    border: `1.5px dashed ${BR}`, borderRadius: 10, background: 'transparent',
                    color, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = color; el.style.background = `${color}08` }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = BR; el.style.background = 'transparent' }}>
                    + Дасгал нэмэх
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Add lesson */}
        {addingLesson ? (
          <div style={{
            background: 'white', borderRadius: 14, border: `2px solid ${color}`,
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <input type="text" value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)}
              placeholder="Хичээлийн нэр..." autoFocus
              style={{ flex: 1, padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${BR}`, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', outline: 'none' }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = color}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = BR}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddLesson()
                if (e.key === 'Escape') { setAddingLesson(false); setNewLessonTitle('') }
              }}
            />
            <button onClick={handleAddLesson} disabled={submitting || !newLessonTitle.trim()} style={{
              background: color, color: 'white', border: 'none', borderRadius: 10,
              padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              fontFamily: 'inherit', opacity: submitting ? 0.6 : 1,
            }}>Нэмэх</button>
            <button onClick={() => { setAddingLesson(false); setNewLessonTitle('') }} style={{
              background: '#F3F0EB', color: S2, border: 'none', borderRadius: 10,
              padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}>Болих</button>
          </div>
        ) : (
          <button onClick={() => setAddingLesson(true)} style={{
            width: '100%', padding: '14px', border: '1.5px dashed #D1D5DB', borderRadius: 14,
            background: 'transparent', color: S3, fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = color; el.style.color = color }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#D1D5DB'; el.style.color = S3 }}>
            + Хичээл нэмэх
          </button>
        )}
        {submitError && <p style={{ fontSize: 13, color: '#DC2626', marginTop: 8 }}>{submitError}</p>}
      </div>
    </div>
  )
}

/* ── LessonsPanel ───────────────────────────────────────────────── */
function LessonsPanel({ courses, onCreateNew, onRefresh }: { courses: Course[]; onCreateNew: () => void; onRefresh: () => void }) {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)

  const deleteLesson = async (lessonId: string, title: string) => {
    if (!window.confirm(`"${title}" хичээлийг устгах уу?\nБүх дасгал хамт устгагдана.`)) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    onRefresh()
  }

  const allLessons = courses.flatMap(c =>
    c.lessons.map(l => ({
      ...l,
      courseName: c.title,
      courseColor: courseColor(c.id),
      courseId: c.id,
    }))
  )

  const filtered = filter === 'all' ? allLessons
    : filter === 'published' ? allLessons.filter(l => l.is_published)
    : allLessons.filter(l => !l.is_published)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: 0 }}>Хичээлүүд</h1>
        </div>
        <CreateBtn onClick={onCreateNew}>Шинэ хичээл</CreateBtn>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#E5F7F7', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#0D9488' }}>{allLessons.length}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#5BBABA' }}>Нийт хичээл</span>
        </div>
        <div style={{ background: '#FFF3D6', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#C4A77D' }}>{allLessons.filter(l => l.is_published).length}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#C4A77D' }}>Нийтлэгдсэн</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'all', label: 'Бүгд' },
          { id: 'published', label: 'Нийтлэгдсэн' },
          { id: 'draft', label: 'Ноорог' },
        ].map(f => (
          <FilterPill key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</FilterPill>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(lesson => {
          const expanded = expandedLesson === lesson.id
          return (
            <div key={lesson.id} style={{
              background: 'white', borderRadius: 14,
              border: `1.5px solid ${expanded ? T : BR}`,
              overflow: 'hidden', transition: 'border-color 0.15s',
            }}>
              <div className="lesson-hdr"
                onClick={() => setExpandedLesson(expanded ? null : lesson.id)}
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${lesson.courseColor}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={lesson.courseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: TX }}>{lesson.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: lesson.courseColor }}>{lesson.courseName}</span>
                    <Sep />
                    <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{lesson.exercises.length} дасгал</span>
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px', borderRadius: 7,
                  background: lesson.is_published ? '#E5F7F7' : '#F3F0EB',
                  fontSize: 11, fontWeight: 700,
                  color: lesson.is_published ? '#14B8A6' : S3, flexShrink: 0,
                }}>
                  {lesson.is_published ? 'Нийтлэгдсэн' : 'Ноорог'}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }}>
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>

              {expanded && (
                <div style={{ borderTop: `1.5px solid #F3F0EB`, padding: '14px 18px', background: '#FAFAF8' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: lesson.exercises.length > 0 ? 12 : 0 }}>
                    <button onClick={() => router.push(`/creator/lessons/${lesson.id}`)} style={{
                      padding: '7px 14px', background: `${lesson.courseColor}15`, color: lesson.courseColor,
                      border: `1.5px solid ${lesson.courseColor}40`, borderRadius: 10,
                      fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    }}>✏️ Засах</button>
                    <button onClick={() => router.push(`/creator/exercises/new?lessonId=${lesson.id}`)} style={{
                      padding: '7px 14px', background: '#E5F7F7', color: '#0D9488',
                      border: '1.5px solid #A3DDD980', borderRadius: 9,
                      fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    }}>🎮 Дасгал нэмэх</button>
                    <button onClick={() => deleteLesson(lesson.id, lesson.title)} style={{
                      padding: '7px 10px', background: 'transparent', color: S3,
                      border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto',
                      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#FEF2F2'; el.style.color = '#EF4444' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'transparent'; el.style.color = S3 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      </svg>
                      Устгах
                    </button>
                  </div>
                  {lesson.exercises.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {lesson.exercises.map(ex => (
                        <div key={ex.id} style={{
                          background: 'white', borderRadius: 10, border: `1.5px solid ${BR}`,
                          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${lesson.courseColor}15`, color: lesson.courseColor }}>
                            {GAME_LABELS[ex.game_type] ?? ex.game_type}
                          </span>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TX }}>{ex.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <EmptyState>Хичээл олдсонгүй</EmptyState>}
      </div>
    </div>
  )
}

/* ── LessonPickerModal ──────────────────────────────────────────── */
function LessonPickerModal({ courses, onPick, onClose }: {
  courses: Course[]; onPick: (lessonId: string) => void; onClose: () => void
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(61,61,61,0.3)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 480, maxHeight: '70vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)', animation: 'modalIn 0.25s ease both',
      }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: `1.5px solid #F3F0EB`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: TX, margin: 0 }}>Дасгал нэмэх хичээл</h2>
            <p style={{ fontSize: 13, color: S3, fontWeight: 500, marginTop: 2 }}>Хичээлээ сонгоно уу</p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {courses.length === 0 && <div style={{ color: S3, fontSize: 14, textAlign: 'center', padding: '24px 0' }}>Хөтөлбөр олдсонгүй</div>}
          {courses.map(c => {
            const color = courseColor(c.id)
            return (
              <div key={c.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: TX }}>{c.title}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 16 }}>
                  {c.lessons.length === 0 && <div style={{ fontSize: 12, color: S3, padding: '4px 0' }}>Хичээл байхгүй</div>}
                  {c.lessons.map(l => (
                    <button key={l.id} onClick={() => onPick(l.id)} style={{
                      padding: '10px 14px', background: 'white', border: `1.5px solid ${BR}`,
                      borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = T; el.style.background = '#E5F7F7' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = BR; el.style.background = 'white' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: TX }}>{l.title}</span>
                      <span style={{ fontSize: 11, color: S3, marginLeft: 'auto' }}>{l.exercises.length} дасгал</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── ExercisesPanel ─────────────────────────────────────────────── */
function ExercisesPanel({ courses, onRefresh }: { courses: Course[]; onCreateNew: () => void; onRefresh: () => void }) {
  const router = useRouter()
  const [filterType, setFilterType] = useState('all')
  const [showPicker, setShowPicker] = useState(false)

  const allExercises = courses.flatMap(c =>
    c.lessons.flatMap(l =>
      l.exercises.map(ex => ({
        ...ex,
        courseName: c.title,
        courseColor: courseColor(c.id),
        lessonName: l.title,
        lessonId: l.id,
      }))
    )
  )

  const gameTypes = [...new Set(allExercises.map(e => e.game_type))]
  const filtered = filterType === 'all' ? allExercises : allExercises.filter(ex => ex.game_type === filterType)

  const handleDeleteExercise = async (exId: string, title: string) => {
    if (!window.confirm(`"${title}" дасгалыг устгах уу?`)) return
    try {
      await deleteExerciseById(exId)
      onRefresh()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Дасгал устгахад алдаа гарлаа')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: 0 }}>Дасгал даалгаврууд</h1>
          <p style={{ fontSize: 14, color: S3, fontWeight: 500, marginTop: 4 }}>Тоглоомон дасгал үүсгэх, удирдах</p>
        </div>
        <CreateBtn onClick={() => setShowPicker(true)}>Шинэ дасгал</CreateBtn>
      </div>

      {showPicker && (
        <LessonPickerModal
          courses={courses}
          onPick={lessonId => { setShowPicker(false); router.push(`/creator/exercises/new?lessonId=${lessonId}`) }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Game type filter cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        <button onClick={() => setFilterType('all')} style={{
          background: filterType === 'all' ? '#E5F7F7' : 'white',
          border: `1.5px solid ${filterType === 'all' ? T : BR}`,
          borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
          textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit',
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: filterType === 'all' ? '#0D9488' : TX }}>{allExercises.length}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: filterType === 'all' ? '#5BBABA' : S3, marginTop: 2 }}>Бүгд</div>
        </button>
        {gameTypes.map(type => {
          const count = allExercises.filter(e => e.game_type === type).length
          const label = GAME_LABELS[type] ?? type
          const isActive = filterType === type
          return (
            <button key={type} onClick={() => setFilterType(isActive ? 'all' : type)} style={{
              background: isActive ? '#E5F7F7' : 'white',
              border: `1.5px solid ${isActive ? T : BR}`,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit',
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: isActive ? '#0D9488' : TX }}>{count}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#5BBABA' : S3, marginTop: 2 }}>{label}</div>
            </button>
          )
        })}
      </div>

      {/* Exercise cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map(ex => (
          <ExerciseCard key={ex.id} exercise={ex}
            onEdit={() => router.push(`/creator/exercises/${ex.id}/edit`)}
            onDelete={() => handleDeleteExercise(ex.id, ex.title)}
          />
        ))}
      </div>
      {filtered.length === 0 && <EmptyState>Дасгал олдсонгүй</EmptyState>}
    </div>
  )
}

function ExerciseCard({ exercise, onEdit, onDelete }: { exercise: Exercise & { courseName: string; courseColor: string; lessonName: string; lessonId: string }; onEdit: () => void; onDelete: () => void }) {
  const [hover, setHover] = useState(false)
  const gameLabel = GAME_LABELS[exercise.game_type] ?? exercise.game_type

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: 'white', borderRadius: 14,
      border: `1.5px solid ${hover ? exercise.courseColor : BR}`,
      padding: '16px 18px',
      transition: 'all 0.2s ease',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: hover ? '0 6px 20px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 7, background: `${exercise.courseColor}15`, color: exercise.courseColor }}>
          {gameLabel}
        </span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: TX, marginBottom: 6 }}>{exercise.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{exercise.courseName}</span>
        <Sep />
        <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{exercise.lessonName}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        {exercise.points_reward > 0 && (
          <div style={{ background: '#FFF3D6', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12 }}>⭐</span>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#C4A77D' }}>+{exercise.points_reward}</span>
          </div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={e => { e.stopPropagation(); onEdit() }} style={{
            background: '#F3F0EB', border: 'none', borderRadius: 8, padding: '6px 10px',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: S2,
            transition: 'all 0.1s',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#E5F7F7'; el.style.color = '#0D9488' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F3F0EB'; el.style.color = S2 }}>
            Засах
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete() }} title="Устгах" style={{
            background: 'transparent', border: 'none', borderRadius: 8, padding: '6px 8px',
            cursor: 'pointer', color: '#D1D5DB', transition: 'all 0.1s',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#FEF2F2'; el.style.color = '#EF4444' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'transparent'; el.style.color = '#D1D5DB' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── ClassesPanel ───────────────────────────────────────────────── */
function ClassesPanel({ courses, students }: { courses: Course[]; students: EnrolledStudent[] }) {
  const [selectedCourse, setSelectedCourse] = useState('all')
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED')
  const filtered = selectedCourse === 'all' ? students : students.filter(s => s.courseId === selectedCourse)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: 0 }}>Анги</h1>
        <p style={{ fontSize: 14, color: S3, fontWeight: 500, marginTop: 4 }}>Бүртгэлтэй сурагчдын мэдээлэл</p>
      </div>

      {/* Summary */}
      <div className="stats-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#E5F7F7', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0D9488' }}>{students.length}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#5BBABA', marginTop: 2 }}>Нийт сурагч</div>
        </div>
        <div style={{ background: '#FFF3D6', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#C4A77D' }}>{publishedCourses.length}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#C4A77D', marginTop: 2 }}>Идэвхтэй хөтөлбөр</div>
        </div>
        <div style={{ background: '#FCE4E4', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#D97B7B' }}>{new Set(students.map(s => s.courseId)).size}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E8A5A5', marginTop: 2 }}>Бүртгэлтэй хөтөлбөр</div>
        </div>
      </div>

      {/* Course filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <FilterPill active={selectedCourse === 'all'} onClick={() => setSelectedCourse('all')}>Бүгд</FilterPill>
        {publishedCourses.map(c => {
          const color = courseColor(c.id)
          const isActive = selectedCourse === c.id
          return (
            <button key={c.id} onClick={() => setSelectedCourse(c.id)} style={{
              padding: '7px 16px', borderRadius: 10, border: '1.5px solid',
              borderColor: isActive ? color : BR,
              background: isActive ? `${color}15` : 'white',
              color: isActive ? color : S2,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
            }}>{c.title}</button>
          )
        })}
      </div>

      {/* Student list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(student => <StudentRow key={student.id} student={student} />)}
        {filtered.length === 0 && <EmptyState>Сурагч олдсонгүй</EmptyState>}
      </div>
    </div>
  )
}

function StudentRow({ student }: { student: EnrolledStudent }) {
  const [hover, setHover] = useState(false)

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: 'white', borderRadius: 14,
      border: `1.5px solid ${hover ? T : BR}`,
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all 0.15s',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 14, background: '#E5F7F7',
        border: '2px solid #E5F7F7', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: TX }}>{student.studentName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{student.gradeLevel}-р анги</span>
          <Sep />
          <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{student.courseTitle}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFF3D6', borderRadius: 8, padding: '4px 10px' }}>
        <span style={{ fontSize: 12 }}>⭐</span>
        <span style={{ fontWeight: 800, fontSize: 13, color: '#C4A77D' }}>{student.pointsTotal}</span>
      </div>
    </div>
  )
}

/* ── Create Course Modal ────────────────────────────────────────── */
function CreateCourseModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Course) => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gradeLevel, setGradeLevel] = useState('2')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    const { data, error } = await supabase.from('courses').insert({
      title: title.trim(),
      description: description.trim() || null,
      grade_level: parseInt(gradeLevel),
      creator_id: session!.user.id,
      status: 'DRAFT',
    }).select().single()
    if (error) { setErr(error.message); setSaving(false); return }
    setSaving(false)
    setSuccess(true)
    onSave({ ...data, lessons: [] })
    setTimeout(onClose, 800)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(61,61,61,0.3)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        animation: 'modalIn 0.25s ease both',
      }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1.5px solid #F3F0EB', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: TX, margin: 0 }}>Шинэ хөтөлбөр</h2>
            <p style={{ fontSize: 13, color: S3, fontWeight: 500, marginTop: 3 }}>Хөтөлбөрийн мэдээллийг оруулна уу</p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, border: `1.5px solid ${BR}`,
            background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#E5F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: TX }}>Амжилттай үүсгэлээ!</div>
              <div style={{ fontSize: 13, color: S3, marginTop: 4 }}>Хөтөлбөр ноорог төлөвтэй нэмэгдлээ</div>
            </div>
          ) : (
            <>
              <ModalInput label="Хөтөлбөрийн нэр" required placeholder="Жишээ: Монгол хэл" value={title} onChange={setTitle} autoFocus />
              <ModalTextarea label="Тайлбар" placeholder="Хөтөлбөрийн товч тайлбар..." value={description} onChange={setDescription} />
              <ModalSelect label="Ангийн түвшин" required value={gradeLevel} onChange={setGradeLevel}
                options={[1,2,3,4,5].map(n => ({ value: String(n), label: `${n}-р анги` }))} />
              {err && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{err}</p>}
              <button onClick={handleSave} disabled={!title.trim() || saving} style={{
                background: !title.trim() || saving ? '#B8E0E0' : T, color: 'white', border: 'none', borderRadius: 12,
                padding: '12px 24px', fontWeight: 700, fontSize: 14,
                cursor: !title.trim() || saving ? 'not-allowed' : 'pointer',
                width: '100%', transition: 'all 0.15s', fontFamily: 'inherit',
                boxShadow: !title.trim() || saving ? 'none' : `0 2px 8px ${T}4D`,
              }}
                onMouseEnter={e => { if (title.trim() && !saving) (e.currentTarget as HTMLButtonElement).style.background = TB }}
                onMouseLeave={e => { if (title.trim() && !saving) (e.currentTarget as HTMLButtonElement).style.background = T }}>
                {saving ? 'Үүсгэж байна...' : 'Хөтөлбөр үүсгэх'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Create Lesson Modal ────────────────────────────────────────── */
function CreateLessonModal({ onClose, courses, onCreated }: {
  onClose: () => void; courses: Course[]; onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  useEffect(() => {
    if (!courseId && courses.length > 0) setCourseId(courses[0].id)
  }, [courses, courseId])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  const handleSave = async () => {
    if (!title.trim() || !courseId) return
    setSaving(true)
    const selectedCourse = courses.find(c => c.id === courseId)
    const orderIndex = selectedCourse ? selectedCourse.lessons.length : 0
    const { error } = await supabase.from('lessons').insert({
      course_id: courseId, title: title.trim(), order_index: orderIndex,
    })
    if (error) { setErr(error.message); setSaving(false); return }
    setSaving(false)
    setSuccess(true)
    setTimeout(() => { onClose(); onCreated() }, 800)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(61,61,61,0.3)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        animation: 'modalIn 0.25s ease both',
      }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1.5px solid #F3F0EB', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: TX, margin: 0 }}>Шинэ хичээл</h2>
            <p style={{ fontSize: 13, color: S3, fontWeight: 500, marginTop: 3 }}>Хичээлийн мэдээллийг оруулна уу</p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, border: `1.5px solid ${BR}`,
            background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#E5F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: TX }}>Амжилттай үүсгэлээ!</div>
              <div style={{ fontSize: 13, color: S3, marginTop: 4 }}>Хичээл нэмэгдлээ</div>
            </div>
          ) : (
            <>
              <ModalSelect label="Хөтөлбөр" required value={courseId} onChange={setCourseId}
                options={courses.map(c => ({ value: c.id, label: c.grade_level ? `${c.title} (${c.grade_level}-р анги)` : c.title }))} />
              <ModalInput label="Хичээлийн нэр" required placeholder="Жишээ: Үсэг таних" value={title} onChange={setTitle} autoFocus />
              {err && <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{err}</p>}
              <button onClick={handleSave} disabled={!title.trim() || !courseId || saving} style={{
                background: !title.trim() || !courseId || saving ? '#B8E0E0' : T, color: 'white', border: 'none', borderRadius: 12,
                padding: '12px 24px', fontWeight: 700, fontSize: 14,
                cursor: !title.trim() || !courseId || saving ? 'not-allowed' : 'pointer',
                width: '100%', transition: 'all 0.15s', fontFamily: 'inherit',
              }}>
                {saving ? 'Үүсгэж байна...' : 'Хичээл үүсгэх'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────────── */
function CreatorDashboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [panelKey, setPanelKey] = useState(0)
  const [modal, setModal] = useState<'course' | 'lesson' | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      await supabase.from('profiles').upsert({
        id: user!.id, email: user!.email ?? '',
        name: user!.user_metadata?.name ?? 'User', role: 'CONTENT_CREATOR',
      }, { onConflict: 'id' })
      setName(user!.user_metadata?.name || 'Бүтээгч')
      setUserId(user!.id)
      await fetchAll(user!.id)
      setLoading(false)
    }
    init()
  }, [router])

  const fetchAll = async (uid: string) => {
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*, lessons(*, exercises(*))')
      .eq('creator_id', uid)
      .order('created_at', { ascending: false })

    const loadedCourses: Course[] = (coursesData ?? []).map((c: any) => ({
      id: c.id, title: c.title, description: c.description, status: c.status,
      grade_level: c.grade_level, created_at: c.created_at,
      lessons: ((c.lessons as any[]) ?? [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((l: any) => ({
          id: l.id, title: l.title, type: l.type, order_index: l.order_index,
          is_published: l.is_published,
          exercises: ((l.exercises as any[]) ?? []).sort((a: any, b: any) => a.order_index - b.order_index),
        })),
    }))
    setCourses(loadedCourses)

    const publishedIds = loadedCourses.filter(c => c.status === 'PUBLISHED').map(c => c.id)
    if (publishedIds.length > 0) {
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('id, student_id, course_id, students(id, name, avatar, grade_level, points_total), courses(id, title)')
        .in('course_id', publishedIds)

      setStudents(((enrollData ?? []) as any[]).map((e: any) => ({
        id: e.id,
        studentId: e.students?.id ?? '',
        studentName: e.students?.name ?? '',
        avatar: e.students?.avatar ?? 'cat',
        gradeLevel: e.students?.grade_level ?? 1,
        pointsTotal: e.students?.points_total ?? 0,
        courseId: e.course_id,
        courseTitle: e.courses?.title ?? '',
      })))
    } else {
      setStudents([])
    }
  }

  // Sync active tab from URL (layout sidebar navigates via ?tab=)
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['courses', 'lessons', 'exercises', 'classes'].includes(tab)) {
      setActiveTab(tab)
      setSelectedCourse(null)
      setPanelKey(k => k + 1)
    }
  }, [searchParams])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSelectedCourse(null)
    setPanelKey(k => k + 1)
  }

  if (loading) return (
    <div style={{ padding: '48px 32px', color: S3, fontWeight: 600, fontSize: 14 }}>
      Уншиж байна...
    </div>
  )

  return (
    <>
      <style>{CSS}</style>
      <TopBar />
      <div key={panelKey} className="panel-enter creator-content" style={{ padding: '28px 32px 48px' }}>

        {activeTab === 'courses' && !selectedCourse && (
          <CoursesPanel
            courses={courses}
            onSelectCourse={c => { setSelectedCourse(c); setPanelKey(k => k + 1) }}
            onCreateNew={() => setModal('course')}
            onRefresh={() => fetchAll(userId)}
          />
        )}

        {activeTab === 'courses' && selectedCourse && (
          <CourseDetailView
            course={selectedCourse}
            onBack={() => { setSelectedCourse(null); setPanelKey(k => k + 1) }}
            onRefresh={() => fetchAll(userId)}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonsPanel courses={courses} onCreateNew={() => setModal('lesson')} onRefresh={() => fetchAll(userId)} />
        )}

        {activeTab === 'exercises' && (
          <ExercisesPanel
            courses={courses}
            onCreateNew={() => {}}
            onRefresh={() => fetchAll(userId)}
          />
        )}

        {activeTab === 'classes' && (
          <ClassesPanel courses={courses} students={students} />
        )}
      </div>

      {modal === 'course' && (
        <CreateCourseModal
          onClose={() => setModal(null)}
          onSave={newCourse => {
            setCourses(prev => [newCourse, ...prev])
            setModal(null)
          }}
        />
      )}

      {modal === 'lesson' && (
        <CreateLessonModal
          onClose={() => setModal(null)}
          courses={courses}
          onCreated={() => fetchAll(userId)}
        />
      )}
    </>
  )
}

export default function CreatorDashboard() {
  return (
    <Suspense>
      <CreatorDashboardInner />
    </Suspense>
  )
}
