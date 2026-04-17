'use client'

import { useState } from 'react'

interface DragItem { id: string; word: string; imageBase64?: string; correctCategory: string }
interface Category { id: string; name: string }

interface Props {
  categories: Category[]
  items: DragItem[]
  pointReward: number
  onComplete: (score: number) => void
}

export default function DragDropGame({ categories, items, pointReward, onComplete }: Props) {
  const [placements, setPlacements] = useState<Record<string, string>>({}) // itemId -> categoryId
  const [dragId, setDragId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<Record<string, boolean>>({})

  const unplaced = items.filter(i => !placements[i.id])
  const getItemsInCategory = (catId: string) => items.filter(i => placements[i.id] === catId)

  const handleDrop = (catId: string) => {
    if (!dragId) return
    setPlacements(p => ({ ...p, [dragId]: catId }))
    setDragId(null)
  }

  const handleRemove = (itemId: string) => {
    if (checked) return
    setPlacements(p => { const n = { ...p }; delete n[itemId]; return n })
  }

  const handleCheck = () => {
    const res: Record<string, boolean> = {}
    items.forEach(item => { res[item.id] = placements[item.id] === item.correctCategory })
    setResults(res)
    setChecked(true)
    const correct = Object.values(res).filter(Boolean).length
    const score = Math.round((correct / items.length) * pointReward)
    if (Object.keys(placements).length === items.length) onComplete(score)
  }

  const correctCount = Object.values(results).filter(Boolean).length

  return (
    <div>
      {/* Unplaced items */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Байрлуулаагүй зүйлс:</div>
        <div
          style={{ minHeight: 64, background: 'var(--surface-2)', border: '1.5px dashed var(--border)', borderRadius: 12, padding: '12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (dragId) { setPlacements(p => { const n = { ...p }; delete n[dragId]; return n }); setDragId(null) } }}
        >
          {unplaced.map(item => (
            <div
              key={item.id}
              draggable={!checked}
              onDragStart={() => setDragId(item.id)}
              onDragEnd={() => setDragId(null)}
              style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 10, padding: item.imageBase64 ? '0' : '8px 14px', cursor: checked ? 'default' : 'grab', fontWeight: 600, fontSize: 14, color: 'var(--text)', userSelect: 'none', overflow: 'hidden', width: item.imageBase64 ? 72 : 'auto', transition: 'box-shadow 0.15s' }}
              onMouseOver={(e) => { if (!checked) e.currentTarget.style.boxShadow = '0 4px 10px rgba(158,120,194,0.25)' }}
              onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              {item.imageBase64 ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageBase64} alt={item.word} style={{ width: 72, height: 56, objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '4px 6px', fontSize: 12, textAlign: 'center' }}>{item.word}</div>
                </div>
              ) : item.word}
            </div>
          ))}
          {unplaced.length === 0 && <span style={{ fontSize: 13, color: '#9ca3af' }}>Бүгд байрлуулагдсан</span>}
        </div>
      </div>

      {/* Category zones */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)`, gap: 14, marginBottom: 20 }}>
        {categories.map(cat => (
          <div
            key={cat.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(cat.id)}
            style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 14, padding: '14px', minHeight: 130, transition: 'border-color 0.2s, background 0.2s' }}
            onDragEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-pale)' }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white' }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--primary)', marginBottom: 10, paddingBottom: 8, borderBottom: '1.5px solid var(--border)' }}>{cat.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {getItemsInCategory(cat.id).map(item => {
                const isCorrect = checked ? results[item.id] : null
                return (
                  <div
                    key={item.id}
                    onClick={() => handleRemove(item.id)}
                    style={{ background: checked ? (isCorrect ? '#dcfce7' : '#fef2f2') : 'var(--primary-pale)', border: `1.5px solid ${checked ? (isCorrect ? '#86efac' : '#fca5a5') : 'var(--primary-light)'}`, borderRadius: 8, padding: item.imageBase64 ? '0' : '6px 12px', cursor: checked ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, color: checked ? (isCorrect ? '#16a34a' : '#dc2626') : 'var(--primary-dark)', overflow: 'hidden', width: item.imageBase64 ? 64 : 'auto' }}
                  >
                    {item.imageBase64 ? (
                      <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageBase64} alt={item.word} style={{ width: 64, height: 48, objectFit: 'cover', display: 'block' }} />
                        <div style={{ padding: '3px 4px', fontSize: 11, textAlign: 'center' }}>{item.word}</div>
                      </div>
                    ) : `${item.word} ${checked ? (isCorrect ? '✓' : '✗') : ''}`}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {checked && (
        <div style={{ background: correctCount === items.length ? '#dcfce7' : 'var(--primary-pale)', border: `1.5px solid ${correctCount === items.length ? '#86efac' : 'var(--primary-light)'}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16, fontSize: 15, fontWeight: 600, color: correctCount === items.length ? '#16a34a' : 'var(--primary-dark)' }}>
          {correctCount === items.length ? '🎉 Бүгдийг зөв байрлуулсан!' : `${correctCount} / ${items.length} зөв байрлуулсан`}
        </div>
      )}

      {!checked ? (
        <button
          className="btn-primary"
          onClick={handleCheck}
          disabled={Object.keys(placements).length < items.length}
          style={{ opacity: Object.keys(placements).length < items.length ? 0.5 : 1 }}
        >
          Шалгах
        </button>
      ) : (
        <div style={{ display: 'inline-block', background: 'var(--primary-pale)', color: 'var(--primary)', borderRadius: 10, padding: '8px 20px', fontWeight: 700, fontSize: 16 }}>
          +{Math.round((correctCount / items.length) * pointReward)} оноо ⭐
        </div>
      )}
    </div>
  )
}
