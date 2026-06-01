'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  text: string
  size?: 'sm' | 'md'
}

export function SpeakButton({ text, size = 'md' }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  // Stop when text changes (next question)
  useEffect(() => {
    audioRef.current?.pause()
    setState('idle')
  }, [text])

  const handleClick = async () => {
    if (state === 'loading') return

    if (state === 'playing') {
      audioRef.current?.pause()
      setState('idle')
      return
    }

    setState('loading')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('TTS failed')

      const blob = await res.blob()
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(blob)
      urlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setState('idle')
      audio.play()
      setState('playing')
    } catch {
      setState('idle')
    }
  }

  const base = size === 'sm'
    ? 'w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0'
    : 'w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0'

  const cls = state === 'playing'
    ? `${base} bg-teal-500 text-white scale-95 shadow-md`
    : state === 'loading'
    ? `${base} bg-stone-100 text-stone-400 animate-pulse cursor-wait`
    : `${base} bg-teal-100 text-teal-600 hover:bg-teal-200 active:scale-95 cursor-pointer`

  return (
    <button type="button" onClick={handleClick} title="Сонсох" className={cls}>
      {state === 'loading' ? (
        /* spinner */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : state === 'playing' ? (
        /* pause icon */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        /* ear icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1C8.14 1 5 4.14 5 8c0 2.38 1.19 4.47 3 5.74V17c0 1.1.9 2 2 2h.28A3.998 3.998 0 0 0 14 21c2.21 0 4-1.79 4-4v-3.26C19.81 12.47 21 10.38 21 8c0-3.86-3.14-7-9-7zm2 18c-.55 0-1-.45-1-1h-2c0 .55-.45 1-1 1-.55 0-1-.45-1-1v-.17c.31.11.64.17 1 .17h4c.36 0 .69-.06 1-.17V18c0 .55-.45 1-1 1zm1-4H9v-1.42C7.77 12.85 7 10.52 7 8c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.52-.77 4.85-2 6.58V15z" />
          <path d="M12 5c-1.66 0-3 1.34-3 3 0 .55.45 1 1 1s1-.45 1-1c0-.55.45-1 1-1s1 .45 1 1c0 1.19-1.34 2.56-1.71 2.93-.19.19-.29.45-.29.71V12h2v-.59C14.28 10.79 15 9.44 15 8c0-1.66-1.34-3-3-3z" />
        </svg>
      )}
    </button>
  )
}
