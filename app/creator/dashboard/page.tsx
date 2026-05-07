'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Stats { total: number; published: number; pending: number; draft: number }

interface RecentCourse { id: string; title: string; status: string; created_at: string }

const STATUS_STYLES: Record<string, { label: string; dot: string }> = {
  DRAFT:          { label: 'Ноорог',          dot: 'bg-stone-400' },
  PENDING_REVIEW: { label: 'Хянагдаж байна', dot: 'bg-amber-400' },
  PUBLISHED:      { label: 'Нийтлэгдсэн',    dot: 'bg-green-500' },
  REJECTED:       { label: 'Татгалзсан',      dot: 'bg-red-400' },
}

export default function CreatorDashboard() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, pending: 0, draft: 0 })
  const [recent, setRecent] = useState<RecentCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/'); return }
      if (data.user.user_metadata?.role !== 'CONTENT_CREATOR') { router.push('/'); return }

      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email ?? '',
        name: data.user.user_metadata?.name ?? 'User',
        role: 'CONTENT_CREATOR' as const,
      }, { onConflict: 'id' })

      setName(data.user.user_metadata?.name || 'Бүтээгч')

      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, status, created_at')
        .eq('creator_id', data.user.id)
        .order('created_at', { ascending: false })

      const rows = courses ?? []
      setStats({
        total: rows.length,
        published: rows.filter((c) => c.status === 'PUBLISHED').length,
        pending:   rows.filter((c) => c.status === 'PENDING_REVIEW').length,
        draft:     rows.filter((c) => c.status === 'DRAFT').length,
      })
      setRecent(rows.slice(0, 5))
      setLoading(false)
    })
  }, [router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400 animate-pulse">Уншиж байна...</div>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden>
            <circle cx="24" cy="24" r="22" fill="none" stroke="#1F1A2E" strokeWidth="2.5" strokeDasharray="4 3" />
            <path d="M14 28 L24 16 L34 28 L24 22 Z" fill="#1F1A2E" />
            <circle cx="24" cy="32" r="2.5" fill="#1F1A2E" />
          </svg>
          <span className="font-bold text-stone-800 text-lg" style={{ fontFamily: 'DM Serif Display, serif' }}>edukids</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500 hidden sm:block">{name}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-500 font-medium hover:border-stone-300 transition-all">
            Гарах
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'DM Serif Display, serif' }}>
            Сайн байна уу, {name} 👋
          </h1>
          <p className="text-stone-500 text-sm mt-1">Таны контент удирдлагын самбар</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Нийт курс',        val: stats.total,     color: 'bg-violet-50 text-violet-700', icon: '📚' },
            { label: 'Нийтлэгдсэн',      val: stats.published, color: 'bg-green-50 text-green-700',   icon: '✅' },
            { label: 'Хянагдаж байгаа',  val: stats.pending,   color: 'bg-amber-50 text-amber-700',   icon: '⏳' },
            { label: 'Ноорог',           val: stats.draft,     color: 'bg-stone-100 text-stone-600',  icon: '📝' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-5 ${s.color} border border-white`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-bold">{s.val}</div>
              <div className="text-xs font-semibold mt-1 opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button onClick={() => router.push('/creator/courses/new')}
            className="flex items-center gap-4 p-5 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 active:scale-95 transition-all text-left shadow-lg shadow-violet-200">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">➕</div>
            <div>
              <div className="font-bold text-base">Шинэ курс үүсгэх</div>
              <div className="text-violet-200 text-xs mt-0.5">Хичээл, дасгалаа нэмнэ үү</div>
            </div>
          </button>
          <button onClick={() => router.push('/creator/courses')}
            className="flex items-center gap-4 p-5 bg-white border border-stone-200 rounded-2xl hover:border-violet-300 hover:bg-violet-50 active:scale-95 transition-all text-left">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">📚</div>
            <div>
              <div className="font-bold text-base text-stone-800">Миний курсууд</div>
              <div className="text-stone-400 text-xs mt-0.5">Бүх курсыг харах, засах</div>
            </div>
          </button>
        </div>

        {/* Recent courses */}
        {recent.length > 0 && (
          <div>
            <h2 className="font-bold text-stone-700 mb-3">Сүүлд үүсгэсэн</h2>
            <div className="space-y-2">
              {recent.map((c) => {
                const s = STATUS_STYLES[c.status] ?? STATUS_STYLES.DRAFT
                return (
                  <div key={c.id} onClick={() => router.push(`/creator/courses/${c.id}`)}
                    className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 px-4 py-3 cursor-pointer hover:border-violet-300 transition-all">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <span className="flex-1 text-sm font-medium text-stone-700 truncate">{c.title}</span>
                    <span className="text-xs text-stone-400 flex-shrink-0">{s.label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A199B4" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}