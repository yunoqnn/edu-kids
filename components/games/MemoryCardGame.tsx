'use client'

import { useState, useEffect } from 'react'

interface Card { id: string; pairId: string; type: 'word' | 'image'; content: string; flipped: boolean; matched: boolean }

interface Pair { word: string; imageBase64: string }

interface Props {
  pairs: Pair[]
  pointReward: number
  onComplete: (score: number) => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function MemoryCardGame({ pairs, pointReward, onComplete }: Props) {
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const deck: Card[] = shuffle(
      pairs.flatMap((p, i) => [
        { id: `w-${i}`, pairId: String(i), type: 'word', content: p.word, flipped: false, matched: false },
        { id: `i-${i}`, pairId: String(i), type: 'image', content: p.imageBase64, flipped: false, matched: false },
      ])
    )
    setCards(deck)
  }, [pairs])

  const handleFlip = (id: string) => {
    if (flipped.length === 2) return
    const card = cards.find(c => c.id === id)
    if (!card || card.flipped || card.matched) return

    const newFlipped = [...flipped, id]
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c))
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid)!)
      if (a.pairId === b.pairId) {
        setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c))
        setFlipped([])
        const matched = cards.filter(c => c.matched).length + 2
        if (matched === cards.length) {
          setCompleted(true)
          onComplete(pointReward)
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c))
          setFlipped([])
        }, 900)
      }
    }
  }

  if (completed) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>Маш сайн!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>{moves} алхамд дуусгалаа</p>
        <div style={{ display: 'inline-block', background: 'var(--primary-pale)', color: 'var(--primary)', borderRadius: 10, padding: '8px 20px', fontWeight: 700, fontSize: 18 }}>
          +{pointReward} оноо ⭐
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Алхам: <strong style={{ color: 'var(--text)' }}>{moves}</strong></span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
          Тааруулсан: <strong style={{ color: 'var(--primary)' }}>{cards.filter(c => c.matched).length / 2}</strong> / {pairs.length}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleFlip(card.id)}
            style={{
              height: 110,
              borderRadius: 14,
              cursor: card.matched ? 'default' : 'pointer',
              transition: 'transform 0.2s',
              transform: card.flipped || card.matched ? 'rotateY(0deg)' : 'rotateY(0deg)',
              background: card.matched ? '#dcfce7' : card.flipped ? 'white' : 'var(--primary)',
              border: card.matched ? '2px solid #86efac' : card.flipped ? '2px solid var(--primary-light)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: card.flipped && !card.matched ? '0 4px 12px rgba(158,120,194,0.2)' : '0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            {(!card.flipped && !card.matched) ? (
              <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)' }}>?</span>
            ) : card.type === 'word' ? (
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: card.matched ? '#16a34a' : 'var(--text)', textAlign: 'center', padding: '0 8px' }}>{card.content}</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
