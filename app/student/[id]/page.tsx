'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { xpProgress } from '@/lib/xp'

/* ---------- Types ---------- */
interface Student {
  id: string; name: string; avatar: string
  grade_level: number; points_balance: number; points_total: number; xp_total: number; level: number
}
interface Exercise {
  id: string; title: string; game_type: string; points_reward: number
  lessonId: string; lessonTitle: string; courseTitle: string; courseColor: string
}
interface Lesson {
  id: string; title: string; type: string; order_index: number
  exercises: { id: string; title: string; game_type: string; points_reward: number }[]
}
interface Course {
  id: string; title: string; description: string | null
  grade_level: number; color: string; icon: string
  lessons: Lesson[]
  is_enrolled: boolean
}

/* ---------- Constants ---------- */
const AVATARS: Record<string, string> = {
  bear: '/avatars/bear head.png', cat: '/avatars/elephant head.png',
  dog: '/avatars/hippo head.png', rabbit: '/avatars/lion head.png',
  penguin: '/avatars/panda head.png', fox: '/avatars/tiger head.png',
}
const GAME_LABELS: Record<string, string> = {
  SIMPLE_QUIZ: 'Асуулт', DRAG_DROP: 'Чирж тавих', MATCHING: 'Хос тааруулах',
  PATTERN: 'Дараалал', ODD_ONE_OUT: 'Өөр нэгийг ол', CATEGORY_SORT: 'Ангилал',
  SEQUENCE_REPEAT: 'Дараалал давтах', READ_REMEMBER: 'Уншиж санаарай', MATCHSTICK: 'Хутга',
}
const GAME_ICONS: Record<string, string> = {
  SIMPLE_QUIZ: '❓', DRAG_DROP: '✋', MATCHING: '🔗', PATTERN: '🔢',
  ODD_ONE_OUT: '🎯', CATEGORY_SORT: '📂', SEQUENCE_REPEAT: '🎵', READ_REMEMBER: '📖', MATCHSTICK: '🔥',
}
const PALETTE = ['#7AD1D1', '#E8A5A5', '#9B8BBC', '#C4A77D', '#8BC4A5', '#B5C4E8']
const ICONS   = ['📖', '🔢', '🌿', '🌎', '🎨', '🎵']

function courseColor(id: string) { const n = id.charCodeAt(0) % PALETTE.length; return PALETTE[n] }
function courseIcon(id: string)  { const n = id.charCodeAt(0) % ICONS.length;   return ICONS[n]   }

/* brand tokens */
const T  = '#7AD1D1'
const BG = '#FAF7F2'
const BR = '#E5DDD3'
const TX = '#3D3D3D'
const S2 = '#6B7280'
const S3 = '#9CA3AF'
const GD = '#C4A77D'

