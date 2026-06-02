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

export async function GET(request: NextRequest) {
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

  // Fetch published courses with lessons and exercises for this creator
  const { data: coursesData, error: coursesError } = await supabaseAdmin
    .from('courses')
    .select('id, title, lessons(id, exercises(id))')
    .eq('creator_id', user.id)
    .eq('status', 'PUBLISHED')

  if (coursesError) return NextResponse.json({ error: coursesError.message }, { status: 500 })
  if (!coursesData || coursesData.length === 0) return NextResponse.json([])

  // Build exercise id set per course and course title map
  const courseExercises: Record<string, string[]> = {}
  const courseMap: Record<string, string> = {}
  for (const c of coursesData as any[]) {
    courseMap[c.id] = c.title
    const ids: string[] = []
    for (const l of (c.lessons ?? [])) {
      for (const e of (l.exercises ?? [])) ids.push(e.id)
    }
    courseExercises[c.id] = ids
  }

  const courseIds = Object.keys(courseMap)

  // Fetch enrollments with student data via admin client (bypasses RLS)
  const { data: enrollData, error: enrollError } = await supabaseAdmin
    .from('enrollments')
    .select('id, student_id, course_id, students(id, name, avatar, grade_level)')
    .in('course_id', courseIds)

  if (enrollError) return NextResponse.json({ error: enrollError.message }, { status: 500 })
  if (!enrollData || enrollData.length === 0) return NextResponse.json([])

  // Get unique student IDs
  const studentIds = [...new Set((enrollData as any[]).map((e: any) => e.student_id))]

  // Fetch exercise attempts for these students
  const { data: attemptsData } = await supabaseAdmin
    .from('exercise_attempts')
    .select('student_id, exercise_id, completed_at')
    .in('student_id', studentIds)

  // Build completed exercise set and last active per student
  const completedMap: Record<string, Set<string>> = {}
  const lastActiveMap: Record<string, string> = {}
  for (const a of (attemptsData ?? []) as any[]) {
    if (!completedMap[a.student_id]) completedMap[a.student_id] = new Set()
    completedMap[a.student_id].add(a.exercise_id)
    if (!lastActiveMap[a.student_id] || a.completed_at > lastActiveMap[a.student_id]) {
      lastActiveMap[a.student_id] = a.completed_at
    }
  }

  // Build result with progress calculation
  const result = (enrollData as any[]).map((e: any) => {
    const student = e.students as any
    const cid = e.course_id
    const exerciseIds = courseExercises[cid] ?? []
    const totalEx = exerciseIds.length
    const doneEx = totalEx > 0
      ? exerciseIds.filter((exId: string) => completedMap[e.student_id]?.has(exId)).length
      : 0
    const progress = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0

    return {
      id: e.id,
      studentId: student?.id ?? '',
      studentName: student?.name ?? '',
      avatar: student?.avatar ?? 'bear',
      gradeLevel: student?.grade_level ?? 1,
      courseId: cid,
      courseTitle: courseMap[cid] ?? '',
      progress,
      lastActive: lastActiveMap[e.student_id] ?? null,
    }
  })

  return NextResponse.json(result)
}
