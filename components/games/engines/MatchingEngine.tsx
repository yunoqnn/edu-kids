'use client'

import { useState, useEffect } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, MatchingData, MediaContent } from '@/types/games'

interface CardInfo { id: string; pairId: string; side: 'left' | 'right'; content: MediaContent }
interface Selected { id: string; side: 'left' | 'right'; pairId: string }

export function MatchingEngine({ data, config, onComplete }: GameEngineProps<MatchingData>) {
  const pts = Math.round(100 / data.pairs.length)
  const session = useGameSession({
    timeLimitSeconds: config.timeLimitSeconds,
    maxScore: 100,
    onTimeUp: () => onComplete(session.complete()),
  })

  const leftCards: CardInfo[] = data.pairs.map((p) => ({ id: `L-${p.id}`, pairId: p.id, side: 'left', content: p.left }))
  const [rightCards] = useState<CardInfo[]>(() =>
    [...data.pairs].sort(() => Math.random() - 0.5).map((p) => ({ id: `R-${p.id}`, pairId: p.id, side: 'right', content: p.right }))
  )

  const [selected, setSelected] = useState<Selected | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [locked, setLocked] = useState(false)

  const handleClick = (card: CardInfo) => {
    if (locked || matched.includes(card.pairId)) return
    if (!selected) { setSelected({ id: card.id, side: card.side, pairId: card.pairId }); return }
    if (selected.id === card.id) { setSelected(null); return }
    if (selected.side === card.side) { setSelected({ id: card.id, side: card.side, pairId: card.pairId }); return }
    /* Different sides — check match */
    if (selected.pairId === card.pairId) {
      setMatched((m) => [...m, card.pairId])
      session.recordCorrect(pts)
      setSelected(null)
    } else {
      setWrongIds([selected.id, card.id])
      setLocked(true)
      session.recordIncorrect()
      setTimeout(() => { setSelected(null); setWrongIds([]); setLocked(false) }, 700)
    }
  }

  useEffect(() => {
    if (matched.length === data.pairs.length) setTimeout(() => onComplete(session.complete()), 500)
  }, [matched.length, data.pairs.length])

  const cardCls = (card: CardInfo) => {
    const base = 'flex items-center justify-center p-3 rounded-2xl border-2 min-h-[64px] text-center transition-all duration-150 active:scale-95 cursor-pointer select-none'
    if (matched.includes(card.pairId))    return `${base} border-green-400 bg-green-50 opacity-60`
    if (wrongIds.includes(card.id))       return `${base} border-red-400 bg-red-50`
    if (selected?.id === card.id)         return `${base} border-violet-500 bg-violet-100 shadow-md scale-105`
    return `${base} border-stone-200 bg-white hover:border-violet-300 hover:bg-violet-50`
  }

  return (
    <GameShell
      title="Хос тааруулах"
      score={session.score}
      timeRemaining={session.timeRemaining}
      timeLimitSeconds={config.timeLimitSeconds}
      progress={{ current: matched.length, total: data.pairs.length }}
    >
      <div className="w-full max-w-lg">
        <p className="text-center text-stone-500 text-sm mb-5 font-medium">
          Зүүнээс нэг, баруунаас нэг сонгоод тааруулаарай
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-stone-400 text-center uppercase tracking-wide">A</p>
            {leftCards.map((card) => (
              <button key={card.id} type="button" onClick={() => handleClick(card)} className={cardCls(card)}>
                <MediaRenderer content={card.content} size="sm" />
              </button>
            ))}
          </div>
          {/* Right column — shuffled */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-stone-400 text-center uppercase tracking-wide">B</p>
            {rightCards.map((card) => (
              <button key={card.id} type="button" onClick={() => handleClick(card)} className={cardCls(card)}>
                <MediaRenderer content={card.content} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  )
}