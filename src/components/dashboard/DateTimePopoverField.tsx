import { useEffect, useMemo, useRef, useState } from 'react'

type TimeParts = { hour: number; minute: number }

function isValidDate(date: Date) {
  return Number.isFinite(date.getTime())
}

function parseDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  return isValidDate(date) ? date : null
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatDisplay(value?: string) {
  const date = parseDate(value)
  if (!date) return ''
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function buildMonthGrid(viewMonth: Date) {
  const firstOfMonth = startOfMonth(viewMonth)
  const startOffset = firstOfMonth.getDay()
  const start = new Date(
    firstOfMonth.getFullYear(),
    firstOfMonth.getMonth(),
    1 - startOffset,
  )

  return Array.from({ length: 42 }, (_, i) => {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
  })
}

function toDayId(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function createLocalDateTime(date: Date, time: TimeParts) {
  const local = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.hour,
    time.minute,
    0,
    0,
  )
  return local.toISOString()
}

export function DateTimePopoverField({
  label,
  value,
  placeholder = 'dd/mm/aaaa hh:mm',
  defaultTime,
  onChange,
}: {
  label: string
  value?: string
  placeholder?: string
  defaultTime: TimeParts
  onChange: (next?: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const selected = useMemo(() => parseDate(value), [value])
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected ?? new Date()))

  const selectedTime = useMemo<TimeParts>(() => {
    if (!selected) return defaultTime
    return { hour: selected.getHours(), minute: selected.getMinutes() }
  }, [defaultTime, selected])

  const selectedDayId = selected ? toDayId(selected) : null
  const days = useMemo(() => buildMonthGrid(viewMonth), [viewMonth])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      const container = containerRef.current
      if (!container) return
      if (e.target instanceof Node && container.contains(e.target)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const selectBaseDate = selected ?? new Date()

  return (
    <div ref={containerRef} className="relative">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.12em] text-white/60 font-black">
          {label}
        </span>
        <button
          ref={buttonRef}
          type="button"
          className="bg-surface-container-lowest border border-outline-variant/20 text-on-surface px-3 py-2 rounded-md text-xs font-mono text-left flex items-center justify-between gap-2 hover:border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-[#00A878]/40"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            setOpen((s) => {
              const next = !s
              if (next) setViewMonth(startOfMonth(selected ?? new Date()))
              return next
            })
          }}
        >
          <span className={formatDisplay(value) ? '' : 'text-white/30'}>
            {formatDisplay(value) || placeholder}
          </span>
          <span className="material-symbols-outlined text-base text-white/60">
            calendar_month
          </span>
        </button>
      </label>

      {open ? (
        <div
          role="dialog"
          aria-label={`${label} picker`}
          className="absolute z-50 mt-2 w-[320px] rounded-md border border-outline-variant/20 bg-black/95 backdrop-blur p-3 jewel-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-black uppercase tracking-[0.12em] text-white/70">
              {monthLabel(viewMonth)}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-7 w-7 rounded-md border border-outline-variant/20 bg-surface-container-lowest text-white/70 hover:bg-surface-container-highest"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                aria-label="Mês anterior"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-md border border-outline-variant/20 bg-surface-container-lowest text-white/70 hover:bg-surface-container-highest"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                aria-label="Próximo mês"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => (
                  <div
                    key={d}
                    className="text-[10px] text-white/40 font-black uppercase tracking-[0.12em] text-center"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const id = toDayId(day)
                  const inMonth = day.getMonth() === viewMonth.getMonth()
                  const isSelected = selectedDayId === id

                  return (
                    <button
                      key={id}
                      type="button"
                      aria-label={id}
                      className={[
                        'h-8 rounded-md text-xs font-black transition-colors',
                        inMonth ? 'text-white/80' : 'text-white/25',
                        isSelected
                          ? 'bg-[#00A878] text-black'
                          : 'hover:bg-surface-container-highest',
                      ].join(' ')}
                      onClick={() => {
                        onChange(createLocalDateTime(day, selectedTime))
                      }}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="w-24 flex flex-col gap-2">
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/40 font-black">
                Hora
              </div>
              <select
                className="bg-surface-container-lowest border border-outline-variant/20 text-on-surface px-2 py-2 rounded-md text-xs font-mono"
                value={selectedTime.hour}
                onChange={(e) => {
                  const hour = Number(e.target.value)
                  if (!Number.isFinite(hour)) return
                  onChange(
                    createLocalDateTime(selectBaseDate, {
                      hour,
                      minute: selectedTime.minute,
                    }),
                  )
                }}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {pad2(h)}
                  </option>
                ))}
              </select>

              <div className="text-[10px] uppercase tracking-[0.12em] text-white/40 font-black">
                Min
              </div>
              <select
                className="bg-surface-container-lowest border border-outline-variant/20 text-on-surface px-2 py-2 rounded-md text-xs font-mono"
                value={selectedTime.minute}
                onChange={(e) => {
                  const minute = Number(e.target.value)
                  if (!Number.isFinite(minute)) return
                  onChange(
                    createLocalDateTime(selectBaseDate, {
                      hour: selectedTime.hour,
                      minute,
                    }),
                  )
                }}
              >
                {Array.from({ length: 60 }, (_, m) => (
                  <option key={m} value={m}>
                    {pad2(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/10">
            <button
              type="button"
              className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 hover:text-white"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
            >
              Limpar
            </button>
            <button
              type="button"
              className="text-[10px] uppercase tracking-[0.2em] font-black text-[#00A878] hover:text-[#00d190]"
              onClick={() => {
                const now = new Date()
                onChange(createLocalDateTime(now, { hour: now.getHours(), minute: now.getMinutes() }))
              }}
            >
              Agora
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
