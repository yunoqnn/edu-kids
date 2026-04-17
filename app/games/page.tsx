'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MemoryCardGame from '@/components/games/MemoryCardGame'
import DragDropGame from '@/components/games/DragDropGame'
import NumberSequenceGame from '@/components/games/NumberSequenceGame'

const MEMORY_PAIRS = [
  { word: 'Нар', imageBase64: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgZmlsbD0iI0ZCQzAyRCIvPjxsaW5lIHgxPSI1MCIgeTE9IjEwIiB4Mj0iNTAiIHkyPSIyMCIgc3Ryb2tlPSIjRkJDMDJEIiBzdHJva2Utd2lkdGg9IjQiLz48bGluZSB4MT0iNTAiIHkxPSI4MCIgeDI9IjUwIiB5Mj0iOTAiIHN0cm9rZT0iI0ZCQzAyRCIgc3Ryb2tlLXdpZHRoPSI0Ii8+PGxpbmUgeDE9IjEwIiB5MT0iNTAiIHgyPSIyMCIgeTI9IjUwIiBzdHJva2U9IiNGQkMwMkQiIHN0cm9rZS13aWR0aD0iNCIvPjxsaW5lIHgxPSI4MCIgeTE9IjUwIiB4Mj0iOTAiIHkyPSI1MCIgc3Ryb2tlPSIjRkJDMDJEIiBzdHJva2Utd2lkdGg9IjQiLz48L3N2Zz4=' },
  { word: 'Сар', imageBase64: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNjAgMjBBMzAgMzAgMCAxIDAgNjAgODBBMjAgMjAgMCAxIDEgNjAgMjBaIiBmaWxsPSIjQjBCRUM1Ii8+PC9zdmc+' },
  { word: 'Мод', imageBase64: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSI0NSIgeT0iNjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzhENjUzOSIvPjxwb2x5Z29uIHBvaW50cz0iNTAsMTAgMjAsNjAgODAsNjAiIGZpbGw9IiM0Q0FGNTAiLz48L3N2Zz4=' },
  { word: 'Цэцэг', imageBase64: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxMCIgZmlsbD0iI0ZGRUIzQiIvPjxlbGxpcHNlIGN4PSI1MCIgY3k9IjMwIiByeD0iMTAiIHJ5PSIxNSIgZmlsbD0iI0U5MUU2MyIvPjxlbGxpcHNlIGN4PSI1MCIgY3k9IjcwIiByeD0iMTAiIHJ5PSIxNSIgZmlsbD0iI0U5MUU2MyIvPjxlbGxpcHNlIGN4PSIzMCIgY3k9IjUwIiByeD0iMTUiIHJ5PSIxMCIgZmlsbD0iI0U5MUU2MyIvPjxlbGxpcHNlIGN4PSI3MCIgY3k9IjUwIiByeD0iMTUiIHJ5PSIxMCIgZmlsbD0iI0U5MUU2MyIvPjwvc3ZnPg==' },
]

const DRAG_CATEGORIES = [
  { id: 'animal', name: '🐾 Амьтан' },
  { id: 'plant', name: '🌿 Ургамал' },
]
const DRAG_ITEMS = [
  { id: '1', word: 'Нохой', correctCategory: 'animal' },
  { id: '2', word: 'Муур', correctCategory: 'animal' },
  { id: '3', word: 'Цэцэг', correctCategory: 'plant' },
  { id: '4', word: 'Мод', correctCategory: 'plant' },
  { id: '5', word: 'Үнэг', correctCategory: 'animal' },
  { id: '6', word: 'Өвс', correctCategory: 'plant' },
]

const NUMBER_SEQUENCES = [
  { id: '1', steps: [2, 4, 6, 8, null], answer: 10, hint: '2-оор нэмж байна' },
  { id: '2', steps: [1, 3, 9, 27, null], answer: 81, hint: '3-аар үржиж байна' },
  { id: '3', steps: [10, 8, 6, 4, null], answer: 2, hint: '2-оор хасаж байна' },
]

type GameKey = 'memory' | 'drag' | 'number'

export default function GamesDemo() {
  const router = useRouter()
  const [active, setActive] = useState<GameKey>('memory')
  const [scores, setScores] = useState<Record<GameKey, number | null>>({ memory: null, drag: null, number: null })

  const TABS: { key: GameKey; icon: string; label: string }[] = [
    { key: 'memory', icon: '🃏', label: 'Memory Card' },
    { key: 'drag', icon: '🧩', label: 'Drag & Drop' },
    { key: 'number', icon: '🔢', label: 'Тооны гинж' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Top bar */}
      <nav style={{ background: 'white', borderBottom: '1.5px solid var(--border)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎓</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--primary)' }}>StudyComp</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>/ Тоглоомууд (Demo)</span>
        </div>
        <button className="btn-ghost" style={{ fontSize: 13, padding: '7px 16px' }} onClick={() => router.push('/')}>← Гарах</button>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Тоглоомуудын жишээ 🎮</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Контент бүтээгч хичээл нэмсний дараа энд харагдана.</p>
        </div>

        {/* Score summary */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {TABS.map(t => (
            <div key={t.key} style={{ flex: 1, background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{t.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--primary)', marginTop: 2 }}>
                {scores[t.key] !== null ? `${scores[t.key]} оноо` : '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'white', border: '1.5px solid var(--border)', borderRadius: 12, padding: 4 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s', background: active === t.key ? 'var(--primary)' : 'transparent', color: active === t.key ? 'white' : 'var(--text-muted)' }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Game area */}
        <div className="card" style={{ padding: '28px' }}>
          {active === 'memory' && (
            <MemoryCardGame pairs={MEMORY_PAIRS} pointReward={20} onComplete={(s) => setScores(p => ({ ...p, memory: s }))} />
          )}
          {active === 'drag' && (
            <DragDropGame categories={DRAG_CATEGORIES} items={DRAG_ITEMS} pointReward={15} onComplete={(s) => setScores(p => ({ ...p, drag: s }))} />
          )}
          {active === 'number' && (
            <NumberSequenceGame sequences={NUMBER_SEQUENCES} pointReward={30} onComplete={(s) => setScores(p => ({ ...p, number: s }))} />
          )}
        </div>
      </div>
    </div>
  )
}
