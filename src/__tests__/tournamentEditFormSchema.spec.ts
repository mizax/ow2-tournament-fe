import { describe, expect, it } from 'vitest'
import { tournamentEditSchema } from '@/components/manager/tournament-edit/TournamentEditFormSchema'

describe('tournamentEditSchema', () => {
  const validBase = {
    title: 'День Защитника',
    sef_title: 'den-zaschitnika',
    discipline: 'Overwatch 2',
    format: 'Online',
    type: 'Online Tournament',
    schedule: [{ day: 1, date: '2026-02-21', stage: 'Групповой этап', start_time: '16:00' }],
    prize_pool: {},
  }

  it('passes with minimal valid data', () => {
    expect(tournamentEditSchema.safeParse(validBase).success).toBe(true)
  })

  it('rejects sef_title with uppercase', () => {
    expect(
      tournamentEditSchema.safeParse({ ...validBase, sef_title: 'Den-Zaschitnika' }).success,
    ).toBe(false)
  })

  it('rejects sef_title with spaces', () => {
    expect(
      tournamentEditSchema.safeParse({ ...validBase, sef_title: 'den zaschitnika' }).success,
    ).toBe(false)
  })

  it('rejects sef_title shorter than 3 chars', () => {
    expect(tournamentEditSchema.safeParse({ ...validBase, sef_title: 'ab' }).success).toBe(false)
  })

  it('rejects empty schedule', () => {
    expect(tournamentEditSchema.safeParse({ ...validBase, schedule: [] }).success).toBe(false)
  })

  it('rejects schedule date in wrong format', () => {
    const bad = {
      ...validBase,
      schedule: [{ day: 1, date: '21.02.2026', stage: 'Этап', start_time: '16:00' }],
    }
    expect(tournamentEditSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects schedule start_time in wrong format', () => {
    const bad = {
      ...validBase,
      schedule: [{ day: 1, date: '2026-02-21', stage: 'Этап', start_time: '4pm' }],
    }
    expect(tournamentEditSchema.safeParse(bad).success).toBe(false)
  })

  it('accepts ISO datetime with Z offset for registration', () => {
    const data = {
      ...validBase,
      registration: { start: '2026-01-25T17:00:00Z', deadline: '2026-02-21T12:45:00Z' },
    }
    expect(tournamentEditSchema.safeParse(data).success).toBe(true)
  })

  it('accepts ISO datetime with timezone offset for registration', () => {
    const data = {
      ...validBase,
      registration: { start: '2026-01-25T17:00:00+03:00' },
    }
    expect(tournamentEditSchema.safeParse(data).success).toBe(true)
  })

  it('rejects freeform date string for registration', () => {
    const data = { ...validBase, registration: { start: '25.01.2026 17:00' } }
    expect(tournamentEditSchema.safeParse(data).success).toBe(false)
  })

  it('rejects plain date without time for registration', () => {
    const data = { ...validBase, registration: { start: '2026-01-25' } }
    expect(tournamentEditSchema.safeParse(data).success).toBe(false)
  })

  it('rejects null in optional string fields', () => {
    const data = { ...validBase, results: { mvp: null, summary: 'текст' } }
    expect(tournamentEditSchema.safeParse(data).success).toBe(false)
  })
})
