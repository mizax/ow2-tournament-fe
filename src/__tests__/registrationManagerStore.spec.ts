import { describe, expect, it, vi } from 'vitest'
import { useRegistrationManagerStore } from '@/stores/registrationManagerStore'
import {
  createRegistrationComment,
  fetchManagedTournaments,
  fetchRegistrationDetails,
  fetchRegistrations,
  resolveRequestedAction,
  updateRegistrationStatus,
  updateRoleRankings,
} from '@/services/registrationManagerApi'
import { RoleValue } from '@/components/tournament/registration/types'

vi.mock('@/services/registrationManagerApi', () => ({
  createRegistrationComment: vi.fn(),
  fetchManagedTournaments: vi.fn(),
  fetchRegistrationDetails: vi.fn(),
  fetchRegistrations: vi.fn(),
  resolveRequestedAction: vi.fn(),
  updateRegistrationStatus: vi.fn(),
  updateRoleRankings: vi.fn(),
}))

const fetchManagedTournamentsMock = vi.mocked(fetchManagedTournaments)
const fetchRegistrationsMock = vi.mocked(fetchRegistrations)
const fetchRegistrationDetailsMock = vi.mocked(fetchRegistrationDetails)
const updateRegistrationStatusMock = vi.mocked(updateRegistrationStatus)
const createRegistrationCommentMock = vi.mocked(createRegistrationComment)
const resolveRequestedActionMock = vi.mocked(resolveRequestedAction)
const updateRoleRankingsMock = vi.mocked(updateRoleRankings)

