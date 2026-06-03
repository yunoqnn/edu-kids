'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
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
  xp_reward: number
  stars_reward: number
  lesson_id: string
}

interface CompleteResult {
  xpEarned: number
  starsEarned: number
  newLevel: number
  leveledUp: boolean
}

export default function PlayPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId') ?? ''

  const [exercise, setExercise] = useState<ExerciseRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GameResult | null>(null)
  const [completeResult, setCompleteResult] = useState<CompleteResult | null>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    supabase
      .from('exercises')
      .select('id, title, game_type, game_config, game_data, points_reward, xp_reward, stars_reward, lesson_id')
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

    if (!studentId) return

    try {
      const response = await fetch(`/api/exercises/${exerciseId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          score:               res.score,
          correctCount:        res.correctCount,
          incorrectCount:      res.incorrectCount,
          timeElapsedSeconds:  res.timeElapsedSeconds,
        }),
      })
      if (response.ok) {
        const data: CompleteResult = await response.json()
        setCompleteResult(data)
      }
    } catch (err) {
      console.error('Complete exercise error:', err)
    }
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
      xpEarned={completeResult?.xpEarned ?? 0}
      starsEarned={completeResult?.starsEarned ?? 0}
      leveledUp={completeResult?.leveledUp ?? false}
      newLevel={completeResult?.newLevel ?? 1}
      showRewards={!!studentId}
      onPlayAgain={() => {
        setResult(null)
        setCompleteResult(null)
        setKey((k) => k + 1)
      }}
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