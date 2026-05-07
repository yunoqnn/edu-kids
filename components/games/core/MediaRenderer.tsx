'use client'

import { useState, useRef } from 'react'
import type { MediaContent } from '@/types/games'

interface Props {
  content: MediaContent
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MediaRenderer({ content, className = '', size = 'md' }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const imgSize = { sm: 'w-16 h-16', md: 'w-28 h-28', lg: 'w-44 h-44' }[size]

  if (content.type === 'text') {
    const textSize = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' }[size]
    return <span className={`font-bold text-stone-800 ${textSize} ${className}`}>{content.value}</span>
  }

  if (content.type === 'image') {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={content.value} alt={content.alt ?? ''} className={`object-contain rounded-xl ${imgSize} ${className}`} />
    )
  }

  if (content.type === 'audio') {
    const toggle = () => {
      if (!audioRef.current) return
      if (playing) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
      else audioRef.current.play()
      setPlaying((p) => !p)
    }
    const btnSize = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-20 h-20' }[size]
    return (
      <button type="button" onClick={toggle} className={`flex flex-col items-center gap-2 ${className}`}>
        <audio ref={audioRef} src={content.value} onEnded={() => setPlaying(false)} />
        <div className={`${btnSize} rounded-full flex items-center justify-center shadow-md transition-all
          ${playing ? 'bg-violet-700 scale-95' : 'bg-violet-500 hover:bg-violet-600'} text-white`}>
          {playing
            ? <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            : <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
        </div>
        <span className="text-xs font-semibold text-violet-700">{playing ? 'Зогсоох' : 'Тоглуулах'}</span>
      </button>
    )
  }

  return null
}