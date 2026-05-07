'use client'

import { MediaUploadField } from '../shared/MediaUploadField'
import type { MatchingData, MatchingPair, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })

interface Props { value: MatchingData; onChange: (v: MatchingData) => void }

export function MatchingBuilder({ value, onChange }: Props) {
  const addPair = () => {
    const pair: MatchingPair = { id: crypto.randomUUID(), left: empty(), right: empty() }
    onChange({ ...value, pairs: [...value.pairs, pair] })
  }
  const removePair = (id: string) => onChange({ ...value, pairs: value.pairs.filter((p) => p.id !== id) })
  const update = (id: string, side: 'left' | 'right', content: MediaContent) =>
    onChange({ ...value, pairs: value.pairs.map((p) => p.id === id ? { ...p, [side]: content } : p) })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-700">Хос тааруулах картууд</p>
        <button type="button" onClick={addPair}
          className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200 transition-all">
          + Хос нэмэх
        </button>
      </div>
      {value.pairs.map((pair, i) => (
        <div key={pair.id} className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <MediaUploadField label={`Зүүн тал ${i + 1}`} value={pair.left} onChange={(c) => update(pair.id, 'left', c)} />
          <MediaUploadField label={`Баруун тал ${i + 1}`} value={pair.right} onChange={(c) => update(pair.id, 'right', c)} />
          <div className="col-span-2 flex justify-end">
            <button type="button" onClick={() => removePair(pair.id)}
              className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
              Хос устгах
            </button>
          </div>
        </div>
      ))}
      {value.pairs.length === 0 && (
        <div className="text-center py-8 text-stone-400 text-sm border-2 border-dashed border-stone-200 rounded-2xl">
          Хос нэмнэ үү
        </div>
      )}
    </div>
  )
}