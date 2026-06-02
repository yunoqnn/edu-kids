'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const T  = '#7AD1D1'
const TB = '#5BBABA'
const BR = '#E5DDD3'
const TX = '#3D3D3D'
const S2 = '#6B7280'
const S3 = '#9CA3AF'
const BG = '#FAF7F2'

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E5DDD3; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #C4A77D; }
  .creator-mob-topbar { display: none; }
  .creator-mob-overlay { display: none; }
  @media (max-width: 768px) {
    .creator-sidebar {
      position: fixed !important;
      height: 100vh !important;
      top: 0 !important;
      left: -280px !important;
      z-index: 200 !important;
      transition: left 0.28s cubic-bezier(.4,0,.2,1) !important;
      width: 260px !important;
    }
    .creator-sidebar.mob-open {
      left: 0 !important;
      box-shadow: 4px 0 28px rgba(0,0,0,0.18) !important;
    }
    .creator-mob-overlay {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.38);
      z-index: 199;
    }
    .creator-mob-topbar {
      display: flex !important;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #fff;
      border-bottom: 1.5px solid #E5DDD3;
      position: sticky;
      top: 0;
      z-index: 10;
    }
  }
  @media (min-width: 769px) {
    .creator-mob-topbar { display: none !important; }
    .creator-mob-overlay { display: none !important; }
  }
`

const NAV_ITEMS = [
  {
    id: 'courses', label: 'Сургалтын хөтөлбөрүүд',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : S2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      </svg>
    ),
  },
  {
    id: 'lessons', label: 'Хичээлүүд',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : S2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
      </svg>
    ),
  },
  {
    id: 'exercises', label: 'Дасгал даалгаврууд',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : S2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>
      </svg>
    ),
  },
  {
    id: 'classes', label: 'Анги',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : S2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
]

function useActiveTab() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  if (pathname === '/creator/dashboard') return searchParams.get('tab') || 'courses'
  if (pathname.startsWith('/creator/exercises')) return 'exercises'
  if (pathname.startsWith('/creator/lessons')) return 'lessons'
  if (pathname.startsWith('/creator/courses')) return 'courses'
  return 'courses'
}

function CreatorSidebar({ name, mobileOpen, onMobileClose }: { name: string; mobileOpen?: boolean; onMobileClose?: () => void }) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const activeTab = useActiveTab()
  const W = collapsed ? 72 : 260

  const handleTab = (tab: string) => { router.push(`/creator/dashboard?tab=${tab}`); onMobileClose?.() }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className={`creator-sidebar${mobileOpen ? ' mob-open' : ''}`} style={{
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
            <div style={{ fontWeight: 700, fontSize: 14, color: TX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name || 'Бүтээгч'}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: TB, marginTop: 2 }}>Контент бүтээгч</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.id
          return (
            <button key={item.id} onClick={() => handleTab(item.id)}
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
              onMouseEnter={e => { if (!isActive) { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#F5F0EA'; el.style.color = TX } }}
              onMouseLeave={e => { if (!isActive) { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'transparent'; el.style.color = S2 } }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon(isActive)}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Expand button (collapsed) */}
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
        <button onClick={handleLogout} title={collapsed ? 'Гарах' : undefined} style={{
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

function CreatorShellInner({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setName(session.user.user_metadata?.name || '')
    })
  }, [])

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {mobileOpen && <div className="creator-mob-overlay" onClick={() => setMobileOpen(false)} />}
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Nunito, sans-serif' }}>
        <CreatorSidebar name={name} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: BG }}>
          {/* Mobile-only topbar with hamburger */}
          <div className="creator-mob-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/></svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: T }}>StudyComp</span>
            </div>
            <button onClick={() => setMobileOpen(true)} style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TX} strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
          {children}
        </main>
      </div>
    </>
  )
}

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <CreatorShellInner>{children}</CreatorShellInner>
    </Suspense>
  )
}
