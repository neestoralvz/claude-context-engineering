import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ProgressiveLoadingProvider } from '@/components/providers/ProgressiveLoadingProvider'
import { Navigation } from '@/components/layout/Navigation'
import { PhilosophicalCore } from '@/components/core/PhilosophicalCore'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Ingeniería de Contexto | Mapa Inteligente de Contexto',
  description: 'Sistema de carga perezosa con núcleo filosófico permanente e integración de pensamiento progresivo. Navegación ultra-eficiente (≤3 pasos cognitivos a cualquier destino).',
  keywords: ['ingeniería de contexto', 'optimización cognitiva', 'pensamiento progresivo', 'rigor matemático'],
  authors: [{ name: 'Equipo de Ingeniería de Contexto' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Ingeniería de Contexto | Mapa Inteligente de Contexto',
    description: 'Sistema de carga perezosa con núcleo filosófico permanente e integración de pensamiento progresivo.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ingeniería de Contexto',
    description: 'Mapa Inteligente de Contexto con Carga Progresiva',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css"
          integrity="sha384-wcIxkf4k558AjM3Yz3BBFQUbk/zgIYC2R0QpeeYb+TwlBVMrlgLqwRjRtGZiK7ww"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProgressiveLoadingProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative">
              {/* Subtle Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-mathematical-50/20 dark:from-primary-950/20 dark:to-mathematical-950/10 pointer-events-none"></div>
              {/* Permanent Philosophical Core - Always Loaded */}
              <PhilosophicalCore />
              
              {/* Navigation System */}
              <Navigation />
              
              {/* Main Content Area */}
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
              
              {/* Progressive Loading Indicator */}
              <div id="progressive-loading-root" />
            </div>
          </ProgressiveLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}