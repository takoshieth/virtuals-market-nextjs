import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Virtuals Market',
  description: 'Live Virtual Protocol tokens with prices',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
