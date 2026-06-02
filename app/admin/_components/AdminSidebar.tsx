'use client'

import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAV = [
  { label: 'Самбар', href: '/admin/dashboard' },
  { label: 'Хэрэглэгчид', href: '/admin/users' },
  { label: 'Контент хянах', href: '/admin/content' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" width="28" height="28" alt="StudyComp" style={{ objectFit: 'contain' }} />
        <div>
          <span className="font-bold text-stone-800 text-sm leading-none" style={{ fontFamily: 'DM Serif Display, serif' }}>edukids</span>
          <div className="text-xs text-stone-400 mt-0.5">Админ</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                active
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-100 transition-all text-left"
        >
          Гарах
        </button>
      </div>
    </aside>
  )
}
