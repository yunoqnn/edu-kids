import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'StudyComp — Хүүхдэд зориулсан сургалтын платформ',
  description: 'Бага сургуулийн 1–5 дугаар ангийн сурагчдад зориулсан тоглоомжуулсан сургалтын платформ',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  openGraph: {
    images: [{ url: '/images/logo.png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  )
}
