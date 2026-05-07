'use client'

import { useState, useEffect } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, SoundMemoryData } from '@/types/games'

interface Card { id: string; pairId: string; type: 'audio' | 'match'; content: import('@/types/games').MediaContent }

export function SoundMemoryEngine({ data, config, onComplete }: GameEngineProps<SoundMemoryData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100, onTimeUp: () => onComplete(session.complete()) })

  const cards: Card[] = data.pairs.flatMap((p) => [
    { id: `A-${p.id}`, pairId: p.id, type: 'audio' as const, content: { type: 'audio' as const, value: p.audio } },
    { id: `M-${p.id}`, pairId: p.id, type: 'match' as const, content: p.match },
  ])

  const [shuffled] = useState(() => [...cards].sort(() => Math.random() - 0.5))
  const [revealed, setRevealed] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [locked, setLocked] = useState(false)

  const handlePick = (id: string) => {
    if (locked || matched.includes(id)) return
    if (revealed.includes(id)) return
    const next = [...revealed, id]
    setRevealed(next)
    if (next.length === 2) {
      setLocked(true)
      const [a, b] = next.map((cid) => shuffled.find((c) => c.id === cid)!)
      if (a.pairId === b.pairId) {
        setMatched((m) => [...m, a.id, b.id])
        session.recordCorrect(Math.round(100 / data.pairs.length))
        setRevealed([])
        setLocked(false)
      } else {
        session.recordIncorrect()
        setTimeout(() => { setRevealed([]); setLocked(false) }, 1200)
      }
    }
  }

  useEffect(() => {
    if (matched.length === cards.length) setTimeout(() => onComplete(session.complete()), 600)
  }, [matched, cards.length, onComplete, session])

  return (
    <GameShell title="Дуу санах" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}
      progress={{ current: matched.length / 2, total: data.pairs.length }}>
      <div className="w-full max-w-sm">
        <p className="text-center text-stone-500 text-sm mb-5">Дуу болон зургийн хосыг ол</p>
        <div className="grid grid-cols-4 gap-2">
          {shuffled.map((card) => {
            const isRevealed = revealed.includes(card.id) || matched.includes(card.id)
            const isMatched = matched.includes(card.id)
            return (
              <button key={card.id} type="button" onClick={() => handlePick(card.id)}
                className={`aspect-square rounded-2xl border-2 flex items-center justify-center p-1.5 transition-all active:scale-95
                  ${isMatched ? 'border-green-400 bg-green-50'
                    : isRevealed ? 'border-violet-400 bg-violet-50 shadow-md'
                    : 'border-stone-200 bg-white hover:border-violet-300'}`}>
                {isRevealed
                  ? <MediaRenderer content={card.content} size="sm" />
                  : <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-xl">🎵</span>
                    </div>}
              </button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}