import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TournamentRegistrationView from '@/views/tournament/TournamentRegistrationView.vue'
import { fetchWithAuth } from '@/services/apiService'
import type { RegistrationFormValues } from '@/components/tournament/registration/types'

const toastError = vi.hoisted(() => vi.fn())

let routeMock: { params: Record<string, unknown> }
let routerMock: { push: ReturnType<typeof vi.fn> }
let tournamentStoreMock: { tournaments: Record<string, { title?: string }>; fetchTournament: ReturnType<typeof vi.fn> }

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  useRouter: () => routerMock,
}))

vi.mock('vue-sonner', () => ({
  toast: {
    error: toastError,
  },
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => `t:${key}`,
    te: (key: string) => key === 'validation.key',
  }),
}))

vi.mock('@/stores/tournamentStore', () => ({
  useTournamentStore: () => tournamentStoreMock,
}))

vi.mock('@/services/apiService', () => ({
  fetchWithAuth: vi.fn(),
}))

const fetchWithAuthMock = vi.mocked(fetchWithAuth)

const formPayload: RegistrationFormValues = {
  altAccounts: [],
  twitch: 'validtwitch',
  discord: 'valid_discord',
  primaryRole: undefined,
  secondaryRole: undefined,
  guarantors: [],
  additionalInfo: '',
  rulesAccepted: true,
}

const setup = () => {
  return mount(TournamentRegistrationView, {
    global: {
      stubs: {
        RouterLink: { template: '<a />' },
        TournamentRegistrationForm: {
          name: 'TournamentRegistrationForm',
          props: ['onSubmit'],
          template: '<div />',
        },
      },
    },
  })
}

beforeEach(() => {
  routeMock = { params: {} }
  routerMock = { push: vi.fn() }
  tournamentStoreMock = { tournaments: {}, fetchTournament: vi.fn().mockResolvedValue({ success: true }) }
  fetchWithAuthMock.mockReset()
  toastError.mockReset()
})

describe('TournamentRegistrationView', () => {
  it('shows error when tournamentSef missing', async () => {
    const wrapper = setup()

    const onSubmit = wrapper.findComponent({ name: 'TournamentRegistrationForm' }).props('onSubmit') as (
      payload: RegistrationFormValues,
    ) => Promise<void>

    await onSubmit(formPayload)

    expect(toastError).toHaveBeenCalledWith('t:errors.unknown')
  })

  it('submits and navigates to registration status', async () => {
    routeMock.params = { tournamentSef: 'ow2' }
    tournamentStoreMock.tournaments['ow2'] = { title: 'OW2 Cup' }

    fetchWithAuthMock.mockResolvedValueOnce({
      success: true,
      data: { registration_id: 123, status: 'PENDING' },
    })

    const wrapper = setup()
    const onSubmit = wrapper.findComponent({ name: 'TournamentRegistrationForm' }).props('onSubmit') as (
      payload: RegistrationFormValues,
    ) => Promise<void>

    await onSubmit(formPayload)

    expect(fetchWithAuthMock).toHaveBeenCalledWith(
      '/api/secured/v1/tournaments/ow2/register',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(routerMock.push).toHaveBeenCalledWith({
      name: 'tournament-registration-status',
      params: { tournamentSef: 'ow2', registrationId: 123 },
    })
  })

  it('shows validation errors from api', async () => {
    routeMock.params = { tournamentSef: 'ow2' }

    fetchWithAuthMock.mockResolvedValueOnce({
      success: false,
      errorData: {
        error: 'validation_error',
        errors: ['validation.key'],
      },
    })

    const wrapper = setup()
    const onSubmit = wrapper.findComponent({ name: 'TournamentRegistrationForm' }).props('onSubmit') as (
      payload: RegistrationFormValues,
    ) => Promise<void>

    await onSubmit(formPayload)

    expect(toastError).toHaveBeenCalledWith('t:validation.key')
  })

  it('shows registration closed error from api', async () => {
    routeMock.params = { tournamentSef: 'ow2' }

    fetchWithAuthMock.mockResolvedValueOnce({
      success: false,
      errorData: {
        error: 'registration_closed',
      },
    })

    const wrapper = setup()
    const onSubmit = wrapper.findComponent({ name: 'TournamentRegistrationForm' }).props('onSubmit') as (
      payload: RegistrationFormValues,
    ) => Promise<void>

    await onSubmit(formPayload)

    expect(toastError).toHaveBeenCalledWith('t:errors.registration_closed')
  })
})
