import { Reactor } from '../../types'
import { ReactorCard } from './ReactorCard'

interface ReactorGridProps {
  reactors: Reactor[]
  onReactorClick?: (reactor: Reactor) => void
}

export function ReactorGrid({ reactors, onReactorClick }: ReactorGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reactors.map((reactor) => (
        <ReactorCard
          key={reactor.id}
          reactor={reactor}
          onClick={() => onReactorClick?.(reactor)}
        />
      ))}
    </div>
  )
}