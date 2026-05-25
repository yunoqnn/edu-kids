'use client'

import { useRouter } from 'next/navigation'
import type { GameResult } from '@/types/games'

interface Props {
  result: GameResult
  title: string
  xpEarned: number
  starsEarned: number
  leveledUp: boolean
  newLevel: number
  onPlayAgain: () => void
}

export function GameResultScreen({ result, title, xpEarned, starsEarned, leveledUp, newLevel, onPlayAgain }: Props) {
  const router = useRouter()
  const pct = Math.round((result.score / result.maxScore) * 100)
  const { message, color } =
    pct >= 80 ? { message: 'Гайхалтай!',   color: '#7DD3A7' }
    : pct >= 50 ? { message: 'Сайн байна!', color: '#FFC93C' }
    :             { message: 'Дахин оролдоорой!', color: '#F26A6A' }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8 max-w-sm w-full text-center">

        {/* Level up banner */}
        {leveledUp && (
          <div className="mb-4 px-4 py-3 bg-amber-400 rounded-2xl text-white font-bold text-base">
            Түвшин ахлаа! Түвшин {newLevel} боллоо
          </div>
        )}

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

        {/* Correct / Incorrect */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-2xl p-4">
            <div className="text-3xl font-bold text-green-600">{result.correctCount}</div>
            <div className="text-xs text-stone-500 mt-0.5">Зөв</div>
          </div>
          <div className="bg-red-50 rounded-2xl p-4">
            <div className="text-3xl font-bold text-red-500">{result.incorrectCount}</div>
            <div className="text-xs text-stone-500 mt-0.5">Буруу</div>
          </div>
        </div>

        {/* XP and Stars earned */}
        {(xpEarned > 0 || starsEarned > 0) && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-violet-50 rounded-2xl p-4">
              <div className="text-2xl font-bold text-violet-600">+{xpEarned}</div>
              <div className="text-xs text-stone-500 mt-0.5">XP</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4">
              <div className="text-2xl font-bold text-amber-500">+{starsEarned}</div>
              <div className="text-xs text-stone-500 mt-0.5">Од</div>
            </div>
          </div>
        )}

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