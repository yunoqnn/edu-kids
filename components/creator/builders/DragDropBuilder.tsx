'use client'

import { MediaUploadField } from '../shared/MediaUploadField'
import type { DragDropData, DragDropItem, DragDropZone, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })

interface Props { value: DragDropData; onChange: (val: DragDropData) => void }

export function DragDropBuilder({ value, onChange }: Props) {
  const addPair = () => {
    const id = crypto.randomUUID()
    const item: DragDropItem = { id, content: empty() }
    const zone: DragDropZone = { id: crypto.randomUUID(), label: empty(), acceptsItemId: id }
    onChange({ ...value, items: [...value.items, item], zones: [...value.zones, zone] })
  }

  const removePair = (itemId: string) => {
    const zone = value.zones.find((z) => z.acceptsItemId === itemId)
    onChange({
      ...value,
      items: value.items.filter((i) => i.id !== itemId),
      zones: zone ? value.zones.filter((z) => z.id !== zone.id) : value.zones,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-700">Зүйл → Байрлал хосууд</p>
        <button type="button" onClick={addPair}
          className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200 transition-all">
          + Хос нэмэх
        </button>
      </div>

      {value.items.map((item, i) => {
        const zone = value.zones.find((z) => z.acceptsItemId === item.id)
        if (!zone) return null
        return (
          <div key={item.id} className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <MediaUploadField label={`Зүйл ${i + 1}`} value={item.content}
                onChange={(c) => onChange({ ...value, items: value.items.map((it) => it.id === item.id ? { ...it, content: c } : it) })} />
            </div>
            <div>
              <MediaUploadField label={`Байрлал ${i + 1}`} value={zone.label}
                onChange={(c) => onChange({ ...value, zones: value.zones.map((z) => z.id === zone.id ? { ...z, label: c } : z) })} />
            </div>
            <div className="col-span-2 flex justify-end">
              <button type="button" onClick={() => removePair(item.id)}
                className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
                Хос устгах
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}