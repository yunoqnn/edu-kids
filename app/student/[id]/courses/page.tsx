'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ---------- Types ---------- */
interface Student {
  id: string
  name: string
  grade_level: number
}

interface Course {
  id: string
  title: string
  description: string | null
  grade_level: number | null
  is_enrolled: boolean
}

const GRADE_COLORS: Record<number, string> = {
  1: 'bg-pink-100 text-pink-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-green-100 text-green-700',
  5: 'bg-blue-100 text-blue-700',
}

/* ---------- Page ---------- */
export default function StudentCoursesPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [gradeFilter, setGradeFilter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  /* ---------- Load student then courses ---------- */
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: s } = await supabase
        .from('students')
        .select('id, name, grade_level')
        .eq('id', id)
        .eq('parent_id', user.id)
        .single()

      if (!s) { router.push('/parent/children'); return }

      setStudent(s)
      const defaultGrade = s.grade_level
      setGradeFilter(defaultGrade)
      await fetchCourses(id, defaultGrade)
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchCourses = async (studentId: string, grade: number | null) => {
    /* Build query */
    let query = supabase
      .from('courses')
      .select('id, title, description, grade_level')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })

    if (grade !== null) {
      query = query.eq('grade_level', grade)
    }

    const { data: rows } = await query

    /* Get enrolled course ids for this child */
    const { data: enrolled } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId)

    const enrolledIds = new Set((enrolled ?? []).map((e) => e.course_id))

    setCourses(
      (rows ?? []).map((c) => ({ ...c, is_enrolled: enrolledIds.has(c.id) }))
    )
  }

  const handleGradeFilter = async (grade: number | null) => {
    setGradeFilter(grade)
    if (student) await fetchCourses(student.id, grade)
  }

  /* ---------- Render ---------- */
  if (loading || !student) return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 text-stone-400 animate-pulse">
      Уншиж байна...
    </div>
  )

  const grades = [1, 2, 3, 4, 5]

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-amber-50">
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.push(`/student/${id}`)}
          className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div>
          <h1 className="font-bold text-stone-800">Курсууд</h1>
          <p className="text-xs text-stone-400">{student.name}</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Grade filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => handleGradeFilter(student.grade_level)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all border
              ${gradeFilter === student.grade_level
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'
              }`}
          >
            {student.grade_level}-р анги (миний)
          </button>

          <button
            onClick={() => handleGradeFilter(null)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all border
              ${gradeFilter === null
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'
              }`}
          >
            Бүх анги
          </button>

          {grades
            .filter((g) => g !== student.grade_level)
            .map((g) => (
              <button
                key={g}
                onClick={() => handleGradeFilter(g)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all border
                  ${gradeFilter === g
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'
                  }`}
              >
                {g}-р анги
              </button>
            ))}
        </div>

        {/* Course list */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-stone-500 font-medium text-sm">Курс байхгүй байна</p>
            <p className="text-stone-400 text-xs mt-1">Бусад ангиудыг шүүж үзнэ үү</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => router.push(`/student/${id}/courses/${course.id}`)}
                className="w-full bg-white rounded-2xl border-2 border-stone-200 p-4 text-left hover:border-violet-400 hover:bg-violet-50 active:scale-95 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-800 mb-1">{course.title}</div>
                    {course.description && (
                      <p className="text-xs text-stone-500 line-clamp-2">{course.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {course.grade_level && (
                      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${GRADE_COLORS[course.grade_level] ?? 'bg-stone-100 text-stone-600'}`}>
                        {course.grade_level}-р анги
                      </span>
                    )}
                    {course.is_enrolled && (
                      <span className="text-xs px-2 py-1 rounded-lg font-semibold bg-green-100 text-green-700">
                        ✓ Бүртгэлтэй
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}