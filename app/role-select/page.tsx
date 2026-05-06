'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, BookOpen, GraduationCap } from 'lucide-react'

function RoleSelectForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'signin'

  const handleSelect = (role: 'PARENT' | 'CONTENT_CREATOR') => {
    router.push(`/auth?tab=${tab}&role=${role}`)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--primary-pale)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            marginBottom: 24,
            padding: 0,
          }}
        >
          ← Back
        </button>

        <div className="card" style={{ padding: '40px 36px', textAlign: 'center' }}>
          {/* Logo */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <GraduationCap style={{ width: 32, height: 32, color: 'white' }} />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 22,
                color: 'var(--primary)',
              }}
            >
              StudyComp
            </div>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 28,
              color: 'var(--text)',
              marginBottom: 8,
            }}
          >
            Who are you?
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 36 }}>
            Choose your role to continue
          </p>

          {/* Role Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Parent Card */}
            <button
              onClick={() => handleSelect('PARENT')}
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                borderRadius: 20,
                padding: '32px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--accent-coral)'
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 12px 32px rgba(232, 165, 165, 0.25)'
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--border)'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: 'var(--accent-coral)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart style={{ width: 36, height: 36, color: 'white' }} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: 'var(--text)',
                    marginBottom: 4,
                  }}
                >
                  Parent
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Monitor your child&apos;s learning journey
                </div>
              </div>
            </button>

            {/* Teacher Card */}
            <button
              onClick={() => handleSelect('CONTENT_CREATOR')}
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                borderRadius: 20,
                padding: '32px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--accent-purple)'
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 12px 32px rgba(155, 139, 188, 0.25)'
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--border)'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen style={{ width: 36, height: 36, color: 'white' }} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: 'var(--text)',
                    marginBottom: 4,
                  }}
                >
                  Teacher
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Create and manage educational content
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RoleSelectPage() {
  return (
    <Suspense>
      <RoleSelectForm />
    </Suspense>
  )
}
