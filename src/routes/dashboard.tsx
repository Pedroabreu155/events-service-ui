import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useEvents } from '../hooks/useEvents'
import { EventSeverity } from '../types/event'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: DashboardComponent,
})

function DashboardComponent() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | undefined>()
  
  const { data: events, isLoading, isError, error } = useEvents({ severity: severityFilter })

  // Ensure events is an array before calling find
  const eventsArray = Array.isArray(events) ? events : [];
  const selectedEvent = eventsArray.find(e => e.id === selectedEventId) || eventsArray[0]

  const handleLogout = () => {
    sessionStorage.removeItem('apiKey')
    window.location.href = '/login'
  }

  const getSeverityColor = (severity: EventSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-error border-error/30 bg-error/10'
      case 'ERROR': return 'text-red-500 border-red-500/30 bg-red-500/10'
      case 'WARNING': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'
      default: return 'text-primary border-primary/30 bg-primary/10'
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-primary flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary jewel-glow"></div>
        <p className="text-xs font-mono tracking-widest uppercase opacity-50">Carregando Fluxo de Eventos...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-error flex-col gap-6 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center border border-error/20">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-headline font-bold">Falha na Conexão</h2>
          <p className="text-sm text-on-surface-variant max-w-md">
            Não foi possível estabelecer conexão com o serviço de eventos. 
            Verifique se a API está rodando ou tente novamente mais tarde.
          </p>
          {error instanceof Error && (
            <p className="text-[10px] font-mono opacity-50 mt-4">Erro: {error.message}</p>
          )}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-surface-container-high hover:bg-surface-container text-on-surface text-sm font-bold rounded-md transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-black text-on-surface font-body">
      {/* Sidebar Navigation (Events Log) */}
      <aside className="flex flex-col w-80 bg-surface-container-lowest border-r border-outline-variant/10 h-screen">
        <div className="p-4 border-b border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-base font-black text-on-surface tracking-tighter">Events Service</div>
              <div className="text-[9px] uppercase tracking-widest text-primary font-bold opacity-80">Logs and Events in one place</div>
            </div>
          </div>
          <div className="relative mb-3 flex gap-2">
            <select 
              value={severityFilter || ''} 
              onChange={(e) => setSeverityFilter(e.target.value as EventSeverity || undefined)}
              className="w-full bg-surface-container-high py-1.5 rounded text-[10px] uppercase font-bold tracking-widest hover:bg-surface-container hover:text-primary transition-all outline-none border-none appearance-none px-2 text-center"
            >
              <option value="">All Severities</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {eventsArray.map((event) => (
            <div 
              key={event.id} 
              onClick={() => setSelectedEventId(event.id)}
              className={`p-4 border-b border-outline-variant/5 cursor-pointer transition-all hover:bg-surface-container-low ${selectedEventId === event.id ? 'bg-surface-container-high border-l-2 border-l-primary' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border ${getSeverityColor(event.severity)}`}>
                  {event.severity}
                </span>
                <span className="text-[9px] text-secondary/40 font-mono">
                  {new Date(event.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="text-[11px] font-bold text-on-surface truncate mb-0.5">{event.title}</h3>
              <p className="text-[10px] text-secondary/60 truncate leading-tight uppercase tracking-tight">{event.source}</p>
            </div>
          ))}

          {eventsArray.length === 0 && (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-secondary/20 text-4xl mb-2">event_busy</span>
              <p className="text-[10px] text-secondary/40 uppercase font-bold tracking-widest">Nenhum evento encontrado</p>
            </div>
          )}
        </div>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-outline-variant/10">
          <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer" onClick={handleLogout}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-on-surface truncate">Admin Root</p>
                <p className="text-[9px] text-secondary/60 truncate">Sair do Sistema</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-sm text-secondary/60">logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        {/* Detail Content */}
        {selectedEvent ? (
          <div className="flex-1 overflow-y-auto p-8 font-headline">
            {/* Selected Event Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <span className={`px-3 py-1 border rounded text-xs font-black tracking-widest ${getSeverityColor(selectedEvent.severity)}`}>
                  {selectedEvent.severity}
                </span>
                <h2 className="text-2xl font-bold text-on-surface">{selectedEvent.title}</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary/60">
                <span>Source: <span className="text-on-surface-variant font-mono">{selectedEvent.source}</span></span>
                <span className="text-outline-variant">•</span>
                <span>at {new Date(selectedEvent.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Summary Table */}
            <div className="mb-8 border border-outline-variant/10 rounded-lg overflow-hidden bg-surface-container-lowest">
              <div className="grid grid-cols-2 border-b border-outline-variant/5 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
                <div className="text-xs font-medium text-secondary/70">ID</div>
                <div className="text-xs font-mono text-on-surface-variant">{selectedEvent.id}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-outline-variant/5 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
                <div className="text-xs font-medium text-secondary/70">Status</div>
                <div className={`text-xs font-mono font-bold ${selectedEvent.status === 'FAILED' ? 'text-error' : 'text-primary'}`}>
                  {selectedEvent.status}
                </div>
              </div>
              <div className="grid grid-cols-2 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
                <div className="text-xs font-medium text-secondary/70">Created At</div>
                <div className="text-xs font-mono text-on-surface-variant">{selectedEvent.createdAt}</div>
              </div>
            </div>

            {/* Description Section */}
            {selectedEvent.description && (
              <div className="mb-8">
                <h3 className="text-sm font-black text-on-surface uppercase tracking-widest mb-4">Description</h3>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-sm text-on-surface-variant">
                  {selectedEvent.description}
                </div>
              </div>
            )}

            {/* Payload Section */}
            {selectedEvent.payload && (
              <div className="mb-8">
                <h3 className="text-sm font-black text-on-surface uppercase tracking-widest mb-4">Payload</h3>
                <div className="bg-[#0a0a0a] rounded-lg p-6 border border-outline-variant/10">
                  <pre className="font-mono text-sm text-secondary leading-relaxed overflow-x-auto">
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Metadata Section */}
            {selectedEvent.metadata && (
              <div className="mb-8">
                <h3 className="text-sm font-black text-on-surface uppercase tracking-widest mb-4">Metadata</h3>
                <div className="bg-[#0a0a0a] rounded-lg p-6 border border-outline-variant/10">
                  <pre className="font-mono text-sm text-secondary leading-relaxed overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-secondary/60 font-headline">
            Selecione um evento para ver os detalhes
          </div>
        )}
      </main>
    </div>
  )
}
