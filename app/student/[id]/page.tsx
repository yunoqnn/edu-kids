'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MemoryCardGame from '@/components/games/MemoryCardGame'
import DragDropGame from '@/components/games/DragDropGame'
import NumberSequenceGame from '@/components/games/NumberSequenceGame'

interface Student { id: string; name: string; avatar: string; points: number; level: number }
interface Exercise { id: string; title: string; type: string; point_reward: number; data: Record<string, unknown> }

export default function StudentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [active, setActive] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) { router.push('/'); return }

      // Load student
      const { data: s } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .eq('parent_id', user.user.id)
        .single()
      if (!s) { router.push('/parent/children'); return }
      setStudent(s)

      // Load exercises
      const { data: ex } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      setExercises(ex || [])

      // Load completed
      const { data: results } = await supabase
        .from('exercise_results')
        .select('exercise_id')
        .eq('student_id', studentId)
      setCompleted(new Set((results || []).map((r: { exercise_id: string }) => r.exercise_id)))

      setLoading(false)
    }
    load()
  }, [router, studentId])

  const handleComplete = async (score: number) => {
    if (!active || !student) return
    // Save result
    await supabase.from('exercise_results').insert({
      student_id: student.id,
      exercise_id: active.id,
      score,
    })
    // Update student points
    await supabase
      .from('students')
      .update({ points: (student.points || 0) + score })
      .eq('id', student.id)
    setStudent(s => s ? { ...s, points: s.points + score } : s)
    setCompleted(c => new Set([...c, active.id]))
  }

  const typeIcon: Record<string, string> = {
    MEMORY_CARD: '🃏',
    DRAG_DROP: '🧩',
    NUMBER_SEQUENCE: '🔢',
  }
  const typeLabel: Record<string, string> = {
    MEMORY_CARD: 'Memory Card',
    DRAG_DROP: 'Drag & Drop',
    NUMBER_SEQUENCE: 'Тооны гинж',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
      Уншиж байна...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-body)' }}>
      {/* Top bar */}
      <nav style={{ background: 'white', borderBottom: '1.5px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {active ? (
            <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>←</button>
          ) : (
            <button onClick={() => router.push('/parent/children')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>←</button>
          )}
          <span style={{ fontSize: 24 }}>{student?.avatar}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{student?.name}</span>
          {active && <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ {active.title}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'var(--primary-pale)', borderRadius: 10, padding: '6px 14px', fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
            ⭐ {student?.points} оноо
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

        {/* Game view */}
        {active ? (
          <div className="card fade-up" style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 20, paddingBottom: 16, borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {typeIcon[active.type]} {active.title}
            </h2>
            {active.type === 'MEMORY_CARD' && (
              <MemoryCardGame
                pairs={(active.data as { pairs: { word: string; imageBase64: string }[] }).pairs}
                pointReward={active.point_reward}
                onComplete={handleComplete}
              />
            )}
            {active.type === 'DRAG_DROP' && (
              <DragDropGame
                categories={(active.data as { categories: { id: string; name: string }[] }).categories}
                items={(active.data as { items: { id: string; word: string; imageBase64?: string; correctCategory: string }[] }).items}
                pointReward={active.point_reward}
                onComplete={handleComplete}
              />
            )}
            {active.type === 'NUMBER_SEQUENCE' && (
              <NumberSequenceGame
                sequences={(active.data as { sequences: { id: string; steps: (number | null)[]; answer: number; hint?: string }[] }).sequences}
                pointReward={active.point_reward}
                onComplete={handleComplete}
              />
            )}
          </div>
        ) : (
          /* Exercise list */
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                Тоглоомууд 🎮
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Тоглоом сонгоод эхэлнэ үү!</p>
            </div>

            {exercises.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center', borderStyle: 'dashed' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Тоглоом байхгүй байна</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Контент бүтээгч тоглоом нэмсний дараа энд харагдана</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {exercises.map((ex) => {
                  const done = completed.has(ex.id)
                  return (
                    <div
                      key={ex.id}
                      onClick={() => setActive(ex)}
                      className="card"
                      style={{ padding: '24px', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', border: done ? '1.5px solid #86efac' : '1.5px solid var(--border)', background: done ? '#f0fdf4' : 'white' }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}
                    >
                      <div style={{ fontSize: 40, marginBottom: 10 }}>{typeIcon[ex.type]}</div>
                      <div className="tag" style={{ marginBottom: 8, fontSize: 11 }}>{typeLabel[ex.type]}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{ex.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>+{ex.point_reward} оноо</div>
                      <div style={{ background: done ? '#16a34a' : 'var(--primary)', color: 'white', borderRadius: 8, padding: '8px', textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
                        {done ? '✓ Дахин тоглох' : 'Тоглох →'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
