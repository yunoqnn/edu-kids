'use client'

import { useState } from 'react'

interface Sequence { id: string; steps: (number | null)[]; answer: number; hint?: string }

interface Props {
  sequences: Sequence[]
  pointReward: number
  onComplete: (score: number) => void
}

export default function NumberSequenceGame({ sequences, pointReward, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean | null>>({})
  const [hints, setHints] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState(false)

  const handleCheck = (seq: Sequence) => {
    const val = parseInt(answers[seq.id] || '')
    const correct = val === seq.answer
    setChecked(p => ({ ...p, [seq.id]: correct }))
    const allDone = sequences.every(s => s.id === seq.id ? true : checked[s.id] !== undefined)
    if (allDone) {
      const correctCount = sequences.filter(s => s.id === seq.id ? correct : checked[s.id]).length
      setDone(true)
      onComplete(Math.round((correctCount / sequences.length) * pointReward))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        {sequences.map((seq, i) => {
          const result = checked[seq.id]
          return (
            <div key={seq.id} className="card" style={{ padding: '22px 24px', border: result === true ? '1.5px solid #86efac' : result === false ? '1.5px solid #fca5a5' : '1.5px solid var(--border)', background: result === true ? '#f0fdf4' : result === false ? '#fef2f2' : 'white' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 }}>Дараалал #{i + 1}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {seq.steps.map((step, si) => (
                  <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {si > 0 && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-muted)' }}>→</span>}
                    <div style={{ width: 60, height: 60, background: step === null ? (result === true ? '#dcfce7' : result === false ? '#fee2e2' : 'var(--primary-pale)') : 'var(--surface-2)', border: `2px solid ${step === null ? (result === true ? '#86efac' : result === false ? '#fca5a5' : 'var(--primary)') : 'var(--border)'}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: step === null ? (result === true ? '#16a34a' : result === false ? '#dc2626' : 'var(--primary)') : 'var(--text)' }}>
                      {step === null ? (result !== undefined ? seq.answer : '?') : step}
                    </div>
                  </div>
                ))}
              </div>

              {result === undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    className="input"
                    type="number"
                    placeholder="Хариулт"
                    value={answers[seq.id] || ''}
                    onChange={e => setAnswers(p => ({ ...p, [seq.id]: e.target.value }))}
                    style={{ width: 120, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}
                    onKeyDown={e => { if (e.key === 'Enter') handleCheck(seq) }}
                  />
                  <button className="btn-primary" onClick={() => handleCheck(seq)} disabled={!answers[seq.id]}>
                    Шалгах
                  </button>
                  {seq.hint && (
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 13, padding: '9px 14px' }}
                      onClick={() => setHints(p => ({ ...p, [seq.id]: true }))}
                    >
                      💡 Зөвлөгөө
                    </button>
                  )}
                </div>
              )}

              {result === true && <div style={{ color: '#16a34a', fontWeight: 600, fontSize: 14 }}>✓ Зөв байна!</div>}
              {result === false && <div style={{ color: '#dc2626', fontWeight: 600, fontSize: 14 }}>✗ Буруу байна. Зөв хариулт: <strong>{seq.answer}</strong></div>}

              {hints[seq.id] && seq.hint && result === undefined && (
                <div style={{ marginTop: 10, background: '#fefce8', border: '1.5px solid #fef08a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#854d0e' }}>
                  💡 {seq.hint}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {done && (
        <div style={{ textAlign: 'center', padding: '24px', background: 'var(--primary-pale)', borderRadius: 14 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Дуусгалаа!</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {sequences.filter(s => checked[s.id]).length} / {sequences.length} зөв
          </div>
        </div>
      )}
    </div>
  )
}
