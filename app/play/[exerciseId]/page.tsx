'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { GAME_REGISTRY } from '@/components/games/registry'
import { GameResultScreen } from '@/components/games/core/GameResult'
import type { GameType, GameConfig, AnyGameData, GameResult } from '@/types/games'

interface ExerciseRow {
  id: string
  title: string
  game_type: GameType
  game_config: GameConfig
  game_data: AnyGameData
  points_reward: number
  lesson_id: string
}

export default function PlayPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const [exercise, setExercise] = useState<ExerciseRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GameResult | null>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    supabase
      .from('exercises')
      .select('id, title, game_type, game_config, game_data, points_reward, lesson_id')
      .eq('id', exerciseId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError('Дасгал олдсонгүй'); setLoading(false); return }
        setExercise(data as ExerciseRow)
        setLoading(false)
      })
  }, [exerciseId])

  const handleComplete = async (res: GameResult) => {
    setResult(res)
    /* Save attempt — student context needed; for now save with anon student_id */
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    /* Find student_id for this user's child currently playing */
    /* TODO: pass studentId via URL param when routing from student dashboard */
    await supabase.from('exercise_attempts').insert({
      exercise_id: exerciseId,
      student_id: user.id, /* replace with actual student_id */
      score: res.score,
      correct_count: res.correctCount,
      completed_at: new Date().toISOString(),
    })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50">
      <div className="text-violet-600 font-bold text-lg animate-pulse">Уншиж байна...</div>
    </div>
  )

  if (error || !exercise) return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50">
      <div className="text-red-500 font-bold">{error}</div>
    </div>
  )

  if (result) return (
    <GameResultScreen
      result={result}
      title={exercise.title}
      onPlayAgain={() => { setResult(null); setKey((k) => k + 1) }}
    />
  )

  const Engine = GAME_REGISTRY[exercise.game_type]
  if (!Engine) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-500">Тоглоомын төрөл олдсонгүй: {exercise.game_type}</div>
    </div>
  )

  return (
    <Engine
      key={key}
      data={exercise.game_data}
      config={exercise.game_config}
      onComplete={handleComplete}
    />
  )
}