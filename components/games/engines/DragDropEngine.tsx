'use client'

import { useState, useEffect } from 'react'
import { GameShell } from '../core/GameShell'
import { MediaRenderer } from '../core/MediaRenderer'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, DragDropData, DragDropRound } from '@/types/games'

export function DragDropEngine({ data, config, onComplete }: GameEngineProps<DragDropData>) {
  const totalZones = data.rounds.reduce((acc, r) => acc + r.zones.length, 0)
  const ptsPerZone = Math.round(100 / totalZones)

  const session = useGameSession({
    timeLimitSeconds: config.timeLimitSeconds,
    maxScore: 100,
    onTimeUp: () => finishRound(true),
  })

  const [roundIndex, setRoundIndex] = useState(0)
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [dragItem, setDragItem] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)

  const round: DragDropRound = data.rounds[roundIndex]
  const placedIds = Object.values(placements)
  const available = round.items.filter((i) => !placedIds.includes(i.id))
  const allPlaced = available.length === 0

  /* Pointer drag handling */
  useEffect(() => {
    if (!dragItem) return
    const onMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY })
      const els = document.elementsFromPoint(e.clientX, e.clientY)
      const zone = els.find((el) => (el as HTMLElement).dataset.zoneId)
      setHoveredZone((zone as HTMLElement)?.dataset.zoneId ?? null)
    }
    const onUp = () => {
      if (dragItem && hoveredZone && !placements[hoveredZone]) {
        setPlacements((p) => ({ ...p, [hoveredZone]: dragItem }))
      }
      setDragItem(null)
      setHoveredZone(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragItem, hoveredZone, placements])

  const finishRound = (forced = false) => {
    setChecked(true)
    if (!forced) {
      round.zones.forEach((z) => {
        if (placements[z.id] === z.acceptsItemId) session.recordCorrect(ptsPerZone)
        else session.recordIncorrect()
      })
    }
  }

  const handleNext = () => {
    if (roundIndex + 1 >= data.rounds.length) {
      onComplete(session.complete())
    } else {
      setRoundIndex((i) => i + 1)
      setPlacements({})
      setChecked(false)
    }
  }

  const draggedContent = dragItem ? round.items.find((i) => i.id === dragItem)?.content : null

  return (
    <GameShell
      title="Чирж тавих"
      score={session.score}
      timeRemaining={session.timeRemaining}
      timeLimitSeconds={config.timeLimitSeconds}
      progress={{ current: roundIndex + 1, total: data.rounds.length }}
    >
      {/* Floating ghost */}
      {dragItem && draggedContent && (
        <div style={{
          position: 'fixed', left: dragPos.x - 40, top: dragPos.y - 40,
          width: 80, height: 80, pointerEvents: 'none', zIndex: 9999, opacity: 0.85,
        }} className="rounded-2xl border-2 border-violet-500 bg-violet-50 shadow-xl flex items-center justify-center">
          <MediaRenderer content={draggedContent} size="sm" />
        </div>
      )}

      <div className="w-full max-w-lg">
        <p className="text-center text-stone-500 text-sm font-medium mb-5">
          Зүйлсийг чирж зөв байранд тавиарай
        </p>

        {/* Drop zones */}
        <div className="flex flex-col gap-3 mb-5">
          {round.zones.map((zone) => {
            const item = placements[zone.id] ? round.items.find((i) => i.id === placements[zone.id]) : null
            const isHovered = hoveredZone === zone.id && !!dragItem && !placements[zone.id]
            const isCorrect = checked && placements[zone.id] === zone.acceptsItemId
            const isWrong = checked && placements[zone.id] && !isCorrect
            return (
              <div
                key={zone.id}
                data-zone-id={zone.id}
                onClick={() => { if (!checked && item && !dragItem) setPlacements((p) => { const n = { ...p }; delete n[zone.id]; return n }) }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 min-h-[72px] transition-all cursor-pointer select-none
                  ${isCorrect ? 'border-green-400 bg-green-50'
                    : isWrong ? 'border-red-400 bg-red-50'
                    : item ? 'border-violet-400 bg-violet-50'
                    : isHovered ? 'border-violet-400 bg-violet-100 scale-[1.02]'
                    : 'border-dashed border-stone-300 bg-stone-50'}`}
              >
                <div className="flex-shrink-0 w-28 border-r border-stone-200 pr-3">
                  <MediaRenderer content={zone.label} size="sm" />
                </div>
                <div className="flex-1 flex items-center justify-center min-h-[44px]">
                  {item
                    ? <MediaRenderer content={item.content} size="sm" />
                    : <span className="text-stone-300 text-sm">↓</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Item tray */}
        {!checked && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-xs text-stone-400 font-semibold uppercase mb-3">Зүйлс — чирж тавина уу</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {available.map((item) => (
                <div
                  key={item.id}
                  onPointerDown={(e) => { e.preventDefault(); setDragItem(item.id); setDragPos({ x: e.clientX, y: e.clientY }) }}
                  className={`flex items-center justify-center p-3 rounded-xl border-2 min-w-[64px]
                    cursor-grab active:cursor-grabbing select-none transition-all
                    ${dragItem === item.id ? 'opacity-30 border-violet-300 bg-violet-50' : 'border-stone-200 bg-white hover:border-violet-300 hover:bg-violet-50'}`}
                >
                  <MediaRenderer content={item.content} size="sm" />
                </div>
              ))}
              {available.length === 0 && <p className="text-stone-400 text-sm py-2">Бүгд байрлуулсан</p>}
            </div>
          </div>
        )}

        {allPlaced && !checked && (
          <button onClick={() => finishRound(false)}
            className="mt-5 w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
            Шалгах
          </button>
        )}
        {checked && (
          <button onClick={handleNext}
            className="mt-5 w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
            {roundIndex + 1 >= data.rounds.length ? 'Дуусгах →' : 'Дараагийн давхарга →'}
          </button>
        )}
      </div>
    </GameShell>
  )
}