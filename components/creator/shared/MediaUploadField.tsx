'use client'

import { useRef } from 'react'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import type { MediaContent } from '@/types/games'

interface Props {
  label: string
  value: MediaContent
  onChange: (val: MediaContent) => void
  allowedTypes?: Array<'text' | 'image' | 'audio'>
}

export function MediaUploadField({ label, value, onChange, allowedTypes = ['text', 'image', 'audio'] }: Props) {
  const { upload, uploading } = useMediaUpload()
  const imgRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File, type: 'image' | 'audio') => {
    const result = await upload(file, type === 'image' ? 'images' : 'audio')
    if (result) onChange({ type, value: result.url })
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-700">{label}</label>

      {/* Type tabs */}
      <div className="flex gap-2">
        {allowedTypes.map((t) => (
          <button key={t} type="button" onClick={() => onChange({ ...value, type: t })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
              ${value.type === t ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'}`}>
            {t === 'text' ? 'Текст' : t === 'image' ? 'Зураг' : 'Дуу'}
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
          <div className="flex gap-2 items-center">
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
            placeholder="Эсвэл URL оруулна уу"
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
            {value.value && <span className="text-xs text-green-600 font-medium">✓ Файл байршуулагдсан</span>}
          </div>
          <input type="text" value={value.value} onChange={(e) => onChange({ type: 'audio', value: e.target.value })}
            placeholder="Эсвэл URL оруулна уу"
            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
        </div>
      )}
    </div>
  )
}