import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EventDetails } from '../components/dashboard/EventDetails'
import { EventSidebar } from '../components/dashboard/EventSidebar'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'
import { CriticalitySchema, ResultSchema } from '../types/event'

type DashboardSearch = {
  criticality?: 'LOW' | 'MEDIUM' | 'HIGH'
  result?: 'SUCCESS' | 'FAILURE'
  clientId?: number
  userId?: number
  eventType?: string
  startDate?: string
  endDate?: string
}

export const Route = createFileRoute('/dashboard')({
  validateSearch: (search) => {
    const toSingleString = (value: unknown) => {
      if (typeof value === 'string') return value
      if (typeof value === 'number' && Number.isFinite(value)) return String(value)
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
      return undefined
    }

    const criticalityRaw = toSingleString(search.criticality)
    const resultRaw = toSingleString(search.result)
    const clientIdRaw = toSingleString(search.clientId)
    const userIdRaw = toSingleString(search.userId)
    const eventTypeRaw = toSingleString(search.eventType)
    const startDateRaw = toSingleString(search.startDate)
    const endDateRaw = toSingleString(search.endDate)

    const criticalityParsed = criticalityRaw
      ? CriticalitySchema.safeParse(criticalityRaw)
      : null
    const resultParsed = resultRaw ? ResultSchema.safeParse(resultRaw) : null

    const criticality =
      criticalityParsed && criticalityParsed.success
        ? criticalityParsed.data
        : undefined
    const result = resultParsed && resultParsed.success ? resultParsed.data : undefined

    const toNumber = (value?: string) => {
      if (!value) return undefined
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : undefined
    }

    const validated: DashboardSearch = {}

    if (criticality) validated.criticality = criticality
    if (result) validated.result = result

    const clientId = toNumber(clientIdRaw)
    const userId = toNumber(userIdRaw)
    if (clientId !== undefined) validated.clientId = clientId
    if (userId !== undefined) validated.userId = userId

    if (eventTypeRaw) validated.eventType = eventTypeRaw
    if (startDateRaw) validated.startDate = startDateRaw
    if (endDateRaw) validated.endDate = endDateRaw

    return validated
  },
  beforeLoad: ({ context }) => {
    const isAuthenticated =
      context.isAuthenticated || !!sessionStorage.getItem('apiKey')
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: DashboardComponent,
})

function DashboardComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const { logout } = useAuth()
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const {
    events,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEvents(search)

  const effectiveSelectedEventId = selectedEventId ?? (events[0]?.id ?? null)

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

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === effectiveSelectedEventId) ?? events[0]
  }, [effectiveSelectedEventId, events])

  const filtersSlot = (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/60 font-black">
          Criticality
        </span>
        <select
          className="bg-surface-container-lowest border border-outline-variant/20 text-on-surface px-3 py-2 rounded-md text-xs font-mono"
          value={search.criticality ?? ''}
          onChange={(e) => {
            const criticality = e.target.value
              ? (e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
              : undefined
            navigate({
              search: (prev) => ({
                ...prev,
                criticality,
              }),
              replace: true,
            })
          }}
        >
          <option value="">Any</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/60 font-black">
          Result
        </span>
        <select
          className="bg-surface-container-lowest border border-outline-variant/20 text-on-surface px-3 py-2 rounded-md text-xs font-mono"
          value={search.result ?? ''}
          onChange={(e) => {
            const result = e.target.value
              ? (e.target.value as 'SUCCESS' | 'FAILURE')
              : undefined
            navigate({
              search: (prev) => ({
                ...prev,
                result,
              }),
              replace: true,
            })
          }}
        >
          <option value="">Any</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILURE">FAILURE</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/60 font-black">
          Client ID
        </span>
        <input
          className="bg-surface-container-lowest border border-outline-variant/20 text-on-surface px-3 py-2 rounded-md text-xs font-mono"
          value={search.clientId ?? ''}
          onChange={(e) => {
            const value = e.target.value
            const parsed = value ? Number(value) : undefined
            navigate({
              search: (prev) => ({
                ...prev,
                clientId: parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined,
              }),
              replace: true,
            })
          }}
          inputMode="numeric"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/60 font-black">
          User ID
        </span>
        <input
          className="bg-surface-container-lowest border border-outline-variant/20 text-on-surface px-3 py-2 rounded-md text-xs font-mono"
          value={search.userId ?? ''}
          onChange={(e) => {
            const value = e.target.value
            const parsed = value ? Number(value) : undefined
            navigate({
              search: (prev) => ({
                ...prev,
                userId: parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined,
              }),
              replace: true,
            })
          }}
          inputMode="search"
        />
      </label>

      <label className="flex flex-col gap-1 col-span-2">
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/60 font-black">
          Event Type
        </span>
        <input
          className="bg-surface-container-lowest border border-outline-variant/20 text-on-surface px-3 py-2 rounded-md text-xs font-mono"
          value={search.eventType ?? ''}
          onChange={(e) => {
            const value = e.target.value
            navigate({
              search: (prev) => ({
                ...prev,
                eventType: value ? value : undefined,
              }),
              replace: true,
            })
          }}
        />
      </label>
    </div>
  )

  return (
    <DashboardLayout
      sidebar={
        <EventSidebar
          events={events}
          selectedEventId={effectiveSelectedEventId}
          onSelectEvent={setSelectedEventId}
          onLogout={async () => {
            logout()
            await navigate({ to: '/login' })
          }}
          isFetchingNextPage={isFetchingNextPage}
          listRef={listRef}
          sentinelRef={sentinelRef}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((s) => !s)}
          filtersSlot={filtersSlot}
        />
      }
    >
      {isError ? (
        <div className="flex h-full items-center justify-center bg-black text-error flex-col gap-6 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center border border-error/20">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-headline font-bold">Falha na Conexão</h2>
            <p className="text-sm text-on-surface-variant max-w-md">
              Não foi possível estabelecer conexão com o serviço de eventos.
              Verifique se a API está rodando ou tente novamente mais tarde.
            </p>
            {error instanceof Error ? (
              <p className="text-[10px] font-mono opacity-50 mt-4">Erro: {error.message}</p>
            ) : null}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-surface-container-high hover:bg-surface-container text-on-surface text-sm font-bold rounded-md transition-all"
            type="button"
          >
            Tentar Novamente
          </button>
        </div>
      ) : isLoading && events.length === 0 ? (
        <div className="flex h-full items-center justify-center bg-black text-primary flex-col gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary jewel-glow"></div>
          <p className="text-xs font-mono tracking-widest uppercase opacity-50">
            Carregando Fluxo de Eventos...
          </p>
        </div>
      ) : selectedEvent ? (
        <EventDetails event={selectedEvent} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-secondary/60 font-headline">
          Selecione um evento para ver os detalhes
        </div>
      )}
    </DashboardLayout>
  )
}
