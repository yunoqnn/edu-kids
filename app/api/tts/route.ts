import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const text = body?.text
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text required' }, { status: 400 })
  }

  const apiKey = process.env.CHIMEGE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 503 })
  }

  const res = await fetch('https://api.chimege.com/v1.1/synthesize', {
    method: 'POST',
    headers: {
      token: apiKey,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body: text,
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('[TTS] Chimege error', res.status, errText)
    return NextResponse.json({ error: 'TTS failed', chimege_status: res.status, chimege_body: errText }, { status: 502 })
  }

  const audio = await res.arrayBuffer()
  return new NextResponse(audio, {
    headers: {
      'Content-Type': 'audio/wav',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
