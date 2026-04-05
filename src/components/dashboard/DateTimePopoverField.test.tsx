import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DateTimePopoverField } from './DateTimePopoverField'

describe('DateTimePopoverField', () => {
  it('opens the picker when clicking anywhere on the field', async () => {
    render(
      <DateTimePopoverField
        label="Start Date"
        defaultTime={{ hour: 0, minute: 0 }}
        onChange={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Start Date' }))
    expect(screen.getByRole('dialog', { name: /start date picker/i })).toBeInTheDocument()
  })

  it('selects a day and emits an ISO string matching local date/time', async () => {
    const onChange = vi.fn()
    const value = new Date(2026, 3, 1, 0, 0, 0, 0).toISOString()

    render(
      <DateTimePopoverField
        label="Start Date"
        value={value}
        defaultTime={{ hour: 0, minute: 0 }}
        onChange={onChange}
      />,
    )

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button', { name: '2026-04-05' }))

    expect(onChange).toHaveBeenCalled()
    const next = onChange.mock.calls.at(-1)?.[0] as string
    const nextDate = new Date(next)

    expect(nextDate.getFullYear()).toBe(2026)
    expect(nextDate.getMonth()).toBe(3)
    expect(nextDate.getDate()).toBe(5)
    expect(nextDate.getHours()).toBe(0)
    expect(nextDate.getMinutes()).toBe(0)
  })
})
