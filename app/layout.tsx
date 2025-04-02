import type { Metadata } from 'next'
import './globals.css'
import { AudioProvider } from '../contexts/AudioContext'
import { AudioUnlocker } from '../components/AudioUnlocker'
import { ThemeProvider } from '../contexts/ThemeContext'
import { Footer } from '../components/Footer'

export const metadata: Metadata = {
  title: 'Simple HIT Timer',
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
      <body suppressHydrationWarning className="flex flex-col min-h-screen">
        <AudioProvider>
          <ThemeProvider>
            <AudioUnlocker />
            <div className="flex-1">
              {children}
            </div>
            <Footer
              githubUrl="https://github.com/adriansprk/HIT-Workout-Timer"
              linkedinUrl="https://www.linkedin.com/in/adriankrueger/"
            />
          </ThemeProvider>
        </AudioProvider>
      </body>
    </html>
  )
}
