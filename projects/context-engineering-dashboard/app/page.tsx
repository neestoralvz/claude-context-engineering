import { Suspense } from 'react'
import { Hero } from '@/components/sections/Hero'
import { PhilosophicalFoundations } from '@/components/sections/PhilosophicalFoundations'
import { SystemOverview } from '@/components/sections/SystemOverview'
import { NavigationMap } from '@/components/sections/NavigationMap'
import { QuickAccess } from '@/components/sections/QuickAccess'
import { ContentShowcase } from '@/components/sections/ContentShowcase'
import { LoadingCard } from '@/components/ui/LoadingCard'

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <Suspense fallback={<LoadingCard className="h-64" />}>
        <Hero />
      </Suspense>

      {/* Permanent Core Context - Always Loaded */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-gradient-to-r from-mathematical-600 to-cognitive-600 bg-clip-text text-transparent">
            Núcleo de Contexto Permanente
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Fundamentos filosóficos siempre cargados
          </p>
        </div>
        
        <Suspense fallback={<LoadingCard className="h-48" />}>
          <PhilosophicalFoundations />
        </Suspense>
      </section>

      {/* System Overview with Lazy Loading */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Resumen del Estado del Sistema
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Métricas de rendimiento y carga perezosa
          </p>
        </div>
        
        <Suspense fallback={<LoadingCard className="h-64" />}>
          <SystemOverview />
        </Suspense>
      </section>

      {/* Intelligent Navigation Map */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-gradient-to-r from-cognitive-600 to-mathematical-600 bg-clip-text text-transparent">
            Mapa de Navegación Cognitiva
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Sistema de mapeo inteligente con carga progresiva
          </p>
        </div>
        
        <Suspense fallback={<LoadingCard className="h-96" />}>
          <NavigationMap />
        </Suspense>
      </section>

      {/* Quick Access Patterns */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
            Patrones de Acceso Rápido
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Rutas optimizadas para máxima eficiencia cognitiva
          </p>
        </div>
        
        <Suspense fallback={<LoadingCard className="h-48" />}>
          <QuickAccess />
        </Suspense>
      </section>

      {/* Content Integration Showcase */}
      <section className="space-y-8">
        <Suspense fallback={<LoadingCard className="h-96" />}>
          <ContentShowcase />
        </Suspense>
      </section>
    </div>
  )
}