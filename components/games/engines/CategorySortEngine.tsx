'use client'

import { useState, useEffect, useCallback } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, CategorySortData } from '@/types/games'

export function CategorySortEngine({ data, config, onComplete }: GameEngineProps<CategorySortData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100, onTimeUp: () => onComplete(session.complete()) })
  const [queue, setQueue] = useState([...data.items].sort(() => Math.random() - 0.5))
  const [timeLeft, setTimeLeft] = useState(data.timePerItemSeconds)
  const [flash, setFlash] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const current = queue[0]

  const advance = useCallback(() => {
    setQueue((q) => q.slice(1))
    setTimeLeft(data.timePerItemSeconds)
  }, [data.timePerItemSeconds])

  useEffect(() => {
    if (!current || done) return
    if (timeLeft <= 0) { session.recordIncorrect(); advance(); return }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, current, done, advance, session])

  useEffect(() => {
    if (queue.length === 0 && !done) {
      setDone(true)
      setTimeout(() => onComplete(session.complete()), 600)
    }
  }, [queue, done, onComplete, session])

  const handleCategory = (catId: string) => {
    if (!current) return
    const correct = current.categoryId === catId
    setFlash(correct ? 'correct' : 'wrong')
    if (correct) session.recordCorrect(Math.round(100 / data.items.length))
    else session.recordIncorrect()
    setTimeout(() => { setFlash(null); advance() }, 400)
  }

  const pct = (timeLeft / data.timePerItemSeconds) * 100

  if (!current) return null

  return (
    <GameShell title="Ангилаарай" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}
      progress={{ current: data.items.length - queue.length, total: data.items.length }}>
      <div className="w-full max-w-lg">
        {/* Current item */}
        <div className={`bg-white rounded-3xl border-2 shadow-sm p-8 mb-4 flex items-center justify-center min-h-[160px] transition-all duration-150
          ${flash === 'correct' ? 'border-green-400 bg-green-50' : flash === 'wrong' ? 'border-red-400 bg-red-50' : 'border-stone-200'}`}>
          <MediaRenderer content={current.content} size="lg" />
        </div>

        {/* Timer bar */}
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-6">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: pct > 50 ? '#7DD3A7' : pct > 25 ? '#FFC93C' : '#F26A6A' }} />
        </div>

        {/* Category buttons */}
        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${Math.min(data.categories.length, 3)}, 1fr)` }}>
          {data.categories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => handleCategory(cat.id)}
              className="py-5 rounded-2xl font-bold text-white text-lg active:scale-95 transition-all shadow-md hover:opacity-90"
              style={{ background: cat.color }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  )
}