'use client'

import { useState } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, DragDropData } from '@/types/games'

export function DragDropEngine({ data, config, onComplete }: GameEngineProps<DragDropData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100, onTimeUp: handleDone })
  const [selected, setSelected] = useState<string | null>(null)
  /* zoneId -> itemId */
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const placedItemIds = Object.values(placements)
  const availableItems = data.items.filter((i) => !placedItemIds.includes(i.id))

  const handleItemClick = (id: string) => {
    if (checked) return
    setSelected((prev) => (prev === id ? null : id))
  }

  const handleZoneClick = (zoneId: string) => {
    if (checked) return
    if (placements[zoneId]) {
      /* Remove from zone back to tray */
      setPlacements((p) => { const n = { ...p }; delete n[zoneId]; return n })
      return
    }
    if (!selected) return
    setPlacements((p) => ({ ...p, [zoneId]: selected }))
    setSelected(null)
  }

  function handleDone() {
    setChecked(true)
    let correct = 0
    data.zones.forEach((z) => {
      if (placements[z.id] === z.acceptsItemId) { correct++; session.recordCorrect(Math.round(100 / data.zones.length)) }
      else session.recordIncorrect()
    })
    void correct
  }

  const allPlaced = availableItems.length === 0
  const isCorrect = (zoneId: string) => checked && placements[zoneId] === data.zones.find((z) => z.id === zoneId)?.acceptsItemId

  return (
    <GameShell title="Зөв байранд тавь" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}>
      <div className="w-full max-w-lg">
        <p className="text-center text-stone-500 text-sm font-medium mb-5">Зүйлсийг зөв байранд тавиарай</p>

        {/* Drop zones */}
        <div className="flex flex-col gap-3 mb-6">
          {data.zones.map((zone) => {
            const item = placements[zone.id] ? data.items.find((i) => i.id === placements[zone.id]) : null
            const correct = isCorrect(zone.id)
            const wrong = checked && placements[zone.id] && !correct
            return (
              <div key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all min-h-[72px] cursor-pointer
                  ${correct ? 'border-green-400 bg-green-50'
                    : wrong ? 'border-red-400 bg-red-50'
                    : item ? 'border-violet-400 bg-violet-50'
                    : selected ? 'border-dashed border-violet-300 bg-violet-50/50 hover:bg-violet-50'
                    : 'border-dashed border-stone-300 bg-stone-50'}`}>
                {/* Zone label */}
                <div className="flex-shrink-0 w-24">
                  <MediaRenderer content={zone.label} size="sm" />
                </div>
                <div className="flex-1 border-l border-stone-200 pl-4 flex items-center justify-center min-h-[48px]">
                  {item
                    ? <MediaRenderer content={item.content} size="sm" />
                    : <span className="text-stone-400 text-sm">{'+'}</span>}
                </div>
                {checked && (
                  <span className={`text-xl ${correct ? '✅' : '❌'}`}>{correct ? '✅' : '❌'}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Item tray */}
        {!checked && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-xs text-stone-400 font-semibold uppercase mb-3">Зүйлс</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {availableItems.map((item) => (
                <button key={item.id} type="button" onClick={() => handleItemClick(item.id)}
                  className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95 min-w-[64px]
                    ${selected === item.id ? 'border-violet-500 bg-violet-100 shadow-md scale-105' : 'border-stone-200 bg-white hover:border-violet-300'}`}>
                  <MediaRenderer content={item.content} size="sm" />
                </button>
              ))}
              {availableItems.length === 0 && <p className="text-stone-400 text-sm">Бүгд байрлуулсан</p>}
            </div>
          </div>
        )}

        {allPlaced && !checked && (
          <button onClick={handleDone}
            className="mt-5 w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
            Шалгах ✓
          </button>
        )}
        {checked && (
          <button onClick={() => onComplete(session.complete())}
            className="mt-5 w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
            Дуусгах →
          </button>
        )}
      </div>
    </GameShell>
  )
}