'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ── Tokens ── */
const T = '#7AD1D1', T2 = '#5BBABA', BG = '#FAF7F2', BR = '#E5DDD3'
const TX = '#3D3D3D', S2 = '#6B7280', S3 = '#9CA3AF'
const COURSE_COLORS = ['#7AD1D1', '#E8A5A5', '#9B8BBC', '#C4A77D', '#8BC4A5', '#B5C4E8']
const AVATAR_SRCS: Record<string, string> = {
  bear: '/avatars/bear head.png', cat: '/avatars/elephant head.png',
  dog: '/avatars/hippo head.png', rabbit: '/avatars/lion head.png',
  penguin: '/avatars/panda head.png', fox: '/avatars/tiger head.png',
}
const DAYS_MN = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя']
function courseColor(id: string) { return COURSE_COLORS[id.charCodeAt(0) % COURSE_COLORS.length] }
function avatarSrc(key: string) { return AVATAR_SRCS[key] ?? AVATAR_SRCS['bear'] }

/* ── Types ── */
interface Profile { id: string; name: string; email: string; created_at: string }
interface Student { id: string; name: string; grade_level: number; avatar: string; points_total: number; xp_total: number; stars: number; level: number }
type Tab = 'profile' | 'child-profile' | 'child-report' | 'screentime' // | 'chatbot'

/* ═════════���════════════════════════════════════
   SIDEBAR
═════���════════════════════════════════════════ */
function Sidebar({ active, onTab, profile, collapsed, onToggle, onLogout, mobileOpen, onMobileClose }: {
  active: Tab; onTab: (t: Tab) => void
  profile: Profile | null; collapsed: boolean; onToggle: () => void; onLogout: () => void
  mobileOpen?: boolean; onMobileClose?: () => void
}) {
  const w = collapsed ? 72 : 272
  const dicebear = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(profile?.name ?? 'P')}&backgroundColor=E5F7F7`

  const NavBtn = ({ id, label, icon, indent }: { id: Tab; label: string; icon: React.ReactNode; indent?: boolean }) => {
    const on = active === id
    return (
      <button onClick={() => { onTab(id); onMobileClose?.() }} title={collapsed ? label : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: collapsed ? '12px 0' : '11px 14px',
          paddingLeft: !collapsed && indent ? 42 : (collapsed ? 0 : 14),
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 12, border: 'none', cursor: 'pointer',
          fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: on ? 700 : 500,
          background: on ? T : 'transparent', color: on ? '#fff' : S2,
          transition: 'all .15s', width: '100%',
        }}
        onMouseEnter={e => { if (!on) { (e.currentTarget as HTMLButtonElement).style.background = '#F5F0EA'; (e.currentTarget as HTMLButtonElement).style.color = TX } }}
        onMouseLeave={e => { if (!on) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = S2 } }}
      >
        <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
        {!collapsed && <span>{label}</span>}
      </button>
    )
  }

  const stroke = (on: boolean) => on ? '#fff' : S2

  return (
    <aside className={`dash-sidebar${mobileOpen ? ' mob-open' : ''}`} style={{
      width: w, minHeight: '100vh', background: '#fff', borderRight: `1.5px solid ${BR}`,
      display: 'flex', flexDirection: 'column', transition: 'width .25s cubic-bezier(.4,0,.2,1)',
      flexShrink: 0, overflow: 'hidden', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '20px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: `1.5px solid ${BR}`, minHeight: 68 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: T, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/></svg>
        </div>
        {!collapsed && <span style={{ fontWeight: 800, fontSize: 17, color: T, flex: 1, marginLeft: 10 }}>StudyComp</span>}
        {!collapsed && (
          <button onClick={onToggle} style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T)} onMouseLeave={e => (e.currentTarget.style.borderColor = BR)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
      </div>

      {/* Profile */}
      <div style={{ padding: collapsed ? '16px 0' : '16px 20px', borderBottom: `1.5px solid ${BR}`, display: 'flex', alignItems: collapsed ? 'center' : 'flex-start', flexDirection: collapsed ? 'column' : 'row', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, overflow: 'hidden', border: '2px solid #E5F7F7', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dicebear} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: TX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name || '—'}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T2, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Эцэг/Эх
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavBtn id="profile" label="Профайл засах" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke(active==='profile')} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>} />

        {!collapsed && (
          <div style={{ padding: '18px 14px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="18" cy="9" r="3"/><path d="M21 21v-1.5a3 3 0 0 0-2.2-2.9"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: S3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Хүүхдийн мэдээлэл</span>
          </div>
        )}
        <NavBtn id="child-profile" label="Профайл засах" indent icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke(active==='child-profile')} strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>} />
        <NavBtn id="child-report" label="Тайлан харах" indent icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke(active==='child-report')} strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>} />
        <NavBtn id="screentime" label="Дэлгэцийн цаг" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke(active==='screentime')} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
        {/* <NavBtn id="chatbot" label="Чатбот" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke(active==='chatbot')} strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>} /> */}
      </nav>

      {collapsed && (
        <div style={{ padding: '0 8px 8px', display: 'flex', justifyContent: 'center' }}>
          <button onClick={onToggle} style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T)} onMouseLeave={e => (e.currentTarget.style.borderColor = BR)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      )}

      <div style={{ padding: collapsed ? '12px 8px 20px' : '12px 12px 20px', borderTop: `1.5px solid ${BR}` }}>
        <button onClick={onLogout} title={collapsed ? 'Гарах' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0' : '10px 14px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 600, background: 'transparent', color: '#EF4444', width: '100%', transition: 'background .15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {!collapsed && <span>Гарах</span>}
        </button>
      </div>
    </aside>
  )
}

/* ════��═════════════════════════════════════════
   SHARED INPUT STYLE
══════════════════════════════════════════════ */
const inputSt: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${BR}`,
  fontSize: 14, fontWeight: 500, fontFamily: "'Nunito',sans-serif", color: TX,
  background: '#FDFCFA', outline: 'none', transition: 'border-color .15s',
}
const labelSt: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: S2, marginBottom: 6, display: 'block' }