describe('registrationManagerStore', () => {
  it('loads managed tournaments and updates state', async () => {
    fetchManagedTournamentsMock.mockResolvedValueOnce({
      success: true,
      data: [{ id: 1, title: 'Cup' }],
    })

    const store = useRegistrationManagerStore()
    const result = await store.loadManagedTournaments()

    expect(result.success).toBe(true)
    expect(store.managedTournamentsLoading).toBe(false)
    expect(store.managedTournaments).toHaveLength(1)
  })

  it('loads registrations and sets totals', async () => {
    fetchRegistrationsMock.mockResolvedValueOnce({
      success: true,
      data: {
        items: [
          {
            id: 10,
            battletag: 'Player#1',
            status: 'PENDING',
            created_at: '2024-01-01',
            updated_at: '2024-01-02',
          },
        ],
        total: 1,
        page: 1,
        per_page: 20,
      },
    })

    const store = useRegistrationManagerStore()
    const result = await store.loadRegistrations(5, { page: 1 })

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(store.registrationsByTournament[5]).toHaveLength(1)
    expect(store.registrationsTotalByTournament[5]).toBe(1)
  })

  it('updates registration status in details and summary', async () => {
    updateRegistrationStatusMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: 22,
        tournament_id: 5,
        user_id: 1,
        user_battletag_id: 1,
        status: 'ACCEPTED',
        twitch: '',
        discord: '',
        additional_info: '',
        rules_accepted: true,
        ip_address: '',
        user_agent: '',
        created_at: '2024-01-01',
        updated_at: '2024-01-03',
        version: 1,
      },
    })

    const store = useRegistrationManagerStore()
    store.registrationDetails[22] = {
      registration: {
        id: 22,
        tournament_id: 5,
        user_id: 1,
        user_battletag_id: 1,
        status: 'PENDING',
        twitch: '',
        discord: '',
        additional_info: '',
        rules_accepted: true,
        ip_address: '',
        user_agent: '',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        version: 1,
      },
      battletag: 'Player#1',
      comments: [],
      requested_actions: [],
      role_rankings: [],
    }
    store.registrationsByTournament[5] = [
      {
        id: 22,
        battletag: 'Player#1',
        status: 'PENDING',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      },
    ]

    const result = await store.updateRegistrationStatus(22, { status: 'ACCEPTED' })

    expect(result.success).toBe(true)
    expect(store.registrationDetails[22].registration.status).toBe('ACCEPTED')
    expect(store.registrationsByTournament[5][0].status).toBe('ACCEPTED')
  })

  it('adds registration comment to details', async () => {
    createRegistrationCommentMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: 1,
        registration_id: 22,
        manager_user_id: 9,
        comment: 'Looks good',
        created_at: '2024-01-01',
      },
    })

    const store = useRegistrationManagerStore()
    store.registrationDetails[22] = {
      registration: {
        id: 22,
        tournament_id: 5,
        user_id: 1,
        user_battletag_id: 1,
        status: 'PENDING',
        twitch: '',
        discord: '',
        additional_info: '',
        rules_accepted: true,
        ip_address: '',
        user_agent: '',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        version: 1,
      },
      battletag: 'Player#1',
      comments: [],
      requested_actions: [],
      role_rankings: [],
    }

    const result = await store.addRegistrationComment(22, 'Looks good')

    expect(result.success).toBe(true)
    expect(store.registrationDetails[22].comments).toHaveLength(1)
  })

  it('updates requested action in details', async () => {
    resolveRequestedActionMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: 7,
        registration_id: 22,
        manager_user_id: 9,
        description: 'Provide proof',
        status: 'RESOLVED',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      },
    })

    const store = useRegistrationManagerStore()
    store.registrationDetails[22] = {
      registration: {
        id: 22,
        tournament_id: 5,
        user_id: 1,
        user_battletag_id: 1,
        status: 'PENDING',
        twitch: '',
        discord: '',
        additional_info: '',
        rules_accepted: true,
        ip_address: '',
        user_agent: '',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        version: 1,
      },
      battletag: 'Player#1',
      comments: [],
      requested_actions: [
        {
          id: 7,
          registration_id: 22,
          manager_user_id: 9,
          description: 'Provide proof',
          status: 'PENDING',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ],
      role_rankings: [],
    }

    const result = await store.resolveRequestedAction(22, 7)

    expect(result.success).toBe(true)
    expect(store.registrationDetails[22].requested_actions[0].status).toBe('RESOLVED')
  })

  it('updates role rankings in details', async () => {
    updateRoleRankingsMock.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 1,
          registration_id: 22,
          role: RoleValue.DAMAGE,
          ranking: 1,
          created_at: '2024-01-01',
        },
      ],
    })

    const store = useRegistrationManagerStore()
    store.registrationDetails[22] = {
      registration: {
        id: 22,
        tournament_id: 5,
        user_id: 1,
        user_battletag_id: 1,
        status: 'PENDING',
        twitch: '',
        discord: '',
        additional_info: '',
        rules_accepted: true,
        ip_address: '',
        user_agent: '',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        version: 1,
      },
      battletag: 'Player#1',
      comments: [],
      requested_actions: [],
      role_rankings: [],
    }

    const result = await store.updateRoleRankings(22, [{ role: RoleValue.DAMAGE, ranking: 1 }])

    expect(result.success).toBe(true)
    expect(store.registrationDetails[22].role_rankings).toHaveLength(1)
  })

  it('loadRegistrationDetails stores response', async () => {
    fetchRegistrationDetailsMock.mockResolvedValueOnce({
      success: true,
      data: {
        registration: {
          id: 33,
          tournament_id: 5,
          user_id: 1,
          user_battletag_id: 1,
          status: 'PENDING',
          twitch: '',
          discord: '',
          additional_info: '',
          rules_accepted: true,
          ip_address: '',
          user_agent: '',
          created_at: '2024-01-01',
          updated_at: '2024-01-02',
          version: 1,
        },
        battletag: 'Player#1',
        comments: [],
        requested_actions: [],
        role_rankings: [],
      },
    })

    const store = useRegistrationManagerStore()
    const result = await store.loadRegistrationDetails(33)

    expect(result.success).toBe(true)
    expect(store.registrationDetails[33]).toBeDefined()
  })
})
