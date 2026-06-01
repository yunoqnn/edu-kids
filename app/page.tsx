'use client'

import { useRouter } from 'next/navigation'
import { GraduationCap, Users, BookOpen, Trophy, BarChart3, Shield, Gamepad2, Star, Clock, Bell, CheckCircle, Heart } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ background: 'rgba(250, 247, 242, 0.9)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl" style={{ color: 'var(--primary)' }}>StudyComp</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-ghost"
              style={{ padding: '8px 20px', fontSize: 14 }}
              onClick={() => router.push('/auth')}
            >
              Нэвтрэх
            </button>
            <button
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: 14 }}
              onClick={() => router.push('/role-select')}
            >
              Бүртгүүлэх
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 pt-16 overflow-hidden">
          <video
            src="videos/hero-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(250, 247, 242, 0.35), rgba(250, 247, 242, 0.55))' }}
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(255, 255, 255, 0.9)', border: '2px solid var(--accent-wood)' }}
          >
            <Gamepad2 className="w-5 h-5" style={{ color: 'var(--accent-teal)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>Тоглонгоо суралцъя!</span>
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
            style={{ color: 'var(--text)', textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}
          >
            Сурах үйл явцыг <br />
            <span style={{ color: 'var(--primary)' }}>Илүү хөгжилтэй болгоё</span>
          </h1>

          <p
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text)', textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            Бага ангийн сурагчдад зориулсан цахим сургалтын платформ. 
            Тоглонгоо суралцаж, урамшуулал цуглуулан, ахиц дэвшлээ эцэг эхтэйгээ хамтдаа хянаарай.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              className="btn-primary text-lg px-10 py-4 shadow-xl"
              onClick={() => router.push('/role-select')}
            >
              <Star className="w-5 h-5" />
              Эхлэх
            </button>
            <button
              className="btn-ghost text-lg px-10 py-4"
              style={{ background: 'rgba(255,255,255,0.85)' }}
              onClick={() => router.push('/auth')}
            >
              Нэвтрэх
            </button>
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="py-24 px-6" style={{ background: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: 'var(--text)' }}>
              Хэнд зориулагдсан бэ?
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
              Сургалтын үйл ажиллагаанд оролцогч хүн бүрд зориулав.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: GraduationCap,
                title: 'Сурагчид',
                desc: 'Тоглоом болон сонирхолтой дасгал даалгавраар дамжуулан суралцах хүсэлтэй 1-5 дугаар ангийн сурагчид.',
                color: 'var(--accent-teal)',
              },
              {
                icon: Heart,
                title: 'Эцэг эхчүүд',
                desc: 'Хүүхдийнхээ сурлагын ахиц дэвшлийг хянаж, суралцах үйл явцад нь дэмжлэг үзүүлэх хүсэлтэй эцэг эхчүүд.',
                color: 'var(--accent-coral)',
              },
              {
                icon: BookOpen,
                title: 'Багш нар',
                desc: 'Сурагчдынхаа гүйцэтгэлийг хянаж, хичээлээ илүү сонирхолтой, хүртээмжтэй байдлаар заах хүсэлтэй сурган хүмүүжүүлэгчид.',
                color: 'var(--accent-purple)',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-8 rounded-3xl text-center transition-transform hover:-translate-y-2 hover:shadow-xl"
                style={{ background: 'var(--background)', border: '2px solid var(--border)' }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ background: item.color }}
                >
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>{item.title}</h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Students */}
      <section className="py-24 px-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: 'var(--accent-teal)', color: 'white' }}
              >
                <GraduationCap className="w-5 h-5" />
                <span className="font-bold text-sm">Сурагчдад зориулав</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6" style={{ color: 'var(--text)' }}>
                Тоглонгоо суралцах боломж
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Гэрийн даалгавраа уйтгартай биш, харин сонирхолтой адал явдал мэтээр хийгээрэй. 
                Тоглоомд суурилсан сургалтын арга нь хүүхдийн сурах сонирхлыг нэмэгдүүлдэг.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Gamepad2, text: 'Бүх хичээлийг хамарсан интерактив тоглоомууд' },
                  { icon: Trophy, text: 'Оноо цуглуулж, шинэ түвшинд хүрэх' },
                  { icon: Star, text: 'Онцгой тэмдэг, шагнал хүртэх' },
                  { icon: BarChart3, text: 'Сурлагын ахиц дэвшлээ хянах' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--primary-pale)' }}
                    >
                      <item.icon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="p-8 rounded-3xl"
              style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Ой тогтоолтын тоглоом', bg: '#E8F1F8' },
                  { title: 'Зөв харгалзуулах', bg: '#E8F5F4' },
                  { title: 'Тоон дараалал', bg: '#F8E8E8' },
                  { title: 'Асуулт, хариулт', bg: '#F0E8F8' },
                ].map((game) => (
                  <div
                    key={game.title}
                    className="p-6 rounded-2xl text-center"
                    style={{ background: game.bg }}
                  >
                    <div className="font-bold" style={{ color: 'var(--text)' }}>{game.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Parents */}
      <section className="py-24 px-6" style={{ background: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className="p-8 rounded-3xl order-2 lg:order-1"
              style={{ background: 'var(--background)', border: '2px solid var(--border)' }}
            >
              <div className="space-y-4">
                {[
                  { icon: BarChart3, title: 'Ахиц дэвшлийг хянах', desc: 'Хүүхдийнхээ сурлагын тайланг дэлгэрэнгүй харах', color: 'var(--accent-teal)' },
                  { icon: Clock, title: 'Дэлгэцийн цагийн тохиргоо', desc: 'Өдөрт платформ ашиглах хугацааг тохируулах', color: 'var(--accent-coral)' },
                  { icon: Bell, title: 'Мэдэгдэл хүлээн авах', desc: 'Хүүхдийнхээ гаргасан амжилтын мэдээллийг цаг тухайд нь авах', color: 'var(--accent-purple)' },
                  { icon: Shield, title: 'Аюулгүй цахим орчин', desc: 'Зөвхөн хүүхдэд зориулагдсан, найдвартай контентууд', color: 'var(--primary)' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'var(--surface)' }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: item.color }}
                    >
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: 'var(--text)' }}>{item.title}</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: 'var(--accent-coral)', color: 'white' }}
              >
                <Heart className="w-5 h-5" />
                <span className="font-bold text-sm">Эцэг эхчүүдэд зориулав</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6" style={{ color: 'var(--text)' }}>
                Хүүхдийнхээ сурах үйл явцтай үргэлж хамт байгаарай
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Хүүхдийнхээ сурлагын ахицыг хянаж, дэлгэцийн цагийг нь тохируулан, гаргасан амжилтыг нь хамтдаа тэмдэглээрэй. 
                Хүүхдийнхээ сурах үйл явцад идэвхтэй оролцох боломжийг бид олгож байна.
              </p>
              <button
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: 15 }}
                onClick={() => router.push('/role-select?tab=signup')}
              >
                Эцэг эхээр бүртгүүлэх
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Teachers */}
      <section className="py-24 px-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: 'var(--accent-purple)', color: 'white' }}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-bold text-sm">Багш нарт зориулав</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6" style={{ color: 'var(--text)' }}>
                Сонирхолтой сургалтын контент бүтээх нь
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Интерактив хичээл бэлтгэж, өөрийн арга барилд нийцүүлэн даалгавар үүсгэх, мөн сурагчдынхаа 
                сурлагын гүйцэтгэлийг нэг дороос хянах бүрэн боломжтой.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { text: 'Контент бүтээх хэрэгсэл' },
                  { text: 'Сурлагын дүн шинжилгээ' },
                  { text: 'Сурагчдын нэгдсэн удирдлага' },
                  { text: 'Даалгавар өгөх систем' },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn-ghost mt-6"
                style={{ padding: '12px 28px', fontSize: 15 }}
                onClick={() => router.push('/role-select?tab=signup')}
              >
                Багшаар бүртгүүлэх
              </button>
            </div>
            <div
              className="p-8 rounded-3xl"
              style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}
            >
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--accent-purple)' }} />
                <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                  Багш нарын нээлттэй бүлгэмд нэгдээрэй
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                  Бусадтайгаа материал хуваалцаж, шинэ санаа уралдуулан, мэргэжил нэгт багш нартайгаа хамтран ажиллаарай.
                </p>
                <div className="flex justify-center gap-8">
                  {[
                    { num: '5', label: 'Ангийн түвшин', color: 'var(--primary)' },
                    { num: '9+', label: 'Тоглоомын төрөл', color: 'var(--accent-teal)' },
                    { num: '∞', label: 'Хичээлийн контент', color: 'var(--accent-coral)' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-3xl font-extrabold" style={{ color: s.color }}>{s.num}</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights band */}
      <section className="py-24 px-6" style={{ background: 'var(--primary)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">
            Суралцах үйл явцыг илүү хялбар болголоо
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Манай платформ нь боловсрол олгох үйл явцыг тоглоомтой хослуулан, 
            сурагчдад хэзээ ч мартагдашгүй мэдлэг бүтээх боломжийг олгодог.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: 'Хэрэглэхэд хялбар', desc: 'Хүүхдэд ээлтэй, ойлгомжтой загвар' },
              { icon: Shield, title: 'Аюулгүй байдал', desc: 'Бүрэн хамгаалагдсан цахим орчин' },
              { icon: Trophy, title: 'Урамшуулалт систем', desc: 'Урам зориг өгөх шагнал, амжилтууд' },
              { icon: BarChart3, title: 'Хянахад хялбар', desc: 'Сурлагын ахицыг хялбархан хянах боломж' },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(255, 255, 255, 0.15)' }}
              >
                <item.icon className="w-10 h-10 text-white mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cozy-classroom.png"
            alt="Тухтай анги танхим"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(91, 124, 158, 0.7), rgba(91, 124, 158, 0.85))' }}
          />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white">
            Эрдмийн аяллаа эхлүүлэхэд бэлэн үү?
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-xl mx-auto">
            Манай платформыг аль хэдийн ашиглаад эхэлсэн мянга мянган сурагч, эцэг эх, багш нартай нэгдээрэй.
          </p>
          <button
            className="btn-primary text-lg px-12 py-5 shadow-2xl"
            style={{ background: 'var(--accent-teal)', fontSize: 18 }}
            onClick={() => router.push('/role-select?tab=signup')}
          >
            <Star className="w-6 h-6" />
            Яг одоо эхлэх
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--text)', color: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="font-extrabold text-xl">StudyComp</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Бага ангийн сурагчдад зориулсан, тоглоомд суурилсан цахим сургалтын платформ.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Цэснүүд</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <li><a href="#" className="hover:text-white transition-colors">Сурагчдад</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Эцэг эхчүүдэд</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Багш нарт</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Мэдээлэл</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <li><a href="#" className="hover:text-white transition-colors">Тусламжийн төв</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Холбоо барих</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Түгээмэл асуултууд</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Дүрэм, журам</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <li><a href="#" className="hover:text-white transition-colors">Нууцлалын бодлого</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Үйлчилгээний нөхцөл</a></li>
              </ul>
            </div>
          </div>
          <div
            className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              © 2026 StudyComp. Бүх эрх хуулиар хамгаалагдсан.
            </span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Бяцхан сурагчдадаа зориулан сэтгэл шингээж бүтээв.
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}