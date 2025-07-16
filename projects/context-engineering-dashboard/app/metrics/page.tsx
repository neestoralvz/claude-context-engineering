'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const performanceMetrics = {
  overall: {
    successRate: 88.62,
    totalExecutions: 227,
    avgConfidence: 8.4,
    contextReduction: 78,
    speedImprovement: 65,
    cognitiveEfficiency: 95
  },
  commands: {
    totalCommands: 64,
    activeCommands: 64,
    atomicCommands: 44,
    orchestrators: 6,
    metaCommands: 1,
    systemCommands: 9
  },
  principles: {
    totalPrinciples: 56,
    activePrinciples: 56,
    categories: 7,
    implementationRate: 98.5
  },
  automation: {
    autoTriggers: 22,
    scriptIntegration: 100,
    mathValidation: 94.2,
    patternCrystallization: 85
  }
}

const qualityMetrics = [
  { name: 'Tasa de Éxito General', value: 88.62, unit: '%', trend: '+2.1%' },
  { name: 'Precisión de Routing', value: 96.3, unit: '%', trend: '+1.8%' },
  { name: 'Optimización de Contexto', value: 78, unit: '%', trend: '+5.2%' },
  { name: 'Mejora de Velocidad', value: 65, unit: '%', trend: '+3.7%' },
  { name: 'Validación Matemática', value: 94.2, unit: '%', trend: '+2.5%' },
  { name: 'Eficiencia Cognitiva', value: 95, unit: '%', trend: '+1.3%' }
]

const commandMetrics = [
  { category: 'Core Intelligence', commands: 8, successRate: 96.5, avgTime: '2.3s' },
  { category: 'Discovery & Learning', commands: 12, successRate: 89.7, avgTime: '4.1s' },
  { category: 'Planning & Strategy', commands: 9, successRate: 92.1, avgTime: '3.8s' },
  { category: 'Orchestration Flow', commands: 11, successRate: 88.3, avgTime: '5.2s' },
  { category: 'Execution & Action', commands: 8, successRate: 85.9, avgTime: '6.7s' },
  { category: 'Verification & Quality', commands: 7, successRate: 93.8, avgTime: '3.1s' },
  { category: 'Documentation & Synthesis', commands: 6, successRate: 91.2, avgTime: '2.9s' },
  { category: 'System & Infrastructure', commands: 3, successRate: 98.1, avgTime: '1.8s' }
]

export default function MetricsPage() {
  const [activeMetric, setActiveMetric] = useState('performance')
  const [isLive, setIsLive] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black bg-gradient-to-r from-sky-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Panel de Métricas
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Análisis completo del rendimiento del sistema y métricas de calidad en tiempo real
        </p>
      </div>

      {/* Live Status Toggle */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            isLive 
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {isLive ? '🟢 Métricas en Vivo' : '⚪ Métricas Estáticas'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 text-center hover:shadow-lg transition-all">
          <div className="text-3xl font-black text-sky-600 dark:text-sky-400 mb-2">
            {performanceMetrics.overall.successRate}%
          </div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tasa de Éxito</div>
          <div className="text-xs text-emerald-600 mt-1">+2.1% esta semana</div>
        </Card>
        
        <Card className="p-6 text-center hover:shadow-lg transition-all">
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
            {performanceMetrics.commands.totalCommands}
          </div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Comandos Activos</div>
          <div className="text-xs text-sky-600 mt-1">100% operacionales</div>
        </Card>
        
        <Card className="p-6 text-center hover:shadow-lg transition-all">
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">
            {performanceMetrics.principles.totalPrinciples}
          </div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Principios</div>
          <div className="text-xs text-purple-600 mt-1">98.5% implementados</div>
        </Card>
        
        <Card className="p-6 text-center hover:shadow-lg transition-all">
          <div className="text-3xl font-black text-orange-600 dark:text-orange-400 mb-2">
            {performanceMetrics.overall.contextReduction}%
          </div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Reducción Contexto</div>
          <div className="text-xs text-emerald-600 mt-1">+5.2% optimización</div>
        </Card>
      </div>

      {/* Quality Metrics */}
      <Card className="p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Métricas de Calidad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qualityMetrics.map((metric, index) => (
            <div key={index} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{metric.name}</h3>
                <Badge variant="success">{metric.trend}</Badge>
              </div>
              <div className="text-3xl font-black text-sky-600 dark:text-sky-400">
                {metric.value}{metric.unit}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Command Performance */}
      <Card className="p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Rendimiento por Categoría de Comandos
        </h2>
        <div className="space-y-4">
          {commandMetrics.map((category, index) => (
            <div key={index} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {category.category}
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {category.commands} comandos
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {category.successRate}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    ⏱️ {category.avgTime} promedio
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${category.successRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Health */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Estado del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Scripts</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              22/22 triggers validados
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Automatización</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              100% integración scripts
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">🧮</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Matemáticas</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              94.2% precisión validación
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-2xl">🔄</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">P55/P56</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              98% cumplimiento transparencia
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}