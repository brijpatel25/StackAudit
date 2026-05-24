import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StackAudit — Find out how much you\'re wasting on AI tools',
  description: 'Audit your AI tool spend in 2 minutes. See exactly where you\'re overspending and how much to save.',
  openGraph: {
    title: 'StackAudit — AI Spend Auditor',
    description: 'Find out how much your team is wasting on AI tools. Free audit in 2 minutes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StackAudit — AI Spend Auditor',
    description: 'Find out how much your team is wasting on AI tools. Free audit in 2 minutes.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
