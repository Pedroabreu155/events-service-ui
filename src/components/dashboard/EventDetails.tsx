import type { Event } from '../../types/event'

function getSeverityColor(severity: string) {
  const s = severity?.toUpperCase()
  switch (s) {
    case 'HIGH':
      return 'text-red-500 border-red-500/30'
    case 'MEDIUM':
      return 'text-yellow-500 border-yellow-500/30'
    case 'LOW':
      return 'text-[#00A878] border-[#00A878]/30'
    default:
      return 'text-primary border-primary/30'
  }
}

function getResultColor(result: string) {
  return result === 'SUCCESS' ? 'text-[#00A878]' : 'text-red-500'
}

export function EventDetails({ event }: { event: Event }) {
  return (
    <div className="flex-1 overflow-y-auto p-8 font-headline">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <span
            className={`px-3 py-1 border rounded text-xs font-black tracking-widest ${getResultColor(event.result)}`}
          >
            {event.result}
          </span>
          <h2 className="text-2xl font-bold text-on-surface">{event.eventType}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary/60">
          <span>
            Source:{' '}
            <span className="text-on-surface-variant font-mono">
              {event.sourceIp}
            </span>
          </span>
          <span className="text-outline-variant">•</span>
          <span>at {new Date(event.timestamp).toLocaleString()}</span>
        </div>
      </div>

      <div className="mb-8 border border-outline-variant/10 rounded-lg overflow-hidden bg-surface-container-lowest">
        <div className="grid grid-cols-2 border-b border-outline-variant/5 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
          <div className="text-xs font-medium text-secondary/70">
            Correlation ID
          </div>
          <div className="text-xs font-mono text-on-surface-variant">
            {event.correlationId || 'N/A'}
          </div>
        </div>
        <div className="grid grid-cols-2 border-b border-outline-variant/5 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
          <div className="text-xs font-medium text-secondary/70">Criticality</div>
          <div
            className={`text-xs font-mono font-bold ${getSeverityColor(event.criticality)}`}
          >
            {event.criticality}
          </div>
        </div>
        <div className="grid grid-cols-2 border-b border-outline-variant/5 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
          <div className="text-xs font-medium text-secondary/70">User ID</div>
          <div className="text-xs font-mono text-on-surface-variant">
            {event.userId}
          </div>
        </div>
        <div className="grid grid-cols-2 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
          <div className="text-xs font-medium text-secondary/70">Client ID</div>
          <div className="text-xs font-mono text-on-surface-variant">
            {event.clientId}
          </div>
        </div>
      </div>

      {event.details ? (
        <div className="mb-8">
          <h3 className="text-sm font-black text-on-surface uppercase tracking-widest mb-4">
            Event Details
          </h3>
          <div className="bg-[#0a0a0a] rounded-lg p-6 border border-outline-variant/10">
            <pre className="font-mono text-sm text-secondary leading-relaxed overflow-x-auto">
              {JSON.stringify(event.details, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  )
}
