'use client'

import { useState, useMemo } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, SimpleQuizData } from '@/types/games'

export function SimpleQuizEngine({ data, config, onComplete }: GameEngineProps<SimpleQuizData>) {
  const total = data.questions.length
  const pts = Math.round(100 / total)

  const session = useGameSession({
    timeLimitSeconds: config.timeLimitSeconds,
    maxScore: 100,
    onTimeUp: () => onComplete(session.complete()),
  })

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const q = data.questions[index]

  const options = useMemo(
    () => config.shuffleOptions ? [...q.options].sort(() => Math.random() - 0.5) : q.options,
    [index, q, config.shuffleOptions]
  )

  const handle = (id: string) => {
    if (showFeedback) return
    setSelected(id)
    setShowFeedback(true)
    const correct = q.options.find((o) => o.id === id)?.isCorrect
    if (correct) session.recordCorrect(pts)
    else session.recordIncorrect()
  }

  const handleNext = () => {
    if (index + 1 >= total) {
      onComplete(session.complete())
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
      setShowFeedback(false)
    }
  }

  const LABELS = ['А', 'Б', 'В', 'Г', 'Д']

  const btnCls = (id: string) => {
    const base = 'w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 active:scale-95'
    if (!showFeedback) return `${base} ${selected === id ? 'border-violet-500 bg-violet-50' : 'border-stone-200 bg-white hover:border-violet-300'} cursor-pointer`
    const opt = q.options.find((o) => o.id === id)
    if (opt?.isCorrect) return `${base} border-green-400 bg-green-50 cursor-default`
    if (id === selected) return `${base} border-red-400 bg-red-50 cursor-default`
    return `${base} border-stone-200 bg-white opacity-50 cursor-default`
  }

  return (
    <GameShell
      title="Асуулт"
      score={session.score}
      timeRemaining={session.timeRemaining}
      timeLimitSeconds={config.timeLimitSeconds}
      progress={{ current: index + 1, total }}
    >
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 mb-5 flex flex-col items-center gap-3 min-h-[140px] justify-center">
          <MediaRenderer content={q.question} size="lg" />
        </div>

        <div className="flex flex-col gap-3">
          {options.map((opt, i) => (
            <button key={opt.id} type="button" onClick={() => handle(opt.id)} className={btnCls(opt.id)}>
              <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
                ${showFeedback && q.options.find((o) => o.id === opt.id)?.isCorrect ? 'bg-green-500 text-white'
                  : showFeedback && opt.id === selected ? 'bg-red-400 text-white'
                  : 'bg-stone-100 text-stone-600'}`}>
                {LABELS[i]}
              </span>
              <MediaRenderer content={opt.content} size="sm" />
            </button>
          ))}
        </div>

        {showFeedback && q.explanation && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 font-medium">
            {q.explanation}
          </div>
        )}

        {showFeedback && (
          <button onClick={handleNext}
            className="mt-5 w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
            {index + 1 >= total ? 'Дуусгах →' : 'Дараагийн асуулт →'}
          </button>
        )}
      </div>
    </GameShell>
  )
}