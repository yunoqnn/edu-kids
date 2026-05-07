'use client'

import { MediaUploadField } from '../shared/MediaUploadField'
import type { CategorySortData, MediaContent } from '@/types/games'

const PRESET_COLORS = ['#F26A6A', '#7CC5F2', '#7DD3A7', '#FFC93C', '#7E5BD9', '#FF8C8C']
const empty = (): MediaContent => ({ type: 'text', value: '' })

interface Props { value: CategorySortData; onChange: (v: CategorySortData) => void }

export function CategorySortBuilder({ value, onChange }: Props) {
  const addCategory = () => {
    const color = PRESET_COLORS[value.categories.length % PRESET_COLORS.length]
    onChange({ ...value, categories: [...value.categories, { id: crypto.randomUUID(), label: '', color }] })
  }
  const removeCategory = (id: string) => {
    onChange({
      ...value,
      categories: value.categories.filter((c) => c.id !== id),
      items: value.items.filter((i) => i.categoryId !== id),
    })
  }
  const addItem = (catId: string) => {
    onChange({ ...value, items: [...value.items, { id: crypto.randomUUID(), content: empty(), categoryId: catId }] })
  }
  const removeItem = (id: string) => onChange({ ...value, items: value.items.filter((i) => i.id !== id) })
  const updateItemContent = (id: string, c: MediaContent) =>
    onChange({ ...value, items: value.items.map((i) => i.id === id ? { ...i, content: c } : i) })

  return (
    <div className="space-y-6">
      {/* Timer setting */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-stone-700">Нэг зүйлийн хугацаа (секунд):</label>
        <input type="number" min={2} max={30} value={value.timePerItemSeconds}
          onChange={(e) => onChange({ ...value, timePerItemSeconds: parseInt(e.target.value) || 5 })}
          className="w-20 px-3 py-1.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-700">Ангиллууд</p>
          <button type="button" onClick={addCategory}
            className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">
            + Ангилал нэмэх
          </button>
        </div>
        <div className="space-y-4">
          {value.categories.map((cat) => {
            const catItems = value.items.filter((i) => i.categoryId === cat.id)
            return (
              <div key={cat.id} className="p-4 rounded-2xl border-2" style={{ borderColor: cat.color, background: `${cat.color}10` }}>
                <div className="flex items-center gap-3 mb-3">
                  <input type="color" value={cat.color}
                    onChange={(e) => onChange({ ...value, categories: value.categories.map((c) => c.id === cat.id ? { ...c, color: e.target.value } : c) })}
                    className="w-8 h-8 rounded-lg border-none cursor-pointer" />
                  <input type="text" value={cat.label} placeholder="Ангиллын нэр"
                    onChange={(e) => onChange({ ...value, categories: value.categories.map((c) => c.id === cat.id ? { ...c, label: e.target.value } : c) })}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:border-violet-400" />
                  <button type="button" onClick={() => removeCategory(cat.id)}
                    className="text-stone-400 hover:text-red-500 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {catItems.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-stone-200">
                      <div className="flex-1">
                        <MediaUploadField label={`Зүйл ${i + 1}`} value={item.content} onChange={(c) => updateItemContent(item.id, c)} />
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-red-500 flex-shrink-0 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addItem(cat.id)}
                    className="w-full py-2 border border-dashed border-stone-300 rounded-xl text-xs text-stone-500 hover:border-violet-400 hover:text-violet-600 transition-all">
                    + Зүйл нэмэх
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}