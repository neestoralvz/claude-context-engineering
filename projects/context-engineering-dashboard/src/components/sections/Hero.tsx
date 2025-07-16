import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MathFormula, PredefinedFormula } from '@/components/ui/MathFormula'

export function Hero() {
  return (
    <div className="text-center space-y-12">
      {/* Main Hero Content */}
      <div className="space-y-6">
        <div className="flex justify-center">
          <Badge variant="mathematical" className="text-sm px-8 py-4 rounded-full bg-accent-100 text-primary-900 dark:bg-accent-900 dark:text-accent-100 font-bold shadow-lg tracking-wide border border-secondary-200 dark:border-secondary-700">
            Mapa Inteligente de Contexto
          </Badge>
        </div>
        
        <h1 className="text-6xl lg:text-8xl font-black text-balance leading-tight tracking-tight text-primary-900 dark:text-primary-100">
          Ingeniería de
          <br />
          <span className="text-accent-600 dark:text-accent-400">
            Contexto
          </span>
        </h1>
        
        <p className="text-xl lg:text-3xl text-secondary-700 dark:text-secondary-200 max-w-5xl mx-auto text-balance leading-relaxed font-medium">
          Sistema de <span className="font-bold text-primary-700 dark:text-primary-300">carga perezosa</span> con núcleo filosófico permanente e integración de
          <span className="font-bold text-accent-700 dark:text-accent-300"> pensamiento progresivo</span>.
          <br className="hidden lg:block" />
          Navegación <span className="font-bold text-mathematical-600 dark:text-mathematical-400">ultra-eficiente</span> (<MathFormula formula="\\leq 3" /> pasos cognitivos a cualquier destino).
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="text-center group transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="relative space-y-3">
              <div className="text-5xl font-black text-slate-700 dark:text-slate-300">
                70
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Comandos
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                100% operacionales
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center group transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="relative space-y-3">
              <div className="text-5xl font-black text-slate-700 dark:text-slate-300">
                78%
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Reducción de Contexto
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                ~15K a ~3.3K tokens
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center group transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="relative space-y-3">
              <div className="text-5xl font-black text-slate-700 dark:text-slate-300">
                88%
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Tasa de Éxito
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                227 ejecuciones totales
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Formula Display */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <PredefinedFormula 
            type="EFFICIENCY"
            description="Donde R = Relevancia, Q = Calidad, C = Carga Cognitiva, T = Tiempo"
          />
          <div className="absolute inset-0 bg-mathematical-50/30 dark:bg-mathematical-900/10 rounded-xl blur-sm"></div>
        </div>
      </div>

      {/* Universal Entry Points */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h3 className="text-3xl font-black mb-8 text-center text-slate-900 dark:text-slate-100">
            Puntos de Entrada Universales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative">
              <div className="bg-slate-900 dark:bg-slate-950 text-green-400 font-mono text-base rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-all duration-300">
                <div className="text-slate-400 font-bold text-lg">/context-eng</div>
                <div className="text-slate-300 text-sm mt-3 leading-relaxed">
                  Activa los 70 comandos + 11 principios
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="bg-slate-900 dark:bg-slate-950 text-green-400 font-mono text-base rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-all duration-300">
                <div className="text-slate-400 font-bold text-lg">/decision</div>
                <div className="text-slate-300 text-sm mt-3 leading-relaxed">
                  Enrutamiento inteligente con activadores automáticos
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="bg-slate-900 dark:bg-slate-950 text-green-400 font-mono text-base rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-all duration-300">
                <div className="text-slate-400 font-bold text-lg">/thinking</div>
                <div className="text-slate-300 text-sm mt-3 leading-relaxed">
                  Análisis estratégico profundo + ideas innovadoras
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}