'use client'

import { MediaUploadField } from '../shared/MediaUploadField'
import type { SimpleQuizData, SimpleQuizQuestion, QuizOption, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })
const emptyOption = (): QuizOption => ({ id: crypto.randomUUID(), content: empty(), isCorrect: false })
const emptyQuestion = (): SimpleQuizQuestion => ({ question: empty(), options: [emptyOption(), emptyOption()], explanation: '' })

interface Props { value: SimpleQuizData; onChange: (v: SimpleQuizData) => void }

export function SimpleQuizBuilder({ value, onChange }: Props) {
  const updateQ = (i: number, patch: Partial<SimpleQuizQuestion>) =>
    onChange({ questions: value.questions.map((q, idx) => idx === i ? { ...q, ...patch } : q) })
  const removeQ = (i: number) => onChange({ questions: value.questions.filter((_, idx) => idx !== i) })
  const addQ = () => onChange({ questions: [...value.questions, emptyQuestion()] })

  const addOption = (qi: number) => updateQ(qi, { options: [...value.questions[qi].options, emptyOption()] })
  const removeOption = (qi: number, oid: string) => updateQ(qi, { options: value.questions[qi].options.filter((o) => o.id !== oid) })
  const setCorrect = (qi: number, oid: string) => updateQ(qi, { options: value.questions[qi].options.map((o) => ({ ...o, isCorrect: o.id === oid })) })
  const updateOption = (qi: number, oid: string, c: MediaContent) => updateQ(qi, { options: value.questions[qi].options.map((o) => o.id === oid ? { ...o, content: c } : o) })

  return (
    <div className="space-y-6">
      {value.questions.map((q, qi) => (
        <div key={qi} className="border border-stone-200 rounded-2xl p-5 space-y-4 bg-stone-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-stone-600">{qi + 1}-р асуулт</span>
            {value.questions.length > 1 && (
              <button type="button" onClick={() => removeQ(qi)} className="text-xs text-red-400 hover:text-red-600 font-semibold">Устгах</button>
            )}
          </div>

          <MediaUploadField label="Асуулт" value={q.question} onChange={(v) => updateQ(qi, { question: v })} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-stone-700">Хариултууд</label>
              <button type="button" onClick={() => addOption(qi)}
                className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">
                + Нэмэх
              </button>
            </div>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={opt.id} className={`flex items-center gap-2 p-2 rounded-xl border-2 ${opt.isCorrect ? 'border-green-400 bg-green-50' : 'border-stone-200 bg-white'}`}>
                  <button type="button" onClick={() => setCorrect(qi, opt.id)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                      ${opt.isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-stone-300 hover:border-green-400'}`}>
                    {opt.isCorrect && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>}
                  </button>
                  <div className="flex-1">
                    <MediaUploadField label={`${oi + 1}`} value={opt.content} onChange={(c) => updateOption(qi, opt.id, c)} />
                  </div>
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(qi, opt.id)} className="text-stone-400 hover:text-red-500 flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1">Тайлбар (заавал биш)</label>
            <input type="text" value={q.explanation ?? ''} onChange={(e) => updateQ(qi, { explanation: e.target.value })}
              placeholder="Зөв хариултын тайлбар..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
          </div>
        </div>
      ))}

      <button type="button" onClick={addQ}
        className="w-full py-3 border-2 border-dashed border-violet-300 rounded-2xl text-sm text-violet-600 font-bold hover:bg-violet-50 transition-all">
        + Асуулт нэмэх
      </button>
    </div>
  )
}