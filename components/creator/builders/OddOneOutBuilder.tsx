'use client'

import { MediaUploadField } from '../shared/MediaUploadField'
import type { OddOneOutData, OddOneOutQuestion, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })

interface Props { value: OddOneOutData; onChange: (v: OddOneOutData) => void }

function SetEditor({ q, qi, onChange, onRemove, canRemove }: {
  q: OddOneOutQuestion; qi: number; onChange: (q: OddOneOutQuestion) => void; onRemove: () => void; canRemove: boolean
}) {
  const addItem = () => onChange({ ...q, items: [...q.items, { id: crypto.randomUUID(), content: empty(), isOdd: false }] })
  const removeItem = (id: string) => onChange({ ...q, items: q.items.filter((i) => i.id !== id) })
  const setOdd = (id: string) => onChange({ ...q, items: q.items.map((i) => ({ ...i, isOdd: i.id === id })) })
  const updateContent = (id: string, c: MediaContent) => onChange({ ...q, items: q.items.map((i) => i.id === id ? { ...i, content: c } : i) })

  return (
    <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-stone-600">{qi + 1}-р сет</span>
        <div className="flex gap-2">
          <button type="button" onClick={addItem} className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">+ Зүйл</button>
          {canRemove && <button type="button" onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 font-semibold">Сет устгах</button>}
        </div>
      </div>
      {q.items.map((item, i) => (
        <div key={item.id} className={`flex items-center gap-2 p-2 rounded-xl border-2 ${item.isOdd ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-white'}`}>
          <button type="button" onClick={() => setOdd(item.id)}
            className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold transition-all ${item.isOdd ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-red-100'}`}>
            Өөр
          </button>
          <div className="flex-1">
            <MediaUploadField label={`${i + 1}`} value={item.content} onChange={(c) => updateContent(item.id, c)} />
          </div>
          <button type="button" onClick={() => removeItem(item.id)} className="text-stone-400 hover:text-red-500 flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-1">Тайлбар (заавал биш)</label>
        <input type="text" value={q.explanation ?? ''} onChange={(e) => onChange({ ...q, explanation: e.target.value })}
          placeholder="Яагаад өөр болохыг..." className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
      </div>
    </div>
  )
}

export function OddOneOutBuilder({ value, onChange }: Props) {
  const addSet = () => onChange({ questions: [...value.questions, { items: [], explanation: '' }] })
  const removeSet = (i: number) => onChange({ questions: value.questions.filter((_, idx) => idx !== i) })
  const updateSet = (i: number, q: OddOneOutQuestion) => onChange({ questions: value.questions.map((s, idx) => idx === i ? q : s) })

  return (
    <div className="space-y-4">
      {value.questions.map((q, i) => (
        <SetEditor key={i} q={q} qi={i} onChange={(q) => updateSet(i, q)} onRemove={() => removeSet(i)} canRemove={value.questions.length > 1} />
      ))}
      <button type="button" onClick={addSet}
        className="w-full py-3 border-2 border-dashed border-violet-300 rounded-2xl text-sm text-violet-600 font-bold hover:bg-violet-50 transition-all">
        + Сет нэмэх
      </button>
    </div>
  )
}