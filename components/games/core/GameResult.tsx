'use client'

import { useRouter } from 'next/navigation'
import type { GameResult } from '@/types/games'

interface Props {
  result: GameResult
  title: string
  onPlayAgain: () => void
}

export function GameResultScreen({ result, title, onPlayAgain }: Props) {
  const router = useRouter()
  const pct = Math.round((result.score / result.maxScore) * 100)
  const { emoji, message, color } =
    pct >= 80 ? { emoji: '🏆', message: 'Гайхалтай!', color: '#7DD3A7' }
    : pct >= 50 ? { emoji: '⭐', message: 'Сайн байна!', color: '#FFC93C' }
    : { emoji: '💪', message: 'Дахин оролдоорой!', color: '#F26A6A' }
  const mins = Math.floor(result.timeElapsedSeconds / 60)
  const secs = result.timeElapsedSeconds % 60

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-3">{emoji}</div>
        <h2 className="text-3xl font-bold mb-1" style={{ color }}>{message}</h2>
        <p className="text-stone-400 text-sm mb-6 truncate">{title}</p>

        {/* Score ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="52" fill="none" stroke="#EADFCB" strokeWidth="10" />
            <circle cx="64" cy="64" r="52" fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={`${(pct / 100) * 326.7} 326.7`}
              strokeLinecap="round" transform="rotate(-90 64 64)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-stone-800">{pct}%</span>
            <span className="text-xs text-stone-400">{result.score}/{result.maxScore}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Зөв', val: result.correctCount, bg: 'bg-green-50', color: 'text-green-600' },
            { label: 'Буруу', val: result.incorrectCount, bg: 'bg-red-50', color: 'text-red-500' },
            { label: 'Хугацаа', val: mins > 0 ? `${mins}:${secs.toString().padStart(2,'0')}` : `${secs}с`, bg: 'bg-violet-50', color: 'text-violet-600' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-3`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
              <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={onPlayAgain}
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 active:scale-95 transition-all">
            Дахин тоглох
          </button>
          <button onClick={() => router.back()}
            className="w-full py-3 border-2 border-stone-200 text-stone-500 rounded-2xl font-semibold hover:border-stone-300 transition-all">
            Буцах
          </button>
        </div>
      </div>
    </div>
  )
}