'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { xpProgress } from '@/lib/xp'

/* ---------- Types ---------- */
interface Student {
  id: string; name: string; avatar: string
  grade_level: number; points_balance: number; points_total: number
  xp_total: number; level: number
}
interface Achievement {
  id: string; icon: string; color: string; title: string; desc: string
  progress?: { current: number; total: number; unit: string }
}

/* ---------- Constants ---------- */
const AVATARS: Record<string, string> = {
  bear: '/avatars/bear head.png', cat: '/avatars/elephant head.png',
  dog: '/avatars/hippo head.png', rabbit: '/avatars/lion head.png',
  penguin: '/avatars/panda head.png', fox: '/avatars/tiger head.png',
}
const T  = '#7AD1D1'
const BG = '#FAF7F2'
const BR = '#E5DDD3'
const TX = '#3D3D3D'
const S3 = '#9CA3AF'

/* ---------- Achievement helpers ---------- */
function buildAchievements(
  student: Student, attemptCount: number, streak: number
): Achievement[] {
  return [
    { id: 'a1',  icon: '🎯', color: '#7AD1D1', title: 'Анхны алхам',      desc: 'Хамгийн анхны дасгалаа амжилттай гүйцэтгэлээ.' },
    { id: 'a2',  icon: '🔥', color: '#E8A5A5', title: 'Тэсвэр хатуужил',  desc: '7 хоног дараалан хичээллэвэл нээгдэнэ.',        progress: { current: Math.min(streak, 7),        total: 7,   unit: 'хоног' } },
    { id: 'a3',  icon: '⭐', color: '#C4A77D', title: 'Од цуглуулагч',    desc: 'Нийт 100 од цуглууллаа.' },
    { id: 'a4',  icon: '🏆', color: '#E8A5A5', title: 'Төгс оноо',         desc: 'Дасгалыг нэг ч алдаагүй бөглөлөө.' },
    { id: 'a5',  icon: '📚', color: '#7AD1D1', title: 'Хичээлч',           desc: 'Эхний бүтэн хичээлээ дуусгалаа.' },
    { id: 'a6',  icon: '🧠', color: '#9B8BBC', title: 'IQ мастер',         desc: '20 дасгал давбал нээгдэнэ.',                    progress: { current: Math.min(attemptCount, 20), total: 20,  unit: 'дасгал' } },
    { id: 'a7',  icon: '📖', color: '#C4A77D', title: 'Номын хорхой',      desc: '5 үлгэр уншиж дуусгавал нээгдэнэ.',             progress: { current: 0,                          total: 5,   unit: 'үлгэр' } },
    { id: 'a8',  icon: '⚡', color: '#7AD1D1', title: 'Хурдан ухаан',      desc: 'Дасгалыг 1 минутад багтаан дуусгалаа.' },
    { id: 'a9',  icon: '🌟', color: '#C4A77D', title: 'Түвшин 5',          desc: '5 дугаар түвшинд хүрлээ.' },
    { id: 'a10', icon: '🎮', color: '#9B8BBC', title: 'Тоглоомч',          desc: '20 тоглоом тоглож дуусгалаа.',                  progress: { current: Math.min(attemptCount, 20), total: 20,  unit: 'тоглоом' } },
    { id: 'a11', icon: '💎', color: '#7AD1D1', title: 'Эрдэнэсийн сан',   desc: '500 од цуглуулбал нээгдэнэ.',                   progress: { current: Math.min(student.points_balance, 500), total: 500, unit: 'од' } },
    { id: 'a12', icon: '🦉', color: '#9B8BBC', title: 'Эрт босогч',        desc: 'Өглөө 7 цагаас өмнө хичээллэвэл нээгдэнэ.',    progress: { current: 0,                          total: 1,   unit: 'удаа' } },
  ]
}

function computeEarnedIds(student: Student, attemptCount: number, enrollmentCount: number, streak: number): string[] {
  const ids: string[] = []
  if (attemptCount >= 1)              ids.push('a1')
  if (streak >= 7)                    ids.push('a2')
  if (student.points_balance >= 100)  ids.push('a3')
  if (enrollmentCount >= 1)           ids.push('a5')
  if (attemptCount >= 20)             ids.push('a6', 'a10')
  if (student.level >= 5)             ids.push('a9')
  return ids
}

