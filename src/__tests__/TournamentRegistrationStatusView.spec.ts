import { describe, expect, it, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import TournamentRegistrationStatusView from '@/views/tournament/TournamentRegistrationStatusView.vue'
import { fetchWithAuth } from '@/services/apiService'
import { RoleValue } from '@/components/tournament/registration/types'

const routeMock = vi.hoisted(() => ({ params: {} as Record<string, unknown> }))

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/services/apiService', () => ({
  fetchWithAuth: vi.fn(),
  fetchWithoutAuth: vi.fn().mockResolvedValue({ success: false }),
}))

const fetchWithAuthMock = vi.mocked(fetchWithAuth)

const setup = () => {
  return shallowMount(TournamentRegistrationStatusView, {
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        Card: { template: '<div><slot /></div>' },
        CardHeader: { template: '<div><slot /></div>' },
        CardContent: { template: '<div><slot /></div>' },
        CardTitle: { template: '<div><slot /></div>' },
        Badge: { template: '<span><slot /></span>' },
        Copyable: { template: '<span><slot /></span>' },
        Spinner: { template: '<span />' },
      },
    },
  })
}

beforeEach(() => {
  routeMock.params = {}
  fetchWithAuthMock.mockReset()
})

describe('TournamentRegistrationStatusView', () => {
  it('shows error when registrationId missing', async () => {
    const wrapper = setup()

    await nextTick()

    expect(wrapper.text()).toContain('errors.unknown')
    expect(fetchWithAuthMock).not.toHaveBeenCalled()
  })

  it('loads registration details and renders status label', async () => {
    routeMock.params = { registrationId: '123' }

    fetchWithAuthMock.mockResolvedValueOnce({
      success: true,
      data: {
        tournamentTitle: 'OW2 Cup',
        tournamentSefTitle: 'ow2',
        battleTag: 'Player#1',
        altAccounts: [],
        twitch: 'player',
        discord: 'player',
        primaryRole: RoleValue.TANK,
        secondaryRole: RoleValue.DAMAGE,
        guarantors: [],
        additionalInfo: '',
        status: 'PENDING',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    })

    const wrapper = setup()

    await flushPromises()
    await nextTick()

    expect(fetchWithAuthMock).toHaveBeenCalledWith('/api/secured/v1/registrations/123')
    expect(wrapper.text()).toContain('registration.smart_button.pending')
  })
})
