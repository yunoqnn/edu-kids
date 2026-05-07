'use client'

import { useState, useEffect } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, MatchingData } from '@/types/games'

interface Card { id: string; pairId: string; side: 'left' | 'right'; content: import('@/types/games').MediaContent }

export function MatchingEngine({ data, config, onComplete }: GameEngineProps<MatchingData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100, onTimeUp: () => onComplete(session.complete()) })

  const cards: Card[] = data.pairs.flatMap((p) => [
    { id: `L-${p.id}`, pairId: p.id, side: 'left' as const, content: p.left },
    { id: `R-${p.id}`, pairId: p.id, side: 'right' as const, content: p.right },
  ])

  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [locked, setLocked] = useState(false)

  const handleFlip = (id: string) => {
    if (locked || flipped.includes(id) || matched.includes(id)) return
    const next = [...flipped, id]
    setFlipped(next)
    if (next.length === 2) {
      setLocked(true)
      const [a, b] = next.map((cid) => cards.find((c) => c.id === cid)!)
      if (a.pairId === b.pairId) {
        setMatched((m) => [...m, a.id, b.id])
        session.recordCorrect(Math.round(100 / data.pairs.length))
        setFlipped([])
        setLocked(false)
      } else {
        session.recordIncorrect()
        setTimeout(() => { setFlipped([]); setLocked(false) }, 900)
      }
    }
  }

  useEffect(() => {
    if (matched.length === cards.length) {
      setTimeout(() => onComplete(session.complete()), 500)
    }
  }, [matched, cards.length, onComplete, session])

  const cols = data.pairs.length <= 3 ? 3 : data.pairs.length <= 6 ? 4 : 6

  return (
    <GameShell title="Тааруулах" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}
      progress={{ current: matched.length / 2, total: data.pairs.length }}>
      <div className="w-full max-w-lg">
        <p className="text-center text-stone-500 text-sm mb-5">Нийлэх хосыг хайж ол</p>
        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {cards.sort(() => Math.random() - 0.5).map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id)
            const isMatched = matched.includes(card.id)
            return (
              <button key={card.id} type="button" onClick={() => handleFlip(card.id)}
                className={`aspect-square rounded-2xl border-2 flex items-center justify-center p-2 transition-all duration-200 active:scale-95
                  ${isMatched ? 'border-green-400 bg-green-50 shadow-sm'
                    : isFlipped ? 'border-violet-400 bg-violet-50 shadow-md'
                    : 'border-stone-200 bg-white hover:border-violet-300 hover:bg-violet-50'}`}>
                {isFlipped
                  ? <MediaRenderer content={card.content} size="sm" />
                  : <div className="w-full h-full rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">?</span>
                    </div>}
              </button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}