/* ---------- Exercise Card ---------- */
function ExCard({ ex, onPlay }: { ex: Exercise; onPlay: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onPlay}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', background: 'white', borderRadius: 16,
        border: `2px solid ${hover ? ex.courseColor : BR}`,
        padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
        transition: 'all 200ms ease',
      }}>
      <div style={{ width: 48, height: 48, borderRadius: 16, background: `${ex.courseColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {GAME_ICONS[ex.game_type] ?? '🎮'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: TX, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: ex.courseColor }}>{GAME_LABELS[ex.game_type] ?? ex.game_type}</span>
          <span style={{ fontSize: 11, color: '#D1D5DB' }}>·</span>
          <span style={{ fontSize: 11, color: S3, fontWeight: 600 }}>{ex.courseTitle}</span>
        </div>
      </div>
      <div style={{ background: '#FFF3D6', borderRadius: 10, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 13 }}>⭐</span>
        <span style={{ fontWeight: 800, fontSize: 14, color: GD }}>+{ex.points_reward}</span>
      </div>
    </button>
  )
}

/* ---------- Enrolled Course Card ---------- */
function EnrolledCard({ course, expanded, onToggle, onLesson }: {
  course: Course; expanded: boolean
  onToggle: () => void; onLesson: (l: Lesson) => void
}) {
  const totalEx = course.lessons.reduce((s, l) => s + l.exercises.length, 0)
  return (
    <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      <button onClick={onToggle}
        style={{ width: '100%', padding: '16px 18px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 14, background: 'transparent', border: 'none', textAlign: 'left' }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: `${course.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          {course.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: TX }}>{course.title}</div>
          <div style={{ fontSize: 12, color: S3, fontWeight: 600, marginTop: 2 }}>{course.lessons.length} хичээл · {totalEx} дасгал</div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={S3} strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {expanded && (
        <div style={{ borderTop: `1.5px solid #F3F0EB`, padding: '8px 12px 12px' }}>
          {course.lessons.map((lesson, idx) => {
            const isFT = lesson.type === 'FAIRY_TALE'
            return (
              <button key={lesson.id} onClick={() => onLesson(lesson)}
                style={{ width: '100%', padding: '12px 8px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', textAlign: 'left', borderRadius: 12, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#F9F7F4'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: isFT ? '#FFF3D6' : `${course.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0, color: isFT ? GD : course.color }}>
                  {isFT ? '📖' : idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: TX }}>{lesson.title}</div>
                  <div style={{ fontSize: 11, color: S3, fontWeight: 600, marginTop: 1 }}>{isFT ? 'Үлгэр' : `${lesson.exercises.length} дасгал`}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---------- Discover Course Card ---------- */
function DiscoverCard({ course, enrolling, onEnroll }: { course: Course; enrolling: boolean; onEnroll: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: 'white', borderRadius: 20, border: `2px solid ${hover ? course.color : BR}`, padding: '18px', transition: 'all 200ms ease', transform: hover ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.06)' : '0 1px 4px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: `${course.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
          {course.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: TX, marginBottom: 4 }}>{course.title}</div>
          {course.description && <div style={{ fontSize: 13, color: S2, lineHeight: 1.5, marginBottom: 10 }}>{course.description}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{course.lessons.length} хичээл</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${course.color}15`, color: course.color }}>{course.grade_level}-р анги</span>
          </div>
          <button onClick={onEnroll} disabled={enrolling}
            style={{ background: course.color, color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: enrolling ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: enrolling ? 0.6 : 1, transition: 'all 0.15s' }}>
            {enrolling ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Page ---------- */
interface ScreenTimeSettings {
  daily_limit_minutes: number
  schedule_enabled: boolean
  schedule_start: string
  schedule_end: string
}

function isOutsideSchedule(s: ScreenTimeSettings): boolean {
  if (!s.schedule_enabled) return false
  const now = new Date()
  const nowM = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = s.schedule_start.slice(0, 5).split(':').map(Number)
  const [eh, em] = s.schedule_end.slice(0, 5).split(':').map(Number)
  return nowM < sh * 60 + sm || nowM >= eh * 60 + em
}

export default function StudentPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'play' | 'courses' | 'discover'>('play')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [screenTimeBlock, setScreenTimeBlock] = useState<null | 'limit' | 'schedule'>(null)
  const [screenTimeSettings, setScreenTimeSettings] = useState<ScreenTimeSettings | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) { router.push('/'); return }

      const { data: s } = await supabase.from('students').select('*').eq('id', id).eq('parent_id', user.id).single()
      if (!s) { router.push('/parent/children'); return }
      setStudent(s)

      /* Check screen time */
      const today = new Date().toISOString().split('T')[0]
      const [{ data: stData }, { data: todayAttempts }] = await Promise.all([
        supabase.from('screen_time_settings').select('*').eq('student_id', id).maybeSingle(),
        supabase.from('exercise_attempts').select('id').eq('student_id', id).gte('completed_at', today + 'T00:00:00'),
      ])
      if (stData) {
        const st: ScreenTimeSettings = stData
        setScreenTimeSettings(st)
        const usedMinutes = (todayAttempts ?? []).length * 5
        if (usedMinutes >= st.daily_limit_minutes) { setScreenTimeBlock('limit'); setLoading(false); return }
        if (isOutsideSchedule(st)) { setScreenTimeBlock('schedule'); setLoading(false); return }
      }

      /* Fetch published courses with lessons and exercises */
      const { data: rawCourses } = await supabase
        .from('courses').select(`id, title, description, grade_level, lessons ( id, title, type, order_index, exercises ( id, title, game_type, points_reward ) )`)
        .eq('status', 'PUBLISHED').order('created_at', { ascending: false })

      /* Fetch enrollments for this child */
      const { data: enr } = await supabase.from('enrollments').select('course_id').eq('student_id', id)
      const enrolledIds = new Set((enr ?? []).map(e => e.course_id))

      const courses: Course[] = (rawCourses ?? []).map((c: any) => ({
        id: c.id, title: c.title, description: c.description,
        grade_level: c.grade_level, color: courseColor(c.id), icon: courseIcon(c.id),
        is_enrolled: enrolledIds.has(c.id),
        lessons: (c.lessons ?? [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((l: any) => ({ ...l, exercises: l.exercises ?? [] })),
      }))
      setAllCourses(courses)
      setLoading(false)
    }
    init()
  }, [id, router])

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId)
    await supabase.from('enrollments').insert({ student_id: id, course_id: courseId })
    setAllCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_enrolled: true } : c))
    setEnrollingId(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: S3, fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 600 }}>
      Уншиж байна...
    </div>
  )

  if (screenTimeBlock && screenTimeSettings) {
    const isLimit = screenTimeBlock === 'limit'
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); * { box-sizing:border-box; } body { font-family:'Nunito',sans-serif; }`}</style>
        <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 90, marginBottom: 24, lineHeight: 1 }}>{isLimit ? '⏰' : '🌙'}</div>
          <div style={{ fontWeight: 800, fontSize: 26, color: TX, marginBottom: 14 }}>
            {isLimit ? 'Дэлгэцийн цаг дууслаа!' : 'Одоо тоглох цаг биш байна'}
          </div>
          <div style={{ fontSize: 15, color: S2, fontWeight: 500, maxWidth: 300, lineHeight: 1.7, marginBottom: 8 }}>
            {isLimit
              ? `Өнөөдрийн ${screenTimeSettings.daily_limit_minutes} минутын хязгаар дуусжээ.`
              : `Тоглох хугацаа: ${screenTimeSettings.schedule_start.slice(0, 5)} – ${screenTimeSettings.schedule_end.slice(0, 5)}`
            }
          </div>
          <div style={{ fontSize: 13, color: S3, fontWeight: 600, marginBottom: 32 }}>
            {isLimit ? 'Маргааш дахин тоглоорой!' : 'Хүлээгээрэй, тун удахгүй болно 😊'}
          </div>
          <button onClick={() => router.push('/parent/children')}
            style={{ background: T, color: 'white', border: 'none', borderRadius: 16, padding: '14px 36px', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(122,209,209,0.4)' }}>
            Буцах
          </button>
        </div>
      </>
    )
  }

  if (!student) return null

  const enrolled = allCourses.filter(c => c.is_enrolled)
  const discover = allCourses.filter(c => !c.is_enrolled)

  /* gather all exercises from enrolled courses */
  const allExercises: Exercise[] = []
  enrolled.forEach(c => c.lessons.forEach(l => l.exercises.forEach(ex => {
    allExercises.push({ ...ex, lessonId: l.id, lessonTitle: l.title, courseTitle: c.title, courseColor: c.color })
  })))

  const { xpIntoLevel, xpNeeded, pct: levelPct } = xpProgress(student.xp_total ?? 0)
  const toNext = xpNeeded - xpIntoLevel

  const tabs = [
    { id: 'play',     label: 'Тоглоом', icon: '🎮' },
    { id: 'courses',  label: 'Хичээл',  icon: '📚' },
    { id: 'discover', label: 'Шинэ',    icon: '🔍' },
  ] as const

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); * { box-sizing:border-box; } body { font-family:'Nunito',sans-serif; }`}</style>

      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, #E5F7F7 0%, ${BG} 30%, ${BG} 100%)`, fontFamily: 'Nunito, sans-serif', paddingBottom: 100 }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${T}, #5BBABA)`, borderRadius: '0 0 32px 32px', padding: '16px 20px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, position: 'relative', zIndex: 1 }}>
            <button onClick={() => router.push('/parent/children')}
              style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{student.points_balance}</span>
            </div>
          </div>

          {/* Profile row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={AVATARS[student.avatar] ?? AVATARS['bear']} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 2 }}>Сайн уу, {student.name}!</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
    {student.grade_level}-р анги · Түвшин {student.level} · {toNext} XP дараагийн түвшинд
  </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${levelPct}%`, height: '100%', background: '#FFF3D6', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{toNext} оноо</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 6, padding: '16px 20px 0', maxWidth: 480, margin: '0 auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: '10px 0', borderRadius: 14, background: activeTab === tab.id ? 'white' : 'transparent', border: activeTab === tab.id ? `2px solid ${BR}` : '2px solid transparent', boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span style={{ fontWeight: activeTab === tab.id ? 800 : 600, fontSize: 13, color: activeTab === tab.id ? TX : S3 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 20px 0' }}>

          {/* PLAY tab */}
          {activeTab === 'play' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allExercises.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: TX, marginBottom: 6 }}>Тоглоом байхгүй байна</div>
                  <div style={{ fontSize: 13, color: S3, marginBottom: 16 }}>Эхлээд хичээлд бүртгүүлнэ үү</div>
                  <button onClick={() => setActiveTab('discover')} style={{ background: T, color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Хичээл хайх →
                  </button>
                </div>
              ) : allExercises.map(ex => (
                <ExCard key={ex.id} ex={ex} onPlay={() => router.push(`/play/${ex.id}?studentId=${id}`)} />
              ))}
            </div>
          )}

          {/* COURSES tab */}
          {activeTab === 'courses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enrolled.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: TX, marginBottom: 6 }}>Бүртгэлтэй хичээл байхгүй</div>
                  <button onClick={() => setActiveTab('discover')} style={{ background: T, color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginTop: 12 }}>
                    Хичээл хайх →
                  </button>
                </div>
              ) : enrolled.map(c => (
                <EnrolledCard key={c.id} course={c} expanded={expanded === c.id}
                  onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
                  onLesson={l => router.push(`/student/${id}/lessons/${l.id}`)} />
              ))}
            </div>
          )}

          {/* DISCOVER tab */}
          {activeTab === 'discover' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, color: S3, fontWeight: 600, marginBottom: 4 }}>{student.grade_level}-р ангийн хичээлүүд</div>
              {discover.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: TX }}>Бүх хичээлд бүртгүүлсэн байна!</div>
                </div>
              ) : discover.map(c => (
                <DiscoverCard key={c.id} course={c}
                  enrolling={enrollingId === c.id}
                  onEnroll={() => handleEnroll(c.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}