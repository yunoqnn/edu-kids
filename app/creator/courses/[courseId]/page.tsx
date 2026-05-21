'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ---------- Types ---------- */
interface Lesson {
  id: string; title: string; type: string
  order_index: number; is_published: boolean
  exercises: { id: string; title: string; game_type: string; points_reward: number }[]
}
interface Course {
  id: string; title: string; description: string | null
  status: string; grade_level: number | null
}

/* ---------- Constants ---------- */
const T  = '#7AD1D1'
const BR = '#E5DDD3'
const TX = '#3D3D3D'
const S2 = '#6B7280'
const S3 = '#9CA3AF'
const GD = '#C4A77D'

const PALETTE = ['#7AD1D1', '#E8A5A5', '#9B8BBC', '#C4A77D', '#8BC4A5', '#B5C4E8']
function courseColor(id: string) { return PALETTE[id.charCodeAt(0) % PALETTE.length] }

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  DRAFT:          { label: 'Түр хувилбар',    bg: '#F3F0EB', color: S2,       dot: S3        },
  PENDING_REVIEW: { label: 'Хянагдаж байна', bg: '#FFF8E1', color: '#B8860B', dot: '#F59E0B' },
  PUBLISHED:      { label: 'Нийтлэгдсэн',    bg: '#E5F7F7', color: '#0D9488', dot: '#14B8A6' },
  REJECTED:       { label: 'Татгалзсан',      bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444' },
}

const GAME_LABELS: Record<string, string> = {
  SIMPLE_QUIZ: 'Асуулт', DRAG_DROP: 'Чирж тавих', MATCHING: 'Хос тааруулах',
  PATTERN: 'Дараалал', ODD_ONE_OUT: 'Өөр нэгийг ол', CATEGORY_SORT: 'Ангилал',
  SEQUENCE_REPEAT: 'Дараалал давтах', READ_REMEMBER: 'Уншиж санаарай', MATCHSTICK: 'Хутга',
}

