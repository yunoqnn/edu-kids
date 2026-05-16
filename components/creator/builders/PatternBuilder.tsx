'use client'

import { MediaUploadField } from '../shared/MediaUploadField'
import type { PatternData, PatternQuestion, QuizOption, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })

interface Props { value: PatternData; onChange: (v: PatternData) => void }

function QuestionEditor({ q, qi, onChange, onRemove, canRemove }: {
  q: PatternQuestion; qi: number; onChange: (q: PatternQuestion) => void; onRemove: () => void; canRemove: boolean
}) {
  const addSeq = () => onChange({ ...q, sequence: [...q.sequence, empty()] })
  const removeSeq = (i: number) => {
    const next = q.sequence.filter((_, idx) => idx !== i)
    onChange({ ...q, sequence: next, missingIndex: Math.min(q.missingIndex, next.length - 1) })
  }
  const addOption = () => {
    const opt: QuizOption = { id: crypto.randomUUID(), content: empty(), isCorrect: false }
    onChange({ ...q, options: [...q.options, opt] })
  }
  const removeOption = (id: string) => onChange({ ...q, options: q.options.filter((o) => o.id !== id) })
  const setCorrect = (id: string) => onChange({ ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.id === id })) })

  return (
    <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-stone-600">{qi + 1}-р дараалал</span>
        {canRemove && <button type="button" onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 font-semibold">Устгах</button>}
      </div>

      {/* Sequence */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-stone-700">Дараалал</label>
          <button type="button" onClick={addSeq} className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">+ Нэмэх</button>
        </div>
        {q.sequence.map((item, i) => (
          <div key={i} className={`flex items-center gap-2 p-2 mb-2 rounded-xl border-2 ${q.missingIndex === i ? 'border-amber-400 bg-amber-50' : 'border-stone-200 bg-white'}`}>
            <span className="text-xs font-bold text-stone-400 w-4">{i + 1}</span>
            <div className="flex-1"><MediaUploadField label="" value={item} onChange={(c) => onChange({ ...q, sequence: q.sequence.map((s, idx) => idx === i ? c : s) })} /></div>
            <button type="button" onClick={() => onChange({ ...q, missingIndex: i })}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${q.missingIndex === i ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-amber-100'}`}>?</button>
            <button type="button" onClick={() => removeSeq(i)} className="text-stone-400 hover:text-red-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Text input toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={q.allowTextInput ?? false} onChange={(e) => onChange({ ...q, allowTextInput: e.target.checked })}
          className="w-4 h-4 accent-violet-600" />
        <span className="text-sm font-medium text-stone-700">Текс бичих хариулт зөвшөөрөх</span>
      </label>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-stone-700">Сонголтууд (заавал биш)</label>
          <button type="button" onClick={addOption} className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">+ Нэмэх</button>
        </div>
        {q.options.map((opt, oi) => (
          <div key={opt.id} className={`flex items-center gap-2 p-2 mb-2 rounded-xl border-2 ${opt.isCorrect ? 'border-green-400 bg-green-50' : 'border-stone-200 bg-white'}`}>
            <button type="button" onClick={() => setCorrect(opt.id)}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${opt.isCorrect ? 'border-green-500 bg-green-500' : 'border-stone-300 hover:border-green-400'}`}>
              {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
            </button>
            <div className="flex-1"><MediaUploadField label={`${oi + 1}`} value={opt.content} onChange={(c) => onChange({ ...q, options: q.options.map((o) => o.id === opt.id ? { ...o, content: c } : o) })} /></div>
            <button type="button" onClick={() => removeOption(opt.id)} className="text-stone-400 hover:text-red-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PatternBuilder({ value, onChange }: Props) {
  const addQ = () => onChange({ questions: [...value.questions, { sequence: [], missingIndex: 0, options: [], allowTextInput: false }] })
  const removeQ = (i: number) => onChange({ questions: value.questions.filter((_, idx) => idx !== i) })
  const updateQ = (i: number, q: PatternQuestion) => onChange({ questions: value.questions.map((item, idx) => idx === i ? q : item) })

  return (
    <div className="space-y-4">
      {value.questions.map((q, i) => (
        <QuestionEditor key={i} q={q} qi={i} onChange={(q) => updateQ(i, q)} onRemove={() => removeQ(i)} canRemove={value.questions.length > 1} />
      ))}
      <button type="button" onClick={addQ}
        className="w-full py-3 border-2 border-dashed border-violet-300 rounded-2xl text-sm text-violet-600 font-bold hover:bg-violet-50 transition-all">
        + Дараалал нэмэх
      </button>
    </div>
  )
}