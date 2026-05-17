'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

/* ---------- Types ---------- */
interface Slide {
  id: string
  image_url: string | null
  script_text: string
  audio_url: string | null
  order_index: number
}

interface Props {
  slideshowId: string
}

/* ---------- Component ---------- */
export default function SlideshowViewer({ slideshowId }: Props) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  /* ---------- Fetch slides ---------- */
  useEffect(() => {
    supabase
      .from('slides')
      .select('id, image_url, script_text, audio_url, order_index')
      .eq('slideshow_id', slideshowId)
      .order('order_index')
      .then(({ data }) => {
        setSlides((data as Slide[]) ?? [])
        setLoading(false)
      })
  }, [slideshowId])

  /* ---------- Auto-play audio on slide change ---------- */
  useEffect(() => {
    const slide = slides[current]
    if (!slide?.audio_url) { setPlaying(false); return }

    /* Stop previous */
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
    }

    const audio = new Audio(slide.audio_url)
    audioRef.current = audio

    audio.play().catch(() => {
      /* Autoplay blocked by browser — user can press play manually */
    })
    setPlaying(true)
    audio.onended = () => setPlaying(false)

    return () => {
      audio.pause()
      audio.onended = null
    }
  }, [current, slides])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= slides.length) return
    setCurrent(idx)
  }

  /* ---------- Render ---------- */
  if (loading) return (
    <div className="bg-white rounded-2xl border border-stone-200 h-48 flex items-center justify-center text-stone-400 text-sm animate-pulse">
      Слайд уншиж байна...
    </div>
  )

  if (slides.length === 0) return null

  const slide = slides[current]

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Slide image */}
      {slide.image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={slide.image_url}
          alt={`Слайд ${current + 1}`}
          className="w-full object-cover max-h-72"
        />
      ) : (
        <div className="w-full h-48 bg-stone-100 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C7C2BB" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
      )}

      {/* Script text */}
      {slide.script_text && (
        <div className="px-5 py-4 bg-stone-50 border-t border-stone-100">
          <p className="text-stone-700 text-sm leading-relaxed">{slide.script_text}</p>
        </div>
      )}

      {/* Navigation controls */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-stone-200">
        {/* Prev */}
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center disabled:opacity-30 hover:border-violet-400 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Center: play/pause + counter */}
        <div className="flex items-center gap-3">
          {slide.audio_url && (
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center hover:bg-violet-200 transition-all"
            >
              {playing ? (
                /* Pause icon */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                /* Play icon */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
            </button>
          )}
          <span className="text-sm font-semibold text-stone-500">
            {current + 1} / {slides.length}
          </span>
        </div>

        {/* Next */}
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === slides.length - 1}
          className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center disabled:opacity-30 hover:border-violet-400 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Slide dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? 'w-4 h-2 bg-violet-500'
                  : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}