'use client'

import { useCallback, useEffect, useState } from 'react'

interface CourseRow {
  id: string
  title: string
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'
  grade_level: number | null
  created_at: string
  rejection_reason: string | null
  creator: { id: string; name: string; email: string }
}

const STATUS_LABELS: Record<string, { label: string; dot: string }> = {
  DRAFT:          { label: 'Ноорог',          dot: 'bg-stone-400' },
  PENDING_REVIEW: { label: 'Хянагдаж байна', dot: 'bg-amber-400' },
  PUBLISHED:      { label: 'Нийтлэгдсэн',    dot: 'bg-green-500' },
  REJECTED:       { label: 'Татгалзсан',      dot: 'bg-red-400' },
}

const STATUS_FILTER_TABS = [
  { value: '', label: 'Бүгд' },
  { value: 'PENDING_REVIEW', label: 'Хүлээж байна' },
  { value: 'PUBLISHED', label: 'Нийтлэгдсэн' },
  { value: 'REJECTED', label: 'Татгалзсан' },
  { value: 'DRAFT', label: 'Ноорог' },
]

export default function AdminContentPage() {
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [denyForm, setDenyForm] = useState<{ id: string; reason: string } | null>(null)

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
                        <td className="px-4 py-3 font-medium text-stone-800">{course.title}</td>
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
              {statusFilter ? STATUS_LABELS[statusFilter]?.label ?? 'Курсууд' : 'Бүх контент'}
            </h2>
            {(statusFilter ? courses : rest).length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-sm">
                Курс олдсонгүй
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
                            {course.title}
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
                              <button
                                onClick={() => setConfirmDelete(course.id)}
                                className="px-2.5 py-1 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all"
                              >
                                Устгах
                              </button>
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
    </div>
  )
}
