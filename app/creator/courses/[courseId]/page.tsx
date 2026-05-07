'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { GAME_LABELS } from '@/components/games/registry'
import type { GameType } from '@/types/games'

interface Lesson {
  id: string
  title: string
  order_index: number
  is_published: boolean
  exercises: { id: string; title: string; game_type: GameType }[]
}

interface Course {
  id: string
  title: string
  status: string
  grade_level: number | null
  description: string | null
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Ноорог', PENDING_REVIEW: 'Хянагдаж байна', PUBLISHED: 'Нийтлэгдсэн', REJECTED: 'Татгалзсан',
}

export default function CourseDetailPage() {
  const router = useRouter()
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [addingLesson, setAddingLesson] = useState(false)
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    const { data: c } = await supabase.from('courses').select('id, title, status, grade_level, description').eq('id', courseId).single()
    const { data: l } = await supabase.from('lessons').select('id, title, order_index, is_published, exercises(id, title, game_type)').eq('course_id', courseId).order('order_index')
    setCourse(c)
    setLessons((l as Lesson[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [courseId])

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return
    const { error } = await supabase.from('lessons').insert({
      course_id: courseId,
      title: newLessonTitle.trim(),
      order_index: lessons.length,
    })
    if (!error) { setNewLessonTitle(''); setAddingLesson(false); fetchData() }
  }

  const togglePublishLesson = async (lessonId: string, current: boolean) => {
    await supabase.from('lessons').update({ is_published: !current }).eq('id', lessonId)
    fetchData()
  }

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Хичээлийг устгах уу? Бүх дасгал устна.')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    fetchData()
  }

  const deleteExercise = async (exerciseId: string) => {
    await supabase.from('exercises').delete().eq('id', exerciseId)
    fetchData()
  }

  const submitForReview = async () => {
    setSubmitting(true)
    await supabase.from('courses').update({ status: 'PENDING_REVIEW' }).eq('id', courseId)
    fetchData()
    setSubmitting(false)
  }

  if (loading || !course) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400 animate-pulse">Уншиж байна...</div>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/creator/courses')}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div>
            <h1 className="font-bold text-stone-800 leading-tight">{course.title}</h1>
            <span className="text-xs text-stone-400">{STATUS_LABEL[course.status] ?? course.status}</span>
          </div>
        </div>
        {course.status === 'DRAFT' && (
          <button onClick={submitForReview} disabled={submitting}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition-all">
            {submitting ? 'Илгээж байна...' : 'Хянуулахаар илгээх'}
          </button>
        )}
        {course.status === 'PENDING_REVIEW' && (
          <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-bold">Хянагдаж байна</span>
        )}
        {course.status === 'PUBLISHED' && (
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold">✓ Нийтлэгдсэн</span>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {course.description && (
          <p className="text-stone-500 text-sm bg-white rounded-xl border border-stone-200 px-4 py-3">{course.description}</p>
        )}

        {/* Lessons */}
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            {/* Lesson header */}
            <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-stone-50 transition-colors"
              onClick={() => setExpanded(expanded === lesson.id ? null : lesson.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A199B4" strokeWidth="2.5" strokeLinecap="round"
                className={`flex-shrink-0 transition-transform ${expanded === lesson.id ? 'rotate-90' : ''}`}>
                <path d="m9 18 6-6-6-6" />
              </svg>
              <span className="font-bold text-stone-700 flex-1">{lesson.title}</span>
              <span className="text-xs text-stone-400">{lesson.exercises.length} дасгал</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); togglePublishLesson(lesson.id, lesson.is_published) }}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all
                  ${lesson.is_published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500 hover:bg-green-50'}`}>
                {lesson.is_published ? 'Нийтлэгдсэн' : 'Ноорог'}
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id) }}
                className="text-stone-400 hover:text-red-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Exercises */}
            {expanded === lesson.id && (
              <div className="border-t border-stone-100 px-5 py-4 space-y-2">
                {lesson.exercises.map((ex) => (
                  <div key={ex.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-lg font-semibold flex-shrink-0">
                      {GAME_LABELS[ex.game_type] ?? ex.game_type}
                    </span>
                    <span className="text-sm font-medium text-stone-700 flex-1 truncate">{ex.title}</span>
                    <button onClick={() => router.push(`/creator/exercises/${ex.id}/edit`)}
                      className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex-shrink-0">
                      Засах
                    </button>
                    <button onClick={() => deleteExercise(ex.id)}
                      className="text-stone-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                <button onClick={() => router.push(`/creator/exercises/new?lessonId=${lesson.id}`)}
                  className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-sm text-violet-600 font-semibold hover:border-violet-300 hover:bg-violet-50 transition-all">
                  + Дасгал нэмэх
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add lesson */}
        {addingLesson ? (
          <div className="bg-white rounded-2xl border-2 border-violet-300 p-4 flex items-center gap-3">
            <input type="text" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
              placeholder="Хичээлийн нэр..." autoFocus
              className="flex-1 text-sm font-medium px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-violet-400" />
            <button onClick={handleAddLesson}
              className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all">
              Нэмэх
            </button>
            <button onClick={() => setAddingLesson(false)}
              className="px-3 py-2 border border-stone-200 text-stone-500 rounded-xl text-sm hover:border-stone-300 transition-all">
              Болих
            </button>
          </div>
        ) : (
          <button onClick={() => setAddingLesson(true)}
            className="w-full py-4 border-2 border-dashed border-stone-300 rounded-2xl text-sm text-stone-500 font-semibold hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all">
            + Хичээл нэмэх
          </button>
        )}
      </div>
    </div>
  )
}