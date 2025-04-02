import type { Metadata } from 'next'
import './globals.css'
import { AudioProvider } from '../contexts/AudioContext'
import { AudioUnlocker } from '../components/AudioUnlocker'
import { ThemeProvider } from '../contexts/ThemeContext'
import { Footer } from '../components/Footer'

export const metadata: Metadata = {
  title: 'Simple HIT Timer',
  description: 'A customizable HIIT workout timer for your interval training sessions',
  generator: 'v0.dev',
  openGraph: {
    title: 'Simple HIT Timer',
    description: 'A customizable HIIT workout timer for your interval training sessions',
    images: [
      {
        url: '/docs/images/config-screen.jpeg',
        width: 1200,
        height: 630,
        alt: 'HIIT Timer Configuration Screen'
      }
    ],
    url: 'https://timer.adriancares.com',
    siteName: 'Simple HIT Timer',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simple HIT Timer',
    description: 'A customizable HIIT workout timer for your interval training sessions',
    images: ['/docs/images/config-screen.jpeg'],
  }
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
