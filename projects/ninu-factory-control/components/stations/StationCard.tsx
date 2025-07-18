import React, { useState } from 'react'
import Image from 'next/image'
import { ProductionStation } from '../../types'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { formatDate, formatNumber } from '../../lib/utils'
import { Activity, Package, TrendingUp, Clock, AlertTriangle, Play, Pause, Square, Settings, Wrench, Plus } from 'lucide-react'

interface StationCardProps {
  station: ProductionStation
  onClick?: () => void
  onStart?: (stationId: string) => void
  onStop?: (stationId: string) => void
  onPause?: (stationId: string) => void
  onMaintenance?: (stationId: string) => void
  onAddToQueue?: (stationId: string, productId: string, quantity: number) => void
  onTargetChange?: (stationId: string, target: number) => void
}

export function StationCard({ 
  station, 
  onClick, 
  onStart, 
  onStop, 
  onPause, 
  onMaintenance,
  onAddToQueue,
  onTargetChange 
}: StationCardProps) {
  const [showControls, setShowControls] = useState(false)
  const [efficiencyTarget, setEfficiencyTarget] = useState(85)
  const [newProductId, setNewProductId] = useState('')
  const [newQuantity, setNewQuantity] = useState(100)
  const getStationTypeIcon = (type: string) => {
    switch (type) {
      case 'labeling': return '🏷️'
      case 'filling': return '🫗'
      case 'packaging': return '📦'
      case 'powder': return '🥄'
      case 'soap': return '🧼'
      default: return '⚙️'
    }
  }


  const getStationTypeName = (type: string) => {
    switch (type) {
      case 'labeling': return 'Etiquetado'
      case 'filling': return 'Llenado'
      case 'packaging': return 'Empaque'
      case 'powder': return 'Polvos'
      case 'soap': return 'Jabones'
      default: return 'Estación'
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Station type-specific images for production line visualization
  const getStationImage = (type: string) => {
    const stationImages = {
      'labeling': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=200&fit=crop&crop=center', // Labeling machine
      'filling': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop&crop=center', // Filling equipment
      'packaging': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=200&fit=crop&crop=center', // Packaging station
      'powder': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=200&fit=crop&crop=center', // Powder processing
      'soap': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=200&fit=crop&crop=center', // Soap manufacturing
    }
    return stationImages[type as keyof typeof stationImages] || stationImages['packaging']
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden" onClick={onClick}>
      {/* Station Image Header */}
      <div className="relative h-32 overflow-hidden">
        <Image 
          src={getStationImage(station.type)}
          alt={`${getStationTypeName(station.type)} station - Production equipment for ${station.name} at Ninu.mx manufacturing facility`}
          fill
          className="object-cover"
          quality={70}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          sizes="(max-width: 400px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-2 text-white">
          <div className="flex items-center space-x-2">
            <span className="text-2xl drop-shadow-md">{getStationTypeIcon(station.type)}</span>
            <div>
              <h3 className="font-semibold text-lg drop-shadow-md">{station.name}</h3>
              <p className="text-sm opacity-90">{getStationTypeName(station.type)}</p>
            </div>
          </div>
        </div>
        <Badge 
          variant="status" 
          className="absolute top-2 right-2 shadow-lg"
        >
          {station.status === 'idle' && 'Inactiva'}
          {station.status === 'running' && 'Operando'}
          {station.status === 'maintenance' && 'Mantenimiento'}
          {station.status === 'error' && 'Error'}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getStationTypeIcon(station.type)}</span>
            <CardTitle className="text-lg">{station.name}</CardTitle>
          </div>
          <Badge variant="status">
            {station.status === 'idle' && 'Inactiva'}
            {station.status === 'running' && 'Operando'}
            {station.status === 'maintenance' && 'Mantenimiento'}
            {station.status === 'error' && 'Error'}
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          {getStationTypeName(station.type)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Product */}
        {station.currentProduct && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-green-900 mb-1">Producto Actual</h4>
            <div className="text-sm">
              <div className="font-medium">{station.currentProduct.name}</div>
              <div className="text-gray-600">{station.currentProduct.size} {station.currentProduct.unit}</div>
            </div>
          </div>
        )}

        {/* Station Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className={`h-4 w-4 ${getEfficiencyColor(station.efficiency)}`} />
            <div>
              <div className="text-sm text-gray-600">Eficiencia</div>
              <div className={`font-medium ${getEfficiencyColor(station.efficiency)}`}>
                {station.efficiency}%
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600">Unidades/h</div>
              <div className="font-medium">{formatNumber(station.unitsPerHour)}</div>
            </div>
          </div>
        </div>

        {/* Efficiency Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Eficiencia Operativa</span>
            <span>{station.efficiency}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                station.efficiency >= 90 ? 'bg-green-600' :
                station.efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${station.efficiency}%` }}
              role="progressbar"
              aria-valuenow={station.efficiency}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Queue Status */}
        {station.queue.length > 0 && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-sm text-orange-900">Cola de Producción</span>
            </div>
            <div className="text-sm text-orange-700">
              {station.queue.length} {station.queue.length === 1 ? 'trabajo' : 'trabajos'} pendientes
            </div>
          </div>
        )}

        {/* Maintenance Alert */}
        {station.status === 'maintenance' && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-sm text-yellow-900">En Mantenimiento</span>
            </div>
            <div className="text-sm text-yellow-700 mt-1">
              Estación fuera de servicio temporalmente
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
          
          <div className="flex space-x-2 flex-wrap gap-2">
            {station.status === 'idle' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onStart?.(station.id)}
                disabled={!onStart}
              >
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button>
            )}
            
            {station.status === 'running' && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPause?.(station.id)}
                  disabled={!onPause}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pausar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStop?.(station.id)}
                  disabled={!onStop}
                >
                  <Square className="h-3 w-3 mr-1" />
                  Detener
                </Button>
              </>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onMaintenance?.(station.id)}
              disabled={!onMaintenance}
            >
              <Wrench className="h-3 w-3 mr-1" />
              Mantenimiento
            </Button>
          </div>
        </div>

        {/* Advanced Controls */}
        {showControls && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-4">
            <h4 className="font-medium text-sm text-gray-900">Controles Avanzados</h4>
            
            {/* Efficiency Target */}
            <div>
              <label className="text-xs text-gray-600">Meta de Eficiencia (%)</label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="number"
                  value={efficiencyTarget}
                  onChange={(e) => setEfficiencyTarget(Number(e.target.value))}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="50"
                  max="100"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTargetChange?.(station.id, efficiencyTarget)}
                  disabled={!onTargetChange}
                >
                  Aplicar
                </Button>
              </div>
            </div>
            
            {/* Add to Queue */}
            <div>
              <label className="text-xs text-gray-600">Agregar a Cola de Producción</label>
              <div className="space-y-2 mt-1">
                <select
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Seleccionar producto...</option>
                  <option value="multiusos-1l">Multiusos 1L</option>
                  <option value="sanitizante-1l">Sanitizante 1L</option>
                  <option value="detergente-2kg">Detergente 2kg</option>
                  <option value="jabon-500ml">Jabón 500ml</option>
                  <option value="kit-alberca">Kit Alberca 3pzas</option>
                </select>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="1"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (newProductId) {
                        onAddToQueue?.(station.id, newProductId, newQuantity)
                        setNewProductId('')
                        setNewQuantity(100)
                      }
                    }}
                    disabled={!onAddToQueue || !newProductId}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Activity */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Última actividad:</span>
          </div>
          <span>{formatDate(station.lastActivity)}</span>
        </div>
      </CardContent>
    </Card>
  )
}