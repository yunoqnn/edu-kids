import { supabaseAdmin } from '@/lib/supabase-admin'

const STAT_CARDS = [
  { key: 'totalUsers',     label: 'Нийт хэрэглэгч',     icon: '👥', color: 'bg-violet-50 text-violet-700' },
  { key: 'totalCourses',   label: 'Нийт курс',           icon: '📚', color: 'bg-blue-50 text-blue-700' },
  { key: 'pendingReviews', label: 'Хянах шаардлагатай', icon: '⏳', color: 'bg-amber-50 text-amber-700' },
  { key: 'activeStudents', label: '30 хоногт идэвхтэй', icon: '🎮', color: 'bg-green-50 text-green-700' },
]

async function getStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [usersRes, coursesRes, pendingRes, attemptsRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'ADMIN'),
    supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'PENDING_REVIEW'),
    supabaseAdmin.from('exercise_attempts').select('student_id').gte('completed_at', thirtyDaysAgo),
  ])

  return {
    totalUsers: usersRes.count ?? 0,
    totalCourses: coursesRes.count ?? 0,
    pendingReviews: pendingRes.count ?? 0,
    activeStudents: new Set((attemptsRes.data ?? []).map((a) => a.student_id)).size,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'DM Serif Display, serif' }}>
          Удирдлагын самбар
        </h1>
        <p className="text-stone-500 text-sm mt-1">Системийн ерөнхий байдал</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className={`rounded-2xl p-5 ${card.color} border border-white`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold">{stats[card.key as keyof typeof stats]}</div>
            <div className="text-xs font-semibold mt-1 opacity-80">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/admin/users"
          className="flex items-center gap-4 p-5 bg-white border border-stone-200 rounded-2xl hover:border-violet-300 hover:bg-violet-50 transition-all"
        >
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">👥</div>
          <div>
            <div className="font-bold text-stone-800">Хэрэглэгчид</div>
            <div className="text-xs text-stone-400 mt-0.5">Хэрэглэгчдийг удирдах</div>
          </div>
        </a>
        <a
          href="/admin/content"
          className="flex items-center gap-4 p-5 bg-white border border-stone-200 rounded-2xl hover:border-violet-300 hover:bg-violet-50 transition-all"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📋</div>
          <div>
            <div className="font-bold text-stone-800">Контент хянах</div>
            <div className="text-xs text-stone-400 mt-0.5">
              {stats.pendingReviews > 0
                ? `${stats.pendingReviews} курс хүлээж байна`
                : 'Хянах зүйл алга'}
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
