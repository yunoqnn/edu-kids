'use client'

import { useCallback, useEffect, useState } from 'react'

interface Exercise {
  id: string
  title: string
  game_type: string
  points_reward: number
}

interface Lesson {
  id: string
  title: string
  type: string
  order_index: number
  is_published: boolean
  exercises: Exercise[]
}

interface CourseRow {
  id: string
  title: string
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'
  grade_level: number | null
  created_at: string
  rejection_reason: string | null
  creator: { id: string; name: string; email: string }
}

interface CoursePreview {
  course: CourseRow
  lessons: Lesson[]
}

const STATUS_LABELS: Record<string, { label: string; dot: string }> = {
  DRAFT:          { label: 'draft',          dot: 'bg-stone-400' },
  PENDING_REVIEW: { label: 'Хянагдаж байна', dot: 'bg-amber-400' },
  PUBLISHED:      { label: 'Нийтлэгдсэн',    dot: 'bg-green-500' },
  REJECTED:       { label: 'Татгалзсан',      dot: 'bg-red-400' },
}

const STATUS_FILTER_TABS = [
  { value: '', label: 'Бүгд' },
  { value: 'PENDING_REVIEW', label: 'Хүлээж байна' },
  { value: 'PUBLISHED', label: 'Нийтлэгдсэн' },
  { value: 'REJECTED', label: 'Татгалзсан' },
  { value: 'DRAFT', label: 'Draft' },
]

const GAME_LABELS: Record<string, string> = {
  SIMPLE_QUIZ: 'Асуулт', DRAG_DROP: 'Чирж тавих', MATCHING: 'Хос тааруулах',
  PATTERN: 'Дараалал', ODD_ONE_OUT: 'Өөр нэгийг ол', CATEGORY_SORT: 'Ангилал',
  SEQUENCE_REPEAT: 'Дараалал давтах', READ_REMEMBER: 'Уншиж санаарай', MATCHSTICK: 'Хутга',
}

