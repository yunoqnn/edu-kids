'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useMediaUpload } from '@/hooks/useMediaUpload'

/* ---------- Types ---------- */
interface Lesson {
  id: string
  title: string
  type: 'LESSON' | 'FAIRY_TALE'
  text_content: string | null
  video_url: string | null
  is_published: boolean
  course_id: string
}

interface Slideshow {
  id: string
  title: string
}

interface Slide {
  id: string
  slideshow_id: string
  image_url: string | null
  script_text: string
  audio_url: string | null
  order_index: number
}

/* ---------- SlideCard sub-component ---------- */
function SlideCard({
  slide,
  index,
  uploading,
  onScriptChange,
  onImageUpload,
  onDelete,
}: {
  slide: Slide
  index: number
  uploading: boolean
  onScriptChange: (val: string) => void
  onImageUpload: (file: File) => void
  onDelete: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [localScript, setLocalScript] = useState(slide.script_text)

  return (
    <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-stone-500">Слайд {index + 1}</span>
        <div className="flex items-center gap-2">
          {slide.audio_url && (
            <span className="text-xs text-green-600 font-semibold">✓ Дуу бэлэн</span>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="text-stone-400 hover:text-red-500 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image upload */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImageUpload(f)
          }}
        />
        {slide.image_url ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image_url}
              alt={`Слайд ${index + 1}`}
              className="w-full h-36 object-cover rounded-lg border border-stone-200"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-2 right-2 px-2 py-1 bg-white rounded-lg text-xs font-semibold border border-stone-200 hover:border-violet-400 transition-all"
            >
              Солих
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full h-28 border-2 border-dashed border-stone-200 rounded-lg text-xs text-stone-400 font-medium hover:border-violet-300 hover:text-violet-500 transition-all"
          >
            {uploading ? 'Байршуулж байна...' : '+ Зураг нэмэх'}
          </button>
        )}
      </div>

      {/* Script textarea — autosaves on blur */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-stone-500">
            Дуулах текст
          </label>
          <span className={`text-xs font-semibold tabular-nums ${
            localScript.length > 280
              ? 'text-red-500'
              : localScript.length > 240
              ? 'text-amber-500'
              : 'text-stone-400'
          }`}>
            {localScript.length} / 300
          </span>
        </div>
        <textarea
          value={localScript}
          onChange={(e) => setLocalScript(e.target.value)}
          onBlur={() => onScriptChange(localScript)}
          rows={3}
          maxLength={300}
          placeholder="Энэ слайдад ярих текстийг бичнэ үү..."
          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none transition-all resize-none bg-white ${
            localScript.length > 280
              ? 'border-red-300 focus:border-red-400'
              : 'border-stone-200 focus:border-violet-400'
          }`}
        />
        {localScript.length > 280 && (
          <p className="text-xs text-red-500 mt-1">
            Chimege API 300 тэмдэгтийн хязгаартай. Товчлох хэрэгтэй.
          </p>
        )}
      </div>
    </div>
  )
}

/* ---------- Main page ---------- */
export default function LessonEditorPage() {
  const router = useRouter()
  const { lessonId } = useParams<{ lessonId: string }>()
  const { upload, uploading } = useMediaUpload()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [slideshow, setSlideshow] = useState<Slideshow | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState<{ successCount: number; total: number } | null>(null)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  /* Form state */
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'LESSON' | 'FAIRY_TALE'>('LESSON')
  const [textContent, setTextContent] = useState('')

  /* Content type: null = not chosen yet, VIDEO, SLIDESHOW */
  const [contentType, setContentType] = useState<'VIDEO' | 'SLIDESHOW' | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState('')
  const videoFileRef = useRef<HTMLInputElement>(null)

  /* ---------- Load ---------- */
  const load = async () => {
    const { data: l } = await supabase
      .from('lessons')
      .select('id, title, type, text_content, video_url, is_published, course_id')
      .eq('id', lessonId)
      .single()

    if (l) {
      const lesson = l as Lesson
      setLesson(lesson)
      setTitle(lesson.title)
      setType((lesson.type ?? 'LESSON') as 'LESSON' | 'FAIRY_TALE')
      setTextContent(lesson.text_content ?? '')
      setVideoUrl(lesson.video_url ?? null)
      if (lesson.video_url) setContentType('VIDEO')
    }

    const { data: sw } = await supabase
      .from('slideshows')
      .select('id, title')
      .eq('lesson_id', lessonId)
      .maybeSingle()

    if (sw) {
      setSlideshow(sw)
      setContentType('SLIDESHOW')
      const { data: sl } = await supabase
        .from('slides')
        .select('*')
        .eq('slideshow_id', sw.id)
        .order('order_index')
      setSlides((sl as Slide[]) ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
      load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  /* ---------- Save lesson ---------- */
  const saveLesson = async () => {
    setSaving(true)
    await supabase
      .from('lessons')
      .update({ title, type, text_content: textContent || null, video_url: videoUrl || null })
      .eq('id', lessonId)
    setSaving(false)
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 2000)
  }

  /* ---------- Content type switch ---------- */
  const switchContentType = (to: 'VIDEO' | 'SLIDESHOW') => {
    if (contentType === to) return
    const hasExisting = contentType === 'VIDEO' ? !!videoUrl : !!slideshow
    if (hasExisting) {
      const label = contentType === 'VIDEO' ? 'видео' : 'слайдшоу'
      if (!confirm(`Одоогийн ${label} агуулгыг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return
      if (contentType === 'VIDEO') {
        setVideoUrl(null)
        supabase.from('lessons').update({ video_url: null }).eq('id', lessonId)
      } else if (slideshow) {
        supabase.from('slideshows').delete().eq('id', slideshow.id)
        setSlideshow(null)
        setSlides([])
      }
    }
    setContentType(to)
  }

  /* ---------- Video upload ---------- */
  const handleVideoUpload = async (file: File) => {
    setVideoUploading(true)
    setVideoUploadError('')
    const result = await upload(file, 'videos')
    setVideoUploading(false)
    if (!result) {
      setVideoUploadError('Видео байршуулахад алдаа гарлаа.')
      return
    }
    setVideoUrl(result.url)
    await supabase.from('lessons').update({ video_url: result.url }).eq('id', lessonId)
  }

  /* ---------- Slideshow actions ---------- */
  const createSlideshow = async () => {
    setCreating(true)
    setCreateError('')
    const { data, error } = await supabase
      .from('slideshows')
      .insert({ lesson_id: lessonId, title: title || 'Slideshow' })
      .select('id, title')
      .single()
    setCreating(false)
    if (error) {
      setCreateError(error.message)
      console.error('Create slideshow error:', error)
      return
    }
    if (data) setSlideshow(data)
  }

  const addSlide = async () => {
    if (!slideshow) return
    const { data } = await supabase
      .from('slides')
      .insert({ slideshow_id: slideshow.id, script_text: '', order_index: slides.length })
      .select('*')
      .single()
    if (data) setSlides((prev) => [...prev, data as Slide])
  }

  const updateSlideField = async (
    slideId: string,
    field: 'script_text' | 'image_url',
    value: string
  ) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, [field]: value } : s))
    )
    await supabase.from('slides').update({ [field]: value }).eq('id', slideId)
  }

  const deleteSlide = async (slideId: string) => {
    if (!confirm('Слайдыг устгах уу?')) return
    await supabase.from('slides').delete().eq('id', slideId)
    setSlides((prev) => prev.filter((s) => s.id !== slideId))
  }

  const handleImageUpload = async (slideId: string, file: File) => {
    const result = await upload(file, 'images')
    if (result) updateSlideField(slideId, 'image_url', result.url)
  }

  const generateAudio = async () => {
    if (!slideshow) return
    setGenerating(true)
    setGenResult(null)
    const res = await fetch(`/api/slideshows/${slideshow.id}/generate`, { method: 'POST' })
    if (res.ok) {
      const json = await res.json()
      setGenResult({ successCount: json.successCount, total: json.total })
      const { data: sl } = await supabase
        .from('slides')
        .select('*')
        .eq('slideshow_id', slideshow.id)
        .order('order_index')
      setSlides((sl as Slide[]) ?? [])
    }
    setGenerating(false)
  }

  /* ---------- Render ---------- */
  if (loading || !lesson) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400 animate-pulse">
      Уншиж байна...
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/creator/courses/${lesson.course_id}`)}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="font-bold text-stone-800">Хичээл засах</h1>
        </div>
        <button
          onClick={saveLesson}
          disabled={saving}
          className="px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-all"
        >
          {saving ? 'Хадгалж байна...' : savedOk ? '✓ Хадгалагдлаа' : 'Хадгалах'}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Basic info card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5">
              Хичээлийн нэр
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-2">Төрөл</label>
            <div className="flex gap-2">
              {(['LESSON', 'FAIRY_TALE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                    ${type === t
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'
                    }`}
                >
                  {t === 'LESSON' ? '📘 Хичээл' : '📖 Үлгэр'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5">
              Текст агуулга
              <span className="font-normal text-stone-400 ml-1">(заавал биш)</span>
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={4}
              placeholder="Хичээлийн үндсэн текст агуулга..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Content type card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-700">Хичээлийн агуулга</h2>
            {contentType && (
              <div className="flex gap-1.5 p-1 bg-stone-100 rounded-xl">
                <button
                  onClick={() => switchContentType('VIDEO')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    contentType === 'VIDEO'
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  🎬 Видео
                </button>
                <button
                  onClick={() => switchContentType('SLIDESHOW')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    contentType === 'SLIDESHOW'
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  🖼️ Слайдшоу
                </button>
              </div>
            )}
          </div>

          {/* Not chosen yet */}
          {!contentType && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setContentType('VIDEO')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-stone-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all group"
              >
                <span className="text-3xl">🎬</span>
                <div className="text-center">
                  <p className="text-sm font-bold text-stone-700 group-hover:text-violet-700">Видео</p>
                  <p className="text-xs text-stone-400 mt-0.5">MP4, MOV файл байршуулах</p>
                </div>
              </button>
              <button
                onClick={() => setContentType('SLIDESHOW')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-stone-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all group"
              >
                <span className="text-3xl">🖼️</span>
                <div className="text-center">
                  <p className="text-sm font-bold text-stone-700 group-hover:text-violet-700">Слайдшоу</p>
                  <p className="text-xs text-stone-400 mt-0.5">Зурагтай слайд + дуу</p>
                </div>
              </button>
            </div>
          )}

          {/* Video section */}
          {contentType === 'VIDEO' && (
            <div className="space-y-3">
              <input
                ref={videoFileRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleVideoUpload(f)
                }}
              />
              {videoUrl ? (
                <div className="space-y-3">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-xl border border-stone-200 bg-black"
                    style={{ maxHeight: 320 }}
                  />
                  <button
                    onClick={() => videoFileRef.current?.click()}
                    disabled={videoUploading}
                    className="w-full py-2.5 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:border-violet-400 hover:text-violet-600 disabled:opacity-50 transition-all"
                  >
                    {videoUploading ? 'Байршуулж байна...' : '↺ Видео солих'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => videoFileRef.current?.click()}
                  disabled={videoUploading}
                  className="w-full py-10 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center gap-2 hover:border-violet-400 hover:bg-violet-50 disabled:opacity-50 transition-all"
                >
                  {videoUploading ? (
                    <>
                      <span className="text-2xl animate-spin">⏳</span>
                      <span className="text-sm font-semibold text-violet-600">Байршуулж байна...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl">🎬</span>
                      <span className="text-sm font-semibold text-violet-600">Видео байршуулах</span>
                      <span className="text-xs text-stone-400">MP4, MOV, WEBM — дарж сонгоно уу</span>
                    </>
                  )}
                </button>
              )}
              {videoUploadError && (
                <p className="text-xs text-red-500 font-medium">{videoUploadError}</p>
              )}
            </div>
          )}

          {/* Slideshow section */}
          {contentType === 'SLIDESHOW' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-500 font-medium">
                  {slideshow ? `${slides.length} слайд` : 'Слайдшоу байхгүй'}
                </span>
                <div className="flex items-center gap-3">
                  {genResult && (
                    <span className={`text-xs font-semibold ${genResult.successCount === genResult.total ? 'text-green-600' : 'text-amber-600'}`}>
                      {genResult.successCount}/{genResult.total} слайд амжилттай
                    </span>
                  )}
                  {slideshow && slides.length > 0 && slides.some((s) => s.script_text) && (
                    <button
                      onClick={generateAudio}
                      disabled={generating}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition-all"
                    >
                      {generating ? 'Үүсгэж байна...' : '🎵 Дуу үүсгэх'}
                    </button>
                  )}
                </div>
              </div>

              {!slideshow ? (
                <div className="space-y-2">
                  <button
                    onClick={createSlideshow}
                    disabled={creating}
                    className="w-full py-4 border-2 border-dashed border-stone-300 rounded-xl text-sm text-violet-600 font-semibold hover:border-violet-400 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {creating ? 'Үүсгэж байна...' : '+ Слайдшоу үүсгэх'}
                  </button>
                  {createError && (
                    <p className="text-xs text-red-500 font-medium px-1">{createError}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {slides.map((slide, idx) => (
                    <SlideCard
                      key={slide.id}
                      slide={slide}
                      index={idx}
                      uploading={uploading}
                      onScriptChange={(val) => updateSlideField(slide.id, 'script_text', val)}
                      onImageUpload={(file) => handleImageUpload(slide.id, file)}
                      onDelete={() => deleteSlide(slide.id)}
                    />
                  ))}
                  <button
                    onClick={addSlide}
                    className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-sm text-violet-600 font-semibold hover:border-violet-300 hover:bg-violet-50 transition-all"
                  >
                    + Зураг слайд нэмэх
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Exercise shortcut card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-stone-700">Дасгал</h2>
            <p className="text-xs text-stone-400 mt-0.5">Game-based дасгал нэмэх</p>
          </div>
          <button
            onClick={() => router.push(`/creator/exercises/new?lessonId=${lessonId}`)}
            className="px-4 py-2 bg-violet-100 text-violet-700 rounded-xl text-sm font-bold hover:bg-violet-200 transition-all"
          >
            + Дасгал нэмэх
          </button>
        </div>
      </div>
    </div>
  )
}
