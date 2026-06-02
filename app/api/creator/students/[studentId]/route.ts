import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function authedClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params
  const supabase = authedClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'CONTENT_CREATOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get creator's published courses with lessons and exercises
  const { data: coursesData } = await supabaseAdmin
    .from('courses')
    .select('id, title, lessons(id, exercises(id))')
    .eq('creator_id', user.id)
    .eq('status', 'PUBLISHED')

  const courseIds: string[] = (coursesData ?? []).map((c: any) => c.id)
  if (courseIds.length === 0) {
    return NextResponse.json({ student: null, attempts: [], enrollments: [] })
  }

  // Collect all exercise IDs belonging to this creator's courses
  const allExerciseIds: string[] = []
  for (const c of (coursesData ?? []) as any[]) {
    for (const l of (c.lessons ?? [])) {
      for (const e of (l.exercises ?? [])) allExerciseIds.push(e.id)
    }
  }

  // Fetch student basic info
  const { data: student } = await supabaseAdmin
    .from('students')
    .select('id, name, avatar, grade_level, points_total, xp_total, level')
    .eq('id', studentId)
    .maybeSingle()

  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  // Fetch exercise attempts for this student, only in creator's exercises
  const attemptsQuery = supabaseAdmin
    .from('exercise_attempts')
    .select('exercise_id, score, completed_at, exercises(id, title, points_reward, lessons(course_id, courses(id, title)))')
    .eq('student_id', studentId)
    .order('completed_at', { ascending: false })
    .limit(200)

  const { data: attemptsRaw } = allExerciseIds.length > 0
    ? await attemptsQuery.in('exercise_id', allExerciseIds)
    : { data: [] }

  // Fetch enrollments for this student in creator's courses
  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('course_id, courses(id, title, lessons(id, exercises(id)))')
    .eq('student_id', studentId)
    .in('course_id', courseIds)

  return NextResponse.json({
    student,
    attempts: attemptsRaw ?? [],
    enrollments: enrollments ?? [],
  })
}
