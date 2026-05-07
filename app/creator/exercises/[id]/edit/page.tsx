'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { GameBuilder } from '@/components/creator/GameBuilder'
import type { GameType, GameConfig, AnyGameData } from '@/types/games'

function EditExercisePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<{ lessonId: string; gameType: GameType; gameData: AnyGameData; config: GameConfig; title: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user || auth.user.user_metadata?.role !== 'CONTENT_CREATOR') { router.push('/'); return }
      const { data: ex, error: err } = await supabase
        .from('exercises')
        .select('lesson_id, game_type, game_data, game_config, title')
        .eq('id', id)
        .single()
      if (err || !ex) { setError('Дасгал олдсонгүй'); return }
      setData({ lessonId: ex.lesson_id, gameType: ex.game_type, gameData: ex.game_data, config: ex.game_config, title: ex.title })
    })
  }, [id, router])

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>
  if (!data) return <div className="min-h-screen flex items-center justify-center text-stone-400 animate-pulse">Уншиж байна...</div>

  return (
    <GameBuilder
      lessonId={data.lessonId}
      exerciseId={id}
      initialType={data.gameType}
      initialData={data.gameData}
      initialConfig={data.config}
      initialTitle={data.title}
    />
  )
}

export default function Page() {
  return <Suspense><EditExercisePage /></Suspense>
}