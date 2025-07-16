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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-transparent to-mathematical-100/20 dark:from-primary-900/10 dark:to-mathematical-900/10 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-transparent via-blue-50/30 to-transparent dark:from-transparent dark:via-blue-900/10 dark:to-transparent pointer-events-none"></div>
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