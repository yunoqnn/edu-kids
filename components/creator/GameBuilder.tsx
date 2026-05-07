'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { GAME_LABELS, GAME_REGISTRY } from '@/components/games/registry'
import { SimpleQuizBuilder }    from './builders/SimpleQuizBuilder'
import { DragDropBuilder }       from './builders/DragDropBuilder'
import { MatchingBuilder }       from './builders/MatchingBuilder'
import { PatternBuilder }        from './builders/PatternBuilder'
import { OddOneOutBuilder }      from './builders/OddOneOutBuilder'
import { CategorySortBuilder }   from './builders/CategorySortBuilder'
import { SequenceRepeatBuilder } from './builders/SequenceRepeatBuilder'
import { SoundMemoryBuilder }    from './builders/SoundMemoryBuilder'
import { MatchstickBuilder }     from './builders/MatchstickBuilder'
import { ReadRememberBuilder }   from './builders/ReadRememberBuilder'
import type {
  GameType, GameConfig, AnyGameData,
  SimpleQuizData, DragDropData, MatchingData, PatternData,
  OddOneOutData, MatchstickData, CategorySortData,
  SequenceRepeatData, SoundMemoryData, ReadRememberData,
} from '@/types/games'

const EMPTY_DATA: Record<GameType, AnyGameData> = {
  SIMPLE_QUIZ: { question: { type: 'text', value: '' }, options: [], explanation: '' } as SimpleQuizData,
  DRAG_DROP: { items: [], zones: [] } as DragDropData,
  MATCHING: { pairs: [] },
  PATTERN: { sequence: [], missingIndex: 0, options: [] },
  ODD_ONE_OUT: { items: [] },
  MATCHSTICK: { prompt: '', segments: [], allowedMoves: 1, solutionSegmentIds: [] },
  CATEGORY_SORT: { categories: [], items: [], timePerItemSeconds: 5 },
  SEQUENCE_REPEAT: { tileCount: 4, tileColors: ['#F26A6A', '#7CC5F2', '#7DD3A7', '#FFC93C'], startLength: 2, maxLength: 8, displaySpeedMs: 700 },
  SOUND_MEMORY: { pairs: [] },
  READ_REMEMBER: { studyContent: { type: 'text', value: '' }, questions: [] },
}

interface Props {
  lessonId: string
  exerciseId?: string /* if editing */
  initialType?: GameType
  initialData?: AnyGameData
  initialConfig?: GameConfig
  initialTitle?: string
}

export function GameBuilder({ lessonId, exerciseId, initialType = 'SIMPLE_QUIZ', initialData, initialConfig, initialTitle = '' }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [gameType, setGameType] = useState<GameType>(initialType)
  const [gameData, setGameData] = useState<AnyGameData>(initialData ?? EMPTY_DATA[initialType])
  const [config, setConfig] = useState<GameConfig>(initialConfig ?? { showInstantFeedback: true, shuffleOptions: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [tab, setTab] = useState<'build' | 'config'>('build')

  const handleTypeChange = (t: GameType) => {
    setGameType(t)
    setGameData(EMPTY_DATA[t])
  }

  const handleSave = async () => {
    if (!title.trim()) { setError('Гарчиг оруулна уу'); return }
    setSaving(true)
    setError('')
    const payload = { lesson_id: lessonId, title, game_type: gameType, game_data: gameData, game_config: config }
    const { error: err } = exerciseId
      ? await supabase.from('exercises').update(payload).eq('id', exerciseId)
      : await supabase.from('exercises').insert(payload)
    if (err) { setError(err.message); setSaving(false); return }
    router.back()
  }

  const renderBuilder = () => {
    switch (gameType) {
      case 'SIMPLE_QUIZ':     return <SimpleQuizBuilder    value={gameData as SimpleQuizData}    onChange={setGameData} />
      case 'DRAG_DROP':       return <DragDropBuilder      value={gameData as DragDropData}       onChange={setGameData} />
      case 'MATCHING':        return <MatchingBuilder      value={gameData as MatchingData}       onChange={setGameData} />
      case 'PATTERN':         return <PatternBuilder       value={gameData as PatternData}        onChange={setGameData} />
      case 'ODD_ONE_OUT':     return <OddOneOutBuilder     value={gameData as OddOneOutData}      onChange={setGameData} />
      case 'MATCHSTICK':      return <MatchstickBuilder    value={gameData as MatchstickData}     onChange={setGameData} />
      case 'CATEGORY_SORT':   return <CategorySortBuilder  value={gameData as CategorySortData}   onChange={setGameData} />
      case 'SEQUENCE_REPEAT': return <SequenceRepeatBuilder value={gameData as SequenceRepeatData} onChange={setGameData} />
      case 'SOUND_MEMORY':    return <SoundMemoryBuilder   value={gameData as SoundMemoryData}    onChange={setGameData} />
      case 'READ_REMEMBER':   return <ReadRememberBuilder  value={gameData as ReadRememberData}   onChange={setGameData} />
      default: return null
    }
  }

  /* Preview */
  if (showPreview) {
    const Engine = GAME_REGISTRY[gameType]
    return (
      <div className="relative">
        <button onClick={() => setShowPreview(false)}
          className="fixed top-4 right-4 z-50 bg-stone-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-stone-900">
          ✕ Хаах
        </button>
        <Engine data={gameData} config={config} onComplete={() => setShowPreview(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h1 className="font-bold text-stone-800">{exerciseId ? 'Засах' : 'Шинэ дасгал'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPreview(true)}
            className="px-4 py-2 border border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:border-violet-300 transition-all">
            Урьдчилан харах
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-all">
            {saving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">{error}</div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Дасгалын нэр</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Жишээ: Үсэг таних — А, Б, В"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base font-medium focus:outline-none focus:border-violet-400 transition-all" />
        </div>

        {/* Game type selector */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-3">Тоглоомын төрөл</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.keys(GAME_LABELS) as GameType[]).map((t) => (
              <button key={t} type="button" onClick={() => handleTypeChange(t)}
                className={`px-3 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all
                  ${gameType === t ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-stone-200 bg-white text-stone-600 hover:border-violet-300'}`}>
                {GAME_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-stone-200 pb-0">
          {(['build', 'config'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-px
                ${tab === t ? 'border-violet-500 text-violet-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
              {t === 'build' ? 'Агуулга' : 'Тохиргоо'}
            </button>
          ))}
        </div>

        {/* Builder */}
        {tab === 'build' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            {renderBuilder()}
          </div>
        )}

        {/* Config */}
        {tab === 'config' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Хугацааны хязгаар (секунд, 0 = хязгааргүй)
              </label>
              <input type="number" min={0} max={600} value={config.timeLimitSeconds ?? 0}
                onChange={(e) => setConfig({ ...config, timeLimitSeconds: parseInt(e.target.value) || undefined })}
                className="w-32 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="shuffle" checked={config.shuffleOptions ?? false}
                onChange={(e) => setConfig({ ...config, shuffleOptions: e.target.checked })}
                className="w-4 h-4 accent-violet-600" />
              <label htmlFor="shuffle" className="text-sm font-medium text-stone-700">Хариултыг холих</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="feedback" checked={config.showInstantFeedback ?? true}
                onChange={(e) => setConfig({ ...config, showInstantFeedback: e.target.checked })}
                className="w-4 h-4 accent-violet-600" />
              <label htmlFor="feedback" className="text-sm font-medium text-stone-700">Шууд хариу харуулах</label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}