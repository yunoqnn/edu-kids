import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/* --------------------------------------------------------------------------
   POST /api/slideshows/[id]/generate
   Loops through all slides for this slideshow in order_index order,
   calls the Chimege TTS API for each slide's script_text,
   and saves the returned audio URL back to the slide row.
   -------------------------------------------------------------------------- */

const CHIMEGE_API_URL = process.env.CHIMEGE_API_URL ?? ''
const CHIMEGE_API_KEY = process.env.CHIMEGE_API_KEY ?? ''

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: slideshowId } = await params
  const supabase = await createClient()

  /* Verify auth */
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  /* Verify the slideshow belongs to this creator */
  const { data: slideshow } = await supabase
    .from('slideshows')
    .select('id, lesson_id')
    .eq('id', slideshowId)
    .single()

  if (!slideshow) {
    return NextResponse.json({ error: 'Slideshow not found' }, { status: 404 })
  }

  /* Fetch slides in order */
  const { data: slides, error: slidesErr } = await supabase
    .from('slides')
    .select('id, script_text')
    .eq('slideshow_id', slideshowId)
    .order('order_index')

  if (slidesErr || !slides) {
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 })
  }

  const results: { id: string; success: boolean }[] = []

  for (const slide of slides) {
    if (!slide.script_text?.trim()) {
      results.push({ id: slide.id, success: false })
      continue
    }

    try {
      /* ----------------------------------------------------------------
         Chimege TTS API call.
         Replace the body structure below with the actual Chimege API
         request format once you have the documentation.
         Expected: send text, receive audio file URL.
         ---------------------------------------------------------------- */
      const ttsRes = await fetch(CHIMEGE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHIMEGE_API_KEY}`,
        },
        body: JSON.stringify({ text: slide.script_text }),
      })

      if (!ttsRes.ok) {
        results.push({ id: slide.id, success: false })
        continue
      }

      const ttsData = await ttsRes.json()
      /* Adjust `ttsData.audio_url` to match the actual Chimege response field */
      const audioUrl: string = ttsData.audio_url ?? ttsData.url ?? ''

      if (!audioUrl) {
        results.push({ id: slide.id, success: false })
        continue
      }

      await supabase
        .from('slides')
        .update({ audio_url: audioUrl })
        .eq('id', slide.id)

      results.push({ id: slide.id, success: true })
    } catch {
      results.push({ id: slide.id, success: false })
    }
  }

  return NextResponse.json({ results })
}