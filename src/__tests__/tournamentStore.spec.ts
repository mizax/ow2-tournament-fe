import { describe, expect, it, vi } from 'vitest'
import { useTournamentStore } from '@/stores/tournamentStore'
import { fetchWithoutAuth } from '@/services/apiService'

vi.mock('@/services/apiService', () => ({
  fetchWithoutAuth: vi.fn(),
}))

const fetchWithoutAuthMock = vi.mocked(fetchWithoutAuth)

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('tournamentStore', () => {
  it('returns error when sef missing', async () => {
    const store = useTournamentStore()

    const result = await store.fetchTournament('')

    expect(result.success).toBe(false)
    expect(result.errorCode).toBe('missing_sef')
    expect(fetchWithoutAuthMock).not.toHaveBeenCalled()
  })

  it('returns cached tournament without fetching', async () => {
    const store = useTournamentStore()
    store.tournaments['ow2'] = {
      id: '1',
      title: 'OW2 Cup',
      discipline: 'ow2',
      format: '5v5',
      type: 'open',
      schedule: [],
      prize_pool: { currency: 'USD', places: [] },
    }

    const result = await store.fetchTournament('ow2')

    expect(result.success).toBe(true)
    expect(result.data?.title).toBe('OW2 Cup')
    expect(fetchWithoutAuthMock).not.toHaveBeenCalled()
  })

  it('deduplicates in-flight requests', async () => {
    const store = useTournamentStore()
    const deferred = createDeferred()
    fetchWithoutAuthMock.mockReturnValueOnce(deferred.promise as never)

    const promiseA = store.fetchTournament('ow2')
    const promiseB = store.fetchTournament('ow2')

    expect(fetchWithoutAuthMock).toHaveBeenCalledTimes(1)

    deferred.resolve({
      success: true,
      data: {
        id: '1',
        title: 'OW2 Cup',
        discipline: 'ow2',
        format: '5v5',
        type: 'open',
        schedule: [],
        prize_pool: { currency: 'USD', places: [] },
      },
    })

    const [resultA, resultB] = await Promise.all([promiseA, promiseB])
    expect(resultA.success).toBe(true)
    expect(resultB.success).toBe(true)
    expect(store.tournaments['ow2']?.title).toBe('OW2 Cup')
  })
})
