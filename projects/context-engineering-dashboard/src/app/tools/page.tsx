'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const tools = [
  {
    name: 'Context7 MCP',
    description: 'Integración de servidor MCP para documentación de bibliotecas en tiempo real',
    status: 'Activo',
    category: 'MCP',
    icon: '🔧',
    features: [
      'Documentación de bibliotecas actualizada',
      'Búsqueda de IDs de bibliotecas',
      'Integración automática con Claude Code'
    ]
  },
  {
    name: 'Claude Code IDE',
    description: 'Integración completa con Claude Code para ejecución de herramientas',
    status: 'Activo', 
    category: 'IDE',
    icon: '💻',
    features: [
      'Ejecución de herramientas en tiempo real',
      'Bash, Grep, Read, Write, Task tools',
      'Transparencia P55/P56 completa'
    ]
  },
  {
    name: 'Task Agent Bridge',
    description: 'Puente de comunicación bidireccional para agentes especialistas',
    status: 'Activo',
    category: 'Orquestación',
    icon: '🤖',
    features: [
      'Despliegue de hasta 10 agentes especialistas',
      'Comunicación bidireccional en tiempo real',
      'Coordinación multi-agente avanzada'
    ]
  },
  {
    name: 'Progressive Thinking',
    description: 'Sistema de análisis profundo de 4 etapas para problemas complejos',
    status: 'Activo',
    category: 'Análisis',
    icon: '🧠',
    features: [
      'Análisis contextual profundo',
      'Insights analíticos estratégicos',
      'Planificación estratégica avanzada',
      'Innovaciones revolucionarias'
    ]
  },
  {
    name: 'Mathematical Validation',
    description: 'Sistema de validación matemática con scripts integrados',
    status: 'Activo',
    category: 'Validación',
    icon: '🧮',
    features: [
      'Cálculos de confianza y complejidad',
      'Validación de triggers automática',
      'Precisión matemática de 4 decimales'
    ]
  }
]

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black bg-gradient-to-r from-sky-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Herramientas de Integración
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Ecosistema completo de herramientas MCP, IDE y análisis para máxima productividad
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 text-center">
          <div className="text-3xl font-black text-sky-600 dark:text-sky-400 mb-2">5</div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Herramientas Activas</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">100%</div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Disponibilidad</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">10</div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Agentes Max</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-black text-orange-600 dark:text-orange-400 mb-2">P55/P56</div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Cumplimiento</div>
        </Card>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tools.map((tool, index) => (
          <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{tool.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {tool.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">{tool.status}</Badge>
                    <Badge variant="outline">{tool.category}</Badge>
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {tool.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Características principales:
                  </h4>
                  <ul className="space-y-1">
                    {tool.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-slate-600 dark:text-slate-300 flex items-center">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Integration Status */}
      <div className="mt-12">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Estado de Integración
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">MCP Servers</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Context7 completamente integrado y operacional
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Claude Code</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Ejecución de herramientas en tiempo real activa
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Task Agents</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Sistema multi-agente con comunicación bidireccional
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}