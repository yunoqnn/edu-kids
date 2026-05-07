'use client'

import { MediaUploadField } from '../shared/MediaUploadField'
import type { ReadRememberData, MediaContent } from '@/types/games'

const empty = (): MediaContent => ({ type: 'text', value: '' })

interface Props { value: ReadRememberData; onChange: (v: ReadRememberData) => void }

export function ReadRememberBuilder({ value, onChange }: Props) {
  const addQuestion = () => onChange({
    ...value,
    questions: [...value.questions, {
      id: crypto.randomUUID(), questionText: '',
      options: [
        { id: crypto.randomUUID(), text: '', isCorrect: true },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ],
    }],
  })

  const removeQuestion = (id: string) => onChange({ ...value, questions: value.questions.filter((q) => q.id !== id) })

  const updateQuestion = (id: string, questionText: string) =>
    onChange({ ...value, questions: value.questions.map((q) => q.id === id ? { ...q, questionText } : q) })

  const updateOption = (qid: string, oid: string, text: string) =>
    onChange({ ...value, questions: value.questions.map((q) => q.id === qid
      ? { ...q, options: q.options.map((o) => o.id === oid ? { ...o, text } : o) }
      : q) })

  const setCorrect = (qid: string, oid: string) =>
    onChange({ ...value, questions: value.questions.map((q) => q.id === qid
      ? { ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.id === oid })) }
      : q) })

  const addOption = (qid: string) =>
    onChange({ ...value, questions: value.questions.map((q) => q.id === qid
      ? { ...q, options: [...q.options, { id: crypto.randomUUID(), text: '', isCorrect: false }] }
      : q) })

  return (
    <div className="space-y-6">
      {/* Study content */}
      <div className="p-4 bg-violet-50 rounded-2xl border border-violet-200 space-y-3">
        <p className="text-sm font-bold text-violet-700">Судлах агуулга</p>
        <MediaUploadField label="Зураг эсвэл текст" value={value.studyContent} onChange={(c) => onChange({ ...value, studyContent: c })} />
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-stone-700">Харуулах хугацаа (секунд, 0 = гараар):</label>
          <input type="number" min={0} max={300} value={value.displayDurationSeconds ?? 0}
            onChange={(e) => onChange({ ...value, displayDurationSeconds: parseInt(e.target.value) || undefined })}
            className="w-20 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-stone-700">Асуултууд</p>
          <button type="button" onClick={addQuestion}
            className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg font-semibold hover:bg-violet-200">
            + Асуулт нэмэх
          </button>
        </div>
        <div className="space-y-4">
          {value.questions.map((q, qi) => (
            <div key={q.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-600">{qi + 1}-р асуулт</span>
                <button type="button" onClick={() => removeQuestion(q.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-semibold">Устгах</button>
              </div>
              <input type="text" value={q.questionText} onChange={(e) => updateQuestion(q.id, e.target.value)}
                placeholder="Асуулт оруулна уу..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400" />
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={opt.id} className={`flex items-center gap-2 p-2 rounded-xl border-2 ${opt.isCorrect ? 'border-green-400 bg-green-50' : 'border-stone-200 bg-white'}`}>
                    <button type="button" onClick={() => setCorrect(q.id, opt.id)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                        ${opt.isCorrect ? 'border-green-500 bg-green-500' : 'border-stone-300 hover:border-green-400'}`}>
                      {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                    <input type="text" value={opt.text} onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                      placeholder={`Сонголт ${oi + 1}`}
                      className="flex-1 bg-transparent text-sm focus:outline-none" />
                  </div>
                ))}
                <button type="button" onClick={() => addOption(q.id)}
                  className="text-xs text-violet-600 hover:text-violet-700 font-semibold">
                  + Сонголт нэмэх
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}