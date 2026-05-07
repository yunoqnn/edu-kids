'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Course {
  id: string
  title: string
  status: string
  grade_level: number | null
  visibility: string
  created_at: string
  lesson_count?: number
}

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  DRAFT:          { label: 'Ноорог',          cls: 'bg-stone-100 text-stone-600' },
  PENDING_REVIEW: { label: 'Хянагдаж байна', cls: 'bg-amber-100 text-amber-700' },
  PUBLISHED:      { label: 'Нийтлэгдсэн',    cls: 'bg-green-100 text-green-700' },
  REJECTED:       { label: 'Татгалзсан',      cls: 'bg-red-100 text-red-600' },
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/'); return }
      const { data: rows } = await supabase
        .from('courses')
        .select('id, title, status, grade_level, visibility, created_at')
        .eq('creator_id', data.user.id)
        .order('created_at', { ascending: false })
      setCourses(rows ?? [])
      setLoading(false)
    })
  }, [router])

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/creator/dashboard')}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h1 className="font-bold text-stone-800 text-lg">Миний курсууд</h1>
        </div>
        <button onClick={() => router.push('/creator/courses/new')}
          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Шинэ курс
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-stone-400 font-medium animate-pulse">Уншиж байна...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-stone-500 font-medium mb-4">Курс байхгүй байна</p>
            <button onClick={() => router.push('/creator/courses/new')}
              className="px-5 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all">
              Эхний курсаа үүсгэх
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const s = STATUS_STYLES[course.status] ?? STATUS_STYLES.DRAFT
              return (
                <div key={course.id}
                  onClick={() => router.push(`/creator/courses/${course.id}`)}
                  className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4 cursor-pointer hover:border-violet-300 hover:shadow-sm transition-all">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📗</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 truncate">{course.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {course.grade_level && (
                        <span className="text-xs text-stone-400">{course.grade_level}-р анги</span>
                      )}
                      <span className="text-xs text-stone-400">
                        {new Date(course.created_at).toLocaleDateString('mn-MN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A199B4" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}