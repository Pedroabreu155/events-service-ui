import type { ReactNode, RefObject } from 'react'
import type { Event } from '../../types/event'

function getRelativeTime(date?: string) {
  if (!date) return 'unknown time'
  const eventDate = new Date(date)
  const now = new Date()
  const diff = now.getTime() - eventDate.getTime()
  if (Number.isNaN(diff)) return 'invalid date'

  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) {
    if (minutes < 1) return 'now'
    if (minutes === 1) return '1 minute ago'
    return `${minutes} minutes ago`
  }

  return eventDate.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getResultColor(result: string) {
  return result === 'SUCCESS' ? 'text-[#00A878]' : 'text-red-500'
}

export function EventSidebar({
  events,
  selectedEventId,
  onSelectEvent,
  onLogout,
  isFetchingNextPage,
  listRef,
  sentinelRef,
  showFilters,
  onToggleFilters,
  filtersSlot,
}: {
  events: Event[]
  selectedEventId: number | null
  onSelectEvent: (eventId: number) => void
  onLogout: () => void
  isFetchingNextPage: boolean
  listRef: RefObject<HTMLDivElement | null>
  sentinelRef: RefObject<HTMLDivElement | null>
  showFilters: boolean
  onToggleFilters: () => void
  filtersSlot: ReactNode
}) {
  return (
    <aside className="flex flex-col w-80 bg-surface-container-lowest border-r border-outline-variant/10 h-screen">
      <div className="p-4 pt-6 border-b border-outline-variant/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-lg font-black text-white tracking-tight">
              Events Service
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#00A878] font-black">
              Inspect
            </div>
          </div>
        </div>
        <div className="relative mb-3">
          <button
            type="button"
            onClick={onToggleFilters}
            className="w-full bg-[#00A878] py-2 rounded-sm text-[10px] uppercase font-black tracking-[0.2em] text-white hover:bg-[#008f66] transition-all flex items-center justify-center gap-2 border border-white/10"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            {showFilters ? 'HIDE FILTERS' : 'FILTERS'}
          </button>
        </div>
        {showFilters ? (
          <div className="mt-3 rounded-md border border-outline-variant/10 bg-black/30 p-3">
            {filtersSlot}
          </div>
        ) : null}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar">
        {events.map((event) => {
          const isSelected = selectedEventId === event.id

          return (
            <div
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              className={`px-6 py-4 border-b border-white/5 cursor-pointer transition-all hover:bg-[#151515] ${isSelected ? 'bg-[#0F1110] border-l-4 border-l-[#00A878]' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectEvent(event.id)
              }}
            >
              <div className="flex flex-col gap-1">
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${getResultColor(event.result)}`}
                >
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

        {events.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-secondary/20 text-4xl mb-2">
              event_busy
            </span>
            <p className="text-[10px] text-secondary/40 uppercase font-bold tracking-widest">
              Nenhum evento encontrado
            </p>
          </div>
        ) : null}

        <div ref={sentinelRef} className="h-8" />

        {isFetchingNextPage ? (
          <div className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-t-2 border-b-2 border-white/30" />
            Carregando mais...
          </div>
        ) : null}
      </div>

      <div className="p-4 border-t border-outline-variant/10">
        <button
          type="button"
          className="w-full flex items-center gap-3 p-2 rounded-lg bg-[#111] hover:bg-[#151515] transition-colors cursor-pointer"
          onClick={onLogout}
        >
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-white/50 text-xl">
              account_circle
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-white truncate">Log out</p>
          </div>
        </button>
      </div>
    </aside>
  )
}
