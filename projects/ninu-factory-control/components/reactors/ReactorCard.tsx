import React, { useState } from 'react'
import Image from 'next/image'
import { Reactor } from '../../types'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { formatDate, formatNumber } from '../../lib/utils'
import { Thermometer, Gauge, RotateCcw, Wrench, Clock, Play, Pause, Square, AlertTriangle, Settings } from 'lucide-react'

interface ReactorCardProps {
  reactor: Reactor
  onClick?: () => void
  onStart?: (reactorId: string) => void
  onStop?: (reactorId: string) => void
  onPause?: (reactorId: string) => void
  onEmergencyStop?: (reactorId: string) => void
  onParameterChange?: (reactorId: string, parameter: string, value: number) => void
}

export function ReactorCard({ 
  reactor, 
  onClick, 
  onStart, 
  onStop, 
  onPause, 
  onEmergencyStop,
  onParameterChange 
}: ReactorCardProps) {
  const [showControls, setShowControls] = useState(false)
  const [tempTarget, setTempTarget] = useState(reactor.temperature)
  const [pressureTarget, setPressureTarget] = useState(reactor.pressure)
  const [speedTarget, setSpeedTarget] = useState(reactor.mixingSpeed)
  const utilizationPercentage = reactor.currentBatch 
    ? Math.round((reactor.currentBatch.quantity / reactor.capacity) * 100)
    : 0

  const reactorImages = {
    'reactor-a': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=200&fit=crop&crop=center', // Chemical tank
    'reactor-b': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=200&fit=crop&crop=center', // Industrial vessel
    'reactor-c': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=200&fit=crop&crop=center'  // Mixing equipment
  }

  const getReactorImage = (reactorId: string) => {
    return reactorImages[reactorId as keyof typeof reactorImages] || reactorImages['reactor-a']
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={onClick}>
      {/* Reactor Image Header */}
      <div className="relative h-32 overflow-hidden">
        <Image 
          src={getReactorImage(reactor.id)}
          alt={`${reactor.name} equipment - Industrial reactor for chemical mixing and production at Ninu.mx facility`}
          fill
          className="object-cover"
          quality={70}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          sizes="(max-width: 400px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-2 text-white">
          <h3 className="font-semibold text-lg drop-shadow-md">{reactor.name}</h3>
          <p className="text-sm opacity-90">Reactor - {formatNumber(reactor.capacity)}L</p>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{reactor.name}</CardTitle>
          <Badge variant="status">
            {reactor.status === 'idle' && 'Inactivo'}
            {reactor.status === 'mixing' && 'Mezclando'}
            {reactor.status === 'heating' && 'Calentando'}
            {reactor.status === 'cooling' && 'Enfriando'}
            {reactor.status === 'completed' && 'Completado'}
            {reactor.status === 'error' && 'Error'}
            {reactor.status === 'maintenance' && 'Mantenimiento'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Batch Info */}
        {reactor.currentBatch && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2">Lote Actual</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">ID:</span>
                <span className="ml-1 font-medium">{reactor.currentBatch.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Cantidad:</span>
                <span className="ml-1 font-medium">{formatNumber(reactor.currentBatch.quantity)} L</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Fin estimado:</span>
                <span className="ml-1 font-medium">{formatDate(reactor.currentBatch.estimatedCompletion)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Controles</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControls(!showControls)}
            >
              <Settings className="h-3 w-3 mr-1" />
              {showControls ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {reactor.status === 'idle' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onStart?.(reactor.id)}
                disabled={!onStart}
              >
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button>
            )}
            
            {(reactor.status === 'mixing' || reactor.status === 'heating' || reactor.status === 'cooling') && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPause?.(reactor.id)}
                  disabled={!onPause}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pausar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStop?.(reactor.id)}
                  disabled={!onStop}
                >
                  <Square className="h-3 w-3 mr-1" />
                  Detener
                </Button>
              </>
            )}
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onEmergencyStop?.(reactor.id)}
              disabled={!onEmergencyStop}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Emergencia
            </Button>
          </div>
        </div>

        {/* Parameter Controls */}
        {showControls && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-3">
            <h4 className="font-medium text-sm text-gray-900">Ajustar Parámetros</h4>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Temperature Control */}
              <div>
                <label className="text-xs text-gray-600">Temperatura Objetivo (°C)</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    value={tempTarget}
                    onChange={(e) => setTempTarget(Number(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onParameterChange?.(reactor.id, 'temperature', tempTarget)}
                    disabled={!onParameterChange || tempTarget === reactor.temperature}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
              
              {/* Pressure Control */}
              <div>
                <label className="text-xs text-gray-600">Presión Objetivo (bar)</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    value={pressureTarget}
                    onChange={(e) => setPressureTarget(Number(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onParameterChange?.(reactor.id, 'pressure', pressureTarget)}
                    disabled={!onParameterChange || pressureTarget === reactor.pressure}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
              
              {/* Mixing Speed Control */}
              <div>
                <label className="text-xs text-gray-600">Velocidad Mezcla (rpm)</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="number"
                    value={speedTarget}
                    onChange={(e) => setSpeedTarget(Number(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="1000"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onParameterChange?.(reactor.id, 'mixingSpeed', speedTarget)}
                    disabled={!onParameterChange || speedTarget === reactor.mixingSpeed}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reactor Parameters Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-sm text-gray-600">Temperatura</div>
              <div className="font-medium">{reactor.temperature}°C</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600">Presión</div>
              <div className="font-medium">{reactor.pressure} bar</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-gray-600">Velocidad</div>
              <div className="font-medium">{reactor.mixingSpeed} rpm</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm text-gray-600">Utilización</div>
              <div className="font-medium">{utilizationPercentage}%</div>
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Capacidad</span>
            <span>{formatNumber(reactor.capacity)} L</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${utilizationPercentage}%` }}
              role="progressbar"
              aria-valuenow={utilizationPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Maintenance Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center space-x-1">
            <Wrench className="h-3 w-3" />
            <span>Último mant:</span>
            <span>{formatDate(reactor.lastMaintenance)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Próximo:</span>
            <span>{formatDate(reactor.nextMaintenance)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}