import { describe, expect, it, vi } from 'vitest'
import { fetchManagedTournament, updateManagedTournament } from '@/services/tournamentManagerApi'
import { fetchWithAuth } from '@/services/apiService'
import type { TournamentEditFormValues } from '@/types/tournament-manager'

vi.mock('@/services/apiService', () => ({
  fetchWithAuth: vi.fn(),
}))

const fetchWithAuthMock = vi.mocked(fetchWithAuth)

describe('tournamentManagerApi', () => {
  it('fetchManagedTournament calls correct URL', async () => {
    fetchWithAuthMock.mockResolvedValueOnce({ success: true })

    await fetchManagedTournament('42')

    expect(fetchWithAuthMock).toHaveBeenCalledWith('/api/secured/v1/manager/tournaments/42')
  })

  it('updateManagedTournament calls PUT with correct URL and body', async () => {
    fetchWithAuthMock.mockResolvedValueOnce({ success: true })

    const payload: TournamentEditFormValues = {
      title: 'Тест',
      sef_title: 'test',
      discipline: 'OW2',
      format: 'Online',
      type: 'Online',
      schedule: [{ day: 1, date: '2026-02-21', stage: 'Group stage', start_time: '16:00' }],
      prize_pool: {},
    }

    await updateManagedTournament('42', payload)

    expect(fetchWithAuthMock).toHaveBeenCalledWith(
      '/api/secured/v1/manager/tournaments/42',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    )
  })
})
