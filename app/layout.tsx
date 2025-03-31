import type { Metadata } from 'next'
import './globals.css'
import { AudioProvider } from '../contexts/AudioContext'
import { AudioUnlocker } from '../components/AudioUnlocker'
import { ThemeProvider } from '../contexts/ThemeContext'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body suppressHydrationWarning>
        <AudioProvider>
          <ThemeProvider>
            <AudioUnlocker />
            {children}
          </ThemeProvider>
        </AudioProvider>
      </body>
    </html>
  )
}
