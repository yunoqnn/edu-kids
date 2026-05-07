'use client'

import { MediaUploadField } from '../shared/MediaUploadField'
import type { OddOneOutData, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })

interface Props { value: OddOneOutData; onChange: (v: OddOneOutData) => void }

export function OddOneOutBuilder({ value, onChange }: Props) {
  const addItem = () => {
    onChange({ ...value, items: [...value.items, { id: crypto.randomUUID(), content: empty(), isOdd: false }] })
  }
  const removeItem = (id: string) => onChange({ ...value, items: value.items.filter((i) => i.id !== id) })
  const setOdd = (id: string) => onChange({ ...value, items: value.items.map((i) => ({ ...i, isOdd: i.id === id })) })
  const updateContent = (id: string, c: MediaContent) =>
    onChange({ ...value, items: value.items.map((i) => i.id === id ? { ...i, content: c } : i) })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-700">Зүйлс (нэг нь өөр байх ёстой)</p>
        <button type="button" onClick={addItem}
          className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">
          + Нэмэх
        </button>
      </div>
      <div className="space-y-3">
        {value.items.map((item, i) => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${item.isOdd ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-white'}`}>
            <button type="button" onClick={() => setOdd(item.id)}
              className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold transition-all
                ${item.isOdd ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-red-100'}`}>
              Өөр
            </button>
            <div className="flex-1">
              <MediaUploadField label={`Зүйл ${i + 1}`} value={item.content} onChange={(c) => updateContent(item.id, c)} />
            </div>
            <button type="button" onClick={() => removeItem(item.id)}
              className="text-stone-400 hover:text-red-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1">Тайлбар (заавал биш)</label>
        <input type="text" value={value.explanation ?? ''} onChange={(e) => onChange({ ...value, explanation: e.target.value })}
          placeholder="Яагаад өөр болохыг тайлбарлана уу..."
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
      </div>
    </div>
  )
}