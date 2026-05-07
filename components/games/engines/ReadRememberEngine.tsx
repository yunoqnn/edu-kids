'use client'

import { useState, useEffect } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, ReadRememberData } from '@/types/games'

type Phase = 'reading' | 'quiz'

export function ReadRememberEngine({ data, config, onComplete }: GameEngineProps<ReadRememberData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100 })
  const [phase, setPhase] = useState<Phase>('reading')
  const [countdown, setCountdown] = useState(data.displayDurationSeconds ?? 0)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    if (phase !== 'reading' || !data.displayDurationSeconds) return
    if (countdown <= 0) { setPhase('quiz'); return }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown, data.displayDurationSeconds])

  const currentQ = data.questions[qIndex]

  const handleAnswer = (id: string) => {
    if (showFeedback) return
    setSelected(id)
    setShowFeedback(true)
    const correct = currentQ.options.find((o) => o.id === id)?.isCorrect
    if (correct) session.recordCorrect(Math.round(100 / data.questions.length))
    else session.recordIncorrect()
  }

  const handleNext = () => {
    if (qIndex + 1 >= data.questions.length) { onComplete(session.complete()); return }
    setQIndex((i) => i + 1)
    setSelected(null)
    setShowFeedback(false)
  }

  const LABELS = ['А', 'Б', 'В', 'Г']

  return (
    <GameShell title="Уншиж санаарай" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}
      progress={phase === 'quiz' ? { current: qIndex, total: data.questions.length } : undefined}>

      {phase === 'reading' ? (
        <div className="w-full max-w-lg">
          {data.displayDurationSeconds && countdown > 0 && (
            <div className="text-center mb-4">
              <span className="bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-sm font-bold">
                {countdown}с дараа алга болно
              </span>
            </div>
          )}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 mb-6 flex flex-col items-center gap-4">
            <MediaRenderer content={data.studyContent} size="lg" className="max-w-sm" />
          </div>
          {!data.displayDurationSeconds && (
            <button onClick={() => setPhase('quiz')}
              className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
              Уншиж дууслаа →
            </button>
          )}
        </div>
      ) : (
        <div className="w-full max-w-lg">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-center font-bold text-stone-700">
            {currentQ.questionText}
          </div>
          <div className="flex flex-col gap-3">
            {currentQ.options.map((opt, i) => {
              const isSelected = selected === opt.id
              const color = !showFeedback ? ''
                : opt.isCorrect ? 'border-green-400 bg-green-50'
                : isSelected ? 'border-red-400 bg-red-50'
                : 'opacity-50'
              return (
                <button key={opt.id} type="button" onClick={() => handleAnswer(opt.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all active:scale-95
                    ${showFeedback ? color : isSelected ? 'border-violet-500 bg-violet-50' : 'border-stone-200 bg-white hover:border-violet-300'}
                    ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}>
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
                    ${showFeedback && opt.isCorrect ? 'bg-green-500 text-white'
                      : showFeedback && isSelected ? 'bg-red-400 text-white'
                      : 'bg-stone-100 text-stone-600'}`}>
                    {showFeedback && isSelected ? (opt.isCorrect ? '✓' : '✗') : LABELS[i]}
                  </span>
                  <span className="font-medium text-stone-700">{opt.text}</span>
                </button>
              )
            })}
          </div>
          {showFeedback && (
            <button onClick={handleNext}
              className="mt-5 w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
              {qIndex + 1 >= data.questions.length ? 'Дуусгах →' : 'Дараагийн асуулт →'}
            </button>
          )}
        </div>
      )}
    </GameShell>
  )
}