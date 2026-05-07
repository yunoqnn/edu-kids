'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameResult } from '@/types/games'

interface Options {
  timeLimitSeconds?: number
  maxScore?: number
  onTimeUp?: () => void
}

export function useGameSession({ timeLimitSeconds, maxScore = 100, onTimeUp }: Options = {}) {
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimitSeconds ?? null)
  const [isRunning, setIsRunning] = useState(true)
  const startRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isRunning) return
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000)
      setTimeElapsed(elapsed)
      if (timeLimitSeconds !== undefined) {
        const rem = Math.max(0, timeLimitSeconds - elapsed)
        setTimeRemaining(rem)
        if (rem === 0) { setIsRunning(false); onTimeUp?.() }
      }
    }, 500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isRunning, timeLimitSeconds, onTimeUp])

  const recordCorrect = useCallback((pts = 10) => {
    setCorrectCount((c) => c + 1)
    setScore((s) => Math.min(s + pts, maxScore))
  }, [maxScore])

  const recordIncorrect = useCallback(() => {
    setIncorrectCount((c) => c + 1)
  }, [])

  const complete = useCallback((): GameResult => {
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
    return { score, maxScore, correctCount, incorrectCount, timeElapsedSeconds: timeElapsed }
  }, [score, maxScore, correctCount, incorrectCount, timeElapsed])

  const reset = useCallback(() => {
    setScore(0); setCorrectCount(0); setIncorrectCount(0)
    setTimeElapsed(0); setTimeRemaining(timeLimitSeconds ?? null)
    setIsRunning(true); startRef.current = Date.now()
  }, [timeLimitSeconds])

  return { score, maxScore, correctCount, incorrectCount, timeElapsed, timeRemaining, isRunning, recordCorrect, recordIncorrect, complete, reset }
}