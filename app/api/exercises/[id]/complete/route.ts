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

  let body: { studentId?: string; score?: number; correctCount?: number; incorrectCount?: number; timeElapsedSeconds?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { studentId, score = 0, correctCount = 0, incorrectCount = 0 } = body

  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })

  /* Verify this student belongs to the requesting user */
  const { data: student } = await supabaseAdmin
    .from('students')
    .select('id, xp_total, stars, level, parent_id, points_total, points_balance')
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

  /* Check if student already completed this exercise */
  const { data: existingAttempt } = await supabaseAdmin
    .from('exercise_attempts')
    .select('id')
    .eq('exercise_id', exerciseId)
    .eq('student_id', studentId)
    .maybeSingle()

  const alreadyPlayed = !!existingAttempt

  const newXpTotal = student.xp_total
  const newStars   = student.stars
  const newLevel   = student.level
  const leveledUp  = false
  let xpEarned     = 0
  let starsEarned  = 0

  if (!alreadyPlayed) {
    /* Calculate earned amounts based on score percentage */
    const pct = score > 0 ? score / (correctCount + incorrectCount) : correctCount / Math.max(correctCount + incorrectCount, 1)
    const multiplier = pct >= 0.8 ? 1 : pct >= 0.5 ? 0.5 : 0.25

    xpEarned    = Math.round((exercise.xp_reward    || 20) * multiplier)
    starsEarned = Math.round((exercise.stars_reward || 3)  * multiplier)

    const earnedXpTotal = student.xp_total + xpEarned
    const earnedStars   = student.stars + starsEarned
    const earnedLevel   = levelFromXp(earnedXpTotal)

    /* Update student */
    await supabaseAdmin
      .from('students')
      .update({
        xp_total:       earnedXpTotal,
        stars:          earnedStars,
        level:          earnedLevel,
        points_total:   (student.points_total   ?? 0) + (exercise.points_reward ?? 0),
        points_balance: (student.points_balance ?? 0) + starsEarned,
      })
      .eq('id', studentId)

    /* Record attempt */
    await supabaseAdmin
      .from('exercise_attempts')
      .insert({
        exercise_id:   exerciseId,
        student_id:    studentId,
        score:         score,
        correct_count: correctCount,
        completed_at:  new Date().toISOString(),
      })

    return NextResponse.json({
      xpEarned,
      starsEarned,
      newXpTotal:  earnedXpTotal,
      newStars:    earnedStars,
      newLevel:    earnedLevel,
      leveledUp:   earnedLevel > student.level,
    })
  }

  return NextResponse.json({
    xpEarned,
    starsEarned,
    newXpTotal,
    newStars,
    newLevel,
    leveledUp,
    alreadyPlayed: true,
  })
}