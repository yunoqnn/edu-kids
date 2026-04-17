'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardShell from '@/components/DashboardShell'

const NAV = [
  { href: '/creator/dashboard', label: 'Хяналтын самбар', icon: '📊' },
  { href: '/creator/courses', label: 'Хичээлүүд', icon: '📖' },
  { href: '/creator/exercises/new', label: 'Дасгал нэмэх', icon: '🎮' },
]

type GameType = 'MEMORY_CARD' | 'DRAG_DROP' | 'NUMBER_SEQUENCE'

interface MemoryPair { id: string; word: string; imageBase64: string | null }
interface DragItem { id: string; word: string; category: string; imageBase64: string | null }
interface DragCategory { id: string; name: string }
interface NumberSeq { id: string; steps: string[]; answer: string; hint: string }

function ImageUploader({ value, onChange, label }: { value: string | null; onChange: (b64: string | null) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</label>}
      <div onClick={() => ref.current?.click()} style={{ width: '100%', height: 80, border: '1.5px dashed var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--surface-2)', overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}
        onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={(e) => { e.stopPropagation(); onChange(null) }} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📷 Зураг</span>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  )
}

function MemoryCardBuilder({ onSave }: { onSave: (title: string, points: number, data: object) => Promise<void> }) {
  const [pairs, setPairs] = useState<MemoryPair[]>([{ id: '1', word: '', imageBase64: null }, { id: '2', word: '', imageBase64: null }])
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState(10)
  const [saving, setSaving] = useState(false)

  const addPair = () => setPairs(p => [...p, { id: Date.now().toString(), word: '', imageBase64: null }])
  const removePair = (id: string) => setPairs(p => p.filter(x => x.id !== id))
  const updatePair = (id: string, field: 'word' | 'imageBase64', value: string | null) =>
    setPairs(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))

  const handleSave = async () => {
    if (!title.trim()) { alert('Гарчиг оруулна уу'); return }
    if (pairs.some(p => !p.word.trim())) { alert('Бүх үгийг бөглөнө үү'); return }
    setSaving(true)
    await onSave(title, points, { pairs })
    setSaving(false)
    setTitle(''); setPairs([{ id: '1', word: '', imageBase64: null }, { id: '2', word: '', imageBase64: null }])
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, marginBottom: 20 }}>
        <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Гарчиг</label><input className="input" placeholder="Жишээ: Амьтдын нэр" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Оноо</label><input className="input" type="number" min={1} value={points} onChange={e => setPoints(Number(e.target.value))} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        {pairs.map((pair, i) => (
          <div key={pair.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</span>
              {pairs.length > 2 && <button onClick={() => removePair(pair.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>✕</button>}
            </div>
            <input className="input" placeholder="Үг" value={pair.word} onChange={e => updatePair(pair.id, 'word', e.target.value)} style={{ marginBottom: 8 }} />
            <ImageUploader value={pair.imageBase64} onChange={v => updatePair(pair.id, 'imageBase64', v)} label="Зураг" />
          </div>
        ))}
        <div className="card" onClick={addPair} style={{ padding: 14, borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 140, color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'var(--primary-pale)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'white')}>
          + Нэмэх
        </div>
      </div>
      <div style={{ padding: '12px 14px', background: 'var(--primary-pale)', borderRadius: 10, fontSize: 13, color: 'var(--primary-dark)', marginBottom: 16 }}>
        💡 Сурагч зурагтай картыг үгтэй карттай тааруулна. Нийт <strong>{pairs.length * 2}</strong> карт.
      </div>
      <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Хадгалж байна...' : '💾 Хадгалж нийтлэх'}</button>
    </div>
  )
}

function DragDropBuilder({ onSave }: { onSave: (title: string, points: number, data: object) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState(10)
  const [categories, setCategories] = useState<DragCategory[]>([{ id: '1', name: '' }, { id: '2', name: '' }])
  const [items, setItems] = useState<DragItem[]>([{ id: '1', word: '', category: '1', imageBase64: null }])
  const [saving, setSaving] = useState(false)

  const addCategory = () => setCategories(c => [...c, { id: Date.now().toString(), name: '' }])
  const updateCategory = (id: string, name: string) => setCategories(c => c.map(x => x.id === id ? { ...x, name } : x))
  const removeCategory = (id: string) => { setCategories(c => c.filter(x => x.id !== id)); setItems(i => i.filter(x => x.category !== id)) }
  const addItem = () => setItems(i => [...i, { id: Date.now().toString(), word: '', category: categories[0]?.id || '', imageBase64: null }])
  const removeItem = (id: string) => setItems(i => i.filter(x => x.id !== id))
  const updateItem = (id: string, field: string, value: string | null) => setItems(i => i.map(x => x.id === id ? { ...x, [field]: value } : x))

  const handleSave = async () => {
    if (!title.trim()) { alert('Гарчиг оруулна уу'); return }
    if (categories.some(c => !c.name.trim())) { alert('Бүх ангиллын нэрийг бөглөнө үү'); return }
    if (items.some(i => !i.word.trim())) { alert('Бүх үгийг бөглөнө үү'); return }
    setSaving(true)
    await onSave(title, points, { categories, items })
    setSaving(false)
    setTitle(''); setCategories([{ id: '1', name: '' }, { id: '2', name: '' }]); setItems([{ id: '1', word: '', category: '1', imageBase64: null }])
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, marginBottom: 20 }}>
        <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Гарчиг</label><input className="input" placeholder="Жишээ: Амьтан, Ургамал ангилах" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Оноо</label><input className="input" type="number" min={1} value={points} onChange={e => setPoints(Number(e.target.value))} /></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Ангиллууд</label><button onClick={addCategory} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>+ Нэмэх</button></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((cat, i) => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary-pale)', borderRadius: 10, padding: '7px 12px', border: '1.5px solid var(--primary-light)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)' }}>{i + 1}.</span>
              <input style={{ background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)', width: 100 }} placeholder="Нэр" value={cat.name} onChange={e => updateCategory(cat.id, e.target.value)} />
              {categories.length > 2 && <button onClick={() => removeCategory(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13 }}>✕</button>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Зүйлүүд</label><button onClick={addItem} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>+ Нэмэх</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {items.map((item, i) => (
            <div key={item.id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</span>
                {items.length > 1 && <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>✕</button>}
              </div>
              <input className="input" placeholder="Үг" value={item.word} onChange={e => updateItem(item.id, 'word', e.target.value)} style={{ marginBottom: 6 }} />
              <ImageUploader value={item.imageBase64} onChange={v => updateItem(item.id, 'imageBase64', v)} />
              <select value={item.category} onChange={e => updateItem(item.id, 'category', e.target.value)} style={{ marginTop: 6, width: '100%', padding: '7px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', background: 'white', outline: 'none' }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name || `Ангилал ${c.id}`}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
      <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Хадгалж байна...' : '💾 Хадгалж нийтлэх'}</button>
    </div>
  )
}

function NumberSequenceBuilder({ onSave }: { onSave: (title: string, points: number, data: object) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState(10)
  const [sequences, setSequences] = useState<NumberSeq[]>([{ id: '1', steps: ['', '', ''], answer: '', hint: '' }])
  const [saving, setSaving] = useState(false)

  const addSeq = () => setSequences(s => [...s, { id: Date.now().toString(), steps: ['', '', ''], answer: '', hint: '' }])
  const removeSeq = (id: string) => setSequences(s => s.filter(x => x.id !== id))
  const updateSeq = (id: string, field: string, value: string | string[]) => setSequences(s => s.map(x => x.id === id ? { ...x, [field]: value } : x))
  const updateStep = (seqId: string, idx: number, val: string) => setSequences(s => s.map(x => x.id === seqId ? { ...x, steps: x.steps.map((st, i) => i === idx ? val : st) } : x))
  const addStep = (seqId: string) => setSequences(s => s.map(x => x.id === seqId ? { ...x, steps: [...x.steps, ''] } : x))

  const handleSave = async () => {
    if (!title.trim()) { alert('Гарчиг оруулна уу'); return }
    if (sequences.some(s => !s.answer.trim())) { alert('Бүх дарааллын хариултыг бөглөнө үү'); return }
    setSaving(true)
    const formatted = sequences.map(s => ({
      id: s.id,
      steps: [...s.steps.map(v => v === '' ? null : Number(v)), null],
      answer: Number(s.answer),
      hint: s.hint,
    }))
    await onSave(title, points, { sequences: formatted })
    setSaving(false)
    setTitle(''); setSequences([{ id: '1', steps: ['', '', ''], answer: '', hint: '' }])
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, marginBottom: 20 }}>
        <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Гарчиг</label><input className="input" placeholder="Жишээ: Тооны дараалал" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Оноо</label><input className="input" type="number" min={1} value={points} onChange={e => setPoints(Number(e.target.value))} /></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {sequences.map((seq, i) => (
          <div key={seq.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Дараалал #{i + 1}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => addStep(seq.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>+ Тоо</button>
                {sequences.length > 1 && <button onClick={() => removeSeq(seq.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13 }}>Устгах</button>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {seq.steps.map((st, si) => (
                <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {si > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>→</span>}
                  <input style={{ width: 56, padding: '8px 6px', border: '1.5px solid var(--border)', borderRadius: 10, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', background: 'white', outline: 'none' }} placeholder={`${si + 1}`} value={st} onChange={e => updateStep(seq.id, si, e.target.value)} />
                </div>
              ))}
              <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>→</span>
              <div style={{ position: 'relative' }}>
                <input style={{ width: 56, padding: '8px 6px', border: '2px solid var(--primary)', borderRadius: 10, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--primary)', background: 'var(--primary-pale)', outline: 'none' }} placeholder="?" value={seq.answer} onChange={e => updateSeq(seq.id, 'answer', e.target.value)} />
                <div style={{ position: 'absolute', top: -7, right: -7, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>✓</div>
              </div>
            </div>
            <input className="input" placeholder="Зөвлөгөө (заавал биш)" value={seq.hint} onChange={e => updateSeq(seq.id, 'hint', e.target.value)} style={{ fontSize: 13 }} />
          </div>
        ))}
      </div>
      <button onClick={addSeq} className="btn-ghost" style={{ marginBottom: 16, fontSize: 13 }}>+ Дараалал нэмэх</button>
      <br />
      <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Хадгалж байна...' : '💾 Хадгалж нийтлэх'}</button>
    </div>
  )
}

const GAME_TYPES: { key: GameType; icon: string; label: string; desc: string }[] = [
  { key: 'MEMORY_CARD', icon: '🃏', label: 'Memory Card', desc: 'Зураг-Үг хослол тааруулах' },
  { key: 'DRAG_DROP', icon: '🧩', label: 'Drag & Drop', desc: 'Зүйлсийг ангилалд чирэх' },
  { key: 'NUMBER_SEQUENCE', icon: '🔢', label: 'Тооны гинж', desc: 'Дараалалд тоо таах' },
]

export default function ExerciseBuilderPage() {
  const [selectedType, setSelectedType] = useState<GameType | null>(null)
  const [creatorId, setCreatorId] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/'); return }
      if (data.user.user_metadata?.role !== 'CREATOR') { router.push('/'); return }
      setCreatorId(data.user.id)
    })
  }, [router])

  const handleSave = async (title: string, points: number, data: object) => {
    const { error } = await supabase.from('exercises').insert({
      creator_id: creatorId,
      title,
      type: selectedType,
      point_reward: points,
      data,
      is_published: true,
    })
    if (error) { alert('Алдаа: ' + error.message); return }
    setSaved(title)
    setSelectedType(null)
    setTimeout(() => setSaved(null), 3000)
  }

  return (
    <DashboardShell role="CREATOR" name="Контент бүтээгч" navItems={NAV} activePath={pathname}>
      <div className="fade-up">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Дасгал / Тест үүсгэх 🎮</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Тоглоомын төрлийг сонгоод агуулгаа оруулна уу. Хадгалсны дараа хүүхдэд шууд харагдана.</p>
        </div>

        {saved && (
          <div style={{ background: '#dcfce7', border: '1.5px solid #86efac', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
            ✓ "{saved}" амжилттай нийтлэгдлээ! Хүүхдийн тоглоомд харагдаж байна.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {GAME_TYPES.map((g) => (
            <div key={g.key} className="card" onClick={() => setSelectedType(g.key)} style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.15s', border: selectedType === g.key ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: selectedType === g.key ? 'var(--primary-pale)' : 'white' }}
              onMouseOver={(e) => { if (selectedType !== g.key) e.currentTarget.style.borderColor = 'var(--primary-light)' }}
              onMouseOut={(e) => { if (selectedType !== g.key) e.currentTarget.style.borderColor = 'var(--border)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{g.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: selectedType === g.key ? 'var(--primary)' : 'var(--text)', marginBottom: 4 }}>{g.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{g.desc}</div>
              {selectedType === g.key && <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>✓ Сонгогдсон</div>}
            </div>
          ))}
        </div>

        {selectedType && (
          <div className="card fade-up" style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 20, paddingBottom: 16, borderBottom: '1.5px solid var(--border)' }}>
              {GAME_TYPES.find(g => g.key === selectedType)?.icon} {GAME_TYPES.find(g => g.key === selectedType)?.label} тохиргоо
            </h2>
            {selectedType === 'MEMORY_CARD' && <MemoryCardBuilder onSave={handleSave} />}
            {selectedType === 'DRAG_DROP' && <DragDropBuilder onSave={handleSave} />}
            {selectedType === 'NUMBER_SEQUENCE' && <NumberSequenceBuilder onSave={handleSave} />}
          </div>
        )}

        {!selectedType && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 15 }}>↑ Дээрээс тоглоомын төрлийг сонгоно уу</div>
        )}
      </div>
    </DashboardShell>
  )
}
