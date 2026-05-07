import { GameTimer } from './GameTimer'

interface Props {
  title: string
  score: number
  maxScore?: number
  timeRemaining: number | null
  timeLimitSeconds?: number
  children: React.ReactNode
  progress?: { current: number; total: number }
}

export function GameShell({ title, score, maxScore = 100, timeRemaining, timeLimitSeconds, children, progress }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-amber-50 flex flex-col">
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600 text-white rounded-xl px-3 py-1 text-sm font-bold shadow-sm">
            ⭐ {score}/{maxScore}
          </div>
          {progress && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-violet-400 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }} />
              </div>
              <span className="text-xs text-stone-400">{progress.current}/{progress.total}</span>
            </div>
          )}
        </div>
        <h1 className="text-sm font-bold text-stone-600 truncate max-w-[140px] text-center">{title}</h1>
        <GameTimer timeRemaining={timeRemaining} timeLimitSeconds={timeLimitSeconds} />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {children}
      </main>
    </div>
  )
}