function computeStreak(dates: string[]): number {
  const daySet = new Set(dates)
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (!daySet.has(d.toISOString().split('T')[0])) d.setDate(d.getDate() - 1)
  let streak = 0
  while (daySet.has(d.toISOString().split('T')[0])) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

/* ---------- Achievement Tile ---------- */
function AchTile({ ach, earned, onClick }: { ach: Achievement; earned: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        transition: 'transform 0.15s', transform: hover ? 'translateY(-4px)' : 'translateY(0)',
      }}>
      <div style={{
        position: 'relative', width: 104, height: 104, borderRadius: 28,
        background: earned ? `${ach.color}22` : '#F1EEE9',
        border: earned ? `2.5px solid ${ach.color}` : `2px solid ${BR}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: earned ? (hover ? `0 12px 26px ${ach.color}44` : `0 6px 16px ${ach.color}33`) : 'none',
        transition: 'all 0.15s',
      }}>
        <span style={{ fontSize: 46, lineHeight: 1, filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.4 }}>{ach.icon}</span>
        {!earned && (
          <div style={{
            position: 'absolute', bottom: -8, right: -8, width: 32, height: 32, borderRadius: '50%',
            background: 'white', border: `2px solid ${BR}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: S3,
          }}>🔒</div>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3, textAlign: 'center', color: earned ? TX : S3, maxWidth: 130 }}>{ach.title}</div>
    </button>
  )
}

