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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = authedClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  if (profile?.role !== 'CONTENT_CREATOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const { data: exercise, error: exerciseError } = await supabaseAdmin
    .from('exercises')
    .select('id, lesson_id')
    .eq('id', id)
    .maybeSingle()

  if (exerciseError) {
    return NextResponse.json({ error: exerciseError.message }, { status: 500 })
  }

  if (!exercise) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }

  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons')
    .select('course_id')
    .eq('id', exercise.lesson_id)
    .maybeSingle()

  if (lessonError) {
    return NextResponse.json({ error: lessonError.message }, { status: 500 })
  }

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .select('creator_id')
    .eq('id', lesson.course_id)
    .maybeSingle()

  if (courseError) {
    return NextResponse.json({ error: courseError.message }, { status: 500 })
  }

  if (!course || course.creator_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: deleteError } = await supabaseAdmin
    .from('exercises')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
