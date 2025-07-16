import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/LoadingCard'

export function SystemOverview() {
  const metrics = {
    commandsActive: { value: 62, total: 62, percentage: 100 },
    successRate: { value: 88.48, percentage: 88.48 },
    contextReduction: { value: 78, percentage: 78 },
    navigationSpeed: { value: 65, percentage: 65 },
    cognitiveSteps: { value: 3, max: 3 }
  }

  return (
    <div className="space-y-6">
      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {metrics.commandsActive.value}/{metrics.commandsActive.total}
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Comandos Activos</div>
              <Badge variant="mathematical" className="text-xs px-2 py-1 rounded-full">
                {metrics.commandsActive.percentage}% Operacionales
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-mathematical-600 dark:text-mathematical-400">
                {metrics.successRate.value}%
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tasa de Éxito</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">226 ejecuciones totales</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-cognitive-600 dark:text-cognitive-400">
                {metrics.contextReduction.value}%
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Reducción de Contexto</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">~15K a ~3.3K tokens</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                ≤{metrics.cognitiveSteps.value}
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pasos Cognitivos</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">A cualquier destino</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Panel de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">Eficiencia del Sistema</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Reducción de Contexto</span>
                    <span className="font-medium">{metrics.contextReduction.value}%</span>
                  </div>
                  <ProgressBar 
                    progress={metrics.contextReduction.percentage} 
                    showLabel={false}
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Velocidad de Navegación</span>
                    <span className="font-medium">+{metrics.navigationSpeed.value}%</span>
                  </div>
                  <ProgressBar 
                    progress={metrics.navigationSpeed.percentage} 
                    showLabel={false}
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tasa de Éxito</span>
                    <span className="font-medium">{metrics.successRate.value}%</span>
                  </div>
                  <ProgressBar 
                    progress={metrics.successRate.percentage} 
                    showLabel={false}
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">Estado del Sistema de Carga</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-mathematical-50 dark:bg-mathematical-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-mathematical-700 dark:text-mathematical-300">
                      Núcleo Filosófico
                    </div>
                    <div className="text-xs text-mathematical-600 dark:text-mathematical-400">
                      Permanente (~0.8K tokens)
                    </div>
                  </div>
                  <Badge variant="mathematical" className="px-3 py-1 rounded-full font-semibold">CARGADO</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-primary-700 dark:text-primary-300">
                      Pensamiento Progresivo
                    </div>
                    <div className="text-xs text-primary-600 dark:text-primary-400">
                      Auto-activación (inteligente)
                    </div>
                  </div>
                  <Badge variant="outline" className="px-3 py-1 rounded-full font-semibold">LISTO</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-cognitive-50 dark:bg-cognitive-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-cognitive-700 dark:text-cognitive-300">
                      Integración MCP
                    </div>
                    <div className="text-xs text-cognitive-600 dark:text-cognitive-400">
                      Hooks Context7 listos
                    </div>
                  </div>
                  <Badge variant="cognitive" className="px-3 py-1 rounded-full font-semibold">LISTO</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Command Chain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🚀 Top Command Chain</span>
            <Badge variant="secondary">96% Success</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="command-interface inline-block">
              <span className="command-prompt">/meta-core</span>
            </div>
            <span className="text-slate-400">→</span>
            <div className="command-interface inline-block">
              <span className="command-prompt">/decision</span>
            </div>
            <span className="text-slate-400">→</span>
            <div className="command-interface inline-block">
              <span className="command-prompt">/command-relationships</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}