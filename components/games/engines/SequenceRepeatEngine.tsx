'use client'

import { useState, useEffect, useCallback } from 'react'
import { GameShell } from '../core/GameShell'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, SequenceRepeatData } from '@/types/games'

type Phase = 'showing' | 'input' | 'correct' | 'wrong' | 'done'

export function SequenceRepeatEngine({ data, config, onComplete }: GameEngineProps<SequenceRepeatData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100 })
  const [sequence, setSequence] = useState<number[]>([])
  const [player, setPlayer] = useState<number[]>([])
  const [lit, setLit] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('showing')
  const [round, setRound] = useState(1)

  const startRound = useCallback((seq: number[]) => {
    setPlayer([])
    setPhase('showing')
    let i = 0
    const show = () => {
      if (i >= seq.length) { setTimeout(() => setPhase('input'), data.displaySpeedMs); setLit(null); return }
      setLit(seq[i])
      setTimeout(() => { setLit(null); setTimeout(() => { i++; show() }, 200) }, data.displaySpeedMs)
    }
    setTimeout(show, 500)
  }, [data.displaySpeedMs])

  /* Init */
  useEffect(() => {
    const init = Array.from({ length: data.startLength }, () => Math.floor(Math.random() * data.tileCount))
    setSequence(init)
    startRound(init)
  }, [data.startLength, data.tileCount, startRound])

  const handleTap = (idx: number) => {
    if (phase !== 'input') return
    const next = [...player, idx]
    setPlayer(next)
    const pos = next.length - 1
    if (next[pos] !== sequence[pos]) {
      setPhase('wrong')
      session.recordIncorrect()
      setTimeout(() => onComplete(session.complete()), 1500)
      return
    }
    if (next.length === sequence.length) {
      setPhase('correct')
      session.recordCorrect(Math.round(100 / data.maxLength) * round)
      if (sequence.length >= data.maxLength) {
        setTimeout(() => onComplete(session.complete()), 1000)
        return
      }
      const nextSeq = [...sequence, Math.floor(Math.random() * data.tileCount)]
      setSequence(nextSeq)
      setRound((r) => r + 1)
      setTimeout(() => startRound(nextSeq), 1000)
    }
  }

  const msg = phase === 'showing' ? 'Дарааллыг санаарай...'
    : phase === 'input' ? 'Давтаарай!'
    : phase === 'correct' ? '✅ Зөв! Дараагийн давхарга...'
    : phase === 'wrong' ? '❌ Буруу! Тоглоом дууслаа.'
    : ''

  return (
    <GameShell title="Дараалал давтах" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}>
      <div className="w-full max-w-xs">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-stone-700 mb-1">{round}-р давхарга</div>
          <div className="text-sm text-stone-500 font-medium">{msg}</div>
        </div>

        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${Math.ceil(data.tileCount / 2)}, 1fr)` }}>
          {Array.from({ length: data.tileCount }).map((_, i) => (
            <button key={i} type="button" onClick={() => handleTap(i)} disabled={phase !== 'input'}
              className="aspect-square rounded-2xl transition-all duration-150 active:scale-90"
              style={{
                background: lit === i ? data.tileColors[i % data.tileColors.length] : `${data.tileColors[i % data.tileColors.length]}55`,
                border: `3px solid ${data.tileColors[i % data.tileColors.length]}`,
                boxShadow: lit === i ? `0 0 24px ${data.tileColors[i % data.tileColors.length]}` : 'none',
                transform: lit === i ? 'scale(1.08)' : 'scale(1)',
              }} />
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {sequence.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < player.length ? 'bg-violet-500' : 'bg-stone-300'}`} />
          ))}
        </div>
      </div>
    </GameShell>
  )
}