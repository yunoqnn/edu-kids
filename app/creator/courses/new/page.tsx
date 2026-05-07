'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gradeLevel, setGradeLevel] = useState<number | ''>('')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!title.trim()) { setError('Гарчиг оруулна уу'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data, error: err } = await supabase.from('courses').insert({
      creator_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      grade_level: gradeLevel || null,
      visibility,
      status: 'DRAFT',
    }).select('id').single()
    if (err) { setError(err.message); setSaving(false); return }
    router.push(`/creator/courses/${data.id}`)
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-violet-400 transition-all'

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h1 className="font-bold text-stone-800">Шинэ курс</h1>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-all">
          {saving ? 'Үүсгэж байна...' : 'Курс үүсгэх'}
        </button>
      </header>

      <div className="max-w-xl mx-auto px-4 py-10 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">{error}</div>
        )}

        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Курсын нэр *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Жишэ: Монгол үсэг таних — 1-р анги" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Тайлбар</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            placeholder="Курсын тухай товч тайлбар..."
            className={`${inputCls} resize-none`} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Зориулагдсан анги</label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((g) => (
              <button key={g} type="button" onClick={() => setGradeLevel(gradeLevel === g ? '' : g)}
                className={`w-12 h-12 rounded-xl border-2 font-bold text-base transition-all
                  ${gradeLevel === g ? 'border-violet-500 bg-violet-600 text-white' : 'border-stone-200 bg-white text-stone-700 hover:border-violet-300'}`}>
                {g}
              </button>
            ))}
            <button type="button" onClick={() => setGradeLevel('')}
              className={`px-4 h-12 rounded-xl border-2 font-semibold text-sm transition-all
                ${gradeLevel === '' ? 'border-violet-500 bg-violet-600 text-white' : 'border-stone-200 bg-white text-stone-500 hover:border-violet-300'}`}>
              Бүгд
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Харагдах байдал</label>
          <div className="flex gap-3">
            {(['PUBLIC', 'PRIVATE'] as const).map((v) => (
              <button key={v} type="button" onClick={() => setVisibility(v)}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all
                  ${visibility === v ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-stone-200 bg-white text-stone-600 hover:border-violet-300'}`}>
                {v === 'PUBLIC' ? '🌐 Нийтийн' : '🔒 Хувийн'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}