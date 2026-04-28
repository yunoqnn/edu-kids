import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StudyComp — Хүүхдэд зориулсан сургалтын платформ',
  description: 'Бага сургуулийн 1–5 дугаар ангийн сурагчдад зориулсан тоглоомжуулсан сургалтын платформ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className="bg-background">
      <body className="bg-background">{children}</body>
    </html>
  )
}
