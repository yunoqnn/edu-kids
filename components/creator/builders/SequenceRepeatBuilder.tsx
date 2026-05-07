'use client'

import type { SequenceRepeatData } from '@/types/games'

const PRESET_COLORS = ['#F26A6A', '#7CC5F2', '#7DD3A7', '#FFC93C', '#7E5BD9', '#FF8C8C']

interface Props { value: SequenceRepeatData; onChange: (v: SequenceRepeatData) => void }

export function SequenceRepeatBuilder({ value, onChange }: Props) {
  const updateColor = (i: number, color: string) => {
    const next = [...value.tileColors]
    next[i] = color
    onChange({ ...value, tileColors: next })
  }

  const addTile = () => {
    if (value.tileCount >= 6) return
    onChange({
      ...value,
      tileCount: value.tileCount + 1,
      tileColors: [...value.tileColors, PRESET_COLORS[value.tileCount % PRESET_COLORS.length]],
    })
  }

  const removeTile = () => {
    if (value.tileCount <= 2) return
    onChange({ ...value, tileCount: value.tileCount - 1, tileColors: value.tileColors.slice(0, -1) })
  }

  const field = (label: string, key: keyof SequenceRepeatData, min: number, max: number) => (
    <div>
      <label className="block text-sm font-semibold text-stone-700 mb-1">{label}</label>
      <input type="number" min={min} max={max} value={value[key] as number}
        onChange={(e) => onChange({ ...value, [key]: parseInt(e.target.value) || min })}
        className="w-28 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
        Дараалал давтах тоглоомд агуулга байхгүй — зөвхөн тохиргоо хийнэ. Дараалал тоглоомын явцад санамсаргүй үүснэ.
      </div>

      {/* Tiles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-700">Хавтангуудын тоо ({value.tileCount})</p>
          <div className="flex gap-2">
            <button type="button" onClick={removeTile} disabled={value.tileCount <= 2}
              className="w-8 h-8 rounded-lg border border-stone-200 text-stone-600 font-bold disabled:opacity-40 hover:border-stone-300 transition-all">
              −
            </button>
            <button type="button" onClick={addTile} disabled={value.tileCount >= 6}
              className="w-8 h-8 rounded-lg border border-stone-200 text-stone-600 font-bold disabled:opacity-40 hover:border-stone-300 transition-all">
              +
            </button>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: value.tileCount }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl shadow-md" style={{ background: value.tileColors[i] }} />
              <input type="color" value={value.tileColors[i]} onChange={(e) => updateColor(i, e.target.value)}
                className="w-12 h-6 rounded-lg border-none cursor-pointer" title="Өнгө сонгох" />
            </div>
          ))}
        </div>
      </div>

      {/* Config fields */}
      <div className="grid grid-cols-2 gap-4">
        {field('Эхлэх урт', 'startLength', 1, 5)}
        {field('Хамгийн их урт', 'maxLength', 3, 20)}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Хурд (ms/хавтан)</label>
          <select value={value.displaySpeedMs} onChange={(e) => onChange({ ...value, displaySpeedMs: parseInt(e.target.value) })}
            className="w-28 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400">
            <option value={400}>Хурдан (400)</option>
            <option value={700}>Дунд (700)</option>
            <option value={1000}>Удаан (1000)</option>
            <option value={1400}>Маш удаан (1400)</option>
          </select>
        </div>
      </div>
    </div>
  )
}