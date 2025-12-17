import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'n8n Workflow Control Center',
  description: 'Automation Dashboard & Trigger Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
