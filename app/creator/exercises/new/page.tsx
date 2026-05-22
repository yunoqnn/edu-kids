'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GameBuilder } from '@/components/creator/GameBuilder'

function NewExercisePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lessonId') ?? ''
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    setAuthorized(true)
  }, [router])

  if (!authorized) return null
  if (!lessonId) return <div className="p-8 text-red-500">lessonId параметр байхгүй байна</div>

  return <GameBuilder lessonId={lessonId} />
}

export default function Page() {
  return <Suspense><NewExercisePage /></Suspense>
}