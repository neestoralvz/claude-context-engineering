import { ProductionStation } from '../../types'
import { StationCard } from './StationCard'

interface StationGridProps {
  stations: ProductionStation[]
  onStationClick?: (station: ProductionStation) => void
}

export function StationGrid({ stations, onStationClick }: StationGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {stations.map((station) => (
        <StationCard
          key={station.id}
          station={station}
          onClick={() => onStationClick?.(station)}
        />
      ))}
    </div>
  )
}