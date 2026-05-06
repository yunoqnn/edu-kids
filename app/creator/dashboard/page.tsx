'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardShell from '@/components/DashboardShell'

const NAV = [
  { href: '/creator/dashboard', label: 'Хяналтын самбар', icon: '📊' },
  { href: '/creator/courses', label: 'Хичээлүүд', icon: '📖' },
  { href: '/creator/exercises/new', label: 'Дасгал нэмэх', icon: '🎮' },
]

export default function CreatorDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const [name, setName] = useState('Контент бүтээгч')
  const [loading, setLoading] = useState(true)

useEffect(() => {
  supabase.auth.getUser().then(async ({ data }) => {
    if (!data.user) { router.push('/'); return }
    const role = data.user.user_metadata?.role
    if (role !== 'CONTENT_CREATOR') { router.push('/'); return }

    /* Ensure profile row exists */
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email ?? '',
      name: data.user.user_metadata?.name ?? 'User',
      role: 'CONTENT_CREATOR' as const,
    }, { onConflict: 'id' })

    setName(data.user.user_metadata?.name || 'Контент бүтээгч')
    setLoading(false)
  })
}, [router])

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Уншиж байна...</div>

  const stats = [
    { icon: '📖', label: 'Хичээлийн хөтөлбөр', value: '0', color: 'var(--primary)' },
    { icon: '🎮', label: 'Нийт дасгал', value: '0', color: '#db2777' },
    { icon: '👩‍🎓', label: 'Суралцагчид', value: '0', color: '#2563eb' },
  ]

  return (
    <DashboardShell role="CONTENT_CREATOR" name={name} navItems={NAV} activePath={pathname}>
      <div className="fade-up">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Контент самбар ✏️</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Хичээл болон дасгал даалгаврыг энд удирдана уу.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {stats.map((s) => (
            <div key={s.label} className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { icon: '📝', title: 'Шинэ хичээл үүсгэх', desc: 'Хөтөлбөр болон хичээлийн агуулга нэмэх', href: '/creator/courses/new', color: 'var(--primary)' },
              { icon: '🎮', title: 'Дасгал/Тест нэмэх', desc: 'Memory card, Drag & drop, Тооны гинж үүсгэх', href: '/creator/exercises/new', color: '#db2777' },
            ].map((a) => (
              <div key={a.title} className="card" onClick={() => router.push(a.href)} style={{ padding: '28px 24px', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{a.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{a.desc}</div>
                <div style={{ marginTop: 16, color: a.color, fontWeight: 600, fontSize: 13 }}>Эхлэх →</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
