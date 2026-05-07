'use client'

import { MediaUploadField } from '../shared/MediaUploadField'
import type { PatternData, QuizOption, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })

interface Props { value: PatternData; onChange: (v: PatternData) => void }

export function PatternBuilder({ value, onChange }: Props) {
  const addSeqItem = () => onChange({ ...value, sequence: [...value.sequence, empty()] })
  const removeSeqItem = (i: number) => {
    const next = value.sequence.filter((_, idx) => idx !== i)
    onChange({ ...value, sequence: next, missingIndex: Math.min(value.missingIndex, next.length - 1) })
  }
  const updateSeq = (i: number, c: MediaContent) =>
    onChange({ ...value, sequence: value.sequence.map((s, idx) => idx === i ? c : s) })

  const addOption = () => {
    const opt: QuizOption = { id: crypto.randomUUID(), content: empty(), isCorrect: false }
    onChange({ ...value, options: [...value.options, opt] })
  }
  const removeOption = (id: string) => onChange({ ...value, options: value.options.filter((o) => o.id !== id) })
  const setCorrect = (id: string) =>
    onChange({ ...value, options: value.options.map((o) => ({ ...o, isCorrect: o.id === id })) })
  const updateOption = (id: string, c: MediaContent) =>
    onChange({ ...value, options: value.options.map((o) => o.id === id ? { ...o, content: c } : o) })

  return (
    <div className="space-y-6">
      {/* Sequence */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-700">Дараалал</p>
          <button type="button" onClick={addSeqItem}
            className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">
            + Нэмэх
          </button>
        </div>
        <div className="space-y-2">
          {value.sequence.map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${value.missingIndex === i ? 'border-amber-400 bg-amber-50' : 'border-stone-200 bg-white'}`}>
              <span className="text-xs font-bold text-stone-400 w-5">{i + 1}</span>
              <div className="flex-1">
                <MediaUploadField label="" value={item} onChange={(c) => updateSeq(i, c)} />
              </div>
              <button type="button" onClick={() => onChange({ ...value, missingIndex: i })}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${value.missingIndex === i ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-amber-100'}`}>
                ? Дутуу
              </button>
              <button type="button" onClick={() => removeSeqItem(i)}
                className="text-stone-400 hover:text-red-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
        {value.sequence.length > 0 && (
          <p className="mt-2 text-xs text-amber-600 font-medium">
            {value.missingIndex + 1}-р байрлал дутуу байна (?). Хариулт болгох байрлалыг &quot;? Дутуу&quot; товч дарж сонгоно уу.
          </p>
        )}
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-700">Хариултын сонголтууд</p>
          <button type="button" onClick={addOption}
            className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">
            + Сонголт нэмэх
          </button>
        </div>
        <div className="space-y-3">
          {value.options.map((opt, i) => (
            <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${opt.isCorrect ? 'border-green-400 bg-green-50' : 'border-stone-200 bg-white'}`}>
              <button type="button" onClick={() => setCorrect(opt.id)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                  ${opt.isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-stone-300 hover:border-green-400'}`}>
                {opt.isCorrect && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>}
              </button>
              <div className="flex-1">
                <MediaUploadField label={`Сонголт ${i + 1}`} value={opt.content} onChange={(c) => updateOption(opt.id, c)} />
              </div>
              <button type="button" onClick={() => removeOption(opt.id)}
                className="text-stone-400 hover:text-red-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}