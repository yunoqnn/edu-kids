'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const T  = '#7AD1D1'
const BR = '#E5DDD3'
const TX = '#3D3D3D'
const S2 = '#6B7280'
const S3 = '#9CA3AF'
const BG = '#FAF7F2'

const inputSt: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: `1.5px solid ${BR}`, fontSize: 14, fontWeight: 500,
  fontFamily: "'Nunito',sans-serif", color: TX, background: '#FDFCFA', outline: 'none',
}

export default function CourseEditPage() {
  const router = useRouter()
  const { courseId } = useParams<{ courseId: string }>()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gradeLevel, setGradeLevel] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('courses').select('title, description, grade_level').eq('id', courseId).single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title)
          setDescription(data.description ?? '')
          setGradeLevel(data.grade_level ?? '')
        }
        setLoading(false)
      })
  }, [courseId])

  const handleSave = async () => {
    if (!title.trim()) { setError('Гарчиг оруулна уу'); return }
    setSaving(true); setError('')
    const { error: err } = await supabase.from('courses').update({
      title: title.trim(),
      description: description.trim() || null,
      grade_level: gradeLevel === '' ? null : Number(gradeLevel),
    }).eq('id', courseId)
    setSaving(false)
    if (err) { setError(err.message); return }
    router.push(`/creator/courses/${courseId}`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, color: S3, fontFamily: 'Nunito,sans-serif' }}>
      Уншиж байна...
    </div>
  )

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap'); *{box-sizing:border-box;}`}</style>
      <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Nunito,sans-serif' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <button onClick={() => router.push(`/creator/courses/${courseId}`)}
              style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${BR}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S2} strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span style={{ fontSize: 13, color: S3, fontWeight: 600 }}>Буцах</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: TX, marginBottom: 8 }}>Хөтөлбөр засах</h1>
          <p style={{ fontSize: 14, color: S3, fontWeight: 500, marginBottom: 32 }}>Сургалтын хөтөлбөрийн мэдээллийг өөрчлөх</p>

          <div style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${BR}`, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: S2, marginBottom: 6, display: 'block' }}>Хөтөлбөрийн нэр *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={inputSt}
                onFocus={e => (e.target.style.borderColor = T)} onBlur={e => (e.target.style.borderColor = BR)}
                placeholder="Хөтөлбөрийн нэр оруулна уу" />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: S2, marginBottom: 6, display: 'block' }}>Тайлбар</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={4} placeholder="Хөтөлбөрийн тайлбар (заавал биш)"
                style={{ ...inputSt, height: 'auto', resize: 'vertical', lineHeight: 1.5 }}
                onFocus={e => (e.target.style.borderColor = T)} onBlur={e => (e.target.style.borderColor = BR)} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: S2, marginBottom: 6, display: 'block' }}>Анги</label>
              <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value === '' ? '' : parseInt(e.target.value))}
                style={{ ...inputSt, cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = T)} onBlur={e => (e.target.style.borderColor = BR)}>
                <option value="">Анги сонгох (заавал биш)</option>
                {[1,2,3,4,5].map(g => <option key={g} value={g}>{g}-р анги</option>)}
              </select>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 12, padding: '10px 14px', color: '#DC2626', fontSize: 13 }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ background: T, color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1, transition: 'all .2s' }}>
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
              <button onClick={() => router.push(`/creator/courses/${courseId}`)}
                style={{ background: '#F3F0EB', color: S2, border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Болих
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
