import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { api } from '../services/api'
import type { Event } from '../types/event'
import { useEvents } from './useEvents'

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

function makeEvent(id: number): Event {
  return {
    id,
    timestamp: new Date('2026-04-05T12:00:00.000Z').toISOString(),
    userId: 1,
    clientId: 1,
    eventType: 'USER_LOGIN',
    sourceIp: '127.0.0.1',
    criticality: 'LOW',
    result: 'SUCCESS',
    correlationId: 'corr',
    entityId: 'ent',
    details: { path: '/login' },
  }
}

describe('useEvents (infinite)', () => {
  it('should fetch next pages when fetchNextPage is called and stop when total is reached', async () => {
    const apiGetMock = vi.mocked(api.get)

    apiGetMock
      .mockResolvedValueOnce({
        events: Array.from({ length: 10 }, (_, i) => makeEvent(i + 1)),
        total: 12,
      })
      .mockResolvedValueOnce({
        events: Array.from({ length: 2 }, (_, i) => makeEvent(i + 11)),
        total: 12,
      })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useEvents(), { wrapper })

    await waitFor(() => {
      expect(result.current.events).toHaveLength(10)
      expect(result.current.hasNextPage).toBe(true)
    })

    await act(async () => {
      await result.current.fetchNextPage()
    })

    await waitFor(() => {
      expect(result.current.events).toHaveLength(12)
      expect(result.current.hasNextPage).toBe(false)
    })

    expect(apiGetMock).toHaveBeenCalledTimes(2)
    expect(apiGetMock.mock.calls[0]?.[1]?.params?.page).toBe('1')
    expect(apiGetMock.mock.calls[1]?.[1]?.params?.page).toBe('2')
  })
})

