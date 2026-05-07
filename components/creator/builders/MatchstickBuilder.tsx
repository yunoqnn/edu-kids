'use client'

import { useState, useEffect } from 'react'
import type { MatchstickData, MatchstickSegmentDef } from '@/types/games'

/* ---- 7-segment helpers ---- */
const DIGIT_SEGS: Record<string, string[]> = {
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
const ALL_SEGS = ['a','b','c','d','e','f','g']
const W = 40, H = 70, T = 5

function segCoords(seg: string, bx: number): [number,number,number,number] {
  const m: Record<string, [number,number,number,number]> = {
    a: [bx+T, T,   bx+W-T, T],
    b: [bx+W-T, T,   bx+W-T, H/2],
    c: [bx+W-T, H/2, bx+W-T, H-T],
    d: [bx+T, H-T, bx+W-T, H-T],
    e: [bx+T, H/2, bx+T,   H-T],
    f: [bx+T, T,   bx+T,   H/2],
    g: [bx+T, H/2, bx+W-T, H/2],
  }
  return m[seg] ?? [0,0,0,0]
}

function buildSegments(initial: string, solution: string): MatchstickSegmentDef[] {
  const segs: MatchstickSegmentDef[] = []
  initial.split('').forEach((ch, ci) => {
    if (!DIGIT_SEGS[ch]) return
    const initActive = DIGIT_SEGS[ch]
    const solActive = DIGIT_SEGS[solution[ci]] ?? initActive
    ALL_SEGS.forEach((seg) => {
      const [x1,y1,x2,y2] = segCoords(seg, ci * 50)
      segs.push({
        id: `${ci}_${seg}`,
        x1, y1, x2, y2,
        active: initActive.includes(seg),
        movable: initActive.includes(seg) !== solActive.includes(seg),
      })
    })
  })
  return segs
}

function getSolutionIds(solution: string): string[] {
  const ids: string[] = []
  solution.split('').forEach((ch, ci) => {
    if (!DIGIT_SEGS[ch]) return
    DIGIT_SEGS[ch].forEach((seg) => ids.push(`${ci}_${seg}`))
  })
  return ids
}

/* Mini preview SVG */
function ExprPreview({ expr }: { expr: string }) {
  const digits = expr.split('').filter((c) => DIGIT_SEGS[c])
  const totalW = expr.length * 50
  return (
    <svg width={totalW} height={H} viewBox={`0 0 ${totalW} ${H}`} style={{ display: 'block' }}>
      {expr.split('').map((ch, ci) => {
        if (!DIGIT_SEGS[ch]) {
          /* Render operator */
          const bx = ci * 50
          if (ch === '+') return (
            <g key={ci}>
              <line x1={bx+20} y1={T+5} x2={bx+20} y2={H-T-5} stroke="#7DD3A7" strokeWidth="5" strokeLinecap="round" />
              <line x1={bx+8} y1={H/2} x2={bx+32} y2={H/2} stroke="#7DD3A7" strokeWidth="5" strokeLinecap="round" />
            </g>
          )
          if (ch === '-') return <line key={ci} x1={bx+8} y1={H/2} x2={bx+32} y2={H/2} stroke="#7DD3A7" strokeWidth="5" strokeLinecap="round" />
          if (ch === '=') return (
            <g key={ci}>
              <line x1={bx+8} y1={H/3} x2={bx+32} y2={H/3} stroke="#7DD3A7" strokeWidth="5" strokeLinecap="round" />
              <line x1={bx+8} y1={(H/3)*2} x2={bx+32} y2={(H/3)*2} stroke="#7DD3A7" strokeWidth="5" strokeLinecap="round" />
            </g>
          )
          return null
        }
        const active = DIGIT_SEGS[ch]
        return (
          <g key={ci}>
            {ALL_SEGS.map((seg) => {
              const [x1,y1,x2,y2] = segCoords(seg, ci * 50)
              return <line key={seg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={active.includes(seg) ? '#1F1A2E' : '#EADFCB'} strokeWidth="5" strokeLinecap="round" />
            })}
          </g>
        )
      })}
    </svg>
  )
}

interface Props { value: MatchstickData; onChange: (v: MatchstickData) => void }

export function MatchstickBuilder({ value, onChange }: Props) {
  const [initialExpr, setInitialExpr] = useState(value.prompt || '')
  const [solutionExpr, setSolutionExpr] = useState('')
  const [allowedMoves, setAllowedMoves] = useState(value.allowedMoves || 1)

  const validPair = initialExpr.length > 0 && solutionExpr.length === initialExpr.length

  /* Auto-rebuild segments whenever expressions change */
  useEffect(() => {
    if (!validPair) return
    const segments = buildSegments(initialExpr, solutionExpr)
    const solutionSegmentIds = getSolutionIds(solutionExpr)
    onChange({ ...value, prompt: initialExpr, segments, allowedMoves, solutionSegmentIds })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExpr, solutionExpr, allowedMoves])

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
        Зөвхөн 0–9 тоо болон +, −, = тэмдэг ашиглана. Эхний болон хариулт нь яг ижил тэмдэгтийн тоотой байх ёстой.
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Эхний тэгшитгэл</label>
          <input type="text" value={initialExpr} onChange={(e) => setInitialExpr(e.target.value.replace(/[^0-9+\-=]/g, ''))}
            placeholder="Жишэ: 6+4=9"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-mono focus:outline-none focus:border-violet-400" />
          {initialExpr && (
            <div className="mt-3 bg-white rounded-xl border border-stone-200 p-3 overflow-x-auto">
              <ExprPreview expr={initialExpr} />
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Зөв хариулт</label>
          <input type="text" value={solutionExpr} onChange={(e) => setSolutionExpr(e.target.value.replace(/[^0-9+\-=]/g, ''))}
            placeholder="Жишэ: 6+4=10"
            className={`w-full px-3 py-2 rounded-xl border text-sm font-mono focus:outline-none transition-all
              ${solutionExpr && solutionExpr.length !== initialExpr.length ? 'border-red-400 bg-red-50' : 'border-stone-200 focus:border-violet-400'}`} />
          {solutionExpr && solutionExpr.length !== initialExpr.length && (
            <p className="text-xs text-red-500 mt-1">Урт таарахгүй байна ({initialExpr.length} vs {solutionExpr.length})</p>
          )}
          {solutionExpr && (
            <div className="mt-3 bg-white rounded-xl border border-stone-200 p-3 overflow-x-auto">
              <ExprPreview expr={solutionExpr} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Зөөх шүдэнзний тоо</label>
          <input type="number" min={1} max={5} value={allowedMoves} onChange={(e) => setAllowedMoves(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Хөтөч (заавал биш)</label>
          <input type="text" value={value.hint ?? ''} onChange={(e) => onChange({ ...value, hint: e.target.value })}
            placeholder="Зөвлөгөө..."
            className="w-48 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
        </div>
      </div>

      {validPair && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 font-medium">
          ✓ {value.segments.filter((s) => s.movable).length} хөдлөх сегмент тодорхойлогдлоо. Тоглоом бэлэн.
        </div>
      )}
    </div>
  )
}