/* ---------- Page ---------- */
export default function CourseDetailPage() {
  const router   = useRouter()
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse]   = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [addingLesson, setAddingLesson] = useState(false)
  const [newTitle, setNewTitle]       = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState('')

  const fetchData = async () => {
    const { data: c } = await supabase.from('courses').select('id, title, description, status, grade_level').eq('id', courseId).single()
    const { data: l } = await supabase.from('lessons').select('id, title, type, order_index, is_published, exercises(id, title, game_type, points_reward)').eq('course_id', courseId).order('order_index')
    setCourse(c)
    setLessons((l as Lesson[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [courseId])

  const handleAddLesson = async () => {
    if (!newTitle.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('lessons').insert({ course_id: courseId, title: newTitle.trim(), order_index: lessons.length })
    if (!error) { setNewTitle(''); setAddingLesson(false); fetchData() }
    setSubmitting(false)
  }

  const togglePublish = async (lessonId: string, current: boolean) => {
    await supabase.from('lessons').update({ is_published: !current }).eq('id', lessonId)
    fetchData()
  }

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Хичээлийг устгах уу? Холбоотой дасгал, үзүүлэн бүгд устана.')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    fetchData()
  }

  const submitForReview = async () => {
    setSubmitError('')
    setSubmitting(true)
    const { error } = await supabase.from('courses').update({ status: 'PENDING_REVIEW' }).eq('id', courseId)
    if (error) setSubmitError(error.message)
    else fetchData()
    setSubmitting(false)
  }

  if (loading || !course) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2', color: S3, fontFamily: 'Nunito, sans-serif' }}>
      Уншиж байна...
    </div>
  )

  const status = STATUS_CONFIG[course.status] ?? STATUS_CONFIG.DRAFT
  const color  = courseColor(course.id)
  const totalEx = lessons.reduce((s, l) => s + l.exercises.length, 0)

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap'); * { box-sizing:border-box; } body { font-family:'Nunito',sans-serif; } .lesson-hdr:hover { background: #FAFAF8 !important; }`}</style>

      <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <button onClick={() => router.push('/creator/dashboard')}
              style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = T}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = BR}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S2} strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span style={{ fontSize: 13, color: S3, fontWeight: 600 }}>Сургалтын хөтөлбөрүүд</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
            <span style={{ fontSize: 13, color: TX, fontWeight: 700 }}>{course.title}</span>
          </div>

          {/* Course header card */}
          <div style={{ background: 'white', borderRadius: 18, border: `1.5px solid ${BR}`, padding: '24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: color }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
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
                {course.description && <p style={{ fontSize: 14, color: S2, margin: '0 0 12px', lineHeight: 1.5 }}>{course.description}</p>}
                <div style={{ display: 'flex', gap: 20 }}>
                  {course.grade_level && <span style={{ fontSize: 13, fontWeight: 600, color: S2 }}>{course.grade_level}-р анги</span>}
                  <span style={{ fontSize: 13, fontWeight: 600, color: S2 }}>{lessons.length} хичээл</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: S2 }}>{totalEx} дасгал</span>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {course.status === 'DRAFT' && (
                  <button onClick={submitForReview} disabled={submitting}
                    style={{ background: '#FFF8E1', color: '#B8860B', border: '1.5px solid #F5D87040', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.6 : 1, transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#FFF3CD'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#FFF8E1'}>
                    Хянуулах
                  </button>
                )}
                <button onClick={() => router.push(`/creator/courses/${courseId}/edit`)}
                  style={{ background: '#F3F0EB', color: S2, border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#E5E2DC'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#F3F0EB'}>
                  Засах
                </button>
              </div>
            </div>
            {submitError && <p style={{ marginTop: 12, fontSize: 13, color: '#DC2626' }}>{submitError}</p>}
          </div>

          {/* Lessons */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: TX, margin: 0 }}>Хичээлүүд</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lessons.map((lesson, idx) => {
                const isExpanded = expanded === lesson.id
                const isFT = lesson.type === 'FAIRY_TALE'

                return (
                  <div key={lesson.id} style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${isExpanded ? color : BR}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                    {/* Lesson header */}
                    <div className="lesson-hdr"
                      style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                      onClick={() => setExpanded(isExpanded ? null : lesson.id)}>
                      <div style={{ width: 36, height: 36, borderRadius: 11, background: isFT ? '#FFF3D6' : `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: isFT ? GD : color, flexShrink: 0 }}>
                        {isFT ? '📖' : idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: TX }}>{lesson.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                          <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{isFT ? 'Үлгэр' : 'Хичээл'}</span>
                          <span style={{ fontSize: 12, color: '#D1D5DB' }}>·</span>
                          <span style={{ fontSize: 12, color: S3, fontWeight: 600 }}>{lesson.exercises.length} дасгал</span>
                        </div>
                      </div>

                      {/* Published badge */}
                      <div style={{ padding: '4px 10px', borderRadius: 7, background: lesson.is_published ? '#E5F7F7' : '#F3F0EB', fontSize: 11, fontWeight: 700, color: lesson.is_published ? '#14B8A6' : S3, flexShrink: 0 }}>
                        {lesson.is_published ? 'Нийтлэгдсэн' : 'Түр хувилбар'}
                      </div>

                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"
                        style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>

                    {/* Expanded area */}
                    {isExpanded && (
                      <div style={{ borderTop: `1.5px solid #F3F0EB`, padding: '12px 18px', background: '#FAFAF8' }}>
                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: lesson.exercises.length > 0 ? 12 : 0, flexWrap: 'wrap' }}>
                          <button onClick={() => router.push(`/creator/lessons/${lesson.id}`)}
                            style={{ padding: '7px 14px', background: `${color}15`, color: color, border: `1.5px solid ${color}30`, borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                            ✏️ Засах / Үзүүлэн
                          </button>
                          <button onClick={() => router.push(`/creator/exercises/new?lessonId=${lesson.id}`)}
                            style={{ padding: '7px 14px', background: '#E5F7F7', color: '#0D9488', border: '1.5px solid #A3DDD980', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                            🎮 Дасгал нэмэх
                          </button>
                          <button onClick={() => togglePublish(lesson.id, lesson.is_published)}
                            style={{ padding: '7px 14px', background: '#F3F0EB', color: S2, border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {lesson.is_published ? 'Нуух' : 'Нийтлэх'}
                          </button>
                          <button onClick={() => deleteLesson(lesson.id)}
                            style={{ padding: '7px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Устгах
                          </button>
                        </div>

                        {/* Exercises */}
                        {lesson.exercises.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {lesson.exercises.map(ex => (
                              <div key={ex.id} style={{ background: 'white', borderRadius: 10, border: `1.5px solid ${BR}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${color}15`, color: color }}>
                                  {GAME_LABELS[ex.game_type] ?? ex.game_type}
                                </span>
                                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TX }}>{ex.title}</span>
                                {ex.points_reward && (
                                  <div style={{ background: '#FFF3D6', borderRadius: 6, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <span style={{ fontSize: 10 }}>⭐</span>
                                    <span style={{ fontWeight: 800, fontSize: 11, color: GD }}>+{ex.points_reward}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {lesson.exercises.length === 0 && (
                          <p style={{ fontSize: 13, color: S3, fontWeight: 500, padding: '4px 0', margin: 0 }}>Дасгал оруулаагүй байна</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add lesson */}
              {addingLesson ? (
                <div style={{ background: 'white', borderRadius: 14, border: `2px solid ${color}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="Хичээлийн нэр..." autoFocus
                    style={{ flex: 1, padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${BR}`, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', outline: 'none' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = color}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = BR}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddLesson(); if (e.key === 'Escape') { setAddingLesson(false); setNewTitle('') } }}
                  />
                  <button onClick={handleAddLesson} disabled={submitting || !newTitle.trim()}
                    style={{ background: color, color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.6 : 1 }}>
                    Нэмэх
                  </button>
                  <button onClick={() => { setAddingLesson(false); setNewTitle('') }}
                    style={{ background: '#F3F0EB', color: S2, border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Болих
                  </button>
                </div>
              ) : (
                <button onClick={() => setAddingLesson(true)}
                  style={{ width: '100%', padding: '14px', border: `1.5px dashed #D1D5DB`, borderRadius: 14, background: 'transparent', color: S3, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = color; (e.currentTarget as HTMLButtonElement).style.color = color }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLButtonElement).style.color = S3 }}>
                  + Хичээл нэмэх
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}