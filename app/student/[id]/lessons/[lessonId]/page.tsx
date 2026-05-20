'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SlideshowViewer from '@/components/SlideshowViewer'

/* ---------- Types ---------- */
interface Lesson {
  id: string
  title: string
  type: string
  text_content: string | null
  course_id: string
}

interface Exercise {
  id: string
  title: string
  game_type: string
  points_reward: number
}

const GAME_LABELS: Record<string, string> = {
  SIMPLE_QUIZ:      'Quiz',
  DRAG_DROP:        'Drag and drop',
  MATCHING:         'Matching',
  PATTERN:          'Pattern',
  ODD_ONE_OUT:      'Odd one out',
  CATEGORY_SORT:    'Category sort',
  SEQUENCE_REPEAT:  'Sequence repeat',
  READ_REMEMBER:    'Read and remember',
  MATCHSTICK:       'Matchstick',
}

/* ---------- Page ---------- */
export default function StudentLessonPage() {
  const router = useRouter()
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [slideshowId, setSlideshowId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      /* Load lesson */
      const { data: l } = await supabase
        .from('lessons')
        .select('id, title, type, text_content, course_id')
        .eq('id', lessonId)
        .single()
      if (!l) { router.back(); return }
      setLesson(l as Lesson)

      /* Check for slideshow */
      const { data: sw } = await supabase
        .from('slideshows')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle()
      if (sw) setSlideshowId(sw.id)

      /* Load exercises */
      const { data: ex } = await supabase
        .from('exercises')
        .select('id, title, game_type, points_reward')
        .eq('lesson_id', lessonId)
      setExercises((ex as Exercise[]) ?? [])

      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  /* ---------- Render ---------- */
  if (loading || !lesson) return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 text-stone-400 animate-pulse">
      Уншиж байна...
    </div>
  )

  const isFairyTale = lesson.type === 'FAIRY_TALE'
  const hasContent = lesson.text_content || slideshowId || exercises.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-amber-50">
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.push(`/student/${id}/courses/${lesson.course_id}`)}
          className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-stone-800 truncate">{lesson.title}</h1>
          <span className={`text-xs font-semibold ${isFairyTale ? 'text-amber-600' : 'text-violet-600'}`}>
            {isFairyTale ? 'Үлгэр' : 'Хичээл'}
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Text content */}
        {lesson.text_content && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
              {lesson.text_content}
            </p>
          </div>
        )}

        {/* Slideshow */}
        {slideshowId && <SlideshowViewer slideshowId={slideshowId} />}

        {/* Exercises */}
        {exercises.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-stone-700 text-base px-1">Дасгалууд</h2>
            {exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => router.push(`/play/${ex.id}?studentId=${id}`)}
                className="w-full bg-white rounded-2xl border-2 border-stone-200 p-4 flex items-center gap-4 text-left hover:border-violet-400 hover:bg-violet-50 active:scale-95 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-stone-800">{ex.title}</div>
                  <div className="text-xs text-violet-600 font-semibold mt-0.5">
                    {GAME_LABELS[ex.game_type] ?? ex.game_type}
                  </div>
                </div>
                <div className="text-sm font-bold text-amber-500 flex-shrink-0">
                  +{ex.points_reward}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!hasContent && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <p className="text-stone-500 font-medium text-sm">Агуулга удахгүй нэмэгдэнэ</p>
          </div>
        )}
      </div>
    </div>
  )
}