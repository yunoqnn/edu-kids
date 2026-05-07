'use client'

import { useState, useMemo } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, SimpleQuizData } from '@/types/games'

export function SimpleQuizEngine({ data, config, onComplete }: GameEngineProps<SimpleQuizData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100, onTimeUp: () => onComplete(session.complete()) })
  const [selected, setSelected] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const options = useMemo(() =>
    config.shuffleOptions ? [...data.options].sort(() => Math.random() - 0.5) : data.options
  , [data.options, config.shuffleOptions])

  const handle = (id: string) => {
    if (showFeedback) return
    setSelected(id)
    setShowFeedback(true)
    const correct = data.options.find((o) => o.id === id)?.isCorrect
    if (correct) session.recordCorrect(100)
    else session.recordIncorrect()
  }

  const LABELS = ['А', 'Б', 'В', 'Г', 'Д']

  const btnCls = (id: string) => {
    const base = 'w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 active:scale-95'
    if (!showFeedback) {
      return `${base} ${selected === id ? 'border-violet-500 bg-violet-50' : 'border-stone-200 bg-white hover:border-violet-300'} cursor-pointer`
    }
    const opt = data.options.find((o) => o.id === id)
    if (opt?.isCorrect) return `${base} border-green-400 bg-green-50 cursor-default`
    if (id === selected) return `${base} border-red-400 bg-red-50 cursor-default`
    return `${base} border-stone-200 bg-white opacity-50 cursor-default`
  }

  return (
    <GameShell title="Асуулт" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}>
      <div className="w-full max-w-lg">
        {/* Question card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 mb-5 flex flex-col items-center gap-3 min-h-[140px] justify-center">
          <MediaRenderer content={data.question} size="lg" />
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {options.map((opt, i) => (
            <button key={opt.id} type="button" onClick={() => handle(opt.id)} className={btnCls(opt.id)}>
              <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
                ${showFeedback && data.options.find((o) => o.id === opt.id)?.isCorrect ? 'bg-green-500 text-white'
                  : showFeedback && opt.id === selected ? 'bg-red-400 text-white'
                  : 'bg-stone-100 text-stone-600'}`}>
                {showFeedback && opt.id === selected
                  ? (data.options.find((o) => o.id === opt.id)?.isCorrect ? '✓' : '✗')
                  : LABELS[i]}
              </span>
              <MediaRenderer content={opt.content} size="sm" />
            </button>
          ))}
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