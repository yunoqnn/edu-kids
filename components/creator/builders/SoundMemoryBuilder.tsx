'use client'

import { useRef } from 'react'
import { useMediaUpload } from '@/hooks/useMediaUpload'
import { MediaUploadField } from '../shared/MediaUploadField'
import type { SoundMemoryData, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })

interface Props { value: SoundMemoryData; onChange: (v: SoundMemoryData) => void }

export function SoundMemoryBuilder({ value, onChange }: Props) {
  const { upload, uploading } = useMediaUpload()
  const audioRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const addPair = () => onChange({ ...value, pairs: [...value.pairs, { id: crypto.randomUUID(), audio: '', match: empty() }] })
  const removePair = (id: string) => onChange({ ...value, pairs: value.pairs.filter((p) => p.id !== id) })

  const uploadAudio = async (id: string, file: File) => {
    const result = await upload(file, 'audio')
    if (result) onChange({ ...value, pairs: value.pairs.map((p) => p.id === id ? { ...p, audio: result.url } : p) })
  }

  const updateMatch = (id: string, match: MediaContent) =>
    onChange({ ...value, pairs: value.pairs.map((p) => p.id === id ? { ...p, match } : p) })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-700">Аудио хос картууд</p>
        <button type="button" onClick={addPair}
          className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">
          + Хос нэмэх
        </button>
      </div>

      {value.pairs.map((pair, i) => (
        <div key={pair.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-600">{i + 1}-р хос</span>
            <button type="button" onClick={() => removePair(pair.id)}
              className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">
              Устгах
            </button>
          </div>

          {/* Audio upload */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2">Аудио</label>
            <input ref={(el) => { audioRefs.current[pair.id] = el }} type="file" accept="audio/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadAudio(pair.id, e.target.files[0])} />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => audioRefs.current[pair.id]?.click()}
                className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-sm text-stone-600 hover:border-violet-300 transition-all">
                {uploading ? 'Байршуулж байна...' : 'Аудио сонгох'}
              </button>
              {pair.audio
                ? <span className="text-xs text-green-600 font-semibold">✓ Байршуулагдсан</span>
                : <span className="text-xs text-stone-400">Файл байхгүй</span>}
            </div>
            <input type="text" value={pair.audio} onChange={(e) => onChange({ ...value, pairs: value.pairs.map((p) => p.id === pair.id ? { ...p, audio: e.target.value } : p) })}
              placeholder="Эсвэл аудио URL оруулна уу"
              className="mt-2 w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-violet-400" />
          </div>

          {/* Match */}
          <MediaUploadField label="Таарах зүйл (зураг эсвэл текст)" value={pair.match}
            onChange={(c) => updateMatch(pair.id, c)} allowedTypes={['text', 'image']} />
        </div>
      ))}

      {value.pairs.length === 0 && (
        <div className="text-center py-8 text-stone-400 text-sm border-2 border-dashed border-stone-200 rounded-2xl">
          Аудио хос нэмнэ үү
        </div>
      )}
    </div>
  )
}