'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Top nav bar */}
      <nav style={{ borderBottom: '1.5px solid #f0e8fa', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎓</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>StudyComp</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-ghost" style={{ padding: '8px 20px', fontSize: 14 }} onClick={() => router.push('/auth?role=PARENT')}>Нэвтрэх</button>
          <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }} onClick={() => router.push('/auth?role=PARENT')}>Бүртгүүлэх</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        <div className="fade-up">
          <div className="tag" style={{ marginBottom: 20 }}>🇲🇳 Монгол хэл · 1–5-р анги</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, lineHeight: 1.15, color: 'var(--text)', marginBottom: 20 }}>
            Суралцах нь<br />
            <span style={{ color: 'var(--primary)' }}>тоглоом шиг</span><br />
            сонирхолтой
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 36, maxWidth: 420 }}>
            Тоглоомжуулсан аргачлалаар хүүхэд ойлгомжтой, сонирхолтойгоор суралцана. Эцэг эх хяналт тавих боломжтой.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }} onClick={() => router.push('/auth?role=PARENT')}>
              👨‍👩‍👧 Эцэг эхээр нэвтрэх
            </button>
            <button className="btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }} onClick={() => router.push('/auth?role=CREATOR')}>
              ✏️ Контент бүтээгч
            </button>
          </div>
        </div>

        {/* Right: feature cards */}
        <div className="fade-up fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: '🎮', title: 'Тоглоом', desc: 'Memory card, drag & drop, тооны гинж тоглоом' },
            { icon: '🏆', title: 'Оноо & Шагнал', desc: 'Амжилт тутам оноо, тэмдэг цуглуулна' },
            { icon: '📊', title: 'Ахиц дэвшил', desc: 'Хүүхдийн суралцах явцыг хянах' },
            { icon: '🔒', title: 'Эцэг эхийн хяналт', desc: 'Дэлгэц ашиглах цаг тохируулах' },
          ].map((f, i) => (
            <div key={f.title} className={`card fade-up fade-up-${i + 1}`} style={{ padding: '20px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text)' }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider section */}
      <section style={{ background: 'var(--primary-pale)', borderTop: '1.5px solid #e8d8f5', borderBottom: '1.5px solid #e8d8f5', padding: '48px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { num: '5', label: 'Ангийн түвшин' },
            { num: '3+', label: 'Тоглоомын төрөл' },
            { num: '∞', label: 'Хичээлийн агуулга' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--primary)', marginBottom: 6 }}>{s.num}</div>
              <div style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1.5px solid var(--border)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>🎓 StudyComp</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>© 2025 StudyComp. Бага сургуулийн сургалтын платформ.</span>
      </footer>
    </div>
  )
}
