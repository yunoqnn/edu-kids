'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SlideshowViewer from '@/components/SlideshowViewer'

interface Lesson {
  id: string; title: string; type: string
  text_content: string | null; course_id: string
}
interface Exercise { id: string; title: string; game_type: string; points_reward: number }

const PALETTE = ['#7AD1D1', '#E8A5A5', '#9B8BBC', '#C4A77D', '#8BC4A5', '#B5C4E8']
function courseColor(id: string) { return PALETTE[id.charCodeAt(0) % PALETTE.length] }

const GAME_LABELS: Record<string, string> = {
  SIMPLE_QUIZ: 'Асуулт', DRAG_DROP: 'Чирж тавих', MATCHING: 'Хос тааруулах',
  PATTERN: 'Дараалал', ODD_ONE_OUT: 'Өөр нэгийг ол', CATEGORY_SORT: 'Ангилал',
  SEQUENCE_REPEAT: 'Дараалал давтах', READ_REMEMBER: 'Уншиж санаарай', MATCHSTICK: 'Хутга',
}
const GAME_ICONS: Record<string, string> = {
  SIMPLE_QUIZ: '❓', DRAG_DROP: '✋', MATCHING: '🔗', PATTERN: '🔢',
  ODD_ONE_OUT: '🎯', CATEGORY_SORT: '📂', SEQUENCE_REPEAT: '🎵', READ_REMEMBER: '📖', MATCHSTICK: '🔥',
}

const BG = '#FAF7F2'
const BR = '#E5DDD3'
const TX = '#3D3D3D'
const S3 = '#9CA3AF'
const GD = '#C4A77D'

export default function StudentLessonPage() {
  const router = useRouter()
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<{ id: string; title: string } | null>(null)
  const [slideshowId, setSlideshowId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: l } = await supabase.from('lessons').select('id, title, type, text_content, course_id').eq('id', lessonId).single()
      if (!l) { router.back(); return }
      setLesson(l as Lesson)
      const { data: c } = await supabase.from('courses').select('id, title').eq('id', l.course_id).single()
      if (c) setCourse(c)
      const { data: sw } = await supabase.from('slideshows').select('id').eq('lesson_id', lessonId).maybeSingle()
      if (sw) setSlideshowId(sw.id)
      const { data: ex } = await supabase.from('exercises').select('id, title, game_type, points_reward').eq('lesson_id', lessonId)
      setExercises((ex as Exercise[]) ?? [])
      setLoading(false)
    }
    load()
  }, [lessonId, router])

  if (loading || !lesson) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: S3, fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 600 }}>
      Уншиж байна...
    </div>
  )

  const isFT     = lesson.type === 'FAIRY_TALE'
  const color    = courseColor(lesson.course_id)
  const hdrColor = isFT ? GD : color

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); * { box-sizing:border-box; } body { font-family:'Nunito',sans-serif; }`}</style>
      <div style={{ minHeight: '100vh', background: isFT ? `linear-gradient(180deg,#FFF3D6 0%,${BG} 20%,${BG} 100%)` : `linear-gradient(180deg,#E5F7F7 0%,${BG} 20%,${BG} 100%)`, fontFamily: 'Nunito, sans-serif', paddingBottom: 40 }}>

        {/* Header */}
        <div style={{ background: hdrColor, borderRadius: '0 0 24px 24px', padding: '16px 20px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            <button onClick={() => router.push(`/student/${id}`)}
              style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              {course && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{course.title}</div>}
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '6px 12px', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {isFT ? '📖 Үлгэр' : '📝 Хичээл'}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 20px 0' }}>

          {lesson.text_content && (
            <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '24px', marginBottom: 20 }}>
              <p style={{ fontSize: 15, color: TX, lineHeight: 1.8, margin: 0, fontWeight: 500 }}>{lesson.text_content}</p>
            </div>
          )}

          {slideshowId && (
            <div style={{ marginBottom: 20 }}>
              <SlideshowViewer slideshowId={slideshowId} accentColor={hdrColor} />
            </div>
          )}

          {exercises.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: TX, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎮</span> Дасгалууд <span style={{ fontSize: 12, fontWeight: 600, color: S3 }}>({exercises.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {exercises.map(ex => (
                  <button key={ex.id} onClick={() => router.push(`/play/${ex.id}?studentId=${id}`)}
                    style={{ width: '100%', background: 'white', borderRadius: 16, border: `2px solid ${BR}`, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', transition: 'all 200ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = color; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BR; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{GAME_ICONS[ex.game_type] ?? '🎮'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: TX }}>{ex.title}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: color, marginTop: 3 }}>{GAME_LABELS[ex.game_type] ?? ex.game_type}</div>
                    </div>
                    <div style={{ background: '#FFF3D6', borderRadius: 10, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 13 }}>⭐</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: GD }}>+{ex.points_reward}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!lesson.text_content && !slideshowId && exercises.length === 0 && (
            <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: TX }}>Агуулга удахгүй нэмэгдэнэ</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}