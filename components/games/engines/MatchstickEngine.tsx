'use client'

import { useState } from 'react'
import { GameShell } from '../core/GameShell'
import { useGameSession } from '@/hooks/useGameSession'
import type { GameEngineProps, MatchstickData, MatchstickSegmentDef } from '@/types/games'

/* 7-segment display: segments per digit */
const SEGMENTS: Record<string, string[]> = {
  '0': ['a','b','c','d','e','f'],
  '1': ['b','c'],
  '2': ['a','b','d','e','g'],
  '3': ['a','b','c','d','g'],
  '4': ['b','c','f','g'],
  '5': ['a','c','d','f','g'],
  '6': ['a','c','d','e','f','g'],
  '7': ['a','b','c'],
  '8': ['a','b','c','d','e','f','g'],
  '9': ['a','b','c','d','f','g'],
}

function SegmentDisplay({ char, active, onToggle }: { char: string; active: Record<string, boolean>; onToggle?: (seg: string) => void }) {
  const W = 40; const H = 70; const T = 5
  const segs = {
    a: { x1: T, y1: T, x2: W - T, y2: T },
    b: { x1: W - T, y1: T, x2: W - T, y2: H / 2 },
    c: { x1: W - T, y1: H / 2, x2: W - T, y2: H - T },
    d: { x1: T, y1: H - T, x2: W - T, y2: H - T },
    e: { x1: T, y1: H / 2, x2: T, y2: H - T },
    f: { x1: T, y1: T, x2: T, y2: H / 2 },
    g: { x1: T, y1: H / 2, x2: W - T, y2: H / 2 },
  }

  if (char === '+') return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-1">
      <line x1={W/2} y1={T+5} x2={W/2} y2={H-T-5} stroke="#7DD3A7" strokeWidth="6" strokeLinecap="round" />
      <line x1={T+2} y1={H/2} x2={W-T-2} y2={H/2} stroke="#7DD3A7" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
  if (char === '=') return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-1">
      <line x1={T+2} y1={H/3} x2={W-T-2} y2={H/3} stroke="#7DD3A7" strokeWidth="6" strokeLinecap="round" />
      <line x1={T+2} y1={(H/3)*2} x2={W-T-2} y2={(H/3)*2} stroke="#7DD3A7" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-0.5">
      {(Object.entries(segs) as [string, { x1: number; y1: number; x2: number; y2: number }][]).map(([id, { x1, y1, x2, y2 }]) => (
        <line key={id} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={active[id] ? '#1F1A2E' : '#EADFCB'}
          strokeWidth="6" strokeLinecap="round"
          className={onToggle && active[id] ? 'cursor-pointer hover:stroke-red-400' : onToggle ? 'cursor-pointer hover:stroke-green-400' : ''}
          onClick={() => onToggle?.(id)} />
      ))}
    </svg>
  )
}

export function MatchstickEngine({ data, config, onComplete }: GameEngineProps<MatchstickData>) {
  const session = useGameSession({ timeLimitSeconds: config.timeLimitSeconds, maxScore: 100, onTimeUp: () => onComplete(session.complete()) })
  const [segments, setSegments] = useState<MatchstickSegmentDef[]>(data.segments)
  const [moveCount, setMoveCount] = useState(0)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState<boolean | null>(null)

  const toggleSegment = (id: string) => {
    if (checked) return
    const seg = segments.find((s) => s.id === id)
    if (!seg?.movable) return
    if (!seg.active && moveCount >= data.allowedMoves) return
    setSegments((segs) => segs.map((s) => s.id === id ? { ...s, active: !s.active } : s))
    setMoveCount((m) => m + (seg.active ? -1 : 1))
  }

  const check = () => {
    const activeIds = segments.filter((s) => s.active).map((s) => s.id).sort()
    const solutionIds = [...data.solutionSegmentIds].sort()
    const isCorrect = JSON.stringify(activeIds) === JSON.stringify(solutionIds)
    setChecked(true)
    setCorrect(isCorrect)
    if (isCorrect) session.recordCorrect(100)
    else session.recordIncorrect()
  }

  /* Group segments by character position for rendering */
  const chars = data.prompt.split('')
  /* Build active map per char: assume segments are named "charIndex_segId" */
  const getActiveForChar = (charIdx: number): Record<string, boolean> => {
    const active: Record<string, boolean> = {}
    segments.filter((s) => s.id.startsWith(`${charIdx}_`)).forEach((s) => {
      active[s.id.split('_')[1]] = s.active
    })
    return active
  }

  return (
    <GameShell title="Шүдэнзний бодлого" score={session.score} timeRemaining={session.timeRemaining} timeLimitSeconds={config.timeLimitSeconds}>
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 mb-6">
          <p className="text-center text-stone-600 font-semibold mb-2">{data.prompt}</p>
          <p className="text-center text-stone-400 text-sm mb-6">
            {data.allowedMoves - moveCount} шүдэнз зөөх боломжтой
          </p>

          {/* Segment display */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {chars.map((ch, i) => (
              <SegmentDisplay
                key={i} char={ch}
                active={getActiveForChar(i)}
                onToggle={!checked ? (seg) => toggleSegment(`${i}_${seg}`) : undefined}
              />
            ))}
          </div>

          {data.hint && !checked && (
            <p className="text-center text-amber-600 text-sm mt-4">💡 {data.hint}</p>
          )}

          {checked && (
            <div className={`mt-4 rounded-2xl p-4 text-center font-bold text-lg
              ${correct ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {correct ? '🎉 Зөв!' : '😅 Буруу байна'}
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-5 text-center text-sm text-amber-700 font-medium">
          Шүдэнз дээр дарж зөөнө үү
        </div>

        {!checked && (
          <button onClick={check} disabled={moveCount === 0}
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 disabled:opacity-50 active:scale-95 transition-all">
            Шалгах ✓
          </button>
        )}
        {checked && (
          <button onClick={() => onComplete(session.complete())}
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
            Дуусгах →
          </button>
        )}
      </div>
    </GameShell>
  )
}