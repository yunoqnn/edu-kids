'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Props {
  role: 'PARENT' | 'CONTENT_CREATOR'
  name: string
  children: React.ReactNode
  navItems: { href: string; label: string; icon: string }[]
  activePath: string
}

export default function DashboardShell({ role, name, children, navItems, activePath }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fafafa' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'white', borderRight: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 24px', borderBottom: '1.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🎓</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--primary)' }}>StudyComp</span>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '16px 24px', borderBottom: '1.5px solid var(--border)' }}>
          <div style={{ width: 40, height: 40, background: 'var(--primary-pale)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 8 }}>
            {role === 'PARENT' ? '👨‍👩‍👧' : '✏️'}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{name}</div>
          <div className="tag" style={{ marginTop: 4, fontSize: 11, padding: '3px 8px' }}>
            {role === 'PARENT' ? 'Эцэг эх' : 'Контент бүтээгч'}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const active = activePath === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 600 : 500, textAlign: 'left', background: active ? 'var(--primary-pale)' : 'transparent', color: active ? 'var(--primary)' : 'var(--text-muted)', transition: 'all 0.15s' }}
                onMouseOver={(e) => { if (!active) e.currentTarget.style.background = '#f9fafb' }}
                onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0 12px' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, background: 'transparent', color: '#ef4444', transition: 'background 0.15s' }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            🚪 Гарах
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        {children}
      </main>
    </div>
  )
}
