'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (
    file: File,
    folder: 'images' | 'audio' = 'images'
  ): Promise<{ url: string; path: string } | null> => {
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: err } = await supabase.storage.from('game-media').upload(path, file)
    if (err) { setError(err.message); setUploading(false); return null }
    const { data } = supabase.storage.from('game-media').getPublicUrl(path)
    setUploading(false)
    return { url: data.publicUrl, path }
  }, [])

  return { upload, uploading, error }
}