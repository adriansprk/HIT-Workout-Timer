import type { Metadata } from 'next'
import './globals.css'
import { AudioProvider } from '../contexts/AudioContext'
import { AudioUnlocker } from '../components/AudioUnlocker'
import { ThemeProvider } from '../contexts/ThemeContext'
import { Footer } from '../components/Footer'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Simple HIIT Timer',
  description: 'A customizable HIIT workout timer for your interval training sessions',
  openGraph: {
    title: 'Simple HIIT Timer',
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
    siteName: 'Simple HIIT Timer',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simple HIIT Timer',
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#E1F5E2" />
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

        {/* Vercel Web Analytics */}
        <Script
          src="https://va.vercel-scripts.com/v1/script.js"
          strategy="afterInteractive"
        />

        {/* Vercel Speed Insights */}
        <Script
          src="https://vercel.com/speed-insights/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
