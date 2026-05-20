'use client'

import { useRef } from 'react'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import type { MediaContent, MediaType } from '@/types/games'

interface Props {
  label: string
  value: MediaContent
  onChange: (val: MediaContent) => void
  allowedTypes?: MediaType[]
}

export function MediaUploadField({ label, value, onChange, allowedTypes = ['text', 'image', 'audio', 'video'] }: Props) {
  const { upload, uploading } = useMediaUpload()
  const imgRef  = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File, type: 'image' | 'audio' | 'video') => {
    const folder = type === 'image' ? 'images' : type === 'audio' ? 'audio' : 'videos'
    const result = await upload(file, folder as 'images' | 'audio')
    if (result) onChange({ type, value: result.url })
  }

  const TYPE_LABELS: Record<MediaType, string> = {
    text: 'Текст', image: 'Зураг', audio: 'Дуу', video: 'Видео',
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-700">{label}</label>

      <div className="flex gap-2 flex-wrap">
        {allowedTypes.map((t) => (
          <button key={t} type="button" onClick={() => onChange({ ...value, type: t })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
              ${value.type === t ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'}`}>
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {value.type === 'text' && (
        <input type="text" value={value.value} onChange={(e) => onChange({ type: 'text', value: e.target.value })}
          placeholder="Текст оруулна уу"
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
      )}

      {value.type === 'image' && (
        <div className="space-y-2">
          <input ref={imgRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'image')} />
          <div className="flex gap-2 items-center flex-wrap">
            <button type="button" onClick={() => imgRef.current?.click()}
              className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:border-violet-300 transition-all">
              {uploading ? 'Байршуулж байна...' : 'Зураг сонгох'}
            </button>
            {value.value && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={value.value} alt="" className="w-12 h-12 rounded-lg object-cover border border-stone-200" />
            )}
          </div>
          <input type="text" value={value.value} onChange={(e) => onChange({ type: 'image', value: e.target.value })}
            placeholder="Эсвэл зургийн URL"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
        </div>
      )}

      {value.type === 'audio' && (
        <div className="space-y-2">
          <input ref={audioRef} type="file" accept="audio/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'audio')} />
          <div className="flex gap-2 items-center">
            <button type="button" onClick={() => audioRef.current?.click()}
              className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:border-violet-300 transition-all">
              {uploading ? 'Байршуулж байна...' : 'Аудио сонгох'}
            </button>
            {value.value && <span className="text-xs text-green-600 font-semibold">Байршуулагдсан</span>}
          </div>
          <input type="text" value={value.value} onChange={(e) => onChange({ type: 'audio', value: e.target.value })}
            placeholder="Эсвэл аудио URL"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
        </div>
      )}

      {value.type === 'video' && (
        <div className="space-y-2">
          <input ref={videoRef} type="file" accept="video/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], 'video')} />
          <div className="flex gap-2 items-center">
            <button type="button" onClick={() => videoRef.current?.click()}
              className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:border-violet-300 transition-all">
              {uploading ? 'Байршуулж байна...' : 'Видео сонгох'}
            </button>
            {value.value && <span className="text-xs text-green-600 font-semibold">Байршуулагдсан</span>}
          </div>
          <input type="text" value={value.value} onChange={(e) => onChange({ type: 'video', value: e.target.value })}
            placeholder="Эсвэл видео URL"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
          {value.value && (
            <video src={value.value} controls className="w-full rounded-xl border border-stone-200 mt-1" style={{ maxHeight: 180 }} />
          )}
        </div>
      )}
    </div>
  )
}