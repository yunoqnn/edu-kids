import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/verify-admin'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck.error

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''

  let query = supabaseAdmin
    .from('courses')
    .select(`
      id, title, status, grade_level, created_at, rejection_reason,
      creator:profiles!creator_id(id, name, email)
    `)

  if (status) {
    query = query.eq('status', status)
  }

  // PENDING_REVIEW first, then by created_at descending
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sort so PENDING_REVIEW appears first when no status filter
  const sorted = status
    ? data
    : [
        ...(data ?? []).filter((c) => c.status === 'PENDING_REVIEW'),
        ...(data ?? []).filter((c) => c.status !== 'PENDING_REVIEW'),
      ]

  return NextResponse.json(sorted)
}
