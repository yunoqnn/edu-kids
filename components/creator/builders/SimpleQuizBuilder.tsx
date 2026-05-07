'use client'

import { useState } from 'react'
import { MediaUploadField } from '../shared/MediaUploadField'
import type { SimpleQuizData, QuizOption, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })
const emptyOption = (): QuizOption => ({ id: crypto.randomUUID(), content: empty(), isCorrect: false })

interface Props {
  value: SimpleQuizData
  onChange: (val: SimpleQuizData) => void
}

export function SimpleQuizBuilder({ value, onChange }: Props) {
  const addOption = () => onChange({ ...value, options: [...value.options, emptyOption()] })
  const removeOption = (id: string) => onChange({ ...value, options: value.options.filter((o) => o.id !== id) })
  const updateOption = (id: string, patch: Partial<QuizOption>) =>
    onChange({ ...value, options: value.options.map((o) => o.id === id ? { ...o, ...patch } : o) })
  const setCorrect = (id: string) =>
    onChange({ ...value, options: value.options.map((o) => ({ ...o, isCorrect: o.id === id })) })

  return (
    <div className="space-y-6">
      <MediaUploadField label="Асуулт" value={value.question} onChange={(q) => onChange({ ...value, question: q })} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-stone-700">Хариултууд</label>
          <button type="button" onClick={addOption}
            className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200 transition-all">
            + Хариулт нэмэх
          </button>
        </div>
        <div className="space-y-3">
          {value.options.map((opt, i) => (
            <div key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all
              ${opt.isCorrect ? 'border-green-400 bg-green-50' : 'border-stone-200 bg-white'}`}>
              <button type="button" onClick={() => setCorrect(opt.id)}
                className={`mt-1 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                  ${opt.isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-stone-300 hover:border-green-400'}`}>
                {opt.isCorrect && <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>}
              </button>
              <div className="flex-1">
                <MediaUploadField label={`Сонголт ${i + 1}`} value={opt.content} onChange={(c) => updateOption(opt.id, { content: c })} />
              </div>
              <button type="button" onClick={() => removeOption(opt.id)}
                className="mt-1 text-stone-400 hover:text-red-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1">Тайлбар (заавал биш)</label>
        <input type="text" value={value.explanation ?? ''} onChange={(e) => onChange({ ...value, explanation: e.target.value })}
          placeholder="Зөв хариултын тайлбар..."
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
      </div>
    </div>
  )
}