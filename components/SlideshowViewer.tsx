'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Slide {
  id: string; image_url: string | null
  script_text: string; audio_url: string | null; order_index: number
}
interface Props { slideshowId: string; accentColor?: string }

const BR = '#E5DDD3'
const TX = '#3D3D3D'

export default function SlideshowViewer({ slideshowId, accentColor = '#7AD1D1' }: Props) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    supabase.from('slides').select('id, image_url, script_text, audio_url, order_index')
      .eq('slideshow_id', slideshowId).order('order_index')
      .then(({ data }) => { setSlides((data as Slide[]) ?? []); setLoading(false) })
  }, [slideshowId])

  useEffect(() => {
    const slide = slides[current]
    if (!slide?.audio_url) { setPlaying(false); return }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null }
    const audio = new Audio(slide.audio_url)
    audioRef.current = audio
    audio.play().catch(() => {})
    setPlaying(true)
    audio.onended = () => setPlaying(false)
    return () => { audio.pause(); audio.onended = null }
  }, [current, slides])

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) } else { a.play(); setPlaying(true) }
  }

  if (loading) return (
    <div style={{ background: 'white', borderRadius: 24, border: `1.5px solid ${BR}`, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14, fontWeight: 600 }}>
      Слайд уншиж байна...
    </div>
  )
  if (!slides.length) return null

  const slide = slides[current]

  return (
    <div style={{ background: 'white', borderRadius: 24, border: `1.5px solid ${BR}`, overflow: 'hidden' }}>

      {/* Image */}
      {slide.image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={slide.image_url} alt={`Слайд ${current + 1}`} style={{ width: '100%', height: '80vh', maxHeight: '80vh', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '70vh', background: `linear-gradient(135deg, #FFF3D6, #E5F7F7)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>
          </svg>
        </div>
      )}

      {/* Script */}
      {slide.script_text && (
        <div style={{ padding: '20px 24px', background: '#FAFAF9', borderTop: `1px solid #F3F0EB` }}>
          <p style={{ fontSize: 16, color: TX, lineHeight: 1.8, fontWeight: 500, margin: 0 }}>{slide.script_text}</p>
        </div>
      )}

      {/* Controls */}
      <div style={{ padding: '12px 24px 16px', borderTop: `1px solid ${BR}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Prev */}
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          style={{ width: 40, height: 40, borderRadius: 12, border: `1.5px solid ${BR}`, background: 'white', cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TX} strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        {/* Center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {slide.audio_url && (
            <button onClick={togglePlay}
              style={{ width: 40, height: 40, borderRadius: 12, background: `${accentColor}20`, border: `1.5px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={accentColor}>
                  <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={accentColor}><path d="M5 3l14 9-14 9V3z"/></svg>
              )}
            </button>
          )}
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280' }}>{current + 1} / {slides.length}</span>
        </div>

        {/* Next */}
        <button onClick={() => setCurrent(c => Math.min(slides.length - 1, c + 1))} disabled={current === slides.length - 1}
          style={{ width: 40, height: 40, borderRadius: 12, border: `1.5px solid ${BR}`, background: 'white', cursor: current === slides.length - 1 ? 'not-allowed' : 'pointer', opacity: current === slides.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TX} strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 16 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{ borderRadius: 4, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: i === current ? accentColor : BR, width: i === current ? 20 : 8, height: 8, padding: 0 }} />
          ))}
        </div>
      )}
    </div>
  )
}