import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/verify-admin'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck.error

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [usersRes, coursesRes, pendingRes, attemptsRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'ADMIN'),
    supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'PENDING_REVIEW'),
    supabaseAdmin.from('exercise_attempts').select('student_id').gte('completed_at', thirtyDaysAgo),
  ])

  const activeStudents = new Set((attemptsRes.data ?? []).map((a) => a.student_id)).size

  return NextResponse.json({
    totalUsers: usersRes.count ?? 0,
    totalCourses: coursesRes.count ?? 0,
    pendingReviews: pendingRes.count ?? 0,
    activeStudents,
  })
}
