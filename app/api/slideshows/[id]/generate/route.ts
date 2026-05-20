import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/* --------------------------------------------------------------------------
   POST /api/slideshows/[id]/generate
   For each slide in order:
     1. Call Chimege TTS → receive WAV binary
     2. Upload WAV to Supabase Storage (game-media bucket)
     3. Save public URL back to slides.audio_url
   Voice is chosen based on the lesson type the slideshow belongs to.
   -------------------------------------------------------------------------- */

const CHIMEGE_SYNTHESIZE_URL = 'https://api.chimege.com/v1.2/synthesize'

/* Lesson type → Chimege voice-id mapping per Yuno's spec */
const VOICE: Record<string, string> = {
  FAIRY_TALE: 'FEMALE4v2',
  LESSON:     'FEMALE3v2',
}

/* Strip characters Chimege rejects: only Cyrillic, spaces, and basic punctuation allowed */
function sanitizeText(text: string): string {
  return text
    .replace(/[^\u0400-\u04FF\s?!.,\-'":]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300)
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: slideshowId } = await params
  const supabase = await createClient()

  /* Auth check */
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = process.env.CHIMEGE_API_KEY
  if (!token) {
    return NextResponse.json({ error: 'CHIMEGE_API_KEY env var is not set' }, { status: 500 })
  }

  /* Get slideshow + lesson type in one query */
  const { data: slideshow, error: swErr } = await supabase
    .from('slideshows')
    .select('id, lesson_id, lessons ( type )')
    .eq('id', slideshowId)
    .single()

  if (swErr || !slideshow) {
    return NextResponse.json({ error: 'Slideshow not found' }, { status: 404 })
  }

  /* Determine voice from lesson type */
  const lessonType: string = (slideshow.lessons as unknown as { type: string } | null)?.type ?? 'LESSON'
  const voiceId = VOICE[lessonType] ?? 'FEMALE3v2'

  /* Fetch all slides in order */
  const { data: slides, error: slidesErr } = await supabase
    .from('slides')
    .select('id, script_text')
    .eq('slideshow_id', slideshowId)
    .order('order_index')

  if (slidesErr || !slides?.length) {
    return NextResponse.json({ error: 'No slides found' }, { status: 404 })
  }

  const results: { id: string; success: boolean; error?: string }[] = []

  for (const slide of slides) {
    const rawText = slide.script_text?.trim() ?? ''

    if (!rawText) {
      results.push({ id: slide.id, success: false, error: 'No script text' })
      continue
    }

    const text = sanitizeText(rawText)

    if (text.length < 2) {
      results.push({ id: slide.id, success: false, error: 'Text too short after sanitization' })
      continue
    }

    try {
      /* Step 1: Call Chimege TTS — response is raw WAV bytes */
      const ttsRes = await fetch(CHIMEGE_SYNTHESIZE_URL, {
        method: 'POST',
        headers: {
          /* Non-standard content-type matches Chimege docs exactly */
          'Content-Type': 'plain/text',
          'token': token,
          'voice-id': voiceId,
        },
        body: Buffer.from(text, 'utf-8'),
      })

      if (!ttsRes.ok) {
        const errCode = ttsRes.headers.get('Error-Code') ?? String(ttsRes.status)
        results.push({ id: slide.id, success: false, error: `Chimege error code ${errCode}` })
        continue
      }

      /* Step 2: Read binary WAV response */
      const wavBuffer = await ttsRes.arrayBuffer()
      const wavBytes = new Uint8Array(wavBuffer)

      /* Step 3: Upload WAV to Supabase Storage */
      const audioPath = `audio/tts-${slideshowId}-${slide.id}-${Date.now()}.wav`

      const { error: uploadErr } = await supabaseAdmin.storage
        .from('game-media')
        .upload(audioPath, wavBytes, {
          contentType: 'audio/wav',
          upsert: true,
        })

      if (uploadErr) {
        results.push({ id: slide.id, success: false, error: uploadErr.message })
        continue
      }

      /* Step 4: Get public URL from storage */
      const { data: urlData } = supabaseAdmin.storage
        .from('game-media')
        .getPublicUrl(audioPath)

      /* Step 5: Save URL back to the slide row */
      await supabaseAdmin
        .from('slides')
        .update({ audio_url: urlData.publicUrl })
        .eq('id', slide.id)

      results.push({ id: slide.id, success: true })

    } catch (err) {
      results.push({ id: slide.id, success: false, error: String(err) })
    }
  }

  const successCount = results.filter((r) => r.success).length
  return NextResponse.json({ results, successCount, total: slides.length })
}