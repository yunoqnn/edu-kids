'use client'

import { useState } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, PatternData } from '@/types/games'

export function PatternEngine({ data, config, onComplete }: GameEngineProps<PatternData>) {
  const total = data.questions.length
  const pts = Math.round(100 / total)

  const session = useGameSession({
    timeLimitSeconds: config.timeLimitSeconds,
    maxScore: 100,
    onTimeUp: () => onComplete(session.complete()),
  })

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [textCorrect, setTextCorrect] = useState<boolean | null>(null)

  const q = data.questions[index]
  const correctAnswer = q.options.find((o) => o.isCorrect)?.content.value ?? ''

  const handleOption = (id: string) => {
    if (showFeedback) return
    setSelected(id)
    setShowFeedback(true)
    const correct = q.options.find((o) => o.id === id)?.isCorrect
    if (correct) session.recordCorrect(pts)
    else session.recordIncorrect()
  }

  const handleTextSubmit = () => {
    if (showFeedback || !textInput.trim()) return
    const correct = textInput.trim().toLowerCase() === correctAnswer.toLowerCase()
    setTextCorrect(correct)
    setShowFeedback(true)
    if (correct) session.recordCorrect(pts)
    else session.recordIncorrect()
  }

  const handleNext = () => {
    if (index + 1 >= total) { onComplete(session.complete()); return }
    setIndex((i) => i + 1)
    setSelected(null)
    setTextInput('')
    setShowFeedback(false)
    setTextCorrect(null)
  }

  return (
    <GameShell
      title="Дараалал"
      score={session.score}
      timeRemaining={session.timeRemaining}
      timeLimitSeconds={config.timeLimitSeconds}
      progress={{ current: index + 1, total }}
    >
      <div className="w-full max-w-lg">
        <p className="text-center text-stone-500 text-sm mb-5">Дараалалд тохирох зүйлийг олоорой</p>

        {/* Sequence row */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {q.sequence.map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                {i === q.missingIndex
                  ? <div className="w-16 h-16 rounded-xl border-2 border-dashed border-violet-400 bg-violet-50 flex items-center justify-center">
                      {showFeedback
                        ? <MediaRenderer content={q.options.find((o) => o.isCorrect)!.content} size="sm" />
                        : <span className="text-violet-400 text-2xl font-bold">?</span>}
                    </div>
                  : <div className="w-16 h-16 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center p-1">
                      <MediaRenderer content={item} size="sm" />
                    </div>}
                {i < q.sequence.length - 1 && <span className="text-stone-300 font-bold text-sm">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Text input mode */}
        {q.allowTextInput && (
          <div className="mb-4">
            <p className="text-xs text-stone-400 font-semibold mb-2">Хариултаа бич:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                disabled={showFeedback}
                placeholder="Хариулт оруулах..."
                className={`flex-1 px-4 py-3 rounded-xl border-2 text-base font-semibold focus:outline-none transition-all
                  ${showFeedback && textCorrect === true ? 'border-green-400 bg-green-50 text-green-700'
                    : showFeedback && textCorrect === false ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-stone-200 focus:border-violet-400'}`}
              />
              {!showFeedback && (
                <button onClick={handleTextSubmit}
                  className="px-4 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 active:scale-95 transition-all">
                  OK
                </button>
              )}
            </div>
            {showFeedback && textCorrect === false && (
              <p className="text-red-500 text-sm mt-1">Зөв хариулт: <span className="font-bold">{correctAnswer}</span></p>
            )}
          </div>
        )}

        {/* Multiple choice options */}
        {q.options.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => {
              const isSelected = selected === opt.id
              const color = !showFeedback ? ''
                : opt.isCorrect ? 'border-green-400 bg-green-50'
                : isSelected ? 'border-red-400 bg-red-50' : 'opacity-50'
              return (
                <button key={opt.id} type="button" onClick={() => handleOption(opt.id)}
                  className={`flex items-center justify-center p-5 rounded-2xl border-2 min-h-[80px] transition-all active:scale-95
                    ${showFeedback ? color : isSelected ? 'border-violet-500 bg-violet-50' : 'border-stone-200 bg-white hover:border-violet-300'}
                    ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}>
                  <MediaRenderer content={opt.content} size="md" />
                </button>
              )
            })}
          </div>
        )}

        {showFeedback && (
          <button onClick={handleNext}
            className="mt-5 w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
            {index + 1 >= total ? 'Дуусгах →' : 'Дараагийн →'}
          </button>
        )}
      </div>
    </GameShell>
  )
}