'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ---------- Types ---------- */
interface Course {
  id: string
  title: string
  description: string | null
  grade_level: number | null
}

interface Lesson {
  id: string
  title: string
  type: string
  order_index: number
}

/* ---------- Page ---------- */
export default function StudentCourseDetailPage() {
  const router = useRouter()
  const { id, courseId } = useParams<{ id: string; courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) { router.push('/'); return }

      /* Verify the child belongs to this parent */
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('id', id)
        .eq('parent_id', user.id)
        .single()
      if (!student) { router.push('/parent/children'); return }

      /* Load course */
      const { data: c } = await supabase
        .from('courses')
        .select('id, title, description, grade_level')
        .eq('id', courseId)
        .single()
      setCourse(c)

      /* Load published lessons in order */
      const { data: l } = await supabase
        .from('lessons')
        .select('id, title, type, order_index')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index')
      setLessons((l as Lesson[]) ?? [])

      /* Check enrollment */
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', id)
        .eq('course_id', courseId)
        .maybeSingle()
      setIsEnrolled(!!enrollment)

      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, courseId])

  const handleEnroll = async () => {
    setEnrolling(true)
    const { error } = await supabase
      .from('enrollments')
      .insert({ student_id: id, course_id: courseId })
    if (!error) setIsEnrolled(true)
    setEnrolling(false)
  }

  /* ---------- Render ---------- */
  if (loading || !course) return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 text-stone-400 animate-pulse">
      Уншиж байна...
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-amber-50">
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.push(`/student/${id}/courses`)}
          className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h1 className="font-bold text-stone-800 flex-1 truncate">{course.title}</h1>
        {isEnrolled ? (
          <span className="text-xs px-3 py-2 bg-green-100 text-green-700 rounded-xl font-semibold flex-shrink-0">
            Бүртгэлтэй
          </span>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-all flex-shrink-0"
          >
            {enrolling ? '...' : 'Бүртгүүлэх'}
          </button>
        )}
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Description */}
        {course.description && (
          <p className="text-stone-500 text-sm bg-white rounded-xl border border-stone-200 px-4 py-3">
            {course.description}
          </p>
        )}

        {/* Enroll prompt */}
        {!isEnrolled && lessons.length > 0 && (
          <div className="bg-violet-50 rounded-2xl border border-violet-200 p-4 text-center">
            <p className="text-violet-700 text-sm font-medium mb-3">
              Хичээлийг нээхийн тулд эхлээд курст бүртгүүлнэ үү
            </p>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-all"
            >
              {enrolling ? 'Бүртгэж байна...' : 'Курст бүртгүүлэх'}
            </button>
          </div>
        )}

        {/* Lesson list */}
        {lessons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <p className="text-stone-500 font-medium text-sm">Хичээл байхгүй байна</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => {
              const isFairyTale = lesson.type === 'FAIRY_TALE'
              return (
                <button
                  key={lesson.id}
                  onClick={() => isEnrolled && router.push(`/student/${id}/lessons/${lesson.id}`)}
                  disabled={!isEnrolled}
                  className={`w-full bg-white rounded-2xl border-2 p-4 flex items-center gap-4 text-left transition-all
                    ${isEnrolled
                      ? 'border-stone-200 hover:border-violet-400 hover:bg-violet-50 active:scale-95'
                      : 'border-stone-200 opacity-60 cursor-not-allowed'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
                    ${isFairyTale ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-800 truncate">{lesson.title}</div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {isFairyTale ? 'Үлгэр' : 'Хичээл'}
                    </div>
                  </div>
                  {!isEnrolled && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A199B4" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}