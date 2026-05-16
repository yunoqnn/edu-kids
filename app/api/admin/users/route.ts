import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/verify-admin'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck.error

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const role = searchParams.get('role') || ''

  let query = supabaseAdmin
    .from('profiles')
    .select('id, email, name, role, is_active, created_at')
    .neq('role', 'ADMIN')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }
  if (role) {
    query = query.eq('role', role)
  }

  const { data: profiles, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const parentIds = (profiles ?? []).filter((p) => p.role === 'PARENT').map((p) => p.id)
  const studentCounts: Record<string, number> = {}

  if (parentIds.length > 0) {
    const { data: students } = await supabaseAdmin
      .from('students')
      .select('parent_id')
      .in('parent_id', parentIds)

    ;(students ?? []).forEach((s) => {
      studentCounts[s.parent_id] = (studentCounts[s.parent_id] ?? 0) + 1
    })
  }

  const result = (profiles ?? []).map((p) => ({
    ...p,
    student_count: p.role === 'PARENT' ? (studentCounts[p.id] ?? 0) : null,
  }))

  return NextResponse.json(result)
}
