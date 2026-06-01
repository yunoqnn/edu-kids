import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/verify-admin'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await verifyAdmin(request)
  if (adminCheck) return adminCheck.error

  const { id } = await params

  const { data: course, error: courseErr } = await supabaseAdmin
    .from('courses')
    .select('id, title, description, status, grade_level, created_at, rejection_reason, creator:profiles!creator_id(id, name, email)')
    .eq('id', id)
    .single()

  if (courseErr) return NextResponse.json({ error: courseErr.message }, { status: 500 })

  const { data: lessons, error: lessonErr } = await supabaseAdmin
    .from('lessons')
    .select('id, title, type, order_index, is_published, exercises(id, title, game_type, points_reward)')
    .eq('course_id', id)
    .order('order_index')

  if (lessonErr) return NextResponse.json({ error: lessonErr.message }, { status: 500 })

  return NextResponse.json({ course, lessons: lessons ?? [] })
}
