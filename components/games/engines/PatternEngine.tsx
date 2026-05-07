'use client'

import { useState } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, PatternData } from '@/types/games'

export function PatternEngine({ data, config, onComplete }: GameEngineProps<PatternData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100, onTimeUp: () => onComplete(session.complete()) })
  const [selected, setSelected] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handle = (id: string) => {
    if (showFeedback) return
    setSelected(id)
    setShowFeedback(true)
    const correct = data.options.find((o) => o.id === id)?.isCorrect
    if (correct) session.recordCorrect(100)
    else session.recordIncorrect()
  }

  return (
    <GameShell title="Дараалал" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}>
      <div className="w-full max-w-lg">
        <p className="text-center text-stone-500 text-sm mb-5">Дараалалд тохирох зүйлийг сонго</p>

        {/* Sequence row */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {data.sequence.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {i === data.missingIndex
                  ? <div className="w-16 h-16 rounded-xl border-2 border-dashed border-violet-400 bg-violet-50 flex items-center justify-center">
                      {showFeedback
                        ? <MediaRenderer content={data.options.find((o) => o.isCorrect)!.content} size="sm" />
                        : <span className="text-violet-400 text-2xl font-bold">?</span>}
                    </div>
                  : <div className="w-16 h-16 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center p-1">
                      <MediaRenderer content={item} size="sm" />
                    </div>}
                {i < data.sequence.length - 1 && i !== data.missingIndex - 1 && (
                  <span className="text-stone-400 font-bold">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {data.options.map((opt) => {
            const isSelected = selected === opt.id
            const color = !showFeedback ? ''
              : opt.isCorrect ? 'border-green-400 bg-green-50'
              : isSelected ? 'border-red-400 bg-red-50'
              : 'opacity-50'
            return (
              <button key={opt.id} type="button" onClick={() => handle(opt.id)}
                className={`flex items-center justify-center p-5 rounded-2xl border-2 transition-all active:scale-95 min-h-[80px]
                  ${showFeedback ? color : isSelected ? 'border-violet-500 bg-violet-50' : 'border-stone-200 bg-white hover:border-violet-300'}
                  ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}>
                <MediaRenderer content={opt.content} size="md" />
              </button>
            )
          })}
        </div>

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