function SaveBtn({ saving, saved, onClick }: { saving?: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving}
      style={{ background: saved ? '#14B8A6' : T, color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s', boxShadow: '0 2px 8px rgba(122,209,209,.3)' }}
      onMouseEnter={e => { if (!saved && !saving) (e.currentTarget as HTMLButtonElement).style.background = T2 }}
      onMouseLeave={e => { if (!saved && !saving) (e.currentTarget as HTMLButtonElement).style.background = saved ? '#14B8A6' : T }}
    >
      {saved ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Хадгалагдлаа</> : (saving ? 'Хадгалж байна...' : 'Хадгалах')}
    </button>
  )
}

/* ══��═══════════════════════════════════════════
   CHILD SELECTOR TABS (reused in multiple panels)
══════════════���══════════════════════════��════ */
function ChildTabs({ students, selectedId, onSelect }: { students: Student[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
      {students.map(c => {
        const sel = c.id === selectedId
        return (
          <button key={c.id} onClick={() => onSelect(c.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 14, border: `2px solid ${sel ? T : BR}`, background: sel ? '#E5F7F7' : 'white', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, overflow: 'hidden', border: '2px solid #E5F7F7' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarSrc(c.avatar)} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontWeight: sel ? 700 : 500, fontSize: 14, color: sel ? '#0D9488' : S2 }}>{c.name}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ═══════════════���════════════════════��═════════
   PARENT PROFILE PANEL
══════════════════════════════════════��═══════ */
function ParentProfilePanel({ profile, userId, onNameUpdate }: { profile: Profile; userId: string; onNameUpdate: (name: string) => void }) {
  const [form, setForm] = useState({ name: profile.name, email: profile.email, phone: '' })
  const [oldPw, setOldPw] = useState(''), [newPw, setNewPw] = useState('')
  const [saved, setSaved] = useState(false), [saving, setSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false), [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [hover, setHover] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const phone = data.user?.user_metadata?.phone ?? ''
      setForm(f => ({ ...f, phone }))
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ name: form.name }).eq('id', userId)
    await supabase.auth.updateUser({ data: { phone: form.phone } })
    onNameUpdate(form.name)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const handlePwSave = async () => {
    if (!newPw.trim() || newPw.length < 6) { setPwError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return }
    setPwError(''); setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwSaving(false)
    if (error) { setPwError(error.message); return }
    setOldPw(''); setNewPw('')
    setPwSaved(true); setTimeout(() => setPwSaved(false), 2000)
  }

  const joined = profile.created_at ? new Date(profile.created_at).toLocaleDateString('mn-MN') : '—'
  const dicebear = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(profile.name)}&backgroundColor=E5F7F7`

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: 0 }}>Профайл засах</h1>
        <p style={{ fontSize: 14, color: S3, fontWeight: 500, marginTop: 4 }}>Өөрийн мэдээллийг шинэчлэх</p>
      </div>
      <div style={{ maxWidth: 560 }}>
        {/* Avatar card */}
        <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '28px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ position: 'relative', cursor: 'pointer' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, overflow: 'hidden', border: '3px solid #E5F7F7' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dicebear} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {hover && <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: TX }}>{form.name}</div>
            <div style={{ fontSize: 13, color: S3, fontWeight: 500, marginTop: 2 }}>{profile.email}</div>
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: T2, background: '#E5F7F7', display: 'inline-block', padding: '4px 12px', borderRadius: 8 }}>
              Бүртгүүлсэн: {joined}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 16 }}>
          <div>
            <label style={labelSt}>Нэр</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputSt}
              onFocus={e => (e.target.style.borderColor = T)} onBlur={e => (e.target.style.borderColor = BR)} />
          </div>
          <div>
            <label style={labelSt}>Имэйл</label>
            <input value={form.email} readOnly style={{ ...inputSt, background: '#F9F7F4', color: S3 }} />
          </div>
          <div>
            <label style={labelSt}>Утасны дугаар</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputSt}
              onFocus={e => (e.target.style.borderColor = T)} onBlur={e => (e.target.style.borderColor = BR)} placeholder="Дугаараа оруулна уу" />
          </div>
          <SaveBtn saved={saved} saving={saving} onClick={handleSave} />
        </div>

        {/* Password */}
        <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: TX }}>Нууц үг солих</div>
          <div className="pw-flex" style={{ display: 'flex', gap: 12 }}>
            <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="Одоогийн нууц үг" style={{ ...inputSt, flex: 1 }}
              onFocus={e => (e.target.style.borderColor = T)} onBlur={e => (e.target.style.borderColor = BR)} />
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Шинэ нууц үг" style={{ ...inputSt, flex: 1 }}
              onFocus={e => (e.target.style.borderColor = T)} onBlur={e => (e.target.style.borderColor = BR)} />
          </div>
          {pwError && <div style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', borderRadius: 10, padding: '8px 12px' }}>{pwError}</div>}
          <SaveBtn saved={pwSaved} saving={pwSaving} onClick={handlePwSave} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════��══════════════════════════════
   CHILD PROFILE PANEL
══════════════════════════════════════════════ */
function ChildProfilePanel({ students, onUpdate, onDelete }: { students: Student[]; onUpdate: (id: string, name: string, grade: number) => void; onDelete: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState(students[0]?.id || '')
  const selected = students.find(s => s.id === selectedId)
  const [form, setForm] = useState({ name: selected?.name ?? '', grade_level: selected?.grade_level ?? 1 })
  const [saved, setSaved] = useState(false), [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])

  useEffect(() => {
    if (!selectedId) return
    const s = students.find(st => st.id === selectedId)
    if (s) setForm({ name: s.name, grade_level: s.grade_level })
    setSaved(false)
    supabase.from('enrollments').select('courses(title)').eq('student_id', selectedId)
      .then(({ data }) => setEnrolledCourses((data ?? []).map((e: any) => e.courses?.title).filter(Boolean)))
  }, [selectedId, students])

  if (!selected) return null

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('students').update({ name: form.name, grade_level: form.grade_level }).eq('id', selectedId)
    onUpdate(selectedId, form.name, form.grade_level)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm(`"${selected.name}"-г устгах уу? Энэ үйлдлийг буцааж болохгүй.`)) return
    setDeleting(true)
    await supabase.from('students').delete().eq('id', selectedId)
    onDelete(selectedId)
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: 0 }}>Хүүхдийн профайл</h1>
        <p style={{ fontSize: 14, color: S3, fontWeight: 500, marginTop: 4 }}>Хүүхдийнхээ мэдээллийг засах</p>
      </div>
      <ChildTabs students={students} selectedId={selectedId} onSelect={setSelectedId} />
      <div style={{ maxWidth: 560 }}>
        {/* Avatar card */}
        <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, overflow: 'hidden', border: '3px solid #E5F7F7' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarSrc(selected.avatar)} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: TX }}>{selected.name}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: '#E5F7F7', color: '#0D9488' }}>Түвшин {selected.level}</span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: '#FFF3D6', color: '#C4A77D' }}>{selected.points_total} оноо</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelSt}>Нэр</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputSt}
              onFocus={e => (e.target.style.borderColor = T)} onBlur={e => (e.target.style.borderColor = BR)} />
          </div>
          <div>
            <label style={labelSt}>Анги</label>
            <select value={form.grade_level} onChange={e => setForm({ ...form, grade_level: parseInt(e.target.value) })} style={{ ...inputSt, cursor: 'pointer' }}>
              {[1,2,3,4,5].map(g => <option key={g} value={g}>{g}-р анги</option>)}
            </select>
          </div>
          {enrolledCourses.length > 0 && (
            <div>
              <label style={labelSt}>Бүртгэлтэй хичээлүүд</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {enrolledCourses.map(c => (
                  <span key={c} style={{ padding: '6px 14px', borderRadius: 10, background: '#E5F7F7', color: '#0D9488', fontSize: 13, fontWeight: 700 }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          <SaveBtn saved={saved} saving={saving} onClick={handleSave} />

          <div style={{ borderTop: `1.5px solid #FEE2E2`, paddingTop: 20, marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 12 }}>Аюултай бүс</div>
            <button onClick={handleDelete} disabled={deleting}
              style={{ background: deleting ? '#FCA5A5' : '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 12, padding: '11px 22px', fontWeight: 700, fontSize: 14, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s' }}
              onMouseEnter={e => { if (!deleting) { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#FCA5A5' } }}
              onMouseLeave={e => { if (!deleting) { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#FECACA' } }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              {deleting ? 'Устгаж байна...' : `${selected.name}-г устгах`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════���═══════════════════════
   CHILD REPORT PANEL
══════════════════════════════════════════════ */
function ChildReportPanel({ students }: { students: Student[] }) {
  const [selectedId, setSelectedId] = useState(students[0]?.id || '')
  const [attempts, setAttempts] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    Promise.all([
      supabase.from('exercise_attempts')
        .select('exercise_id, score, correct_count, completed_at, exercises(title, points_reward, lessons(course_id, courses(title)))')
        .eq('student_id', selectedId)
        .order('completed_at', { ascending: false })
        .limit(200),
      supabase.from('enrollments')
        .select('course_id, courses(id, title, lessons(id, exercises(id)))')
        .eq('student_id', selectedId),
    ]).then(([ar, er]) => {
      setAttempts(ar.data ?? [])
      setEnrollments(er.data ?? [])
      setLoading(false)
    })
  }, [selectedId])

  const child = students.find(s => s.id === selectedId)
  if (!child) return null

  /* Stats */
  const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.score ?? 0), 0) / attempts.length) : 0
  const doneSet = new Set(attempts.map((a: any) => a.exercise_id))
  const doneExercises = doneSet.size
  const totalExercises = enrollments.reduce((sum: number, e: any) =>
    sum + (e.courses?.lessons ?? []).reduce((s2: number, l: any) => s2 + (l.exercises?.length ?? 0), 0), 0)

  /* Streak */
  const attemptDays = new Set(attempts.map((a: any) => a.completed_at?.split('T')[0]))
  let streak = 0
  const sd = new Date(); sd.setHours(0,0,0,0)
  while (true) {
    const ds = sd.toISOString().split('T')[0]
    if (attemptDays.has(ds)) { streak++; sd.setDate(sd.getDate() - 1) } else break
  }

  /* Monthly points (last 6 months) */
  const now = new Date()
  const monthly: number[] = [], monthLabels: string[] = []
  for (let i = 5; i >= 0; i--) {
    const mo = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const pts = attempts.filter((a: any) => {
      const d = new Date(a.completed_at)
      return d.getFullYear() === mo.getFullYear() && d.getMonth() === mo.getMonth()
    }).reduce((s: number, a: any) => s + (a.exercises?.points_reward ?? 0), 0)
    monthly.push(pts)
    monthLabels.push(`${mo.getMonth() + 1}-р сар`)
  }
  const maxPts = Math.max(...monthly, 1)

  /* Course progress */
  const donePerCourse: Record<string, Set<string>> = {}
  attempts.forEach((a: any) => {
    const cid = a.exercises?.lessons?.course_id
    if (!cid) return
    if (!donePerCourse[cid]) donePerCourse[cid] = new Set()
    donePerCourse[cid].add(a.exercise_id)
  })
  const courseProgress = enrollments.map((e: any) => {
    const cid = e.course_id
    const total = (e.courses?.lessons ?? []).reduce((s: number, l: any) => s + (l.exercises?.length ?? 0), 0)
    return { name: e.courses?.title ?? '—', color: courseColor(cid), total, done: donePerCourse[cid]?.size ?? 0 }
  })

  /* Recent activities */
  const recent = attempts.slice(0, 5).map((a: any) => ({
    date: a.completed_at?.split('T')[0] ?? '',
    action: a.exercises?.title ?? '—',
    course: a.exercises?.lessons?.courses?.title ?? '—',
    score: a.score ?? 0,
    points: a.exercises?.points_reward ?? 0,
  }))

  const stats = [
    { label: 'Дундаж оноо', val: avgScore + '%', bg: '#E5F7F7', color: '#0D9488' },
    { label: 'Гүйцэтгэсэн', val: `${doneExercises}/${totalExercises}`, bg: '#FFF3D6', color: '#C4A77D' },
    { label: 'Тасралтгүй өдөр', val: streak, bg: '#FCE4E4', color: '#D97B7B' },
    { label: 'Нийт оноо', val: child.points_total, bg: '#EDE5F7', color: '#7B68AE' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: 0 }}>Хүүхдийн тайлан</h1>
        <p style={{ fontSize: 14, color: S3, fontWeight: 500, marginTop: 4 }}>Сурлагын явцыг дэлгэрэнгүй харах</p>
      </div>
      <ChildTabs students={students} selectedId={selectedId} onSelect={setSelectedId} />

      {loading ? (
        <div style={{ color: S3, fontWeight: 600, padding: '40px 0', textAlign: 'center' }}>Уншиж байна...</div>
      ) : (
        <>
          {/* Stats row */}
          <div className="stats-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '18px' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: s.color, opacity: 0.8, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Course progress */}
            <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '22px 24px' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: TX, marginBottom: 18 }}>Хичээлийн явц</div>
              {courseProgress.length === 0 && <div style={{ color: S3, fontSize: 13 }}>Бүртгэлтэй хичээл байхгүй</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {courseProgress.map(cp => {
                  const pct = cp.total > 0 ? Math.round((cp.done / cp.total) * 100) : 0
                  return (
                    <div key={cp.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: TX }}>{cp.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: cp.color }}>{pct}%</span>
                      </div>
                      <div style={{ height: 10, background: '#F3F0EB', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: cp.color, borderRadius: 5, transition: 'width .6s ease' }} />
                      </div>
                      <div style={{ fontSize: 11, color: S3, fontWeight: 600, marginTop: 4 }}>{cp.done}/{cp.total} дасгал гүйцэтгэсэн</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Monthly chart */}
            <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '22px 24px' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: TX, marginBottom: 18 }}>Сарын оноо</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
                {monthly.map((pts, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T }}>{pts}</span>
                    <div style={{ width: '100%', borderRadius: 6, height: `${Math.max((pts / maxPts) * 100, 8)}px`, background: 'linear-gradient(180deg,#7AD1D1,#B8E8E8)', transition: 'height .5s ease' }} />
                    <span style={{ fontSize: 10, color: S3, fontWeight: 600 }}>{monthLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activities */}
          <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '22px 24px' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: TX, marginBottom: 16 }}>Сүүлийн үйл ажиллагаа</div>
            {recent.length === 0 && <div style={{ color: S3, fontSize: 13 }}>Дасгал гүйцэтгэсэн бүртгэл байхгүй</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recent.map((act, i) => {
                const sc = act.score >= 80 ? '#14B8A6' : act.score >= 60 ? '#F59E0B' : '#E8A5A5'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14, background: i % 2 === 0 ? '#FDFCFA' : 'white' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${sc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: sc }}>{act.score}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: TX }}>{act.action}</div>
                      <div style={{ fontSize: 12, color: S3, fontWeight: 500, marginTop: 2 }}>{act.course} · {act.date}</div>
                    </div>
                    <div style={{ background: '#FFF3D6', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 12 }}>⭐</span>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#C4A77D' }}>+{act.points}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ═══════════��══════════════════════════════════
   SCREEN TIME PANEL  (UI — localStorage limits)
══════════════════════��═══════════════════════ */
function ScreenTimePanel({ students }: { students: Student[] }) {
  const [selectedId, setSelectedId] = useState(students[0]?.id || '')
  const [attempts, setAttempts] = useState<any[]>([])
  const [limit, setLimit] = useState(60)
  const [scheduleEnabled, setScheduleEnabled] = useState(true)
  const [schedule, setSchedule] = useState({ start: '15:00', end: '19:00' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!selectedId) return
    setLimit(60); setScheduleEnabled(true); setSchedule({ start: '15:00', end: '19:00' })
    setSaved(false)
    supabase.from('screen_time_settings').select('*').eq('student_id', selectedId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLimit(data.daily_limit_minutes)
          setScheduleEnabled(data.schedule_enabled)
          setSchedule({ start: (data.schedule_start as string).slice(0, 5), end: (data.schedule_end as string).slice(0, 5) })
        }
      })
    const today = new Date().toISOString().split('T')[0]
    supabase.from('exercise_attempts')
      .select('completed_at')
      .eq('student_id', selectedId)
      .gte('completed_at', today + 'T00:00:00')
      .then(({ data }) => setAttempts(data ?? []))
  }, [selectedId])

  const child = students.find(s => s.id === selectedId)
  if (!child) return null

  const usedToday = attempts.length * 5
  const usedPct = Math.min((usedToday / limit) * 100, 100)
  const remaining = Math.max(limit - usedToday, 0)

  /* Weekly: fetch attempts last 7 days */
  const [weekly, setWeekly] = useState<number[]>([0,0,0,0,0,0,0])
  useEffect(() => {
    if (!selectedId) return
    const d7 = new Date(); d7.setDate(d7.getDate() - 6); d7.setHours(0,0,0,0)
    supabase.from('exercise_attempts')
      .select('completed_at')
      .eq('student_id', selectedId)
      .gte('completed_at', d7.toISOString())
      .then(({ data }) => {
        const counts: number[] = Array(7).fill(0)
        ;(data ?? []).forEach((a: any) => {
          const day = new Date(a.completed_at)
          const diff = Math.floor((Date.now() - day.getTime()) / 86400000)
          const idx = 6 - diff
          if (idx >= 0 && idx < 7) counts[idx] += 5
        })
        setWeekly(counts)
      })
  }, [selectedId])

  const maxW = Math.max(...weekly, 1)
  const presets = [30, 45, 60, 90, 120]

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('screen_time_settings').upsert({
      student_id: selectedId,
      daily_limit_minutes: limit,
      schedule_enabled: scheduleEnabled,
      schedule_start: schedule.start,
      schedule_end: schedule.end,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const arcColor = usedPct >= 90 ? '#E8A5A5' : usedPct >= 70 ? '#F59E0B' : T
  const dashArray = `${usedPct * 4.4} ${440 - usedPct * 4.4}`

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, margin: 0 }}>Дэлгэцийн цаг</h1>
        <p style={{ fontSize: 14, color: S3, fontWeight: 500, marginTop: 4 }}>Хүүхдийн апп ашиглах хугацааг тохируулах</p>
      </div>
      <ChildTabs students={students} selectedId={selectedId} onSelect={setSelectedId} />

      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Today's usage */}
        <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '28px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: TX, marginBottom: 20 }}>Өнөөдрийн хэрэглээ</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 160, height: 160 }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="70" fill="none" stroke="#F3F0EB" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" fill="none" stroke={arcColor} strokeWidth="12" strokeLinecap="round" strokeDasharray={dashArray} style={{ transition: 'stroke-dasharray .6s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: TX }}>{usedToday}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: S3 }}>минут / {limit}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <div style={{ background: '#E5F7F7', borderRadius: 12, padding: '10px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0D9488' }}>{remaining}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T2 }}>минут үлдсэн</div>
            </div>
            <div style={{ background: usedPct >= 90 ? '#FCE4E4' : '#FFF3D6', borderRadius: 12, padding: '10px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: usedPct >= 90 ? '#D97B7B' : '#C4A77D' }}>{Math.round(usedPct)}%</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: usedPct >= 90 ? '#E8A5A5' : '#C4A77D' }}>ашигласан</div>
            </div>
          </div>
        </div>

        {/* Limit settings */}
        <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: TX, marginBottom: 20 }}>Хязгаар тохируулах</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: S2 }}>Өдрийн хязгаар</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: T }}>{limit} мин</span>
            </div>
            <input type="range" min="15" max="180" step="15" value={limit} onChange={e => setLimit(parseInt(e.target.value))}
              style={{ width: '100%', height: 8, appearance: 'none', borderRadius: 4, background: `linear-gradient(to right,#7AD1D1 ${((limit-15)/165)*100}%,#F3F0EB ${((limit-15)/165)*100}%)`, outline: 'none', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: S3, fontWeight: 600 }}>15 мин</span>
              <span style={{ fontSize: 10, color: S3, fontWeight: 600 }}>3 цаг</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {presets.map(p => (
              <button key={p} onClick={() => setLimit(p)}
                style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${limit === p ? T : BR}`, background: limit === p ? '#E5F7F7' : 'white', color: limit === p ? '#0D9488' : S2, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s' }}>
                {p >= 60 ? `${p/60} цаг` : `${p} мин`}
              </button>
            ))}
          </div>
          {/* Schedule */}
          <div style={{ background: '#FDFCFA', borderRadius: 14, padding: '16px', border: `1.5px solid #F3F0EB`, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: TX }}>Цагийн хуваарь</span>
              <button onClick={() => setScheduleEnabled(!scheduleEnabled)}
                style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: scheduleEnabled ? T : BR, position: 'relative', transition: 'background .2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: scheduleEnabled ? 23 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
              </button>
            </div>
            {scheduleEnabled && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: S3, display: 'block', marginBottom: 4 }}>Эхлэх</label>
                  <input type="time" value={schedule.start} onChange={e => setSchedule({ ...schedule, start: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${BR}`, fontSize: 14, fontWeight: 600, fontFamily: "'Nunito',sans-serif", color: TX, outline: 'none' }} />
                </div>
                <span style={{ fontSize: 16, color: '#D1D5DB', fontWeight: 700, marginTop: 16 }}>—</span>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: S3, display: 'block', marginBottom: 4 }}>Дуусах</label>
                  <input type="time" value={schedule.end} onChange={e => setSchedule({ ...schedule, end: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${BR}`, fontSize: 14, fontWeight: 600, fontFamily: "'Nunito',sans-serif", color: TX, outline: 'none' }} />
                </div>
              </div>
            )}
          </div>
          <SaveBtn saved={saved} saving={saving} onClick={handleSave} />
        </div>
      </div>

      {/* Weekly chart */}
      <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '22px 24px', marginTop: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: TX, marginBottom: 18 }}>7 хоногийн хэрэглээ</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
          {weekly.map((mins, i) => {
            const over = mins > limit
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: over ? '#E8A5A5' : T }}>{mins}</span>
                <div style={{ width: '100%', borderRadius: 6, height: `${Math.max((mins / maxW) * 90, 8)}px`, background: over ? 'linear-gradient(180deg,#E8A5A5,#F5D1D1)' : 'linear-gradient(180deg,#7AD1D1,#B8E8E8)', transition: 'height .5s ease' }} />
                <span style={{ fontSize: 11, color: S3, fontWeight: 600 }}>{DAYS_MN[(new Date().getDay() - (6 - i) + 7) % 7]}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'center' }}>
          <div style={{ width: 20, height: 2, background: '#E8A5A5', borderRadius: 1 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: S3 }}>Хязгаараас хэтэрсэн = улаан</span>
        </div>
      </div>
    </div>
  )
}

