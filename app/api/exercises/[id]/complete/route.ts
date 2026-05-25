import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { levelFromXp } from '@/lib/xp'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: exerciseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { studentId, score, correctCount, incorrectCount, timeElapsedSeconds } = body as {
    studentId: string
    score: number
    correctCount: number
    incorrectCount: number
    timeElapsedSeconds: number
  }

  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })

  /* Verify this student belongs to the requesting user */
  const { data: student } = await supabaseAdmin
    .from('students')
    .select('id, xp_total, stars, level, parent_id, points_total')
    .eq('id', studentId)
    .single()

  if (!student || student.parent_id !== user.id) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  /* Fetch exercise rewards */
  const { data: exercise } = await supabaseAdmin
    .from('exercises')
    .select('xp_reward, stars_reward, points_reward')
    .eq('id', exerciseId)
    .single()

  if (!exercise) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })

  /* Calculate earned amounts based on score percentage */
  const pct = score > 0 ? score / (correctCount + incorrectCount) : correctCount / Math.max(correctCount + incorrectCount, 1)
  const multiplier = pct >= 0.8 ? 1 : pct >= 0.5 ? 0.5 : 0.25

  const xpEarned    = Math.round(exercise.xp_reward * multiplier)
  const starsEarned = Math.round(exercise.stars_reward * multiplier)

  /* Compute new totals and level */
  const newXpTotal = student.xp_total + xpEarned
  const newStars   = student.stars + starsEarned
  const newLevel   = levelFromXp(newXpTotal)
  const leveledUp  = newLevel > student.level

  /* Update student */
  await supabaseAdmin
    .from('students')
    .update({
      xp_total:     newXpTotal,
      stars:        newStars,
      level:        newLevel,
      /* keep legacy points_total in sync */
      points_total: (student.points_total ?? 0) + (exercise.points_reward ?? 0),
    })
    .eq('id', studentId)

  /* Record attempt */
  await supabaseAdmin
    .from('exercise_attempts')
    .insert({
      exercise_id:         exerciseId,
      student_id:          studentId,
      score:               score,
      correct_count:       correctCount,
      completed_at:        new Date().toISOString(),
    })

  return NextResponse.json({
    xpEarned,
    starsEarned,
    newXpTotal,
    newStars,
    newLevel,
    leveledUp,
  })
}