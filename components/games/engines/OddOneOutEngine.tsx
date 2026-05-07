'use client'

import { useState } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, OddOneOutData } from '@/types/games'

export function OddOneOutEngine({ data, config, onComplete }: GameEngineProps<OddOneOutData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100, onTimeUp: () => onComplete(session.complete()) })
  const [selected, setSelected] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handle = (id: string) => {
    if (showFeedback) return
    setSelected(id)
    setShowFeedback(true)
    const correct = data.items.find((i) => i.id === id)?.isOdd
    if (correct) session.recordCorrect(100)
    else session.recordIncorrect()
  }

  const cols = data.items.length <= 4 ? 2 : 3

  return (
    <GameShell title="Өөр нэгийг ол" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <span className="inline-block bg-amber-100 text-amber-800 rounded-full px-4 py-1.5 text-sm font-bold">
            Үлдсэнтэйгээ таарахгүй нэгийг сонго
          </span>
        </div>
        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {data.items.map((item) => {
            const isSelected = selected === item.id
            const color = !showFeedback ? ''
              : item.isOdd ? 'border-green-400 bg-green-50'
              : isSelected ? 'border-red-400 bg-red-50'
              : 'opacity-60'
            return (
              <button key={item.id} type="button" onClick={() => handle(item.id)}
                className={`flex items-center justify-center p-4 rounded-2xl border-2 min-h-[88px] transition-all active:scale-95
                  ${showFeedback ? color : isSelected ? 'border-violet-500 bg-violet-50 scale-105 shadow-md' : 'border-stone-200 bg-white hover:border-violet-300'}
                  ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}>
                <MediaRenderer content={item.content} size="md" />
              </button>
            )
          })}
        </div>

        {showFeedback && data.explanation && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 font-medium">
            💡 {data.explanation}
          </div>
        )}
        {showFeedback && (
          <button onClick={() => onComplete(session.complete())}
            className="mt-5 w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
            Дуусгах →
          </button>
        )}
      </div>
    </GameShell>
  )
}