// ChatbotPanel — disabled (TODO: implement with real AI backend)

/* ═══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function ParentDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('profile')
  const [collapsed, setCollapsed] = useState(false)
  const [panelKey, setPanelKey] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const user = session.user
      setUserId(user.id)
      const { data: p } = await supabase.from('profiles').select('id,name,email,created_at').eq('id', user.id).single()
      if (p) setProfile(p as Profile)
      const { data: s } = await supabase.from('students').select('id,name,grade_level,avatar,points_total,xp_total,stars,level').eq('parent_id', user.id).order('created_at')
      setStudents((s as Student[]) ?? [])
      setLoading(false)
    }
    init()
  }, [router])

  const handleTab = (t: Tab) => { setTab(t); setPanelKey(k => k + 1) }
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  const handleChildUpdate = (id: string, name: string, grade: number) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, name, grade_level: grade } : s))
  }

  const handleChildDelete = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id))
    setTab('child-profile')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: S3, fontFamily: 'Nunito,sans-serif', fontWeight: 600 }}>
      Уншиж байна...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', sans-serif; -webkit-font-smoothing: antialiased; background: #FAF7F2; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5DDD3; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #C4A77D; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .panel-enter { animation: fadeIn 0.25s ease both; }
        @keyframes dotPulse { 0%,80%,100% { opacity:.3; transform:scale(.8); } 40% { opacity:1; transform:scale(1); } }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:#7AD1D1; border:3px solid white; box-shadow:0 2px 6px rgba(122,209,209,.4); cursor:pointer; }

        /* ── Mobile responsive ── */
        .mob-ham { display: none; }
        .mob-overlay { display: none; }
        @media (max-width: 768px) {
          .dash-sidebar {
            position: fixed !important;
            height: 100vh !important;
            top: 0 !important;
            left: -290px !important;
            z-index: 200 !important;
            transition: left 0.28s cubic-bezier(.4,0,.2,1) !important;
            width: 272px !important;
          }
          .dash-sidebar.mob-open {
            left: 0 !important;
            box-shadow: 4px 0 28px rgba(0,0,0,0.18) !important;
          }
          .mob-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.38);
            z-index: 199;
          }
          .mob-ham { display: flex !important; }
          .dash-topbar { padding: 10px 16px !important; }
          .dash-search-area { display: none !important; }
          .dash-content { padding: 16px 16px 48px !important; }
          .stats-4col { grid-template-columns: repeat(2, 1fr) !important; }
          .grid-2col { grid-template-columns: 1fr !important; }
          .pw-flex { flex-direction: column !important; }
        }
        @media (min-width: 769px) {
          .mob-ham { display: none !important; }
          .mob-overlay { display: none !important; }
        }
      `}</style>

      {mobileOpen && <div className="mob-overlay" onClick={() => setMobileOpen(false)} />}
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Nunito, sans-serif' }}>
        <Sidebar active={tab} onTab={handleTab} profile={profile} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} onLogout={handleLogout} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: BG }}>
          {/* Top bar */}
          <header className="dash-topbar" style={{ position: 'sticky', top: 0, zIndex: 5, background: 'rgba(250,247,242,.92)', backdropFilter: 'blur(12px)', borderBottom: `1.5px solid ${BR}`, padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="mob-ham" onClick={() => setMobileOpen(true)} style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={S2} strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <span style={{ fontSize: 13, color: S3, fontWeight: 600 }}>
                {new Date().toLocaleDateString('mn-MN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="dash-search-area" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 10, padding: '8px 14px', border: `1.5px solid ${BR}`, minWidth: 200 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" placeholder="Хайх..." style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 500, color: TX, width: '100%' }} />
              </div>
              <button style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S2} strokeWidth="2" strokeLinecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#E8A5A5', border: '1.5px solid white' }} />
              </button>
            </div>
          </header>

          <div key={panelKey} className="panel-enter dash-content" style={{ padding: '28px 32px 48px' }}>
            {tab === 'profile' && profile && (
              <ParentProfilePanel profile={profile} userId={userId} onNameUpdate={name => setProfile(p => p ? { ...p, name } : p)} />
            )}
            {tab === 'child-profile' && (
              students.length === 0
                ? <div style={{ color: S3, fontWeight: 600, padding: '40px 0', textAlign: 'center' }}>Хүүхэд нэмэгдээгүй байна. <button onClick={() => router.push('/parent/children')} style={{ color: T, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>Нэмэх →</button></div>
                : <ChildProfilePanel students={students} onUpdate={handleChildUpdate} onDelete={handleChildDelete} />
            )}
            {tab === 'child-report' && (
              students.length === 0
                ? <div style={{ color: S3, fontWeight: 600, padding: '40px 0', textAlign: 'center' }}>Хүүхэд нэмэгдээгүй байна.</div>
                : <ChildReportPanel students={students} />
            )}
            {tab === 'screentime' && (
              students.length === 0
                ? <div style={{ color: S3, fontWeight: 600, padding: '40px 0', textAlign: 'center' }}>Хүүхэд нэмэгдээгүй байна.</div>
                : <ScreenTimePanel students={students} />
            )}
            {/* {tab === 'chatbot' && <ChatbotPanel />} */}
          </div>
        </main>
      </div>
    </>
  )
}
