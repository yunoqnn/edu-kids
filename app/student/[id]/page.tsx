'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Student {
  id: string
  name: string
  avatar: string
  grade_level: number
  points_balance: number
  points_total: number
  level: number
}

interface Exercise {
  id: string
  title: string
  game_type: string
  points_reward: number
  lesson: {
    id: string
    title: string
    course: {
      id: string
      title: string
    }
  }
}

const AVATAR_SRC: Record<string, string> = {
  bear: '/avatars/bear.jpg',
  cat: '/avatars/cat.jpg',
  dog: '/avatars/dog.jpg',
  rabbit: '/avatars/rabbit.jpg',
  penguin: '/avatars/penguin.jpg',
  fox: '/avatars/fox.jpg',
}

const GAME_LABELS: Record<string, string> = {
  SIMPLE_QUIZ:     'Асуулт',
  DRAG_DROP:       'Чирж тавих',
  MATCHING:        'Хос тааруулах',
  PATTERN:         'Дараалал',
  ODD_ONE_OUT:     'Өөр нэгийг ол',
  CATEGORY_SORT:   'Ангилал',
  SEQUENCE_REPEAT: 'Дараалал давтах',
  READ_REMEMBER:   'Уншиж санаарай',
}

export default function StudentPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      /* Verify parent auth */
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      /* Load student */
      const { data: s, error: sErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .eq('parent_id', user.id)
        .single()

      if (sErr || !s) { setError('Сурагч олдсонгүй'); setLoading(false); return }
      setStudent(s)

      /* Load enrolled exercises via enrollments → courses → lessons → exercises */
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', id)

      if (!enrollments?.length) { setLoading(false); return }

      const courseIds = enrollments.map((e) => e.course_id)

      const { data: exRows } = await supabase
        .from('exercises')
        .select(`
          id, title, game_type, points_reward,
          lessons!inner (
            id, title,
            courses!inner ( id, title )
          )
        `)
        .in('lessons.course_id', courseIds)
        .eq('lessons.is_published', true)

      setExercises((exRows as unknown as Exercise[]) ?? [])
      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400 font-medium animate-pulse">
      Уншиж байна...
    </div>
  )

  if (error || !student) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <p className="text-red-500 font-bold mb-4">{error || 'Сурагч олдсонгүй'}</p>
        <button onClick={() => router.back()}
          className="px-4 py-2 bg-stone-800 text-white rounded-xl font-semibold">
          Буцах
        </button>
      </div>
    </div>
  )

  const avatarSrc = AVATAR_SRC[student.avatar] ?? '/avatars/cat.jpg'

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span className="font-bold text-stone-800">{student.name}</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Student card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-violet-200 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarSrc} alt={student.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-stone-800">{student.name}</h1>
            <p className="text-stone-400 text-sm mb-3">{student.grade_level}-р анги</p>
            <div className="flex gap-4">
              <div>
                <div className="text-lg font-bold text-violet-600">{student.points_balance}</div>
                <div className="text-xs text-stone-400">оноо</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-500">{student.level}</div>
                <div className="text-xs text-stone-400">түвшин</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{student.points_total}</div>
                <div className="text-xs text-stone-400">нийт оноо</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div>
          <h2 className="font-bold text-stone-700 mb-3 text-lg">
            Дасгалууд
            {exercises.length > 0 && (
              <span className="ml-2 text-sm font-normal text-stone-400">({exercises.length})</span>
            )}
          </h2>

          {exercises.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-stone-500 font-medium text-sm">Одоогоор дасгал байхгүй байна</p>
              <p className="text-stone-400 text-xs mt-1">Эцэг эх курст бүртгэх шаардлагатай</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => router.push(`/play/${ex.id}?studentId=${student.id}`)}
                  className="w-full bg-white rounded-2xl border-2 border-stone-200 p-4 flex items-center gap-4 text-left hover:border-violet-400 hover:bg-violet-50 active:scale-95 transition-all"
                >
                  {/* Game type badge */}
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                    {ex.game_type === 'SIMPLE_QUIZ'     ? '❓'
                     : ex.game_type === 'DRAG_DROP'     ? '🖱'
                     : ex.game_type === 'MATCHING'      ? '🔗'
                     : ex.game_type === 'PATTERN'       ? '🔢'
                     : ex.game_type === 'ODD_ONE_OUT'   ? '🎯'
                     : ex.game_type === 'CATEGORY_SORT' ? '📂'
                     : ex.game_type === 'SEQUENCE_REPEAT' ? '🎵'
                     : ex.game_type === 'READ_REMEMBER' ? '📖'
                     : '🎮'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-800 truncate">{ex.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-violet-600 font-semibold">
                        {GAME_LABELS[ex.game_type] ?? ex.game_type}
                      </span>
                      <span className="text-xs text-stone-400">·</span>
                      <span className="text-xs text-stone-400">{ex.lesson?.course?.title}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-bold text-amber-500">+{ex.points_reward}</div>
                    <div className="text-xs text-stone-400">оноо</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push(`/student/${student.id}/courses`)}
          className="w-full bg-violet-600 text-white rounded-2xl p-4 font-bold hover:bg-violet-700 active:scale-95 transition-all flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Курс хайх
        </button>
      </div>
    </div>
  )
}