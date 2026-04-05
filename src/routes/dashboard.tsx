import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useEvents } from '../hooks/useEvents'
import { Criticality } from '../types/event'

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
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [criticalityFilter] = useState<Criticality | undefined>()
  const listRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  
  const {
    events,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEvents({ criticality: criticalityFilter })

  const eventsArray = Array.isArray(events) ? events : []
  const effectiveSelectedEventId = selectedEventId ?? (eventsArray[0]?.id ?? null)

  useEffect(() => {
    const root = listRef.current
    const target = sentinelRef.current

    if (!root || !target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (!first?.isIntersecting) return
        if (!hasNextPage) return
        if (isFetchingNextPage) return
        fetchNextPage()
      },
      { root, rootMargin: '200px', threshold: 0 },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const selectedEvent =
    eventsArray.find((e) => e.id === effectiveSelectedEventId) ?? eventsArray[0]

  const getRelativeTime = (date?: string) => {
    if (!date) return 'unknown time'
    const eventDate = new Date(date)
    const now = new Date()
    const diff = now.getTime() - eventDate.getTime()
    if (isNaN(diff)) return 'invalid date'
    
    const minutes = Math.floor(diff / 60000)
    
    // Se for menos de 60 minutos (1 hora), mostra "há x minutos"
    if (minutes < 60) {
      if (minutes < 1) return 'now'
      if (minutes === 1) return '1 minute ago'
      return `${minutes} minutes ago`
    }
    
    // Se for mais de 1 hora, mostra a data e horário formatados
    return eventDate.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLogout = () => {
    sessionStorage.removeItem('apiKey')
    window.location.href = '/login'
  }

  const getSeverityColor = (severity: string) => {
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

  const getResultColor = (result: string) => {
    return result === 'SUCCESS' ? 'text-[#00A878]' : 'text-red-500'
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
        <div className="p-4 pt-6 border-b border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-lg font-black text-white tracking-tight">Events Service</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#00A878] font-black">Inspect</div>
            </div>
          </div>
          <div className="relative mb-3">
            <button 
              className="w-full bg-[#00A878] py-2 rounded-sm text-[10px] uppercase font-black tracking-[0.2em] text-white hover:bg-[#008f66] transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              FILTERS
            </button>
          </div>
        </div>

        {/* Event List */}
        <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {eventsArray.map((event) => {
            const isSelected = effectiveSelectedEventId === event.id
            
            return (
              <div 
                key={event.id} 
                onClick={() => setSelectedEventId(event.id)}
                className={`px-6 py-4 border-b border-white/5 cursor-pointer transition-all hover:bg-[#151515] ${isSelected ? 'bg-[#0F1110] border-l-4 border-l-[#00A878]' : ''}`}
              >
                <div className="flex flex-col gap-1">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${getResultColor(event.result)}`}>
                    {event.eventType}
                  </div>
                  <div className="text-[10px] text-white/70 font-mono">
                    client_id: {event.clientId}
                  </div>
                  <div className="text-[10px] text-white/30 font-medium">
                    {getRelativeTime(event.timestamp)}
                  </div>
                </div>
              </div>
            )
          })}

          {eventsArray.length === 0 && (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-secondary/20 text-4xl mb-2">event_busy</span>
              <p className="text-[10px] text-secondary/40 uppercase font-bold tracking-widest">Nenhum evento encontrado</p>
            </div>
          )}

          <div ref={sentinelRef} className="h-8" />

          {isFetchingNextPage && (
            <div className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-t-2 border-b-2 border-white/30" />
              Carregando mais...
            </div>
          )}
        </div>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-outline-variant/10">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#111] hover:bg-[#151515] transition-colors cursor-pointer" onClick={handleLogout}>
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-white/50 text-xl">account_circle</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-white truncate">Log out</p>
            </div>
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
                <span className={`px-3 py-1 border rounded text-xs font-black tracking-widest ${getResultColor(selectedEvent.result)}`}>
                  {selectedEvent.result}
                </span>
                <h2 className="text-2xl font-bold text-on-surface">{selectedEvent.eventType}</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary/60">
                <span>Source: <span className="text-on-surface-variant font-mono">{selectedEvent.sourceIp}</span></span>
                <span className="text-outline-variant">•</span>
                <span>at {new Date(selectedEvent.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {/* Summary Table */}
            <div className="mb-8 border border-outline-variant/10 rounded-lg overflow-hidden bg-surface-container-lowest">
              <div className="grid grid-cols-2 border-b border-outline-variant/5 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
                <div className="text-xs font-medium text-secondary/70">Correlation ID</div>
                <div className="text-xs font-mono text-on-surface-variant">{selectedEvent.correlationId || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-outline-variant/5 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
                <div className="text-xs font-medium text-secondary/70">Criticality</div>
                <div className={`text-xs font-mono font-bold ${getSeverityColor(selectedEvent.criticality)}`}>
                  {selectedEvent.criticality}
                </div>
              </div>
              <div className="grid grid-cols-2 border-b border-outline-variant/5 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
                <div className="text-xs font-medium text-secondary/70">User ID</div>
                <div className="text-xs font-mono text-on-surface-variant">{selectedEvent.userId}</div>
              </div>
              <div className="grid grid-cols-2 px-6 py-3 items-center hover:bg-surface-container-low transition-colors">
                <div className="text-xs font-medium text-secondary/70">Client ID</div>
                <div className="text-xs font-mono text-on-surface-variant">{selectedEvent.clientId}</div>
              </div>
            </div>

            {/* Event Details Section */}
            {selectedEvent.details && (
              <div className="mb-8">
                <h3 className="text-sm font-black text-on-surface uppercase tracking-widest mb-4">Event Details</h3>
                <div className="bg-[#0a0a0a] rounded-lg p-6 border border-outline-variant/10">
                  <pre className="font-mono text-sm text-secondary leading-relaxed overflow-x-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
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