/* ---------- Achievement Modal ---------- */
function AchModal({ ach, earned, onClose }: { ach: Achievement | null; earned: boolean; onClose: () => void }) {
  if (!ach) return null
  const p = ach.progress
  const pct = p ? Math.min(p.current / p.total * 100, 100) : 0
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(45,40,35,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 28, width: '100%', maxWidth: 420,
        padding: '34px 32px 30px', position: 'relative',
        boxShadow: '0 24px 60px rgba(0,0,0,0.24)', textAlign: 'center',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: 12,
          background: '#F1EEE9', border: 'none', cursor: 'pointer', color: S3,
          fontSize: 18, fontWeight: 700, lineHeight: 1, fontFamily: 'inherit',
        }}>×</button>
        <div style={{
          width: 104, height: 104, borderRadius: 32, margin: '0 auto 18px',
          background: earned ? `${ach.color}22` : '#F1EEE9',
          border: earned ? `3px solid ${ach.color}` : `2px solid ${BR}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: earned ? `0 10px 26px ${ach.color}33` : 'none',
        }}>
          <span style={{ fontSize: 52, filter: earned ? 'none' : 'grayscale(1)', opacity: earned ? 1 : 0.4 }}>{ach.icon}</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: TX }}>{ach.title}</div>
        <div style={{ marginTop: 7, fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: earned ? ach.color : S3 }}>
          {earned ? '✓ Авсан' : 'Аваагүй'}
        </div>
        <div style={{ marginTop: 14, fontSize: 15, color: '#6B7280', lineHeight: 1.55 }}>{ach.desc}</div>
        {!earned && p && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: S3 }}>Явц</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: TX }}>{p.current} / {p.total} {p.unit}</span>
            </div>
            <div style={{ height: 11, background: '#F1EEE9', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: ach.color, borderRadius: 6 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Stat Card ---------- */
function StatCard({ icon, value, label, accent }: { icon: string; value: string | number; label: string; accent: string }) {
  return (
    <div style={{
      flex: '1 1 180px', background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`,
      padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      display: 'flex', alignItems: 'center', gap: 16, minWidth: 0,
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: accent, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: S3, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

/* ---------- Page ---------- */
export default function StudentProfilePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [student,         setStudent]         = useState<Student | null>(null)
  const [streak,          setStreak]          = useState(0)
  const [attemptCount,    setAttemptCount]    = useState(0)
  const [enrollmentCount, setEnrollmentCount] = useState(0)
  const [loading,         setLoading]         = useState(true)
  const [sheet,           setSheet]           = useState<Achievement | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) { router.push('/'); return }

      const { data: s } = await supabase
        .from('students').select('*').eq('id', id).eq('parent_id', user.id).single()
      if (!s) { router.push('/parent/children'); return }
      setStudent(s)

      const [{ data: attempts }, { data: enr }] = await Promise.all([
        supabase.from('exercise_attempts').select('completed_at').eq('student_id', id)
          .order('completed_at', { ascending: false }).limit(500),
        supabase.from('enrollments').select('id').eq('student_id', id),
      ])

      const dates = (attempts ?? []).map((a: any) => a.completed_at.split('T')[0])
      setStreak(computeStreak(dates))
      setAttemptCount((attempts ?? []).length)
      setEnrollmentCount((enr ?? []).length)
      setLoading(false)
    }
    init()
  }, [id, router])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: S3, fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 600 }}>
      Уншиж байна...
    </div>
  )
  if (!student) return null

  const { xpIntoLevel, xpNeeded, pct: levelPct } = xpProgress(student.xp_total ?? 0)
  const toNext      = xpNeeded - xpIntoLevel
  const achievements = buildAchievements(student, attemptCount, streak)
  const earnedIds   = computeEarnedIds(student, attemptCount, enrollmentCount, streak)
  const earned      = achievements.filter(a => earnedIds.includes(a.id))

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; } body { font-family: 'Nunito', sans-serif; background: ${BG}; }`}</style>

      <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Nunito, sans-serif', paddingBottom: 80 }}>

        {/* Full-bleed teal header */}
        <div style={{ background: `linear-gradient(135deg, ${T} 0%, #9CE0E0 100%)`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: 80,  width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: 120, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

          <div style={{ maxWidth: 1080, margin: '0 auto', padding: '22px clamp(20px,4vw,48px) 36px', position: 'relative', zIndex: 1 }}>
            {/* Top row: back + star pill */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <button onClick={() => router.back()}
                style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>⭐</span>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>{student.points_balance}</span>
              </div>
            </div>

            {/* Profile row: avatar + name + XP bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
              <div style={{ width: 120, height: 120, borderRadius: 32, overflow: 'hidden', flexShrink: 0, border: '4px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={AVATARS[student.avatar] ?? AVATARS['bear']} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  Миний профайл
                </div>
                <div style={{ color: 'white', fontWeight: 900, fontSize: 34, lineHeight: 1.1 }}>{student.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 700, marginTop: 6 }}>
                  {student.grade_level}-р анги · Түвшин {student.level}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                  <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.22)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${levelPct}%`, height: '100%', background: '#FFF3D6', borderRadius: 5, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }}>
                    Дараагийн түвшинд {toNext} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '36px clamp(20px,4vw,48px) 0' }}>

          {/* Stat cards */}
          <div style={{ display: 'flex', gap: 18, marginBottom: 40, flexWrap: 'wrap' }}>
            <StatCard icon="🏅" value={student.level}                        label="Түвшин"          accent="#7AD1D1" />
            <StatCard icon="✨" value={student.points_total.toLocaleString()} label="Нийт оноо"       accent="#C4A77D" />
            <StatCard icon="⭐" value={student.points_balance}                label="Од"              accent="#E8A5A5" />
            <StatCard icon="🔥" value={streak}                                label="Дараалсан хоног" accent="#9B8BBC" />
          </div>

          {/* Шагнал header — clicks through to all achievements */}
          <button onClick={() => router.push(`/student/${id}/profile/achievements`)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            padding: 0, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: TX }}>Шагнал</span>
              <span style={{ background: '#FFF3D6', color: '#C4A77D', fontWeight: 900, fontSize: 15, borderRadius: 10, padding: '3px 12px' }}>
                {earned.length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: S3, fontWeight: 800, fontSize: 15 }}>
              Бүгдийг харах
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </button>

          {/* Earned achievements grid (color) — or empty state */}
          {earned.length > 0 ? (
            <div style={{
              background: 'white', borderRadius: 24, border: `1.5px solid ${BR}`,
              padding: '38px 32px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '36px 16px', justifyItems: 'center',
            }}>
              {earned.map(a => <AchTile key={a.id} ach={a} earned={true} onClick={() => setSheet(a)} />)}
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 24, border: `1.5px solid ${BR}`, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎁</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: TX }}>Шагнал хараахан байхгүй</div>
              <div style={{ fontSize: 15, color: S3, marginTop: 6 }}>Дасгал хийж эхний шагналаа аваарай!</div>
            </div>
          )}
        </div>
      </div>

      <AchModal ach={sheet} earned={true} onClose={() => setSheet(null)} />
    </>
  )
}
