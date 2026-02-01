import { describe, expect, it, vi } from 'vitest'
import { fetchRegistrations } from '@/services/registrationManagerApi'
import { fetchWithAuth } from '@/services/apiService'

vi.mock('@/services/apiService', () => ({
  fetchWithAuth: vi.fn(),
}))

const fetchWithAuthMock = vi.mocked(fetchWithAuth)

describe('registrationManagerApi', () => {
  it('builds query with optional params', async () => {
    fetchWithAuthMock.mockResolvedValueOnce({ success: true })

    await fetchRegistrations({
      tournamentId: 10,
      status: ['PENDING', 'ACCEPTED'],
      sort: 'created_at:desc',
      page: 2,
      perPage: 25,
      battletag: 'Player#1234',
    })

    expect(fetchWithAuthMock).toHaveBeenCalledWith(
      '/api/secured/v1/manager/registrations/?tournament_id=10&status=PENDING%2CACCEPTED&sort=created_at%3Adesc&page=2&per_page=25&battletag=Player%231234',
    )
  })

  it('builds query with required params only', async () => {
    fetchWithAuthMock.mockResolvedValueOnce({ success: true })

    await fetchRegistrations({ tournamentId: 7 })

    expect(fetchWithAuthMock).toHaveBeenCalledWith(
      '/api/secured/v1/manager/registrations/?tournament_id=7',
    )
  })
})
