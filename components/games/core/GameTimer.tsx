interface Props {
  timeRemaining: number | null
  timeLimitSeconds?: number
}

export function GameTimer({ timeRemaining, timeLimitSeconds }: Props) {
  if (timeRemaining === null) return null
  const pct = timeLimitSeconds ? (timeRemaining / timeLimitSeconds) * 100 : 100
  const stroke = pct > 50 ? '#7DD3A7' : pct > 25 ? '#FFC93C' : '#F26A6A'
  const mins = Math.floor(timeRemaining / 60)
  const secs = timeRemaining % 60
  return (
    <div className="relative w-11 h-11">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#EADFCB" strokeWidth="4" />
        <circle cx="22" cy="22" r="18" fill="none" stroke={stroke} strokeWidth="4"
          strokeDasharray={`${(pct / 100) * 113.1} 113.1`}
          strokeLinecap="round" transform="rotate(-90 22 22)"
          style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: stroke }}>
        {mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : secs}
      </span>
    </div>
  )
}