export default function AdminContentPage() {
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [denyForm, setDenyForm] = useState<{ id: string; reason: string } | null>(null)

  const [preview, setPreview] = useState<CoursePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [previewDenyForm, setPreviewDenyForm] = useState<{ reason: string } | null>(null)

  const fetchCourses = useCallback(async (status: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    const res = await fetch(`/api/admin/content?${params}`)
    const data = await res.json()
    setCourses(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCourses(statusFilter) }, [statusFilter, fetchCourses])

  async function openPreview(id: string) {
    setPreviewLoading(true)
    setPreview(null)
    setExpandedLesson(null)
    setPreviewDenyForm(null)
    const res = await fetch(`/api/admin/content/${id}/preview`)
    const data = await res.json()
    setPreview(data)
    setPreviewLoading(false)
  }

  function closePreview() {
    setPreview(null)
    setPreviewDenyForm(null)
    setExpandedLesson(null)
  }

  async function approve(id: string) {
    setBusy(id)
    await fetch(`/api/admin/content/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PUBLISHED' }),
    })
    await fetchCourses(statusFilter)
    setBusy(null)
  }

  async function approveFromPreview(id: string) {
    setBusy(id)
    await fetch(`/api/admin/content/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PUBLISHED' }),
    })
    closePreview()
    await fetchCourses(statusFilter)
    setBusy(null)
  }

  async function denyFromPreview(id: string, reason: string) {
    setBusy(id)
    await fetch(`/api/admin/content/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', rejection_reason: reason }),
    })
    closePreview()
    await fetchCourses(statusFilter)
    setBusy(null)
  }

  async function deny(id: string, reason: string) {
    setBusy(id)
    await fetch(`/api/admin/content/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', rejection_reason: reason }),
    })
    setDenyForm(null)
    await fetchCourses(statusFilter)
    setBusy(null)
  }

  async function deleteCourse(id: string) {
    setBusy(id)
    await fetch(`/api/admin/content/${id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    await fetchCourses(statusFilter)
    setBusy(null)
  }

  const pending = courses.filter((c) => c.status === 'PENDING_REVIEW')
  const rest = courses.filter((c) => c.status !== 'PENDING_REVIEW')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'DM Serif Display, serif' }}>
          Контент хянах
        </h1>
        <p className="text-stone-500 text-sm mt-1">Бүтээгчдийн илгээсэн курсуудыг хянах</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6 w-fit">
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === tab.value
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-stone-400 text-sm animate-pulse">Уншиж байна...</div>
      ) : (
        <>
          {/* Pending review section */}
          {!statusFilter && pending.length > 0 && (
            <section className="mb-8">
              <h2 className="font-bold text-stone-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Хянах шаардлагатай
                <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {pending.length}
                </span>
              </h2>
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Гарчиг</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Бүтээгч</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Анги</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Огноо</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {pending.map((course) => (
                      <tr key={course.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-stone-800">
                          <button
                            onClick={() => openPreview(course.id)}
                            className="text-left hover:text-violet-700 hover:underline transition-colors"
                          >
                            {course.title}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-stone-500">
                          <div>{course.creator.name}</div>
                          <div className="text-xs text-stone-400">{course.creator.email}</div>
                        </td>
                        <td className="px-4 py-3 text-stone-500">
                          {course.grade_level ? `${course.grade_level}-р анги` : '—'}
                        </td>
                        <td className="px-4 py-3 text-stone-400 text-xs">
                          {new Date(course.created_at).toLocaleDateString('mn-MN')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {denyForm?.id === course.id ? (
                            <div className="flex gap-2 items-center justify-end flex-wrap">
                              <input
                                autoFocus
                                value={denyForm.reason}
                                onChange={(e) => setDenyForm({ id: course.id, reason: e.target.value })}
                                placeholder="Татгалзах шалтгаан..."
                                className="border border-stone-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-400 w-48"
                              />
                              <button
                                onClick={() => deny(course.id, denyForm.reason)}
                                disabled={busy === course.id}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                              >
                                Татгалзах
                              </button>
                              <button
                                onClick={() => setDenyForm(null)}
                                className="px-2 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-600 hover:bg-stone-100"
                              >
                                Болих
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex gap-2">
                              <button
                                onClick={() => openPreview(course.id)}
                                className="px-3 py-1.5 border border-violet-200 text-violet-600 rounded-lg text-xs font-semibold hover:bg-violet-50 transition-all"
                              >
                                Харах
                              </button>
                              <button
                                onClick={() => approve(course.id)}
                                disabled={busy === course.id}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-all"
                              >
                                Зөвшөөрөх
                              </button>
                              <button
                                onClick={() => setDenyForm({ id: course.id, reason: '' })}
                                disabled={busy === course.id}
                                className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition-all"
                              >
                                Татгалзах
                              </button>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* All / filtered courses */}
          <section>
            <h2 className="font-bold text-stone-700 mb-3">
              {statusFilter ? STATUS_LABELS[statusFilter]?.label ?? 'Хичээлүүд' : 'Бүх контент'}
            </h2>
            {(statusFilter ? courses : rest).length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-sm">
                Хичээл олдсонгүй
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Гарчиг</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Бүтээгч</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Төлөв</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500">Огноо</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {(statusFilter ? courses : rest).map((course) => {
                      const s = STATUS_LABELS[course.status] ?? STATUS_LABELS.DRAFT
                      return (
                        <tr key={course.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-stone-800">
                            <button
                              onClick={() => openPreview(course.id)}
                              className="text-left hover:text-violet-700 hover:underline transition-colors"
                            >
                              {course.title}
                            </button>
                            {course.rejection_reason && (
                              <div className="text-xs text-red-400 mt-0.5 truncate max-w-xs">{course.rejection_reason}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-stone-500 text-xs">{course.creator.name}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                              <span className="text-xs text-stone-600">{s.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-stone-400 text-xs">
                            {new Date(course.created_at).toLocaleDateString('mn-MN')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {confirmDelete === course.id ? (
                              <span className="inline-flex gap-2 items-center">
                                <span className="text-xs text-stone-500">Устгах уу?</span>
                                <button
                                  onClick={() => deleteCourse(course.id)}
                                  disabled={busy === course.id}
                                  className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                                >
                                  Тийм
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-2.5 py-1 border border-stone-200 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                                >
                                  Үгүй
                                </button>
                              </span>
                            ) : (
                              <span className="inline-flex gap-2">
                                <button
                                  onClick={() => openPreview(course.id)}
                                  className="px-2.5 py-1 border border-stone-200 text-stone-500 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-all"
                                >
                                  Харах
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(course.id)}
                                  className="px-2.5 py-1 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all"
                                >
                                  Устгах
                                </button>
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Preview Modal */}
      {(previewLoading || preview) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closePreview() }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {previewLoading ? (
              <div className="p-12 text-center text-stone-400 text-sm animate-pulse">Уншиж байна...</div>
            ) : preview ? (
              <>
                {/* Modal header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-stone-100">
                  <div>
                    <h2 className="text-lg font-bold text-stone-800">{preview.course.title}</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {preview.course.grade_level && (
                        <span className="text-xs text-stone-500 font-medium">{preview.course.grade_level}-р анги</span>
                      )}
                      <span className="text-xs text-stone-400">{preview.course.creator.name}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        preview.course.status === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-600' :
                        preview.course.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' :
                        preview.course.status === 'REJECTED' ? 'bg-red-50 text-red-500' :
                        'bg-stone-100 text-stone-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_LABELS[preview.course.status]?.dot ?? 'bg-stone-400'}`} />
                        {STATUS_LABELS[preview.course.status]?.label ?? preview.course.status}
                      </span>
                    </div>
                    {/* {preview.course.description && (
                      <p className="text-sm text-stone-500 mt-2 leading-relaxed">{preview.course.description}</p>
                    )} */}
                  </div>
                  <button
                    onClick={closePreview}
                    className="ml-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>

                {/* Lessons list */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {preview.lessons.length === 0 ? (
                    <div className="text-center text-stone-400 text-sm py-8">Хичээл оруулаагүй байна</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
                        {preview.lessons.length} хичээл · {preview.lessons.reduce((s, l) => s + l.exercises.length, 0)} дасгал
                      </div>
                      {preview.lessons.map((lesson, idx) => {
                        const isOpen = expandedLesson === lesson.id
                        return (
                          <div key={lesson.id} className="border border-stone-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setExpandedLesson(isOpen ? null : lesson.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left"
                            >
                              <span className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {lesson.type === 'FAIRY_TALE' ? '📖' : idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-stone-800">{lesson.title}</div>
                                <div className="text-xs text-stone-400 mt-0.5">
                                  {lesson.type === 'FAIRY_TALE' ? 'Үлгэр' : 'Хичээл'} · {lesson.exercises.length} дасгал
                                </div>
                              </div>
                              <svg
                                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"
                                style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0 }}
                              >
                                <path d="m6 9 6 6 6-6"/>
                              </svg>
                            </button>

                            {isOpen && (
                              <div className="border-t border-stone-100 bg-stone-50 px-4 py-3 space-y-2">
                                {lesson.exercises.length === 0 ? (
                                  <p className="text-xs text-stone-400">Дасгал оруулаагүй байна</p>
                                ) : (
                                  lesson.exercises.map((ex) => (
                                    <div key={ex.id} className="flex items-center gap-2 bg-white rounded-lg border border-stone-100 px-3 py-2">
                                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 flex-shrink-0">
                                        {GAME_LABELS[ex.game_type] ?? ex.game_type}
                                      </span>
                                      <span className="text-sm text-stone-700 flex-1 truncate">{ex.title}</span>
                                      {ex.points_reward > 0 && (
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex-shrink-0">
                                          +{ex.points_reward}⭐
                                        </span>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Modal footer – approve/reject for PENDING_REVIEW */}
                {preview.course.status === 'PENDING_REVIEW' && (
                  <div className="border-t border-stone-100 px-6 py-4">
                    {previewDenyForm ? (
                      <div className="flex gap-2 items-center flex-wrap">
                        <input
                          autoFocus
                          value={previewDenyForm.reason}
                          onChange={(e) => setPreviewDenyForm({ reason: e.target.value })}
                          placeholder="Татгалзах шалтгаан..."
                          className="flex-1 min-w-0 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                        />
                        <button
                          onClick={() => denyFromPreview(preview.course.id, previewDenyForm.reason)}
                          disabled={busy === preview.course.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex-shrink-0"
                        >
                          Татгалзах
                        </button>
                        <button
                          onClick={() => setPreviewDenyForm(null)}
                          className="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-100 flex-shrink-0"
                        >
                          Болих
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setPreviewDenyForm({ reason: '' })}
                          disabled={busy === preview.course.id}
                          className="px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-all"
                        >
                          Татгалзах
                        </button>
                        <button
                          onClick={() => approveFromPreview(preview.course.id)}
                          disabled={busy === preview.course.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-all"
                        >
                          Зөвшөөрөх
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
